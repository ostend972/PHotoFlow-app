


import React, { useState, useEffect, useMemo, useRef } from 'react';
import { api } from '../lib/api';
import { Modele, Projet } from '../types';
import { 
  Search, 
  Plus, 
  Instagram, 
  Mail, 
  Phone, 
  Ruler, 
  Eye, 
  Scissors,
  X,
  Edit3,
  Trash2,
  Camera,
  User,
  MoreVertical,
  Briefcase
} from 'lucide-react';
import { clsx } from 'clsx';

export function Models() {
  const [modeles, setModeles] = useState<Modele[]>([]);
  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedModel, setSelectedModel] = useState<Modele | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<Partial<Modele>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    api.logDebug('Models Load', 'Fetching models list', 'Models');
    const [m, p] = await Promise.all([
      api.getModeles(),
      api.getProjets()
    ]);
    setModeles(m);
    setProjects(p);
    setLoading(false);
  };

  const filteredModels = useMemo(() => {
    return modeles.filter(m => 
      m.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.instagram && m.instagram.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [modeles, searchQuery]);

  const handleOpenCreate = () => {
    setEditingModel({ prenom: '', nom: '' });
    setIsEditModalOpen(true);
    api.logDebug('Model Create', 'Opened create modal', 'Models');
  };

  const handleOpenEdit = (model: Modele) => {
    setEditingModel({ ...model });
    setIsEditModalOpen(true);
    api.logDebug('Model Edit', `Opened edit modal for ${model.id}`, 'Models');
  };

  const handleSave = async () => {
    if (!editingModel.nom || !editingModel.prenom) return;
    api.logDebug('Model Save', `Saving model ${editingModel.prenom} ${editingModel.nom}`, 'Models');
    await api.saveModele(editingModel as Modele);
    setIsEditModalOpen(false);
    loadData();
    if (selectedModel && editingModel.id === selectedModel.id) {
      setSelectedModel({ ...selectedModel, ...editingModel } as Modele);
    }
  };

  const handleDelete = async (model: Modele) => {
    if (confirm(`Supprimer le modèle ${model.prenom} ${model.nom} ?`)) {
      api.logDebug('Model Delete', `Deleting model ${model.id}`, 'Models');
      await api.deleteModele(model.id!);
      if (selectedModel?.id === model.id) setSelectedModel(null);
      loadData();
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingModel({ ...editingModel, photo_path: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const getModelProjects = (modelId: number) => {
    // In a real scenario we would filter by a join table. 
    // For now we just return empty or mock logic if `project_count` was populated.
    // Let's rely on the fact that we can fetch projects.
    return projects.slice(0, (editingModel.id || 0) % 5); // Mock correlation
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">
            Modèles <span className="text-gray-300 text-2xl ml-2 font-thin">{modeles.length}</span>
          </h2>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nouveau modèle</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-8 shrink-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un modèle, instagram..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:border-black outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pb-8">
          {filteredModels.map(model => (
            <div 
              key={model.id}
              onClick={() => {
                  setSelectedModel(model);
                  api.logDebug('Model View', `Opened detail for ${model.id}`, 'Models');
              }}
              className="bg-white border border-border rounded-sm overflow-hidden hover:border-black transition-all cursor-pointer group flex flex-col h-full hover:shadow-md"
            >
              <div className="aspect-square bg-gray-50 relative overflow-hidden flex items-center justify-center">
                 {model.photo_path ? (
                    <img src={model.photo_path} alt={model.prenom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                    <User size={48} className="text-gray-300" strokeWidth={1} />
                 )}
                 <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="bg-white/80 backdrop-blur p-1.5 rounded-full text-black hover:bg-black hover:text-white transition-colors" onClick={(e) => { e.stopPropagation(); handleOpenEdit(model); }}>
                        <Edit3 size={14} />
                     </button>
                 </div>
              </div>
              
              <div className="p-4 flex flex-col flex-1">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg text-black">{model.prenom} {model.nom}</h3>
                 </div>
                 {model.instagram && (
                    <div className="flex items-center gap-1.5 text-xs font-medium text-text-secondary mb-3">
                        <Instagram size={12} /> {model.instagram}
                    </div>
                 )}
                 
                 <div className="mt-auto pt-3 border-t border-border flex justify-between items-center text-xs text-text-secondary">
                     <div className="flex gap-3">
                        {model.taille_cm && <span>{model.taille_cm} cm</span>}
                        {model.yeux && <span className="capitalize">{model.yeux}</span>}
                     </div>
                     <span className="font-medium text-black">{model.project_count || 0} projets</span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedModel && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
             <button onClick={() => setSelectedModel(null)} className="text-text-secondary hover:text-black">
               <X size={20} />
             </button>
             <button onClick={() => handleOpenEdit(selectedModel)} className="text-xs font-medium border border-border px-3 py-1.5 rounded-sm hover:border-black transition-colors flex items-center gap-2">
               <Edit3 size={14} /> Modifier
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8">
             <div className="flex flex-col items-center mb-10">
               <div className="w-32 h-32 rounded-full bg-gray-50 border border-border overflow-hidden mb-6 relative group cursor-pointer">
                  {selectedModel.photo_path ? (
                      <img src={selectedModel.photo_path} className="w-full h-full object-cover" />
                  ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <User size={40} />
                      </div>
                  )}
               </div>
               <h2 className="text-2xl font-medium text-black">{selectedModel.prenom} {selectedModel.nom}</h2>
               {selectedModel.instagram && (
                   <a href={`https://instagram.com/${selectedModel.instagram.replace('@', '')}`} target="_blank" className="text-sm font-medium text-text-secondary hover:text-[#E1306C] flex items-center gap-2 mt-2 transition-colors">
                       <Instagram size={16} /> {selectedModel.instagram}
                   </a>
               )}
             </div>

             <div className="space-y-10">
               {/* Stats Physiques */}
               <section>
                 <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-sm border border-border">
                        <div className="text-lg font-light text-black">{selectedModel.taille_cm || '-'}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Cm</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-sm border border-border">
                        <div className="text-lg font-light text-black truncate">{selectedModel.cheveux || '-'}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Cheveux</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-sm border border-border">
                        <div className="text-lg font-light text-black truncate">{selectedModel.yeux || '-'}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Yeux</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-sm border border-border">
                        <div className="text-lg font-light text-black truncate text-xs pt-1.5">{selectedModel.mensurations || '-'}</div>
                        <div className="text-[10px] uppercase tracking-wider text-text-secondary mt-1">Mensur.</div>
                    </div>
                 </div>
               </section>

               <section>
                 <h4 className="text-xs font-medium uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Contact</h4>
                 <div className="space-y-4">
                    {selectedModel.email && (
                      <div className="flex items-center gap-3">
                         <Mail size={16} className="text-text-secondary" />
                         <span className="text-sm">{selectedModel.email}</span>
                      </div>
                    )}
                    {selectedModel.telephone && (
                      <div className="flex items-center gap-3">
                         <Phone size={16} className="text-text-secondary" />
                         <span className="text-sm">{selectedModel.telephone}</span>
                      </div>
                    )}
                 </div>
               </section>

               {selectedModel.notes && (
                 <section>
                   <h4 className="text-xs font-medium uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Notes</h4>
                   <p className="text-sm text-text-primary leading-relaxed bg-gray-50 p-4 rounded-sm border border-border italic">
                     "{selectedModel.notes}"
                   </p>
                 </section>
               )}
             </div>
           </div>

           <div className="p-4 border-t border-border bg-gray-50/30">
             <button 
                onClick={() => handleDelete(selectedModel)}
                className="w-full flex items-center justify-center gap-2 text-danger border border-border hover:bg-red-50 hover:border-danger py-3 rounded-sm transition-colors text-sm font-medium"
             >
               <Trash2 size={16} /> Supprimer ce modèle
             </button>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-border flex justify-between items-center">
               <h3 className="text-xl font-light text-black">{editingModel.id ? 'Modifier le modèle' : 'Nouveau modèle'}</h3>
               <button onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
             </div>
             
             <div className="p-8 overflow-y-auto space-y-8">
                {/* Photo Upload */}
                <div className="flex justify-center">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 hover:border-black flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group bg-gray-50"
                    >
                        {editingModel.photo_path ? (
                            <img src={editingModel.photo_path} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center text-gray-400">
                                <Camera size={24} className="mx-auto mb-1" />
                                <span className="text-[10px] uppercase">Ajouter</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white text-xs font-medium">Modifier</span>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Prénom *</label>
                     <input type="text" value={editingModel.prenom || ''} onChange={e => setEditingModel({...editingModel, prenom: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none font-medium" autoFocus />
                   </div>
                   <div>
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Nom *</label>
                     <input type="text" value={editingModel.nom || ''} onChange={e => setEditingModel({...editingModel, nom: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none font-medium" />
                   </div>
                   
                   <div className="col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-border">
                       <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Taille (cm)</label>
                            <input type="number" value={editingModel.taille_cm || ''} onChange={e => setEditingModel({...editingModel, taille_cm: Number(e.target.value)})} className="w-full border-b border-border py-2 focus:border-black outline-none" />
                       </div>
                       <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Mensurations</label>
                            <input type="text" value={editingModel.mensurations || ''} onChange={e => setEditingModel({...editingModel, mensurations: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" placeholder="XX-XX-XX" />
                       </div>
                       <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Cheveux</label>
                            <select value={editingModel.cheveux || ''} onChange={e => setEditingModel({...editingModel, cheveux: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none bg-transparent">
                                <option value="">-</option>
                                <option value="Bruns">Bruns</option>
                                <option value="Blonds">Blonds</option>
                                <option value="Châtains">Châtains</option>
                                <option value="Noirs">Noirs</option>
                                <option value="Roux">Roux</option>
                                <option value="Gris">Gris</option>
                            </select>
                       </div>
                       <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Yeux</label>
                            <select value={editingModel.yeux || ''} onChange={e => setEditingModel({...editingModel, yeux: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none bg-transparent">
                                <option value="">-</option>
                                <option value="Bleus">Bleus</option>
                                <option value="Verts">Verts</option>
                                <option value="Marrons">Marrons</option>
                                <option value="Noirs">Noirs</option>
                                <option value="Noisette">Noisette</option>
                            </select>
                       </div>
                   </div>

                   <div className="col-span-2 grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-border">
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Instagram</label>
                            <input type="text" value={editingModel.instagram || ''} onChange={e => setEditingModel({...editingModel, instagram: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" placeholder="@pseudo" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Email</label>
                            <input type="email" value={editingModel.email || ''} onChange={e => setEditingModel({...editingModel, email: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" />
                        </div>
                   </div>
                </div>
             </div>

             <div className="p-6 border-t border-border flex justify-end gap-3 bg-gray-50/50">
               <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 border border-border rounded-full text-sm font-medium hover:bg-white transition-colors">Annuler</button>
               <button onClick={handleSave} disabled={!editingModel.nom || !editingModel.prenom} className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors">Enregistrer</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}