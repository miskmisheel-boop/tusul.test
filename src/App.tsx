import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sun, Moon, Globe, FileText, BarChart, Briefcase, 
  Download, Plus, Trash2, Search, Upload, CheckCircle, 
  ChevronRight, BrainCircuit 
} from 'lucide-react';
import { Language, INITIAL_CV_DATA, CVData } from './types';
import { translations } from './locales';
import { cn } from './lib/utils';
import CVBuilder from './components/CVBuilder';
import CVAiAnalysis from './components/CVAiAnalysis';
import CareerRecommendation from './components/CareerRecommendation';

export default function App() {
  const [lang, setLang] = useState<Language>(Language.MN);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'builder' | 'analysis' | 'recommend'>('builder');
  const [cvData, setCvData] = useState<CVData>(INITIAL_CV_DATA);

  const t = translations[lang];

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const toggleLang = () => setLang(prev => prev === Language.MN ? Language.EN : Language.MN);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)] text-[var(--fg)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 z-20">
        <div className="flex items-center gap-3 mb-10 px-2 mt-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent uppercase">
              {t.title}
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black">
              {t.subtitle}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-3 tracking-widest opacity-50">Menu</div>
          <NavItem 
            active={activeTab === 'builder'} 
            onClick={() => setActiveTab('builder')}
            icon={<FileText size={18} />}
            label={t.nav.builder}
          />
          <NavItem 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')}
            icon={<BarChart size={18} />}
            label={t.nav.analysis}
          />
          <NavItem 
            active={activeTab === 'recommend'} 
            onClick={() => setActiveTab('recommend')}
            icon={<Briefcase size={18} />}
            label={t.nav.recommend}
          />
          
          <div className="mt-8 p-4 bg-indigo-900/10 border border-indigo-500/10 rounded-2xl">
            <p className="text-[11px] text-indigo-300 font-medium leading-relaxed italic">
              "AI туслах бэлэн байна. Таны карьерыг шинэ түвшинд гаргахад туслая."
            </p>
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mode</span>
            <button 
              onClick={toggleTheme}
              className="relative w-14 h-8 bg-slate-900 rounded-full flex items-center px-1 border border-slate-800 shadow-inner group overflow-hidden"
            >
              <div className="flex justify-between w-full px-2 z-10 text-xs">
                <span>🌙</span>
                <span className="opacity-40">☀️</span>
              </div>
              <motion.div 
                layout
                className="absolute w-6 h-6 bg-slate-700 rounded-full border border-slate-600 shadow-lg"
                animate={{ x: theme === 'light' ? 24 : 0 }}
              />
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Lang</span>
            <div className="flex bg-slate-900 rounded-full p-1 border border-slate-800">
              <button 
                onClick={() => setLang(Language.MN)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1",
                  lang === Language.MN ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-white"
                )}
              >
                <span>🇲🇳</span> MN
              </button>
              <button 
                onClick={() => setLang(Language.EN)}
                className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold transition-all flex items-center gap-1",
                  lang === Language.EN ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-500 hover:text-white"
                )}
              >
                <span>🇺🇸</span> EN
              </button>
            </div>
          </div>
          
          <div className="text-[9px] text-slate-600 text-center pb-2 tracking-tighter opacity-50">
            © 2024 CareerFlow AI • v2.4.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + lang}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            {activeTab === 'builder' && (
              <CVBuilder 
                data={cvData} 
                setData={setCvData} 
                lang={lang} 
                t={t}
              />
            )}
            {activeTab === 'analysis' && (
              <CVAiAnalysis 
                data={cvData}
                lang={lang}
                t={t}
              />
            )}
            {activeTab === 'recommend' && (
              <CareerRecommendation 
                data={cvData}
                lang={lang}
                t={t}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        active 
          ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-400" 
          : "hover:bg-slate-900 text-slate-400 hover:text-slate-200"
      )}
    >
      <span className={cn(
        "transition-colors",
        active ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
      )}>
        {icon}
      </span>
      <span className="text-xs font-bold tracking-tight uppercase">{label}</span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-lg"
        />
      )}
    </button>
  );
}
