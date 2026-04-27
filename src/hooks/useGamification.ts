import { useState, useCallback, useEffect } from 'react';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  desc: string;
  earned: boolean;
}

interface GamificationState {
  points: number;
  visitedPlaces: Set<string>;
  badges: Badge[];
}

const BADGES_DEF = [
  { id: 'first_step',   name: 'İlk Adım',       icon: '🚶', desc: 'İlk mekanı ziyaret et' },
  { id: 'museum5',      name: 'Müze Avcısı',     icon: '🏛️', desc: '5 müze ziyaret et' },
  { id: 'library3',     name: 'Kitap Kurdu',     icon: '📚', desc: '3 kütüphane ziyaret et' },
  { id: 'explorer10',   name: 'Kaşif',           icon: '🗺️', desc: '10 mekan ziyaret et' },
  { id: 'istanbul20',   name: 'İstanbul Aşığı',  icon: '❤️', desc: '20 mekan ziyaret et' },
  { id: 'ambassador30', name: 'Kültür Elçisi',   icon: '👑', desc: '30 mekan ziyaret et' },
];

const STORAGE_KEY = 'kulturota_gamification';

function load(): { points: number; visited: string[] } {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"points":0,"visited":[]}');
  } catch {
    return { points: 0, visited: [] };
  }
}

function save(points: number, visited: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ points, visited }));
  } catch {}
}

function computeBadges(visited: Set<string>, placeMeta: Map<string, boolean>): Badge[] {
  const museumCount   = [...visited].filter(n => placeMeta.get(n) === false).length;
  const libraryCount  = [...visited].filter(n => placeMeta.get(n) === true).length;
  const totalCount    = visited.size;

  return BADGES_DEF.map(b => ({
    ...b,
    earned:
      b.id === 'first_step'   ? totalCount >= 1  :
      b.id === 'museum5'      ? museumCount >= 5  :
      b.id === 'library3'     ? libraryCount >= 3 :
      b.id === 'explorer10'   ? totalCount >= 10  :
      b.id === 'istanbul20'   ? totalCount >= 20  :
      b.id === 'ambassador30' ? totalCount >= 30  :
      false,
  }));
}

export function useGamification(placeMeta: Map<string, boolean> = new Map()) {
  const stored = load();
  const [points, setPoints]   = useState(stored.points);
  const [visited, setVisited] = useState<Set<string>>(new Set(stored.visited));
  const [badges, setBadges]   = useState<Badge[]>(() => computeBadges(new Set(stored.visited), placeMeta));
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    setBadges(computeBadges(visited, placeMeta));
  }, [visited, placeMeta]);

  const markVisited = useCallback((placeName: string, isLibrary: boolean, pts = 10) => {
    setVisited(prev => {
      if (prev.has(placeName)) return prev;
      const next = new Set(prev);
      next.add(placeName);
      const newPoints = points + pts;
      setPoints(newPoints);
      save(newPoints, [...next]);

      // Yeni rozet kontrolü
      placeMeta.set(placeName, isLibrary);
      const updatedBadges = computeBadges(next, placeMeta);
      const earned = updatedBadges.find(
        b => b.earned && !computeBadges(prev, placeMeta).find(ob => ob.id === b.id && ob.earned)
      );
      if (earned) setNewBadge(earned);

      return next;
    });
  }, [points, placeMeta]);

  const clearNewBadge = useCallback(() => setNewBadge(null), []);
  const hasVisited = useCallback((name: string) => visited.has(name), [visited]);

  return { points, visited, badges, newBadge, markVisited, clearNewBadge, hasVisited };
}
