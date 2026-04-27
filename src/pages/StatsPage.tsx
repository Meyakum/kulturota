import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';
import Papa from 'papaparse';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTFybZkkYn2RsnmFSaNME3WbyJkXoWU54o4hiGKUbMQ6Ijd8m_wO2nK5sRQQnd93XtQS0poQBGBXgGX/pub?output=csv';

interface PlaceRow {
  name: string; type: string; district: string; year: number;
}

export default function StatsPage() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  const [data, setData] = useState<PlaceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Papa.parse(CSV_URL + '&t=' + Date.now(), {
      download: true, header: true,
      complete: (res) => {
        const rows = (res.data as any[])
          .filter(r => r['Adı']?.trim())
          .map(r => ({
            name: r['Adı'],
            type: r['Mekan  Türü'] || r['Mekan Türü'] || '',
            district: r['İlçe Adı'] || '',
            year: parseInt(r['Açılış Yılı']) || 0,
          }));
        setData(rows);
        setLoading(false);
      },
      error: () => setLoading(false),
    });
  }, []);

  const museums   = data.filter(d => !d.type.toLowerCase().includes('kütüphane'));
  const libraries = data.filter(d => d.type.toLowerCase().includes('kütüphane'));

  // İlçe dağılımı
  const districtCounts: Record<string, number> = {};
  data.forEach(d => { districtCounts[d.district] = (districtCounts[d.district] || 0) + 1; });
  const districtsSorted = Object.entries(districtCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  // Yıl dağılımı
  const yearCounts: Record<number, number> = {};
  data.forEach(d => { if (d.year > 1900) yearCounts[d.year] = (yearCounts[d.year] || 0) + 1; });
  const yearsSorted = Object.entries(yearCounts).sort((a, b) => +a[0] - +b[0]);

  const chartColors = {
    indigo: 'rgba(99,102,241,0.8)',
    teal: 'rgba(20,184,166,0.8)',
    purple: 'rgba(168,85,247,0.8)',
    amber: 'rgba(245,158,11,0.8)',
  };

  const textColor = isDark ? '#e2e8f0' : '#1e293b';
  const gridColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const barOptions = (title: string) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title, color: textColor, font: { size: 14, weight: 'bold' as const } },
    },
    scales: {
      x: { ticks: { color: textColor, font: { size: 11 } }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: true },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300" title={t('back')}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            {t('statsTitle')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleLang} className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">{t('dataLoading')}</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { label: t('totalPlaces'), value: data.length, color: 'from-indigo-500 to-purple-500', icon: '🗺️' },
                { label: t('totalMuseums'), value: museums.length, color: 'from-indigo-500 to-blue-500', icon: '🏛️' },
                { label: t('totalLibraries'), value: libraries.length, color: 'from-teal-500 to-emerald-500', icon: '📚' },
                { label: t('totalDistricts'), value: Object.keys(districtCounts).length, color: 'from-amber-500 to-orange-500', icon: '🏙️' },
              ].map((kpi, i) => (
                <div key={i} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="text-3xl mb-1">{kpi.icon}</div>
                  <div className="text-3xl font-bold">{kpi.value}</div>
                  <div className="text-sm opacity-85 font-medium">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* District bar */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                <Bar
                  data={{
                    labels: districtsSorted.map(([d]) => d),
                    datasets: [{ data: districtsSorted.map(([, v]) => v), backgroundColor: chartColors.indigo, borderRadius: 6 }],
                  }}
                  options={barOptions(t('byDistrict'))}
                />
              </div>

              {/* Type pie */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                <div className="w-full max-w-xs">
                  <Pie
                    data={{
                      labels: [t('museums'), t('libraries')],
                      datasets: [{ data: [museums.length, libraries.length], backgroundColor: [chartColors.indigo, chartColors.teal], borderWidth: 0 }],
                    }}
                    options={{
                      plugins: {
                        legend: { position: 'bottom', labels: { color: textColor } },
                        title: { display: true, text: t('byType'), color: textColor, font: { size: 14, weight: 'bold' } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Year bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <Bar
                data={{
                  labels: yearsSorted.map(([y]) => y),
                  datasets: [{ data: yearsSorted.map(([, v]) => v), backgroundColor: chartColors.purple, borderRadius: 6 }],
                }}
                options={barOptions(t('byYear'))}
              />
            </div>

            {/* Fun facts */}
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🏆', text: `En fazla mekan: ${districtsSorted[0]?.[0] ?? '—'} (${districtsSorted[0]?.[1] ?? 0})` },
                { icon: '📅', text: `En eski mekan: ${data.filter(d => d.year > 0).sort((a, b) => a.year - b.year)[0]?.name ?? '—'} (${data.filter(d => d.year > 0).sort((a, b) => a.year - b.year)[0]?.year ?? '—'})` },
                { icon: '✨', text: `En yeni mekan: ${data.filter(d => d.year > 0).sort((a, b) => b.year - a.year)[0]?.name ?? '—'} (${data.filter(d => d.year > 0).sort((a, b) => b.year - a.year)[0]?.year ?? '—'})` },
              ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-3">
                  <span className="text-2xl">{f.icon}</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{f.text}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
