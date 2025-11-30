import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { AppSettings, Template } from '../../types';
import { 
  ArrowRight, 
  Check, 
  Monitor, 
  Moon, 
  Sun,
  LayoutTemplate,
  FolderOpen,
  FileText,
  Zap,
  Globe,
  Bell,
  Volume2
} from 'lucide-react';
import { clsx } from 'clsx';

interface OnboardingWizardProps {
  onComplete: () => void;
  initialSettings: AppSettings;
}

const STEPS = [
  { id: 1, label: 'Bienvenue' },
  { id: 2, label: 'Interface' },
  { id: 3, label: 'Structure' },
  { id: 4, label: 'Fichiers' },
  { id: 5, label: 'Optimisation' },
];

export function OnboardingWizard({ onComplete, initialSettings }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadTemplates = async () => {
      const tpls = await api.getTemplates();
      setTemplates(tpls);
    };
    loadTemplates();
  }, []);

  const handleChange = (section: keyof AppSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep(prev => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const finalSettings: AppSettings = {
      ...settings,
      general: {
        ...settings.general,
        isFirstRun: false,
        userName: userName.trim()
      }
    };
    await api.saveSettings(finalSettings);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center animate-fade-in font-sans">
      <div className="w-full max-w-4xl h-[80vh] flex flex-col relative">
        {/* Stepper */}
        <div className="absolute top-0 left-0 right-0 flex justify-center items-center gap-2 mb-12">
          {STEPS.map((s, idx) => (
            <div key={s.id} className="flex items-center gap-2">
               <div className={clsx(
                  "w-2.5 h-2.5 rounded-full transition-all duration-300",
                  step >= s.id ? "bg-black" : "bg-gray-200"
               )} />
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center mt-8">
            {/* STEP 1: WELCOME */}
            {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-md w-full">
                   <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                       <span className="text-2xl font-bold tracking-tighter">PF</span>
                   </div>
                   <h1 className="text-4xl font-light text-black mb-4">Bienvenue sur PhotoFlow</h1>
                   <p className="text-text-secondary mb-12">
                       Configurons ensemble votre nouvel espace de travail pour photographe professionnel.
                   </p>
                   
                   <div className="text-left bg-gray-50 border border-border p-6 rounded-sm mb-8">
                       <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-2">Comment vous appelez-vous ?</label>
                       <input 
                          type="text" 
                          placeholder="Votre Prénom" 
                          value={userName}
                          onChange={e => setUserName(e.target.value)}
                          className="w-full bg-transparent border-b border-black text-2xl font-light py-2 outline-none placeholder-gray-300"
                          autoFocus
                          onKeyDown={e => e.key === 'Enter' && userName && handleNext()}
                       />
                   </div>
                </div>
            )}

            {/* STEP 2: INTERFACE */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 max-w-2xl w-full">
                    <h2 className="text-2xl font-light text-black mb-2">Personnalisation de l'interface</h2>
                    <p className="text-text-secondary mb-10">Choisissez l'apparence qui vous correspond le mieux.</p>

                    <div className="grid grid-cols-3 gap-6 mb-10">
                        {[
                            { id: 'light', label: 'Clair', icon: Sun },
                            { id: 'dark', label: 'Sombre', icon: Moon },
                            { id: 'system', label: 'Système', icon: Monitor },
                        ].map(theme => (
                            <button
                                key={theme.id}
                                onClick={() => handleChange('general', 'theme', theme.id)}
                                className={clsx(
                                    "flex flex-col items-center justify-center gap-4 p-8 border rounded-sm transition-all",
                                    settings.general.theme === theme.id
                                        ? "border-black bg-black text-white shadow-lg scale-105"
                                        : "border-border hover:border-gray-400 bg-white"
                                )}
                            >
                                <theme.icon size={32} strokeWidth={1} />
                                <span className="text-sm font-medium">{theme.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-left">
                        <div className="p-4 border border-border rounded-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Globe size={20} />
                                <span className="font-medium text-sm">Langue</span>
                            </div>
                            <select 
                                value={settings.general.language}
                                onChange={e => handleChange('general', 'language', e.target.value)}
                                className="bg-transparent text-sm font-medium outline-none text-right cursor-pointer"
                            >
                                <option value="fr">Français</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                        <div className="p-4 border border-border rounded-sm flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Bell size={20} />
                                <span className="font-medium text-sm">Notifications</span>
                            </div>
                            <button 
                                onClick={() => handleChange('general', 'notifications', !settings.general.notifications)}
                                className={clsx("w-10 h-5 rounded-full p-0.5 transition-colors relative", settings.general.notifications ? "bg-black" : "bg-gray-200")}
                            >
                                <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.general.notifications ? "translate-x-5" : "translate-x-0")} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 3: STRUCTURE */}
            {step === 3 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 max-w-2xl w-full">
                    <h2 className="text-2xl font-light text-black mb-2">Structure des dossiers</h2>
                    <p className="text-text-secondary mb-10">Définissez comment vos projets seront organisés sur votre disque.</p>

                    <div className="space-y-6 text-left">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Destination par défaut</label>
                            <div className="flex gap-2">
                                <div className="flex-1 border border-border p-4 rounded-sm bg-gray-50 text-sm font-mono text-text-secondary truncate">
                                    {settings.folders.defaultDestination || 'C:\\Users\\Alan\\Pictures\\Projets'}
                                </div>
                                <button className="px-6 py-2 border border-border rounded-sm hover:bg-black hover:text-white transition-colors text-sm font-medium">
                                    Parcourir
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Template par défaut</label>
                            <div className="grid grid-cols-2 gap-4">
                                {templates.slice(0, 4).map(tpl => (
                                    <div 
                                        key={tpl.id}
                                        onClick={() => handleChange('folders', 'defaultTemplate', tpl.id)}
                                        className={clsx(
                                            "p-4 border rounded-sm cursor-pointer flex items-center gap-3 transition-all",
                                            settings.folders.defaultTemplate === tpl.id 
                                                ? "border-black bg-black text-white shadow-md" 
                                                : "border-border hover:border-black"
                                        )}
                                    >
                                        <LayoutTemplate size={18} />
                                        <span className="text-sm font-medium">{tpl.nom}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-text-secondary mb-3">Format du nom</label>
                            <select 
                                value={settings.folders.projectNameFormat}
                                onChange={(e) => handleChange('folders', 'projectNameFormat', e.target.value)}
                                className="w-full border border-border p-4 rounded-sm bg-white focus:border-black outline-none font-mono text-sm"
                            >
                                <option value="{DATE}_{NOM}">{`{DATE}_{NOM}  (ex: 2024-01-15_Wedding)`}</option>
                                <option value="{NOM}_{DATE}">{`{NOM}_{DATE}  (ex: Wedding_2024-01-15)`}</option>
                                <option value="{NOM}">{`{NOM}  (ex: Wedding)`}</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 4: FILES */}
            {step === 4 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 max-w-2xl w-full">
                    <h2 className="text-2xl font-light text-black mb-2">Gestion des fichiers</h2>
                    <p className="text-text-secondary mb-10">Optimisez votre flux de travail lors de l'import.</p>

                    <div className="space-y-8 text-left">
                        <div className="grid grid-cols-2 gap-6">
                            <div 
                                onClick={() => handleChange('files', 'transferMode', 'copy')}
                                className={clsx(
                                    "p-6 border rounded-sm cursor-pointer hover:border-black transition-all",
                                    settings.files.transferMode === 'copy' ? "bg-black text-white border-black shadow-md" : "border-border bg-white"
                                )}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <FileText size={24} />
                                    {settings.files.transferMode === 'copy' && <Check size={20} />}
                                </div>
                                <h3 className="font-bold mb-1">Copier</h3>
                                <p className={clsx("text-xs", settings.files.transferMode === 'copy' ? "text-gray-300" : "text-text-secondary")}>
                                    Conserve les originaux (Sûr).
                                </p>
                            </div>
                            <div 
                                onClick={() => handleChange('files', 'transferMode', 'move')}
                                className={clsx(
                                    "p-6 border rounded-sm cursor-pointer hover:border-black transition-all",
                                    settings.files.transferMode === 'move' ? "bg-black text-white border-black shadow-md" : "border-border bg-white"
                                )}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <ArrowRight size={24} />
                                    {settings.files.transferMode === 'move' && <Check size={20} />}
                                </div>
                                <h3 className="font-bold mb-1">Déplacer</h3>
                                <p className={clsx("text-xs", settings.files.transferMode === 'move' ? "text-gray-300" : "text-text-secondary")}>
                                    Supprime les sources (Rapide).
                                </p>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border border-border rounded-sm">
                            <h4 className="font-bold text-sm mb-4">Formats RAW supportés</h4>
                            <div className="flex flex-wrap gap-2">
                                {['.ARW', '.CR2', '.CR3', '.NEF', '.RAF', '.DNG'].map(fmt => (
                                    <span key={fmt} className="bg-white border border-border px-3 py-1.5 rounded-sm text-xs font-mono font-medium">
                                        {fmt}
                                    </span>
                                ))}
                                <span className="text-xs text-text-secondary flex items-center px-2">+12 autres</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STEP 5: OPTIMIZATION */}
            {step === 5 && (
                 <div className="animate-in fade-in slide-in-from-right-8 duration-300 max-w-2xl w-full">
                    <h2 className="text-2xl font-light text-black mb-2">Optimisation</h2>
                    <p className="text-text-secondary mb-10">Ajustez les performances selon votre machine.</p>

                    <div className="space-y-8 text-left max-w-lg mx-auto">
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-black flex items-center gap-2">
                                    <Zap size={16} /> Threads de copie
                                </label>
                                <span className="font-mono text-sm bg-black text-white px-2 py-0.5 rounded-sm">{settings.performance.threads}</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="8" 
                                value={settings.performance.threads}
                                onChange={(e) => handleChange('performance', 'threads', Number(e.target.value))}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                            <p className="text-xs text-text-secondary mt-2 text-center">
                                Nombre de fichiers copiés simultanément.
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-6 border border-border rounded-sm">
                            <div>
                                <p className="font-bold text-sm">Vérification d'intégrité</p>
                                <p className="text-xs text-text-secondary mt-1">Calcule le checksum après chaque copie.</p>
                            </div>
                            <button 
                                onClick={() => handleChange('performance', 'verifyIntegrity', !settings.performance.verifyIntegrity)}
                                className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.performance.verifyIntegrity ? "bg-black" : "bg-gray-200")}
                            >
                                <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.performance.verifyIntegrity ? "translate-x-6" : "translate-x-0")} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>

        <div className="mt-8 mb-12 flex justify-between w-full max-w-lg px-8">
            {step > 1 ? (
                <button 
                    onClick={() => setStep(prev => prev - 1)}
                    className="px-6 py-3 text-sm font-medium text-text-secondary hover:text-black transition-colors"
                >
                    Retour
                </button>
            ) : (
                <div></div> // Spacer
            )}
            
            <button 
                onClick={handleNext}
                disabled={step === 1 && !userName.trim()}
                className="px-10 py-3 bg-black text-white text-sm font-bold rounded-full hover:bg-accent-hover transition-all flex items-center gap-2 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {step === STEPS.length ? 'Commencer' : 'Suivant'}
                <ArrowRight size={16} />
            </button>
        </div>
      </div>
    </div>
  );
}