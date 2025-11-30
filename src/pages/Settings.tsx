import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { AppSettings, Template, DebugLogEntry } from '../types';
import { 
  Settings as SettingsIcon, 
  Folder, 
  FileText, 
  Zap, 
  Database, 
  Info,
  Monitor,
  Moon,
  Sun,
  Bell,
  Volume2,
  Rocket,
  Minus,
  Check,
  ChevronRight,
  ExternalLink,
  Save,
  Terminal,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { clsx } from 'clsx';

const SECTIONS = [
  { id: 'general', label: 'Général', icon: SettingsIcon },
  { id: 'folders', label: 'Dossiers', icon: Folder },
  { id: 'files', label: 'Fichiers', icon: FileText },
  { id: 'performance', label: 'Performance', icon: Zap },
  { id: 'data', label: 'Données', icon: Database },
  { id: 'about', label: 'À propos', icon: Info },
];

const RAW_FORMATS = ['.ARW', '.CR2', '.CR3', '.NEF', '.NRW', '.RAF', '.DNG', '.ORF', '.RW2', '.PEF', '.SRW', '.IIQ', '.3FR', '.FFF', '.ERF', '.MOS', '.MRW', '.X3F'];
const IMAGE_FORMATS = ['.JPG', '.JPEG', '.PNG', '.TIFF', '.TIF', '.WEBP', '.HEIC', '.BMP'];

export function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Debug State
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [refreshingLogs, setRefreshingLogs] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [s, t] = await Promise.all([
        api.getSettings(),
        api.getTemplates()
      ]);
      setSettings(s);
      setTemplates(t);
      setLoading(false);
      api.logDebug('Settings Page Init', 'Settings loaded', 'Settings');
    };
    init();
  }, []);

  // Poll for logs if debug mode is on and we are in data section
  useEffect(() => {
      let interval: NodeJS.Timeout;
      if (activeSection === 'data' && settings?.data.debugMode) {
          fetchLogs();
          interval = setInterval(fetchLogs, 2000);
      }
      return () => clearInterval(interval);
  }, [activeSection, settings?.data.debugMode]);

  const fetchLogs = async () => {
      setRefreshingLogs(true);
      const logs = await api.getDebugLogs();
      setDebugLogs(logs);
      setRefreshingLogs(false);
  };

  const handleClearLogs = async () => {
      await api.clearDebugLogs();
      setDebugLogs([]);
      api.logDebug('Logs Cleared', 'User cleared debug logs', 'Settings');
  };

  const handleChange = (section: keyof AppSettings, key: string, value: any) => {
    if (!settings) return;
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
    api.saveSettings(newSettings);
    api.logDebug('Setting Changed', `${String(key)} = ${value}`, 'Settings');
  };

  const handleToggleFormat = (type: 'rawFormats' | 'imageFormats', format: string) => {
    if (!settings) return;
    const current = settings.files[type];
    const updated = current.includes(format) 
      ? current.filter(f => f !== format)
      : [...current, format];
    
    handleChange('files', type, updated);
  };

  const formatLogDate = (iso: string) => {
      const d = new Date(iso);
      return d.toLocaleString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit'
      }) + '.' + d.getMilliseconds().toString().padStart(3, '0');
  };

  if (loading || !settings) return <div className="flex h-full items-center justify-center"><div className="w-8 h-8 border-2 border-border border-t-black rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-full pt-4 animate-fade-in gap-8">
      {/* Sidebar Navigation */}
      <div className="w-56 shrink-0 flex flex-col gap-1">
        <h2 className="text-3xl font-light text-black tracking-tight mb-8 px-2">Paramètres</h2>
        {SECTIONS.map(section => (
          <button
            key={section.id}
            onClick={() => {
                setActiveSection(section.id);
                api.logDebug('Section Changed', `Switched to ${section.id}`, 'Settings');
            }}
            className={clsx(
              "flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 text-sm font-medium text-left",
              activeSection === section.id 
                ? "bg-black text-white" 
                : "text-text-secondary hover:bg-white hover:text-black"
            )}
          >
            <section.icon size={18} strokeWidth={1.5} />
            {section.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 bg-white border border-border rounded-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          
          {/* GENERAL SECTION */}
          {activeSection === 'general' && (
            <div className="space-y-12 max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Thème de l'interface</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'light', label: 'Clair', icon: Sun },
                    { id: 'dark', label: 'Sombre', icon: Moon },
                    { id: 'system', label: 'Système', icon: Monitor },
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => handleChange('general', 'theme', theme.id)}
                      className={clsx(
                        "flex flex-col items-center justify-center gap-3 p-6 border rounded-sm transition-all",
                        settings.general.theme === theme.id
                          ? "border-black bg-gray-50 ring-1 ring-black"
                          : "border-border hover:border-black"
                      )}
                    >
                      <theme.icon size={24} strokeWidth={1} />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Langue & Région</h3>
                 <div>
                    <label className="block text-sm font-medium text-black mb-2">Langue de l'application</label>
                    <select 
                      value={settings.general.language}
                      onChange={(e) => handleChange('general', 'language', e.target.value)}
                      className="w-full border border-border p-3 rounded-sm bg-white focus:border-black outline-none"
                    >
                      <option value="fr">🇫🇷 Français</option>
                      <option value="en">🇺🇸 English</option>
                    </select>
                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Système</h3>
                 
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                       <div className="flex items-center gap-4">
                          <Bell size={20} className="text-text-secondary" />
                          <div>
                             <p className="font-medium text-sm">Notifications</p>
                             <p className="text-xs text-text-secondary">Afficher les notifications système</p>
                          </div>
                       </div>
                       <button 
                          onClick={() => handleChange('general', 'notifications', !settings.general.notifications)}
                          className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.general.notifications ? "bg-black" : "bg-gray-200")}
                       >
                          <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.general.notifications ? "translate-x-6" : "translate-x-0")} />
                       </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                       <div className="flex items-center gap-4">
                          <Volume2 size={20} className="text-text-secondary" />
                          <div>
                             <p className="font-medium text-sm">Sons</p>
                             <p className="text-xs text-text-secondary">Jouer un son à la fin des opérations</p>
                          </div>
                       </div>
                       <button 
                          onClick={() => handleChange('general', 'sound', !settings.general.sound)}
                          className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.general.sound ? "bg-black" : "bg-gray-200")}
                       >
                          <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.general.sound ? "translate-x-6" : "translate-x-0")} />
                       </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                       <div className="flex items-center gap-4">
                          <Rocket size={20} className="text-text-secondary" />
                          <div>
                             <p className="font-medium text-sm">Lancer au démarrage</p>
                             <p className="text-xs text-text-secondary">Démarrer PhotoFlow avec Windows</p>
                          </div>
                       </div>
                       <button 
                          onClick={() => handleChange('general', 'launchAtStartup', !settings.general.launchAtStartup)}
                          className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.general.launchAtStartup ? "bg-black" : "bg-gray-200")}
                       >
                          <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.general.launchAtStartup ? "translate-x-6" : "translate-x-0")} />
                       </button>
                    </div>
                 </div>
              </section>
            </div>
          )}

          {/* FOLDERS SECTION */}
          {activeSection === 'folders' && (
            <div className="space-y-12 max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
              <section className="space-y-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Configuration par défaut</h3>
                 
                 <div>
                    <label className="block text-sm font-medium text-black mb-2">Destination par défaut</label>
                    <div className="flex gap-2">
                       <input 
                          type="text" 
                          readOnly 
                          value={settings.folders.defaultDestination}
                          className="flex-1 border border-border p-3 rounded-sm bg-gray-50 text-sm font-mono text-text-secondary"
                       />
                       <button className="px-4 py-2 border border-border rounded-sm hover:bg-black hover:text-white transition-colors text-sm font-medium">Parcourir</button>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">Disque utilisé par défaut pour les nouveaux projets.</p>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-black mb-2">Template par défaut</label>
                    <select 
                      value={settings.folders.defaultTemplate}
                      onChange={(e) => handleChange('folders', 'defaultTemplate', Number(e.target.value))}
                      className="w-full border border-border p-3 rounded-sm bg-white focus:border-black outline-none"
                    >
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.nom}</option>
                      ))}
                    </select>
                 </div>
              </section>

              <section className="space-y-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Structure</h3>
                 
                 <div>
                    <label className="block text-sm font-medium text-black mb-2">Dossier racine des projets</label>
                    <input 
                      type="text"
                      value={settings.folders.rootFolderName}
                      onChange={(e) => handleChange('folders', 'rootFolderName', e.target.value)}
                      className="w-full border border-border p-3 rounded-sm bg-white focus:border-black outline-none"
                    />
                    <p className="text-xs text-text-secondary mt-2">Nom du dossier racine créé sur chaque disque.</p>
                 </div>

                 <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                    <div>
                        <p className="font-medium text-sm">Organisation par année</p>
                        <p className="text-xs text-text-secondary">Créer automatiquement un sous-dossier avec l'année (ex: 2024)</p>
                    </div>
                    <button 
                        onClick={() => handleChange('folders', 'organizeByYear', !settings.folders.organizeByYear)}
                        className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.folders.organizeByYear ? "bg-black" : "bg-gray-200")}
                    >
                        <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.folders.organizeByYear ? "translate-x-6" : "translate-x-0")} />
                    </button>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-black mb-2">Format du nom de projet</label>
                    <select 
                      value={settings.folders.projectNameFormat}
                      onChange={(e) => handleChange('folders', 'projectNameFormat', e.target.value)}
                      className="w-full border border-border p-3 rounded-sm bg-white focus:border-black outline-none font-mono text-sm"
                    >
                      <option value="{DATE}_{NOM}">{`{DATE}_{NOM}  (ex: 2024-01-15_Wedding)`}</option>
                      <option value="{NOM}_{DATE}">{`{NOM}_{DATE}  (ex: Wedding_2024-01-15)`}</option>
                      <option value="{NOM}">{`{NOM}  (ex: Wedding)`}</option>
                    </select>
                 </div>
              </section>
            </div>
          )}

          {/* FILES SECTION */}
          {activeSection === 'files' && (
             <div className="space-y-12 max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Transfert</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-4">Mode de transfert</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div 
                          onClick={() => handleChange('files', 'transferMode', 'copy')}
                          className={clsx(
                            "p-4 border rounded-sm cursor-pointer hover:border-black transition-colors",
                            settings.files.transferMode === 'copy' ? "bg-gray-50 border-black ring-1 ring-black" : "border-border"
                          )}
                        >
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-bold">Copier</span>
                              {settings.files.transferMode === 'copy' && <Check size={16} />}
                           </div>
                           <p className="text-xs text-text-secondary">Conserve les fichiers originaux sur la carte source. (Recommandé)</p>
                        </div>
                        <div 
                          onClick={() => handleChange('files', 'transferMode', 'move')}
                          className={clsx(
                            "p-4 border rounded-sm cursor-pointer hover:border-black transition-colors",
                            settings.files.transferMode === 'move' ? "bg-gray-50 border-black ring-1 ring-black" : "border-border"
                          )}
                        >
                           <div className="flex items-center justify-between mb-2">
                              <span className="font-bold">Déplacer</span>
                              {settings.files.transferMode === 'move' && <Check size={16} />}
                           </div>
                           <p className="text-xs text-text-secondary">Supprime les fichiers sources après transfert. (Plus rapide)</p>
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                    <div>
                        <p className="font-medium text-sm">Recherche récursive</p>
                        <p className="text-xs text-text-secondary">Scanner les sous-dossiers des sources</p>
                    </div>
                    <button 
                        onClick={() => handleChange('files', 'includeSubfolders', !settings.files.includeSubfolders)}
                        className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.files.includeSubfolders ? "bg-black" : "bg-gray-200")}
                    >
                        <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.files.includeSubfolders ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Formats Supportés</h3>
                  
                  <div>
                      <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-black">Formats RAW</label>
                          <div className="space-x-2">
                              <button onClick={() => handleChange('files', 'rawFormats', RAW_FORMATS)} className="text-[10px] uppercase font-bold text-text-secondary hover:text-black">Tout sélectionner</button>
                              <button onClick={() => handleChange('files', 'rawFormats', [])} className="text-[10px] uppercase font-bold text-text-secondary hover:text-black">Tout désélectionner</button>
                          </div>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {RAW_FORMATS.map(fmt => (
                              <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={settings.files.rawFormats.includes(fmt)}
                                    onChange={() => handleToggleFormat('rawFormats', fmt)}
                                    className="rounded-sm border-gray-300 text-black focus:ring-black"
                                  />
                                  <span className="text-xs font-mono">{fmt}</span>
                              </label>
                          ))}
                      </div>
                  </div>

                  <div className="pt-4">
                      <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-medium text-black">Formats Image</label>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {IMAGE_FORMATS.map(fmt => (
                              <label key={fmt} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={settings.files.imageFormats.includes(fmt)}
                                    onChange={() => handleToggleFormat('imageFormats', fmt)}
                                    className="rounded-sm border-gray-300 text-black focus:ring-black"
                                  />
                                  <span className="text-xs font-mono">{fmt}</span>
                              </label>
                          ))}
                      </div>
                  </div>
               </section>
             </div>
          )}

          {/* PERFORMANCE SECTION */}
          {activeSection === 'performance' && (
            <div className="space-y-12 max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Optimisation</h3>
                  
                  <div>
                      <div className="flex justify-between items-center mb-2">
                         <label className="text-sm font-medium text-black">Threads de copie ({settings.performance.threads})</label>
                      </div>
                      <input 
                         type="range" 
                         min="1" 
                         max="8" 
                         value={settings.performance.threads}
                         onChange={(e) => handleChange('performance', 'threads', Number(e.target.value))}
                         className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                      />
                      <div className="flex justify-between text-xs text-text-secondary mt-2">
                         <span>1 (Éco)</span>
                         <span>8 (Max)</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-2">Plus de threads accélère le transfert mais utilise plus de CPU.</p>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                    <div>
                        <p className="font-medium text-sm">Vérification d'intégrité</p>
                        <p className="text-xs text-text-secondary">Calculer le checksum après copie (Ralentit le transfert)</p>
                    </div>
                    <button 
                        onClick={() => handleChange('performance', 'verifyIntegrity', !settings.performance.verifyIntegrity)}
                        className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.performance.verifyIntegrity ? "bg-black" : "bg-gray-200")}
                    >
                        <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.performance.verifyIntegrity ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-black mb-2">Espace disque minimum (GB)</label>
                     <input 
                       type="number"
                       value={settings.performance.minFreeSpaceGB}
                       onChange={(e) => handleChange('performance', 'minFreeSpaceGB', Number(e.target.value))}
                       className="w-24 border border-border p-2 rounded-sm bg-white focus:border-black outline-none"
                     />
                     <p className="text-xs text-text-secondary mt-1">L'opération sera bloquée si l'espace libre est insuffisant.</p>
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Cache</h3>
                  <div className="p-4 border border-border rounded-sm bg-gray-50 flex justify-between items-center">
                      <div>
                          <p className="text-sm font-medium">Cache EXIF</p>
                          <p className="text-xs text-text-secondary mt-1">{settings.performance.exifCacheSize} entrées</p>
                      </div>
                      <button className="text-xs font-medium border border-border px-3 py-1.5 rounded-sm hover:bg-white transition-colors">Vider le cache</button>
                  </div>
               </section>
            </div>
          )}

          {/* DATA SECTION */}
          {activeSection === 'data' && (
            <div className="space-y-12 max-w-3xl animate-in fade-in slide-in-from-right-4 duration-300">
               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Base de données</h3>
                  
                  <div className="p-4 border border-border rounded-sm bg-gray-50">
                      <div className="flex items-center gap-2 mb-2">
                         <Database size={16} />
                         <span className="font-mono text-xs">database.sqlite</span>
                      </div>
                      <p className="text-xs text-text-secondary mb-4 break-all">C:\Users\Alan\AppData\Roaming\PhotoFlow\database.sqlite</p>
                      <button className="text-xs font-medium bg-white border border-border px-3 py-1.5 rounded-sm hover:border-black transition-colors">Ouvrir le dossier</button>
                  </div>

                  <div className="flex gap-4">
                      <button className="flex-1 py-3 border border-border rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          <Save size={16} /> Exporter la base
                      </button>
                      <button className="flex-1 py-3 border border-border rounded-sm text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                          Import
                      </button>
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Zone de danger</h3>
                  
                  <div className="border border-danger/20 rounded-sm p-6 bg-red-50/10">
                      <h4 className="text-danger font-medium text-sm mb-2">Réinitialisation</h4>
                      <p className="text-xs text-text-secondary mb-6">Ces actions sont irréversibles. Soyez prudent.</p>
                      
                      <div className="space-y-3">
                          <button className="w-full text-left px-4 py-3 border border-border hover:border-danger hover:text-danger rounded-sm text-sm transition-colors bg-white">
                              Réinitialiser tous les paramètres
                          </button>
                          <button className="w-full text-left px-4 py-3 border border-danger text-danger hover:bg-danger hover:text-white rounded-sm text-sm transition-colors bg-white">
                              Supprimer toutes les données (Projets, Clients, Modèles)
                          </button>
                      </div>
                  </div>
               </section>

               <section className="space-y-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4">Debug</h3>
                  
                  <div className="flex items-center justify-between p-4 border border-border rounded-sm">
                    <div>
                        <p className="font-medium text-sm">Mode Debug</p>
                        <p className="text-xs text-text-secondary">Activer les journaux détaillés pour le développement</p>
                    </div>
                    <button 
                        onClick={() => handleChange('data', 'debugMode', !settings.data.debugMode)}
                        className={clsx("w-12 h-6 rounded-full p-1 transition-colors relative", settings.data.debugMode ? "bg-black" : "bg-gray-200")}
                    >
                        <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", settings.data.debugMode ? "translate-x-6" : "translate-x-0")} />
                    </button>
                  </div>

                  {settings.data.debugMode && (
                      <div className="border border-border rounded-sm overflow-hidden bg-gray-900 text-green-400 font-mono text-xs flex flex-col h-80">
                          <div className="p-2 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                              <span className="flex items-center gap-2">
                                  <Terminal size={14} /> 
                                  Logs ({debugLogs.length})
                              </span>
                              <div className="flex gap-2">
                                  <button onClick={fetchLogs} className="p-1 hover:text-white" title="Actualiser"><RefreshCw size={14} className={clsx(refreshingLogs && "animate-spin")} /></button>
                                  <button onClick={handleClearLogs} className="p-1 hover:text-red-400" title="Effacer"><Trash2 size={14} /></button>
                              </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-1">
                              {debugLogs.length === 0 ? (
                                  <span className="opacity-50">Aucun log disponible...</span>
                              ) : (
                                  debugLogs.map((log, i) => (
                                      <div key={i} className="flex gap-2 border-b border-gray-800 pb-1 mb-1 last:border-0 last:mb-0 last:pb-0">
                                          <span className="text-gray-500 whitespace-nowrap">[{formatLogDate(log.timestamp)}]</span>
                                          <span className="text-yellow-400 w-24 shrink-0 truncate text-right">[{log.component || 'App'}]</span>
                                          <span className="text-white font-bold whitespace-nowrap">{log.action}:</span>
                                          <span className="break-all">{log.details || '-'}</span>
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  )}
               </section>
            </div>
          )}

          {/* ABOUT SECTION */}
          {activeSection === 'about' && (
            <div className="space-y-12 max-w-2xl mx-auto text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
               <div className="pt-12">
                   <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-6">
                       <span className="text-2xl font-bold tracking-tighter">PF</span>
                   </div>
                   <h2 className="text-2xl font-light text-black">PhotoFlow Master</h2>
                   <p className="text-sm text-text-secondary mt-2">Version 2.0.0</p>
               </div>

               <div className="space-y-4">
                   <p className="text-sm text-text-secondary max-w-md mx-auto">
                       Gestionnaire de projets photo professionnel conçu pour simplifier votre workflow et sécuriser vos données.
                   </p>
                   <div className="flex items-center justify-center gap-6 text-sm font-medium pt-4">
                       <a href="#" className="hover:underline">Site web</a>
                       <a href="#" className="hover:underline">Documentation</a>
                       <a href="#" className="hover:underline">Support</a>
                       <a href="#" className="hover:underline">GitHub</a>
                   </div>
               </div>

               <div className="pt-12 border-t border-border mt-12">
                   <p className="text-xs text-text-secondary mb-4">© 2024 PhotoFlow Master. Tous droits réservés.</p>
                   <p className="text-[10px] text-text-secondary">
                       Développé avec Electron, React, et beaucoup de ☕️ par Alan Clerence.
                   </p>
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}