import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Map, MapPin, CreditCard, MessageSquarePlus, MessageSquareHeart, Sun, Moon, Menu, X, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../hooks/useTheme';
import { useI18n } from '../hooks/useI18n';

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { lang, t, toggleLang } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);

  const cards = [
    {
      href: 'https://muze.gov.tr/MuseumPass',
      target: '_blank',
      icon: <CreditCard className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />,
      shadow: 'shadow-indigo-500/20',
      titleKey: 'getMuseumCard' as const,
      descKey: 'getMuseumCardDesc' as const,
      linkKey: 'officialSite' as const,
      color: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      href: 'mailto:info@kulturota.com?subject=Yeni%20Mekan%20Tavsiyesi',
      icon: <MessageSquarePlus className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
      shadow: 'shadow-purple-500/20',
      titleKey: 'suggestPlace' as const,
      descKey: 'suggestPlaceDesc' as const,
      linkKey: 'writeUs' as const,
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      href: 'mailto:info@kulturota.com?subject=Geri%20Bildirim',
      icon: <MessageSquareHeart className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
      shadow: 'shadow-blue-500/20',
      titleKey: 'feedback' as const,
      descKey: 'feedbackDesc' as const,
      linkKey: 'sendMessage' as const,
      color: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 transition-colors duration-500">
      {/* BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
        <img
          src="https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2070&auto=format&fit=crop"
          alt="İstanbul"
          className="w-full h-full object-cover scale-110 opacity-100 dark:opacity-40 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[60px] mix-blend-overlay transition-colors duration-500" />
        <div className="absolute inset-0 bg-sky-50/50 dark:bg-slate-900/50 backdrop-blur-3xl transition-colors duration-500" />
        <motion.div animate={{ x: [0, 80, 0], y: [0, -60, 0] }} transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-400/30 dark:bg-sky-600/20 rounded-full blur-[100px]" />
        <motion.div animate={{ x: [0, -60, 0], y: [0, 80, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-[120px]" />
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-[100px]" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="sticky top-0 w-full px-6 py-4 flex items-center justify-between border-b border-white/30 dark:border-white/10 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-50 transition-colors duration-500"
        >
          <div className="flex items-center gap-3 text-slate-800 dark:text-slate-100 font-bold text-xl drop-shadow-sm">
            <div className="bg-white/60 dark:bg-slate-800/60 p-2 rounded-[14px] border border-white/50 dark:border-white/10 shadow-sm backdrop-blur-md">
              <Map className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="tracking-tight hidden sm:block">{t('appName')}</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium text-slate-700 dark:text-slate-300">
            <a href="#about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('about')}</a>
            <a href="https://muze.gov.tr/MuseumPass" target="_blank" rel="noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('museumCard')}</a>
            <button onClick={() => navigate('/istatistikler')} className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <BarChart2 className="w-4 h-4" /> {t('statsTitle')}
            </button>
            <a href="#contact" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{t('contact')}</a>
          </nav>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="px-3 py-1.5 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
            >
              {lang === 'tr' ? '🇬🇧 EN' : '🇹🇷 TR'}
            </button>
            {/* Dark mode */}
            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 border border-white/30 dark:border-white/10 shadow-sm transition-all" title={isDark ? 'Açık Tema' : 'Koyu Tema'}>
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
            </button>
            {/* Hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="md:hidden p-2 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 border border-white/30 dark:border-white/10 transition-all">
              {menuOpen ? <X className="w-5 h-5 text-slate-700 dark:text-slate-200" /> : <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />}
            </button>
          </div>
        </motion.header>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-[73px] left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/95 backdrop-blur-xl border-b border-white/20 dark:border-white/10 px-6 py-4 flex flex-col gap-4 text-slate-800 dark:text-slate-100 font-medium md:hidden"
            >
              <a href="#about" onClick={() => setMenuOpen(false)} className="hover:text-indigo-600">{t('about')}</a>
              <a href="https://muze.gov.tr/MuseumPass" target="_blank" rel="noreferrer" className="hover:text-indigo-600">{t('museumCard')}</a>
              <button onClick={() => { navigate('/istatistikler'); setMenuOpen(false); }} className="text-left hover:text-indigo-600">{t('statsTitle')}</button>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="hover:text-indigo-600">{t('contact')}</a>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-20 pb-28">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-100/80 dark:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-sm font-medium backdrop-blur-md"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            90+ Müze & Kütüphane • AI Destekli Rehber
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-6 drop-shadow-sm"
          >
            {lang === 'tr' ? 'İstanbul\'un Tarihi' : 'Istanbul\'s Heritage'}<br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400">
              {lang === 'tr' ? 'Parmaklarınızın Ucunda' : 'At Your Fingertips'}
            </span>
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="text-xl text-slate-700/80 dark:text-slate-300/80 mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/map')}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-slate-900/80 dark:bg-white/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-full hover:bg-slate-800 dark:hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:duration-1000 group-hover:transition-transform group-hover:translate-x-[150%]" />
              <MapPin className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
              {t('exploreMap')}
            </button>
            <button
              onClick={() => navigate('/istatistikler')}
              className="inline-flex items-center gap-2 px-6 py-4 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-full transition-all hover:-translate-y-1 shadow-md"
            >
              <BarChart2 className="w-4 h-4" />
              {t('statsTitle')}
            </button>
          </motion.div>

          {/* Cards */}
          <div id="about" className="grid sm:grid-cols-3 gap-6 mt-28 w-full text-left">
            {cards.map((card, i) => (
              <motion.a
                key={i}
                href={card.href}
                target={(card as any).target}
                rel={(card as any).target ? 'noreferrer' : undefined}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 + i * 0.1 }}
                className="group block bg-white/40 dark:bg-slate-800/40 backdrop-blur-[40px] p-8 rounded-[2.5rem] border border-white/50 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all duration-500 hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-white/70 dark:bg-slate-900/70 rounded-2xl flex items-center justify-center mb-6 border border-white/60 dark:border-white/10 shadow-lg ${card.shadow} backdrop-blur-md group-hover:scale-110 transition-transform duration-500`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 tracking-tight">{t(card.titleKey)}</h3>
                <p className="text-slate-700/80 dark:text-slate-300/80 leading-relaxed font-medium text-sm mb-4">{t(card.descKey)}</p>
                <span className={`text-sm font-bold ${card.color} group-hover:underline`}>{t(card.linkKey)}</span>
              </motion.a>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer id="contact" className="relative z-10 text-center py-6 text-sm text-slate-500 dark:text-slate-500 border-t border-white/10">
          © {new Date().getFullYear()} KültürRota — İstanbul Kültür Haritası
        </footer>
      </div>
    </div>
  );
}
