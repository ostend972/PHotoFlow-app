


import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Client, Projet } from '../types';
import { 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar,
  MoreVertical,
  X,
  ExternalLink,
  Copy,
  Trash2,
  Edit3
} from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate } from 'react-router-dom';

export function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for Modal/Panel
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    api.logDebug('Clients Load', 'Fetching clients list', 'Clients');
    const [c, p] = await Promise.all([
      api.getClients(),
      api.getProjets()
    ]);
    setClients(c);
    setProjects(p);
    setLoading(false);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.entreprise && c.entreprise.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [clients, searchQuery]);

  const handleOpenCreate = () => {
    setEditingClient({ nom: '' });
    setIsEditModalOpen(true);
    api.logDebug('Client Create', 'Opened create modal', 'Clients');
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient({ ...client });
    setIsEditModalOpen(true);
    api.logDebug('Client Edit', `Opened edit modal for ${client.id}`, 'Clients');
  };

  const handleSave = async () => {
    if (!editingClient.nom) return;
    api.logDebug('Client Save', `Saving client ${editingClient.nom}`, 'Clients');
    await api.saveClient(editingClient as Client);
    setIsEditModalOpen(false);
    loadData();
    if (selectedClient && editingClient.id === selectedClient.id) {
      setSelectedClient({ ...selectedClient, ...editingClient } as Client);
    }
  };

  const handleDelete = async (client: Client) => {
    if (confirm(`Supprimer le client ${client.nom} ? Les projets liés seront conservés.`)) {
      api.logDebug('Client Delete', `Deleting client ${client.id}`, 'Clients');
      await api.deleteClient(client.id!);
      if (selectedClient?.id === client.id) setSelectedClient(null);
      loadData();
    }
  };

  const getClientProjects = (clientId: number) => {
    return projects.filter(p => p.client_id === clientId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getRandomColor = (id: number = 0) => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500'];
    return colors[id % colors.length];
  };

  return (
    <div className="h-full flex flex-col pt-4 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">
            Clients <span className="text-gray-300 text-2xl ml-2 font-thin">{clients.length}</span>
          </h2>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> <span className="hidden sm:inline">Nouveau client</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-8 shrink-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un client, entreprise, email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:border-black outline-none transition-colors text-sm"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {filteredClients.map(client => (
            <div 
              key={client.id}
              onClick={() => {
                  setSelectedClient(client);
                  api.logDebug('Client View', `Opened detail for ${client.id}`, 'Clients');
              }}
              className="bg-white border border-border rounded-sm p-6 hover:border-black transition-all cursor-pointer group flex flex-col h-full hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-medium tracking-wider", getRandomColor(client.id))}>
                  {getInitials(client.nom)}
                </div>
                <button 
                   onClick={(e) => { e.stopPropagation(); handleOpenEdit(client); }}
                   className="p-1 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="font-medium text-lg text-black group-hover:underline decoration-1 underline-offset-4">{client.nom}</h3>
                {client.entreprise && <p className="text-sm text-text-secondary">{client.entreprise}</p>}
                
                <div className="mt-4 space-y-1.5">
                  {client.email && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary hover:text-black transition-colors" onClick={e => { e.stopPropagation(); window.location.href = `mailto:${client.email}`; }}>
                      <Mail size={14} /> <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.telephone && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Phone size={14} /> <span>{client.telephone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border mt-auto flex justify-between items-center text-xs">
                 <div className="flex items-center gap-1.5 text-black font-medium">
                   <Briefcase size={14} />
                   {client.project_count || 0} projets
                 </div>
                 {client.last_project_date && (
                   <span className="text-text-secondary font-mono">
                     {new Date(client.last_project_date).toLocaleDateString()}
                   </span>
                 )}
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && !loading && (
             <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
               <Briefcase size={32} strokeWidth={1} className="mb-4 opacity-50" />
               <p className="text-sm">Aucun client trouvé.</p>
             </div>
          )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedClient && (
        <div className="fixed inset-y-0 right-0 w-[450px] bg-white border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
           <div className="p-6 border-b border-border flex justify-between items-start shrink-0">
             <button onClick={() => setSelectedClient(null)} className="text-text-secondary hover:text-black">
               <X size={20} />
             </button>
             <button onClick={() => handleOpenEdit(selectedClient)} className="text-xs font-medium border border-border px-3 py-1.5 rounded-sm hover:border-black transition-colors flex items-center gap-2">
               <Edit3 size={14} /> Modifier
             </button>
           </div>
           
           <div className="flex-1 overflow-y-auto p-8">
             <div className="text-center mb-10">
               <div className={clsx("w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-light mx-auto mb-4", getRandomColor(selectedClient.id))}>
                  {getInitials(selectedClient.nom)}
               </div>
               <h2 className="text-2xl font-medium text-black">{selectedClient.nom}</h2>
               {selectedClient.entreprise && <p className="text-text-secondary mt-1">{selectedClient.entreprise}</p>}
             </div>

             <div className="space-y-8">
               <section>
                 <h4 className="text-xs font-medium uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Coordonnées</h4>
                 <div className="space-y-4">
                    {selectedClient.email && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-sm bg-gray-50 flex items-center justify-center"><Mail size={16} /></div>
                           <span className="text-sm font-medium">{selectedClient.email}</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded" title="Copier" onClick={() => navigator.clipboard.writeText(selectedClient.email!)}>
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                    {selectedClient.telephone && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-sm bg-gray-50 flex items-center justify-center"><Phone size={16} /></div>
                           <span className="text-sm font-medium">{selectedClient.telephone}</span>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded" title="Copier" onClick={() => navigator.clipboard.writeText(selectedClient.telephone!)}>
                          <Copy size={14} />
                        </button>
                      </div>
                    )}
                    {selectedClient.site_web && (
                      <div className="flex justify-between items-center group">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-sm bg-gray-50 flex items-center justify-center"><ExternalLink size={16} /></div>
                           <a href={selectedClient.site_web} target="_blank" rel="noreferrer" className="text-sm font-medium hover:underline truncate max-w-[200px]">{selectedClient.site_web}</a>
                        </div>
                      </div>
                    )}
                 </div>
               </section>

               {selectedClient.notes && (
                 <section>
                   <h4 className="text-xs font-medium uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Notes</h4>
                   <p className="text-sm text-text-primary leading-relaxed bg-gray-50 p-4 rounded-sm border border-border">
                     {selectedClient.notes}
                   </p>
                 </section>
               )}

               <section>
                 <h4 className="text-xs font-medium uppercase tracking-widest text-text-secondary mb-4 border-b border-border pb-2">Historique Projets</h4>
                 <div className="space-y-2">
                   {getClientProjects(selectedClient.id!).map(p => (
                     <div key={p.id} className="flex items-center justify-between p-3 border border-border rounded-sm hover:border-black transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <Briefcase size={16} className="text-text-secondary" />
                          <div>
                            <div className="text-sm font-medium group-hover:underline">{p.nom}</div>
                            <div className="text-xs text-text-secondary">{new Date(p.date_shooting).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${p.statut === 'livre' ? 'border-transparent text-success bg-green-50' : 'border-gray-200 text-gray-400'}`}>
                          {p.statut.replace('_', ' ')}
                        </span>
                     </div>
                   ))}
                   {getClientProjects(selectedClient.id!).length === 0 && (
                     <p className="text-sm text-gray-400 italic">Aucun projet associé.</p>
                   )}
                 </div>
               </section>
             </div>
           </div>

           <div className="p-4 border-t border-border bg-gray-50/30">
             <button 
                onClick={() => handleDelete(selectedClient)}
                className="w-full flex items-center justify-center gap-2 text-danger border border-border hover:bg-red-50 hover:border-danger py-3 rounded-sm transition-colors text-sm font-medium"
             >
               <Trash2 size={16} /> Supprimer ce client
             </button>
           </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
             <div className="p-6 border-b border-border flex justify-between items-center">
               <h3 className="text-xl font-light text-black">{editingClient.id ? 'Modifier le client' : 'Nouveau client'}</h3>
               <button onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
             </div>
             
             <div className="p-8 overflow-y-auto space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="col-span-2">
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Nom *</label>
                     <input type="text" value={editingClient.nom || ''} onChange={e => setEditingClient({...editingClient, nom: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none font-medium" placeholder="Nom du client" autoFocus />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Entreprise</label>
                     <input type="text" value={editingClient.entreprise || ''} onChange={e => setEditingClient({...editingClient, entreprise: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" placeholder="Nom de l'entreprise" />
                   </div>
                   <div>
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Email</label>
                     <input type="email" value={editingClient.email || ''} onChange={e => setEditingClient({...editingClient, email: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" placeholder="email@exemple.com" />
                   </div>
                   <div>
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Téléphone</label>
                     <input type="tel" value={editingClient.telephone || ''} onChange={e => setEditingClient({...editingClient, telephone: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" placeholder="06..." />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Site Web</label>
                     <input type="url" value={editingClient.site_web || ''} onChange={e => setEditingClient({...editingClient, site_web: e.target.value})} className="w-full border-b border-border py-2 focus:border-black outline-none" placeholder="https://..." />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Notes</label>
                     <textarea value={editingClient.notes || ''} onChange={e => setEditingClient({...editingClient, notes: e.target.value})} className="w-full border border-border p-3 rounded-sm focus:border-black outline-none resize-none text-sm" rows={3} placeholder="Préférences, historique..." />
                   </div>
                </div>
             </div>

             <div className="p-6 border-t border-border flex justify-end gap-3 bg-gray-50/50">
               <button onClick={() => setIsEditModalOpen(false)} className="px-6 py-2 border border-border rounded-full text-sm font-medium hover:bg-white transition-colors">Annuler</button>
               <button onClick={handleSave} disabled={!editingClient.nom} className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors">Enregistrer</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}