






import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Template, Client, Modele, Projet, SourceFolder, DiskUsage } from '../types';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  HardDrive,
  User,
  ChevronRight,
  Plus,
  X,
  UserPlus,
  FolderInput,
  Trash2,
  Calendar,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import * as Icons from 'lucide-react';

export function NewProject() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  
  // Data
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [models, setModels] = useState<Modele[]>([]);
  const [disks, setDisks] = useState<DiskUsage[]>([]);
  
  // State: Step 1 Sources
  const [sources, setSources] = useState<SourceFolder[]>([]);

  // State: Step 2 Destination & Metadata
  const [projectName, setProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [selectedDisk, setSelectedDisk] = useState<string>('');
  const [dateShooting, setDateShooting] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClient, setSelectedClient] = useState<number | null>(null);
  const [selectedModels, setSelectedModels] = useState<number[]>([]);
  const [projectNotes, setProjectNotes] = useState('');

  // Inline Creation State
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  
  const [isCreatingModel, setIsCreatingModel] = useState(false);
  const [newModelPrenom, setNewModelPrenom] = useState('');
  const [newModelNom, setNewModelNom] = useState('');

  useEffect(() => {
    const initData = async () => {
      api.logDebug('Wizard Init', 'Loading initial data', 'NewProject');
      const [tpls, cls, mds, dks] = await Promise.all([
        api.getTemplates(),
        api.getClients(),
        api.getModeles(),
        api.getDriveSpace()
      ]);
      setTemplates(tpls);
      setClients(cls);
      setModels(mds);
      setDisks(dks);
      
      const defaultTpl = tpls.find(t => t.is_default);
      if (defaultTpl) setSelectedTemplate(defaultTpl.id!);

      // Select default disk (one with most space or C:)
      const validDisk = dks.find(d => d.is_connected && d.free > 10000000000);
      if (validDisk) setSelectedDisk(validDisk.path);
    };
    initData();
  }, []);

  const handleAddSource = async () => {
      const path = await api.selectDirectory();
      if (path) {
          api.logDebug('Add Source', `User selected: ${path}`, 'NewProject');
          // Simulate scanning
          const info = await api.scanDirectory(path);
          setSources(prev => [...prev, info]);
          // Auto-fill project name from folder name if empty
          if (!projectName) {
              const folderName = path.split(/[\\/]/).pop();
              if (folderName) setProjectName(folderName);
          }
      }
  };

  const removeSource = (index: number) => {
      setSources(prev => prev.filter((_, i) => i !== index));
      api.logDebug('Remove Source', `Removed index ${index}`, 'NewProject');
  };

  const handleCreateClient = async () => {
    if (!newClientName) return;
    api.logDebug('Inline Client', `Creating client ${newClientName}`, 'NewProject');
    const id = await api.saveClient({ nom: newClientName });
    const newCls = await api.getClients();
    setClients(newCls);
    setSelectedClient(id);
    setIsCreatingClient(false);
    setNewClientName('');
  };

  const handleCreateModel = async () => {
    if (!newModelPrenom || !newModelNom) return;
    api.logDebug('Inline Model', `Creating model ${newModelPrenom} ${newModelNom}`, 'NewProject');
    const id = await api.saveModele({ prenom: newModelPrenom, nom: newModelNom });
    const newMds = await api.getModeles();
    setModels(newMds);
    setSelectedModels(prev => [...prev, id]);
    setIsCreatingModel(false);
    setNewModelPrenom('');
    setNewModelNom('');
  };

  const startCreation = async () => {
    setIsProcessing(true);
    setProgress(0);
    setProgressLog(["Initialisation du projet..."]);
    api.logDebug('Creation Start', `Project: ${projectName}`, 'NewProject');

    // Simulate process
    const totalFiles = sources.reduce((acc, s) => acc + s.fileCount, 0);
    const totalSize = sources.reduce((acc, s) => acc + s.size, 0);
    
    // Create Project in DB
    const newProject: Projet = {
        nom: projectName,
        date_shooting: dateShooting,
        statut: 'en_cours',
        taille_bytes: totalSize,
        nb_fichiers: totalFiles,
        chemin: `${selectedDisk}\\${projectName}`, // Mock path
        disque: selectedDisk,
        template_id: selectedTemplate || undefined,
        client_id: selectedClient,
        model_ids: selectedModels,
        notes: projectNotes
    };

    await new Promise(r => setTimeout(r, 800));
    setProgressLog(prev => [...prev, "Structure des dossiers créée ✅"]);
    setProgress(10);

    // Simulate Copy loop
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
        await new Promise(r => setTimeout(r, 150));
        const currentPct = 10 + Math.floor((i / steps) * 90);
        setProgress(currentPct);
        if (i % 3 === 0) {
            setProgressLog(prev => [`Copie fichier DSC_${1000 + i}.ARW...`, ...prev.slice(0, 4)]);
        }
    }

    await api.createProjet(newProject, sources.map(s => s.path));
    
    setProgress(100);
    setProgressLog(prev => ["Projet créé avec succès ! 🎉", ...prev]);
    setSuccess(true);
    setIsProcessing(false);
    api.logDebug('Creation Success', `Finished creating ${projectName}`, 'NewProject');
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Folder;
    return <IconComponent size={20} strokeWidth={1.5} />;
  };

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  // --- RENDER ---

  if (success) {
      return (
        <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="w-20 h-20 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
                 <Check size={40} />
             </div>
             <h2 className="text-3xl font-light text-black mb-2">Projet créé avec succès !</h2>
             <p className="text-text-secondary mb-8">
                 <span className="font-medium text-black">{projectName}</span> a été initialisé sur <span className="font-mono text-black">{selectedDisk}</span>
             </p>
             
             <div className="bg-white border border-border rounded-sm p-6 w-full max-w-md mb-8 text-left space-y-3">
                 <div className="flex justify-between text-sm">
                     <span className="text-text-secondary">Fichiers copiés</span>
                     <span className="font-medium">{sources.reduce((a,b)=>a+b.fileCount,0)}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                     <span className="text-text-secondary">Taille totale</span>
                     <span className="font-medium">{formatSize(sources.reduce((a,b)=>a+b.size,0))}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                     <span className="text-text-secondary">Durée</span>
                     <span className="font-medium">3 min 45 sec</span>
                 </div>
             </div>

             <div className="flex gap-4">
                 <button onClick={() => navigate('/')} className="px-6 py-2 border border-border rounded-full hover:bg-gray-50 transition-colors text-sm font-medium">
                     Retour au Dashboard
                 </button>
                 <button onClick={() => navigate('/projects')} className="px-6 py-2 bg-black text-white rounded-full hover:bg-accent-hover transition-colors text-sm font-medium">
                     Ouvrir le projet
                 </button>
             </div>
        </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 animate-fade-in flex flex-col h-full">
      {/* Header Wizard */}
      <div className="mb-10 text-center shrink-0">
        <h1 className="text-3xl font-light text-black tracking-tight">Nouveau Projet</h1>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center mb-12 space-x-4 text-xs font-medium uppercase tracking-widest shrink-0">
        <div className={clsx("flex items-center gap-2", step >= 1 ? "text-black" : "text-gray-300")}>
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center border", step >= 1 ? "border-black bg-black text-white" : "border-gray-300")}>1</div>
            Sources
        </div>
        <div className="w-12 h-px bg-gray-200" />
        <div className={clsx("flex items-center gap-2", step >= 2 ? "text-black" : "text-gray-300")}>
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center border", step >= 2 ? "border-black bg-black text-white" : "border-gray-300")}>2</div>
            Destination
        </div>
        <div className="w-12 h-px bg-gray-200" />
        <div className={clsx("flex items-center gap-2", step >= 3 ? "text-black" : "text-gray-300")}>
            <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center border", step >= 3 ? "border-black bg-black text-white" : "border-gray-300")}>3</div>
            Confirmation
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 relative">
          
          {/* STEP 1: SOURCES */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 h-full flex flex-col">
               <div 
                  onClick={handleAddSource}
                  className="border-2 border-dashed border-gray-300 rounded-sm p-12 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all group mb-8"
               >
                  <FolderInput className="mx-auto mb-4 text-gray-300 group-hover:text-black transition-colors" size={48} strokeWidth={1} />
                  <p className="font-medium text-lg text-black mb-1">Sélectionner les sources</p>
                  <p className="text-sm text-text-secondary">Glissez vos dossiers ici ou cliquez pour parcourir</p>
               </div>

               <div className="flex-1 overflow-y-auto min-h-[200px]">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Sources ajoutées ({sources.length})</h3>
                   {sources.length === 0 ? (
                       <p className="text-sm text-gray-400 italic">Aucune source sélectionnée.</p>
                   ) : (
                       <div className="space-y-3">
                           {sources.map((src, idx) => (
                               <div key={idx} className="bg-white border border-border p-4 rounded-sm flex justify-between items-center group hover:border-black transition-colors">
                                   <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-sm text-black">
                                           <FolderInput size={20} />
                                       </div>
                                       <div>
                                           <p className="font-medium text-sm text-black">{src.path}</p>
                                           <p className="text-xs text-text-secondary mt-0.5">
                                               {src.fileCount} fichiers • {formatSize(src.size)} • <span className="font-mono">RAW:{src.rawCount} JPG:{src.jpgCount}</span>
                                           </p>
                                       </div>
                                   </div>
                                   <button onClick={() => removeSource(idx)} className="text-gray-300 hover:text-danger p-2 transition-colors">
                                       <Trash2 size={16} />
                                   </button>
                               </div>
                           ))}
                       </div>
                   )}
               </div>
            </div>
          )}

          {/* STEP 2: DESTINATION */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 h-full flex flex-col overflow-y-auto">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* Left Column: Project Info */}
                   <div className="space-y-8">
                       <section>
                           <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Informations Projet</h3>
                           <div className="space-y-4">
                               <div>
                                   <label className="block text-xs font-medium text-black mb-1.5">Nom du projet</label>
                                   <input 
                                     type="text" 
                                     value={projectName}
                                     onChange={e => setProjectName(e.target.value)}
                                     placeholder="Ex: Wedding_Dupont"
                                     className="w-full border border-border p-3 rounded-sm focus:border-black outline-none font-medium"
                                   />
                               </div>
                               <div>
                                   <label className="block text-xs font-medium text-black mb-1.5">Date du shooting</label>
                                   <div className="relative">
                                       <input 
                                         type="date"
                                         value={dateShooting}
                                         onChange={e => setDateShooting(e.target.value)}
                                         className="w-full border border-border p-3 rounded-sm focus:border-black outline-none pl-10"
                                       />
                                       <Calendar size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                   </div>
                               </div>
                               <div>
                                   <label className="block text-xs font-medium text-black mb-1.5">Notes (optionnel)</label>
                                   <textarea 
                                     value={projectNotes}
                                     onChange={e => setProjectNotes(e.target.value)}
                                     className="w-full border border-border p-3 rounded-sm focus:border-black outline-none text-sm resize-none"
                                     rows={3}
                                     placeholder="Détails sur le shooting..."
                                   />
                               </div>
                           </div>
                       </section>

                       <section>
                           <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Client & Modèles</h3>
                           <div className="space-y-6">
                               {/* Client Selector */}
                               <div>
                                   <div className="flex justify-between items-center mb-2">
                                       <label className="block text-xs font-medium text-black">Client</label>
                                       <button onClick={() => setIsCreatingClient(true)} className="text-[10px] uppercase font-bold text-black flex items-center gap-1 hover:underline"><Plus size={10} /> Nouveau</button>
                                   </div>
                                   {isCreatingClient ? (
                                       <div className="flex gap-2 animate-in fade-in">
                                           <input autoFocus type="text" placeholder="Nom du client" value={newClientName} onChange={e => setNewClientName(e.target.value)} className="flex-1 border border-border p-2 text-sm rounded-sm" />
                                           <button onClick={handleCreateClient} disabled={!newClientName} className="bg-black text-white px-3 rounded-sm text-xs font-bold disabled:opacity-50">OK</button>
                                           <button onClick={() => setIsCreatingClient(false)} className="border border-border px-3 rounded-sm text-xs">X</button>
                                       </div>
                                   ) : (
                                       <select 
                                         value={selectedClient || ''}
                                         onChange={e => setSelectedClient(Number(e.target.value))}
                                         className="w-full border border-border p-3 rounded-sm bg-white focus:border-black outline-none"
                                       >
                                           <option value="">Sélectionner un client...</option>
                                           {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                                       </select>
                                   )}
                               </div>

                               {/* Models Selector */}
                               <div>
                                   <div className="flex justify-between items-center mb-2">
                                       <label className="block text-xs font-medium text-black">Modèles</label>
                                       <button onClick={() => setIsCreatingModel(true)} className="text-[10px] uppercase font-bold text-black flex items-center gap-1 hover:underline"><Plus size={10} /> Nouveau</button>
                                   </div>
                                   {isCreatingModel ? (
                                       <div className="flex gap-2 animate-in fade-in mb-3">
                                           <input autoFocus type="text" placeholder="Prénom" value={newModelPrenom} onChange={e => setNewModelPrenom(e.target.value)} className="flex-1 border border-border p-2 text-sm rounded-sm" />
                                           <input type="text" placeholder="Nom" value={newModelNom} onChange={e => setNewModelNom(e.target.value)} className="flex-1 border border-border p-2 text-sm rounded-sm" />
                                           <button onClick={handleCreateModel} disabled={!newModelPrenom} className="bg-black text-white px-3 rounded-sm text-xs font-bold disabled:opacity-50">OK</button>
                                           <button onClick={() => setIsCreatingModel(false)} className="border border-border px-3 rounded-sm text-xs">X</button>
                                       </div>
                                   ) : (
                                       <div className="flex flex-wrap gap-2 mb-2">
                                           {selectedModels.map(mid => {
                                               const m = models.find(mo => mo.id === mid);
                                               return (
                                                   <span key={mid} className="bg-gray-100 text-black text-xs px-2 py-1 rounded-sm flex items-center gap-1">
                                                       {m?.prenom} {m?.nom}
                                                       <button onClick={() => setSelectedModels(prev => prev.filter(id => id !== mid))} className="hover:text-danger"><X size={10} /></button>
                                                   </span>
                                               );
                                           })}
                                       </div>
                                   )}
                                   <select 
                                     value=""
                                     onChange={e => {
                                         const val = Number(e.target.value);
                                         if (!selectedModels.includes(val)) setSelectedModels(prev => [...prev, val]);
                                     }}
                                     className="w-full border border-border p-3 rounded-sm bg-white focus:border-black outline-none"
                                   >
                                       <option value="">Ajouter un modèle...</option>
                                       {models.filter(m => !selectedModels.includes(m.id!)).map(m => (
                                           <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>
                                       ))}
                                   </select>
                               </div>
                           </div>
                       </section>
                   </div>

                   {/* Right Column: Destination */}
                   <div className="space-y-8">
                       <section>
                           <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Structure (Template)</h3>
                           <div className="grid grid-cols-2 gap-4">
                               {templates.map(tpl => (
                                   <div 
                                     key={tpl.id}
                                     onClick={() => setSelectedTemplate(tpl.id!)}
                                     className={clsx(
                                         "p-4 border rounded-sm cursor-pointer transition-all flex items-center gap-3",
                                         selectedTemplate === tpl.id ? "border-black bg-black text-white" : "border-border hover:border-black"
                                     )}
                                   >
                                       {renderIcon(tpl.icone)}
                                       <span className="font-medium text-sm">{tpl.nom}</span>
                                   </div>
                               ))}
                           </div>
                       </section>

                       <section>
                           <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Disque de destination</h3>
                           <div className="space-y-3">
                               {disks.map(disk => {
                                   const percent = Math.round(((disk.total - disk.free) / disk.total) * 100);
                                   const isSelected = selectedDisk === disk.path;
                                   
                                   return (
                                       <div 
                                         key={disk.path}
                                         onClick={() => disk.is_connected && setSelectedDisk(disk.path)}
                                         className={clsx(
                                             "p-4 border rounded-sm transition-all relative overflow-hidden",
                                             !disk.is_connected && "opacity-50 cursor-not-allowed bg-gray-50",
                                             disk.is_connected && "cursor-pointer",
                                             isSelected ? "border-black ring-1 ring-black" : "border-border hover:border-black"
                                         )}
                                       >
                                           <div className="flex justify-between items-center mb-2 relative z-10">
                                               <div className="flex items-center gap-3">
                                                   <HardDrive size={18} className={isSelected ? "text-black" : "text-gray-400"} />
                                                   <div>
                                                       <p className="font-bold text-sm">{disk.path} <span className="font-normal text-text-secondary">({disk.label})</span></p>
                                                   </div>
                                               </div>
                                               {isSelected && <div className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center"><Check size={10} /></div>}
                                           </div>
                                           
                                           <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative z-10">
                                               <div 
                                                 className={clsx("h-full", disk.is_connected ? "bg-black" : "bg-red-400")} 
                                                 style={{ width: `${percent}%` }}
                                               ></div>
                                           </div>
                                           <div className="flex justify-between mt-2 text-[10px] text-text-secondary relative z-10">
                                               <span>{formatSize(disk.free)} libres</span>
                                               <span>Total: {formatSize(disk.total)}</span>
                                           </div>
                                       </div>
                                   );
                               })}
                           </div>
                       </section>
                   </div>
               </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & PROGRESS */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-8 fade-in duration-300 h-full flex flex-col items-center justify-center">
               {isProcessing ? (
                   <div className="w-full max-w-xl bg-white border border-border rounded-sm p-8 shadow-sm">
                       <div className="flex items-center justify-between mb-6">
                           <h3 className="font-medium text-lg flex items-center gap-2">
                               <Loader2 className="animate-spin" size={20} />
                               Création en cours...
                           </h3>
                           <span className="font-mono text-sm font-medium">{progress}%</span>
                       </div>
                       
                       <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
                           <div className="h-full bg-black transition-all duration-300" style={{ width: `${progress}%` }}></div>
                       </div>
                       
                       <div className="bg-black text-white p-4 rounded-sm font-mono text-xs h-40 overflow-hidden flex flex-col justify-end">
                           {progressLog.map((log, i) => (
                               <div key={i} className="opacity-80 pb-0.5 border-l-2 border-green-500 pl-2 ml-1">{log}</div>
                           ))}
                       </div>
                   </div>
               ) : (
                   <div className="w-full max-w-3xl border border-border p-8 bg-white rounded-sm">
                       <div className="text-center mb-10">
                           <HardDrive size={32} strokeWidth={1} className="mx-auto mb-4" />
                           <h2 className="text-2xl font-light text-black">Résumé du projet</h2>
                           <p className="text-text-secondary mt-1">Vérifiez les informations avant de lancer la création</p>
                       </div>

                       <div className="grid grid-cols-2 gap-8 mb-8 border-b border-border pb-8">
                           <div>
                               <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Source</h4>
                               <div className="space-y-2 text-sm">
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Dossiers</span>
                                       <span className="font-medium">{sources.length}</span>
                                   </div>
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Total Fichiers</span>
                                       <span className="font-medium">{sources.reduce((a,b)=>a+b.fileCount, 0)}</span>
                                   </div>
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Taille totale</span>
                                       <span className="font-medium">{formatSize(sources.reduce((a,b)=>a+b.size, 0))}</span>
                                   </div>
                               </div>
                           </div>
                           <div>
                               <h4 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Destination</h4>
                               <div className="space-y-2 text-sm">
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Nom Projet</span>
                                       <span className="font-medium">{projectName}</span>
                                   </div>
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Disque</span>
                                       <span className="font-medium">{selectedDisk}</span>
                                   </div>
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Template</span>
                                       <span className="font-medium">{templates.find(t=>t.id===selectedTemplate)?.nom}</span>
                                   </div>
                                   <div className="flex justify-between border-b border-border pb-1">
                                       <span className="text-text-secondary">Client</span>
                                       <span className="font-medium">{clients.find(c=>c.id===selectedClient)?.nom || '-'}</span>
                                   </div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-sm flex gap-3 text-sm text-yellow-800">
                           <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                           <p>
                               Vous allez copier <span className="font-bold">{sources.reduce((a,b)=>a+b.fileCount, 0)} fichiers</span> vers le disque <span className="font-bold">{selectedDisk}</span>. 
                               L'opération peut prendre quelques minutes.
                           </p>
                       </div>
                   </div>
               )}
            </div>
          )}
      </div>

      {/* Footer Actions */}
      {!isProcessing && (
        <div className="mt-8 flex justify-between pt-6 border-t border-border shrink-0">
          <button 
            onClick={() => {
                if(step > 1) {
                    setStep(step - 1);
                    api.logDebug('Step Change', `To Step ${step - 1}`, 'NewProject');
                } else {
                    navigate('/');
                }
            }}
            className="px-6 py-3 text-sm font-medium text-black hover:bg-gray-50 rounded-full transition-colors border border-border"
          >
            {step === 1 ? 'Annuler' : 'Retour'}
          </button>
          
          <button 
            onClick={() => {
                if (step < 3) {
                    setStep(step + 1);
                    api.logDebug('Step Change', `To Step ${step + 1}`, 'NewProject');
                } else {
                    startCreation();
                }
            }}
            disabled={step === 1 && sources.length === 0 || step === 2 && (!projectName || !selectedDisk)}
            className="px-8 py-3 bg-black text-white text-sm font-medium rounded-full hover:bg-accent-hover transition-colors flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {step === 3 ? (
              <>Lancer la création <HardDrive size={16} /></>
            ) : (
              <>Suivant <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}