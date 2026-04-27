import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 px-4">
      <div className="text-8xl mb-6 select-none">🗺️</div>
      <h1 className="text-4xl font-bold mb-3">404 — Sayfa Bulunamadı</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 text-center max-w-md">
        Aradığınız sayfa mevcut değil. Belki silinmiş ya da URL yanlış girilmiş olabilir.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all hover:-translate-y-0.5 shadow-lg"
      >
        <Home className="w-4 h-4" />
        Ana Sayfaya Dön
      </button>
    </div>
  );
}
