import { Trophy, Star, X } from 'lucide-react';
import type { Badge } from '../hooks/useGamification';

interface Props {
  points: number;
  badges: Badge[];
  visitedCount: number;
  onClose: () => void;
}

export default function GamificationModal({ points, badges, visitedCount, onClose }: Props) {
  const earned = badges.filter(b => b.earned);

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              <span className="font-bold text-lg">Kültür Pasaportu</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-3xl font-bold">{points}</div>
              <div className="text-xs opacity-80">Toplam Puan</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{visitedCount}</div>
              <div className="text-xs opacity-80">Ziyaret Edildi</div>
            </div>
            <div>
              <div className="text-3xl font-bold">{earned.length}</div>
              <div className="text-xs opacity-80">Rozet</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="p-5">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Rozetler
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {badges.map(b => (
              <div
                key={b.id}
                title={b.desc}
                className={`flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  b.earned
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-40 grayscale'
                }`}
              >
                <span className="text-2xl mb-1">{b.icon}</span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">{b.name}</span>
                {b.earned && <Star className="w-3 h-3 text-yellow-500 mt-1 fill-yellow-500" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
