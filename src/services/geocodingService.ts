import { knownLocations } from '../data/knownLocations';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const CACHE_KEY = 'kulturota_geocache';

function loadCache(): Record<string, { lat: number; lon: number }> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveToCache(key: string, coords: { lat: number; lon: number }) {
  const cache = loadCache();
  cache[key] = coords;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export async function geocodeAddress(
  name: string,
  district: string
): Promise<{ lat: number; lon: number } | null> {
  // 1. Bilinen koordinatlar
  if (knownLocations[name]) return knownLocations[name];

  // 2. LocalStorage cache
  const cache = loadCache();
  if (cache[name]) return cache[name];

  // 3. Nominatim API
  const nameQuery = `${name}, İstanbul`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(nameQuery)}&limit=1`;

  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
    const data = await res.json();

    if (data?.length > 0) {
      const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      saveToCache(name, coords);
      return coords;
    }

    // 4. İlçe bazlı fallback
    await sleep(1000);
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(district + ', İstanbul')}&limit=1`;
    const fbRes = await fetch(fallbackUrl, { headers: { 'Accept-Language': 'tr' } });
    const fbData = await fbRes.json();

    if (fbData?.length > 0) {
      const offset = () => (Math.random() - 0.5) * 0.012;
      const coords = {
        lat: parseFloat(fbData[0].lat) + offset(),
        lon: parseFloat(fbData[0].lon) + offset(),
      };
      saveToCache(name, coords);
      return coords;
    }
  } catch (err) {
    console.error('Geocoding hatası:', err);
  }

  return null;
}
