import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet.markercluster';
import Papa from 'papaparse';
import { ArrowLeft, Sun, Moon, Loader2, MapPin, Trophy, Search, SlidersHorizontal, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';
import { useGamification } from '../hooks/useGamification';
import { getIcon } from '../data/mapIcons';
import { geocodeAddress } from '../services/geocodingService';
import { getIstanbulWeather, type WeatherData } from '../services/weatherService';
import { getPlaceSummary } from '../services/geminiService';
import ChatBot from '../components/ChatBot';
import GamificationModal from '../components/GamificationModal';
import { knownLocations } from '../data/knownLocations';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTFybZkkYn2RsnmFSaNME3WbyJkXoWU54o4hiGKUbMQ6Ijd8m_wO2nK5sRQQnd93XtQS0poQBGBXgGX/pub?output=csv';
const ISTANBUL: [number, number] = [41.0082, 28.9784];

const THEMES: Record<string, string> = {
  voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  light:   'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark:    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
};

function isOpenNow(hours: string): boolean {
  if (!hours || hours === 'Belirtilmemiş') return false;
  const m = hours.match(/(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/);
  if (!m) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = +m[1] * 60 + +m[2];
  const close = +m[3] * 60 + +m[4];
  return cur >= open && cur <= close;
}

interface PlaceMeta {
  name: string; district: string; address: string; phone: string;
  hours: string; mediaUrl: string; isLibrary: boolean; year: number;
  coords: { lat: number; lon: number };
  marker: L.Marker;
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export default function MapPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  const placeMeta = useRef<Map<string, boolean>>(new Map());
  const gami = useGamification(placeMeta.current);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const museumCluster = useRef<L.MarkerClusterGroup | null>(null);
  const libraryCluster = useRef<L.MarkerClusterGroup | null>(null);
  const allPlaces = useRef<PlaceMeta[]>([]);
  const csvContext = useRef('');

  const [status, setStatus] = useState('Harita Yükleniyor...');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showGami, setShowGami] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [badgeToast, setBadgeToast] = useState<string | null>(null);
  const [mapTheme, setMapTheme] = useState('voyager');

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'museum' | 'library'>('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [yearFilter, setYearFilter] = useState(2025);

  const districts = [...new Set(allPlaces.current.map(p => p.district).filter(Boolean))].sort();

  // Apply filters
  const applyFilters = useCallback(() => {
    if (!mapInst.current || !museumCluster.current || !libraryCluster.current) return;
    museumCluster.current.clearLayers();
    libraryCluster.current.clearLayers();

    allPlaces.current.forEach(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || (typeFilter === 'museum' && !p.isLibrary) || (typeFilter === 'library' && p.isLibrary);
      const matchDistrict = districtFilter === 'all' || p.district === districtFilter;
      const matchOpen = !openOnly || isOpenNow(p.hours);
      const matchYear = !p.year || p.year <= yearFilter;

      if (matchSearch && matchType && matchDistrict && matchOpen && matchYear) {
        p.marker.setIcon(getIcon(p.isLibrary, isDark));
        if (p.isLibrary) libraryCluster.current!.addLayer(p.marker);
        else museumCluster.current!.addLayer(p.marker);
      }
    });
  }, [search, typeFilter, districtFilter, openOnly, yearFilter, isDark]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  // Theme change → swap tile
  useEffect(() => {
    if (!mapInst.current || !tileRef.current) return;
    mapInst.current.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(THEMES[mapTheme], {
      attribution: '© OpenStreetMap contributors © CARTO',
      maxZoom: 20,
    }).addTo(mapInst.current);
  }, [mapTheme]);

  // Badge toast
  useEffect(() => {
    if (gami.newBadge) {
      setBadgeToast(`${gami.newBadge.icon} ${gami.newBadge.name} rozeti kazandınız!`);
      gami.clearNewBadge();
      setTimeout(() => setBadgeToast(null), 4000);
    }
  }, [gami.newBadge]);

  // Weather
  useEffect(() => { getIstanbulWeather().then(setWeather); }, []);

  // Map init + CSV load
  useEffect(() => {
    if (!mapRef.current || mapInst.current) return;

    mapInst.current = L.map(mapRef.current).setView(ISTANBUL, 11);
    tileRef.current = L.tileLayer(THEMES.voyager, {
      attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 20,
    }).addTo(mapInst.current);

    museumCluster.current = (L as any).markerClusterGroup({ chunkedLoading: true });
    libraryCluster.current = (L as any).markerClusterGroup({ chunkedLoading: true });
    mapInst.current.addLayer(museumCluster.current);
    mapInst.current.addLayer(libraryCluster.current);

    const url = CSV_URL + '&t=' + Date.now();
    setStatus('Veriler İndiriliyor...');

    Papa.parse(url, {
      download: true, header: true,
      complete: async (res) => {
        const rows = (res.data as any[]).filter(r => r['Adı']?.trim());
        const firstKeys = Object.keys(rows[0] || {});
        const nameKey = firstKeys.find(k => k.toLowerCase().includes('adı')) || 'Adı';
        const typeKey = firstKeys.find(k => k.toLowerCase().includes('türü')) || 'Mekan  Türü';

        csvContext.current = rows.map(r => `${r[nameKey]}|${r['İlçe Adı']}|${r['Çalışma Saatleri']}`).join('\n');

        let loaded = 0;
        for (const row of rows) {
          const name: string = row[nameKey] || '';
          const district: string = row['İlçe Adı'] || '';
          const address: string = row['Adres'] || district;
          const phone: string = row['Telefon'] || 'Belirtilmemiş';
          const hours: string = row['Çalışma Saatleri'] || 'Belirtilmemiş';
          const mediaUrl: string = row['Medya'] || '';
          const type: string = row[typeKey] || '';
          const year: number = parseInt(row['Açılış Yılı']) || 0;
          const isLibrary = type.toLowerCase().includes('kütüphane');

          placeMeta.current.set(name, isLibrary);
          const coords = await geocodeAddress(name, district);
          if (!coords || !mapInst.current) { loaded++; continue; }

          let mediaHtml = '';
          if (mediaUrl) {
            const yt = mediaUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|embed\/))([^"&?\/\s]{11})/i);
            mediaHtml = yt
              ? `<iframe width="100%" height="140" src="https://www.youtube.com/embed/${yt[1]}" frameborder="0" allowfullscreen style="border-radius:8px;margin-bottom:8px"></iframe>`
              : `<img src="${mediaUrl}" alt="${name}" style="width:100%;height:130px;object-fit:cover;border-radius:8px;margin-bottom:8px" referrerpolicy="no-referrer"/>`;
          }

          const openBadge = isOpenNow(hours)
            ? '<span style="display:inline-block;padding:2px 8px;background:#10b981;color:white;border-radius:12px;font-size:11px;font-weight:600;margin-bottom:6px">● Açık</span>'
            : '<span style="display:inline-block;padding:2px 8px;background:#ef4444;color:white;border-radius:12px;font-size:11px;font-weight:600;margin-bottom:6px">● Kapalı</span>';

          const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + district + ' İstanbul')}`;
          const shareUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`;

          const popupId = `popup-${name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;

          const popupHtml = `
            <div id="${popupId}" style="font-family:system-ui,sans-serif;min-width:260px;max-width:300px">
              ${mediaHtml}
              <div>${openBadge}</div>
              <h3 style="margin:0 0 6px;color:#4f46e5;font-size:15px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:4px">${name}</h3>
              <p style="margin:4px 0;font-size:12px"><b>Adres:</b> ${address}</p>
              <p style="margin:4px 0;font-size:12px"><b>Tel:</b> ${phone}</p>
              <p style="margin:4px 0;font-size:12px"><b>Saat:</b> ${hours}</p>
              <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">
                <a href="${mapsUrl}" target="_blank" style="padding:5px 10px;background:#4f46e5;color:white;border-radius:8px;font-size:11px;font-weight:600;text-decoration:none">🗺️ Harita</a>
                <button onclick="window.kulturotaAI && window.kulturotaAI('${name.replace(/'/g, "\\'")}','${address}')" style="padding:5px 10px;background:#7c3aed;color:white;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:none">✨ AI Özeti</button>
                <button onclick="window.kulturotaVisit && window.kulturotaVisit('${name.replace(/'/g, "\\'")}',${isLibrary})" style="padding:5px 10px;background:#0d9488;color:white;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:none" id="visit-${popupId}">✓ Ziyaret</button>
                <button onclick="navigator.share&&navigator.share({title:'${name.replace(/'/g, "\\'")}',url:'${shareUrl}'})" style="padding:5px 10px;background:#64748b;color:white;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:none">↗ Paylaş</button>
              </div>
              <div id="ai-${popupId}" style="margin-top:8px;font-size:12px;color:#374151;display:none"></div>
            </div>`;

          const marker = L.marker([coords.lat, coords.lon], { icon: getIcon(isLibrary, isDark) } as any)
            .bindPopup(popupHtml, { maxWidth: 320 })
            .bindTooltip(`<b>${name}</b><br><span style="font-size:11px">${isLibrary ? '📚 Kütüphane' : '🏛️ Müze'} • ${district}</span>`, { direction: 'top' });

          if (isLibrary) libraryCluster.current?.addLayer(marker);
          else museumCluster.current?.addLayer(marker);

          allPlaces.current.push({ name, district, address, phone, hours, mediaUrl, isLibrary, year, coords, marker });
          loaded++;
          setStatus(`Harita Hazırlanıyor... (${loaded}/${rows.length})`);
          if (!knownLocations[name]) await sleep(1100);
        }

        if (mapInst.current && allPlaces.current.length > 0) {
          const all = allPlaces.current.map(p => p.marker);
          const group = L.featureGroup(all);
          mapInst.current.fitBounds(group.getBounds(), { padding: [30, 30] });
        }

        setStatus('Yükleme Tamamlandı');
        setIsLoaded(true);
      },
    });

    return () => { mapInst.current?.remove(); mapInst.current = null; };
  }, []);

  // Global popup callbacks
  useEffect(() => {
    (window as any).kulturotaAI = async (name: string, details: string) => {
      const popupId = `popup-${name.replace(/\s/g, '-').replace(/[^a-zA-Z0-9-]/g, '')}`;
      const el = document.getElementById(`ai-${popupId}`);
      if (!el) return;
      el.style.display = 'block';
      el.textContent = '✨ AI özeti yükleniyor...';
      const summary = await getPlaceSummary(name, details);
      el.textContent = summary;
    };
    (window as any).kulturotaVisit = (name: string, isLibrary: boolean) => {
      gami.markVisited(name, isLibrary);
    };
    return () => {
      delete (window as any).kulturotaAI;
      delete (window as any).kulturotaVisit;
    };
  }, [gami.markVisited]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* HEADER */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 flex items-center gap-2 shadow-sm z-[1000] relative flex-shrink-0">
        <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300" title={t('back')}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm hidden sm:block">{t('mapTitle')}</span>

        <div className="flex items-center gap-1.5 ml-1">
          <button onClick={() => setShowFilter(f => !f)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${showFilter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filtre
          </button>
        </div>

        <div className="flex-1 mx-2 hidden sm:block">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-slate-400" /></button>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {weather && <span className="text-xs font-medium text-slate-600 dark:text-slate-300 hidden md:flex items-center gap-1">{weather.emoji} {weather.temp}</span>}
          {!isLoaded && (
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-800">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">{status}</span>
            </div>
          )}
          {isLoaded && <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">{allPlaces.current.length} mekan</span>}

          <button onClick={() => setShowGami(true)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 text-xs font-semibold hover:bg-yellow-100 transition">
            <Trophy className="w-3.5 h-3.5" /> {gami.points}
          </button>
          <button onClick={toggleLang} className="px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition">
            {lang === 'tr' ? 'EN' : 'TR'}
          </button>
          <button onClick={toggleTheme} className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* FILTER PANEL */}
      {showFilter && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center gap-3 z-[999] relative flex-shrink-0">
          {/* Mobile search */}
          <div className="relative sm:hidden w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Type */}
          <div className="flex items-center gap-1">
            {(['all','museum','library'] as const).map(tp => (
              <button key={tp} onClick={() => setTypeFilter(tp)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${typeFilter === tp ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'}`}>
                {tp === 'all' ? '🗺️ Tümü' : tp === 'museum' ? '🏛️ Müze' : '📚 Kütüphane'}
              </button>
            ))}
          </div>

          {/* District */}
          <select value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="all">Tüm İlçeler</option>
            {districts.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Open now */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={openOnly} onChange={e => setOpenOnly(e.target.checked)} className="w-3.5 h-3.5 accent-indigo-600" />
            Şu An Açık
          </label>

          {/* Year */}
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>Yıl: <b>{yearFilter}</b></span>
            <input type="range" min={1942} max={2025} value={yearFilter} onChange={e => setYearFilter(+e.target.value)}
              className="w-28 accent-indigo-600" />
          </div>

          {/* Map theme */}
          <select value={mapTheme} onChange={e => setMapTheme(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 focus:outline-none">
            <option value="voyager">🗺️ Varsayılan</option>
            <option value="light">☀️ Açık</option>
            <option value="dark">🌙 Koyu</option>
            <option value="satellite">🛰️ Uydu</option>
          </select>

          {/* My location */}
          <button onClick={() => {
            navigator.geolocation?.getCurrentPosition(pos => {
              mapInst.current?.setView([pos.coords.latitude, pos.coords.longitude], 14);
              L.circle([pos.coords.latitude, pos.coords.longitude], { radius: 100, color: '#4f46e5' }).addTo(mapInst.current!);
            });
          }} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition">
            <MapPin className="w-3.5 h-3.5" /> Konumum
          </button>
        </div>
      )}

      {/* MAP */}
      <div className="flex-1 relative z-0">
        <div ref={mapRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* BADGE TOAST */}
      {badgeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[3000] bg-yellow-400 text-yellow-900 px-5 py-2.5 rounded-full font-semibold text-sm shadow-xl animate-bounce">
          {badgeToast}
        </div>
      )}

      {/* CHATBOT */}
      <ChatBot placesContext={csvContext.current} />

      {/* GAMIFICATION MODAL */}
      {showGami && (
        <GamificationModal
          points={gami.points}
          badges={gami.badges}
          visitedCount={gami.visited.size}
          onClose={() => setShowGami(false)}
        />
      )}

      {/* DARK MODE POPUP CSS */}
      <style>{`
        .dark .leaflet-popup-content-wrapper, .dark .leaflet-popup-tip, .dark .leaflet-tooltip {
          background:#1e293b; color:#f8fafc; border-color:#334155;
        }
        .dark .leaflet-popup-content h3 { color:#818cf8!important; }
        .leaflet-cluster-anim .leaflet-marker-icon { transition: top .3s, left .3s; }
      `}</style>
    </div>
  );
}
