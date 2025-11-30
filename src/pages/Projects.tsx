



import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Projet, Client, Template } from '../types';
import { ProjectDetail } from '../components/projects/ProjectDetail';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  LayoutGrid, 
  List, 
  Filter, 
  Calendar,
  MoreVertical,
  Image as ImageIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import * as Icons from 'lucide-react';

export function Projects() {
  const [projects, setProjects] = useState<Projet[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    year: 'all',
    client: 'all',
    template: 'all',
    status: 'all',
    disk: 'all'
  });

  // Metadata for dropdowns
  const [clients, setClients] = useState<Client[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableDisks, setAvailableDisks] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    api.logDebug('Projects Load', 'Fetching projects list', 'Projects');
    const [p, c, t] = await Promise.all([
      api.getProjets(),
      api.getClients(),
      api.getTemplates()
    ]);
    setProjects(p);
    setClients(c);
    setTemplates(t);
    
    // Extract unique years and disks
    const years = Array.from(new Set(p.map(x => x.date_shooting.substring(0, 4)))).sort().reverse();
    setAvailableYears(years);
    const disks = Array.from(new Set(p.map(x => x.disque))).sort();
    setAvailableDisks(disks);
    
    setLoading(false);
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.client_nom && p.client_nom.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesYear = filters.year === 'all' || p.date_shooting.startsWith(filters.year);
      const matchesClient = filters.client === 'all' || p.client_id?.toString() === filters.client;
      const matchesTemplate = filters.template === 'all' || p.template_id?.toString() === filters.template;
      const matchesStatus = filters.status === 'all' || p.statut === filters.status;
      const matchesDisk = filters.disk === 'all' || p.disque === filters.disk;

      return matchesSearch && matchesYear && matchesClient && matchesTemplate && matchesStatus && matchesDisk;
    });
  }, [projects, searchQuery, filters]);

  const handleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProjects.map(p => p.id!)));
    }
    api.logDebug('Selection', 'Toggled Select All', 'Projects');
  };

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleResetFilters = () => {
    setFilters({ year: 'all', client: 'all', template: 'all', status: 'all', disk: 'all' });
    setSearchQuery('');
    api.logDebug('Filters', 'Reset filters', 'Projects');
  };

  const handleFilterChange = (key: string, value: string) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      api.logDebug('Filters', `Changed ${key} to ${value}`, 'Projects');
  };

  const renderIcon = (iconName: string | undefined) => {
    const IconComponent = (Icons as any)[iconName || 'Folder'] || Icons.Folder;
    return <IconComponent size={14} strokeWidth={1.5} />;
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '-';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  const renderStatusBadge = (status: string) => {
    const config = {
      en_cours: { label: 'En cours', classes: 'border-black text-black' },
      livre: { label: 'Terminé', classes: 'border-transparent text-success bg-green-50' },
      archive: { label: 'Archivé', classes: 'border-gray-200 text-gray-400' }
    };
    const c = (config as any)[status] || config.en_cours;
    return (
      <span className={clsx("text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border whitespace-nowrap bg-white", c.classes)}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full animate-fade-in pt-4 w-full relative">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">Projets <span className="text-gray-300 text-2xl ml-2 font-thin">{projects.length}</span></h2>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex bg-gray-100 rounded-sm p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={clsx("p-2 rounded-sm transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black")}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={clsx("p-2 rounded-sm transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-black")}
              >
                <LayoutGrid size={18} />
              </button>
           </div>
           <Link 
            to="/new-project" 
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Nouveau projet</span>
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap gap-4 items-center justify-between">
           <div className="relative w-full max-w-md">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
             <input 
                type="text" 
                placeholder="Rechercher un projet, client..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-sm focus:border-black outline-none transition-colors text-sm"
             />
           </div>
           <div className="flex items-center gap-2">
             {selectedIds.size > 0 && (
                <div className="flex items-center gap-4 bg-black text-white px-4 py-1.5 rounded-sm mr-4 animate-in fade-in slide-in-from-bottom-2">
                   <span className="text-xs font-medium">{selectedIds.size} sélectionné(s)</span>
                   <div className="h-4 w-px bg-white/20"></div>
                   <button className="text-xs hover:underline" onClick={() => api.logDebug('Action', 'Archive selected', 'Projects')}>Archiver</button>
                   <button className="text-xs hover:underline" onClick={() => api.logDebug('Action', 'Delete selected', 'Projects')}>Supprimer</button>
                </div>
             )}
           </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
            <Filter size={14} className="text-text-secondary mr-2" />
            
            <div className="flex flex-wrap gap-2">
              <select 
                  value={filters.year}
                  onChange={e => handleFilterChange('year', e.target.value)}
                  className="bg-white border border-border text-xs px-3 py-1.5 rounded-sm focus:border-black outline-none"
              >
                  <option value="all">Toutes années</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select 
                  value={filters.client}
                  onChange={e => handleFilterChange('client', e.target.value)}
                  className="bg-white border border-border text-xs px-3 py-1.5 rounded-sm focus:border-black outline-none max-w-[150px]"
              >
                  <option value="all">Tous clients</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
              </select>

              <select 
                  value={filters.template}
                  onChange={e => handleFilterChange('template', e.target.value)}
                  className="bg-white border border-border text-xs px-3 py-1.5 rounded-sm focus:border-black outline-none"
              >
                  <option value="all">Tous templates</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.nom}</option>)}
              </select>

              <select 
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                  className="bg-white border border-border text-xs px-3 py-1.5 rounded-sm focus:border-black outline-none"
              >
                  <option value="all">Tous statuts</option>
                  <option value="en_cours">En cours</option>
                  <option value="livre">Terminé</option>
                  <option value="archive">Archivé</option>
              </select>

              <select 
                  value={filters.disk}
                  onChange={e => handleFilterChange('disk', e.target.value)}
                  className="bg-white border border-border text-xs px-3 py-1.5 rounded-sm focus:border-black outline-none"
              >
                  <option value="all">Tous disques</option>
                  {availableDisks.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {(filters.year !== 'all' || filters.client !== 'all' || filters.status !== 'all' || filters.template !== 'all' || searchQuery) && (
                <button 
                    onClick={handleResetFilters}
                    className="text-xs text-danger hover:underline ml-auto"
                >
                    Réinitialiser
                </button>
            )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto min-h-0 bg-white border border-border rounded-sm">
        {loading ? (
            <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
            </div>
        ) : filteredProjects.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <Icons.FolderOpen size={32} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-sm font-medium">Aucun projet trouvé</p>
                <button onClick={handleResetFilters} className="text-xs mt-2 underline hover:text-black">Effacer les filtres</button>
            </div>
        ) : (
            <>
                {viewMode === 'list' ? (
                    <div className="min-w-full inline-block align-middle">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left border-collapse">
                                <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                    <tr>
                                        <th className="py-3 px-4 border-b border-border w-10">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                                                onChange={handleSelectAll}
                                                className="rounded-sm border-gray-300 text-black focus:ring-0"
                                            />
                                        </th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary whitespace-nowrap">Projet</th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary w-32 whitespace-nowrap">Date</th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary whitespace-nowrap hidden md:table-cell">Client</th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary w-32 whitespace-nowrap hidden lg:table-cell">Template</th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary w-24 whitespace-nowrap hidden xl:table-cell">Disque</th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary w-28 text-right whitespace-nowrap hidden sm:table-cell">Taille</th>
                                        <th className="py-3 px-4 border-b border-border text-xs font-medium uppercase tracking-widest text-text-secondary w-28 text-center whitespace-nowrap">Statut</th>
                                        <th className="py-3 px-4 border-b border-border w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProjects.map(project => (
                                        <tr 
                                            key={project.id} 
                                            className={clsx(
                                                "hover:bg-gray-50 transition-colors group cursor-pointer border-b border-border last:border-0",
                                                selectedIds.has(project.id!) && "bg-gray-50"
                                            )}
                                            onClick={() => toggleSelection(project.id!)}
                                        >
                                            <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={selectedIds.has(project.id!)}
                                                    onChange={() => toggleSelection(project.id!)}
                                                    className="rounded-sm border-gray-300 text-black focus:ring-0"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium text-black group-hover:underline decoration-1 underline-offset-4 cursor-pointer" onClick={(e) => {
                                                    e.stopPropagation();
                                                    api.logDebug('Project Open', `Opening project ${project.id}`, 'Projects');
                                                    setSelectedProjectId(project.id!);
                                                }}>
                                                    {project.nom}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-text-secondary font-mono whitespace-nowrap">
                                                {new Date(project.date_shooting).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-black hidden md:table-cell whitespace-nowrap">
                                                {project.client_nom || '-'}
                                            </td>
                                            <td className="py-3 px-4 hidden lg:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-text-secondary">
                                                        {renderIcon(project.template_icone)}
                                                    </div>
                                                    <span className="text-xs font-medium whitespace-nowrap">{project.template_nom}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 hidden xl:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-success"></div>
                                                    <span className="text-xs font-mono text-text-secondary whitespace-nowrap">{project.disque}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-text-secondary font-mono text-right hidden sm:table-cell whitespace-nowrap">
                                                {formatSize(project.taille_bytes)}
                                            </td>
                                            <td className="py-3 px-4 text-center whitespace-nowrap">
                                                {renderStatusBadge(project.statut)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        api.logDebug('Project Menu', `Opening context menu for ${project.id}`, 'Projects');
                                                        setSelectedProjectId(project.id!);
                                                    }}
                                                    className="p-1 text-gray-400 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 p-6 bg-background-secondary h-full content-start">
                        {filteredProjects.map(project => (
                            <div 
                                key={project.id}
                                onClick={() => {
                                    api.logDebug('Project Open', `Opening project ${project.id}`, 'Projects');
                                    setSelectedProjectId(project.id!);
                                }}
                                className={clsx(
                                    "bg-white border rounded-sm hover:border-black transition-all cursor-pointer flex flex-col group relative overflow-hidden h-[280px]",
                                    selectedProjectId === project.id ? "border-black shadow-md" : "border-border"
                                )}
                            >
                                {/* Image / Cover */}
                                <div className="h-40 bg-gray-50 relative overflow-hidden border-b border-border">
                                    {project.cover_image ? (
                                        <img 
                                            src={project.cover_image} 
                                            alt={project.nom} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                            {renderIcon(project.template_icone)}
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        {renderStatusBadge(project.statut)}
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-sm text-[10px] font-medium border border-border">
                                        {project.template_nom}
                                    </div>
                                </div>
                                
                                <div className="p-4 flex flex-col flex-1 justify-between">
                                    <div>
                                        <h3 className="font-medium text-lg text-black group-hover:underline decoration-1 underline-offset-4 truncate leading-tight" title={project.nom}>{project.nom}</h3>
                                        <div className="flex items-center gap-2 text-xs text-text-secondary mt-1">
                                            <Calendar size={12} />
                                            <span className="font-mono">{new Date(project.date_shooting).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-xs mt-3 pt-3 border-t border-border">
                                        <div className="flex items-center gap-2 text-black font-medium">
                                            <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
                                            {project.disque}
                                        </div>
                                        <span className="font-mono text-text-secondary">{formatSize(project.taille_bytes)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}
      </div>
      
      {/* Pagination Footer */}
      <div className="py-4 border-t border-border flex justify-between items-center text-xs text-text-secondary shrink-0">
          <span>Affichage {filteredProjects.length > 0 ? 1 : 0}-{filteredProjects.length} sur {filteredProjects.length} projets</span>
          <div className="flex gap-2">
              <button disabled className="px-3 py-1 border border-border rounded-sm opacity-50 cursor-not-allowed">Précédent</button>
              <button disabled className="px-3 py-1 border border-border rounded-sm opacity-50 cursor-not-allowed">Suivant</button>
          </div>
      </div>

      {/* Detail Panel */}
      {selectedProjectId && (
        <ProjectDetail 
            project={projects.find(p => p.id === selectedProjectId)!} 
            onClose={() => setSelectedProjectId(null)}
            onUpdate={loadData}
        />
      )}
    </div>
  );
}