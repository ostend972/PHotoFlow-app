






import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Projet, ActivityLog, DiskUsage } from '../types';
import { 
  Folder, 
  ArrowRight,
  Plus,
  UserPlus,
  CheckCircle2,
  Package,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';

export function Dashboard() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [recentProjects, setRecentProjects] = useState<Projet[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [disks, setDisks] = useState<DiskUsage[]>([]);
  const [stats, setStats] = useState({ 
      totalSize: 0, 
      activeCount: 0,
      clientCount: 0,
      modelCount: 0
  });

  useEffect(() => {
    const loadData = async () => {
      api.logDebug('Dashboard Load', 'Fetching dashboard data', 'Dashboard');
      const [allProjects, allClients, allModels, logs, diskData] = await Promise.all([
          api.getProjets(),
          api.getClients(),
          api.getModeles(),
          api.getActivityLogs(),
          api.getDriveSpace()
      ]);
      
      setProjets(allProjects);
      setRecentProjects(allProjects.slice(0, 4)); // Get top 4
      setActivity(logs.slice(0, 6)); // Get top 6 logs
      setDisks(diskData);
      
      const totalSize = allProjects.reduce((acc, p) => acc + (p.taille_bytes || 0), 0);
      const activeCount = allProjects.filter(p => p.statut === 'en_cours').length;
      
      setStats({ 
          totalSize, 
          activeCount,
          clientCount: allClients.length,
          modelCount: allModels.length
      });
      api.logDebug('Dashboard Load', `Loaded ${allProjects.length} projects`, 'Dashboard');
    };
    loadData();
  }, []);

  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb > 1000) return `${(gb / 1024).toFixed(1)} TB`;
    return `${gb.toFixed(1)} GB`;
  };

  const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Bonjour";
      if (hour < 18) return "Bonne après-midi";
      return "Bonsoir";
  };

  const formatRelativeTime = (isoString: string) => {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffHours < 48) return `Hier à ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
      return date.toLocaleDateString([], {day: 'numeric', month: 'short'});
  };

  const renderIcon = (iconName: string | undefined) => {
    const IconComponent = (Icons as any)[iconName || 'Folder'] || Icons.Folder;
    return <IconComponent size={14} strokeWidth={1.5} />;
  };

  // Simple Donut Chart Component
  const DonutChart = ({ data }: { data: DiskUsage[] }) => {
    let cumulativePercent = 0;
    const connectedDrives = data.filter(d => d.is_connected);
    const totalCapacity = connectedDrives.reduce((acc, d) => acc + d.total, 0);
    
    const slices = connectedDrives.map((disk, index) => {
      const used = disk.total - disk.free;
      const percent = totalCapacity > 0 ? (used / totalCapacity) * 100 : 0;
      const start = cumulativePercent;
      cumulativePercent += percent;
      const color = index === 0 ? '#000000' : index === 1 ? '#666666' : '#cccccc';
      
      return (
        <circle
          key={disk.path}
          r="15.9155"
          cx="21"
          cy="21"
          fill="transparent"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${percent} ${100 - percent}`}
          strokeDashoffset={25 - start}
        />
      );
    });

    return (
      <svg width="120" height="120" viewBox="0 0 42 42" className="transform -rotate-90">
        <circle r="15.9155" cx="21" cy="21" fill="transparent" stroke="#f5f5f5" strokeWidth="6" />
        {slices}
      </svg>
    );
  };

  const handleQuickAction = (action: string) => {
      api.logDebug('Quick Action', `Clicked ${action}`, 'Dashboard');
  }

  return (
    <div className="flex flex-col h-full pt-4 animate-fade-in w-full gap-4 lg:gap-6 overflow-hidden">
      {/* 1. Header Personalise */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 shrink-0 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">{getGreeting()} Alan 👋</h2>
          <p className="text-text-secondary mt-2 text-sm font-medium uppercase tracking-wide">
             {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="hidden md:block text-right">
           <p className="text-sm font-medium text-black">PhotoFlow Master</p>
           <p className="text-xs text-text-secondary">v2.0.0</p>
        </div>
      </div>

      {/* 2. KPIs Global */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
         <div className="bg-white p-6 rounded-sm border border-border flex flex-col hover:border-black transition-colors group">
            <span className="text-3xl lg:text-4xl font-light text-black mb-auto">{projets.length}</span>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Projets</p>
               <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <Plus size={10} /> 3 ce mois
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-sm border border-border flex flex-col hover:border-black transition-colors group">
            <span className="text-3xl lg:text-4xl font-light text-black mb-auto">{stats.clientCount}</span>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Clients</p>
               <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <Plus size={10} /> 2 ce mois
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-sm border border-border flex flex-col hover:border-black transition-colors group">
            <span className="text-3xl lg:text-4xl font-light text-black mb-auto">{stats.modelCount}</span>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">Modèles</p>
               <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium">
                  <Plus size={10} /> 1 ce mois
               </div>
            </div>
         </div>
         <div className="bg-white p-6 rounded-sm border border-border flex flex-col hover:border-black transition-colors group">
            <span className="text-3xl lg:text-4xl font-light text-black mb-auto">{formatSize(stats.totalSize).split(' ')[0]}</span>
            <div>
               <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-1">TB Total</p>
               <div className="text-[10px] text-text-secondary font-medium">
                  Espace utilisé
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-hidden pb-2">
          {/* 3. Disk Space & Timeline (Left Column - 1/3) */}
          <div className="flex flex-col gap-6 lg:col-span-1 min-h-0 h-full overflow-hidden">
              {/* Espace Disque */}
              <div className="bg-white border border-border rounded-sm p-6 flex flex-col gap-4 shrink-0 overflow-hidden h-full max-h-[50%]">
                 <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Espace Disque</h3>
                 </div>
                 
                 <div className="flex gap-6 h-full min-h-0">
                     <div className="flex items-center justify-center shrink-0">
                        <DonutChart data={disks} />
                     </div>
                     <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {disks.map((d, i) => {
                            const used = d.total - d.free;
                            const percent = d.total > 0 ? Math.round((used / d.total) * 100) : 0;
                            const colorClass = i === 0 ? 'bg-black' : i === 1 ? 'bg-gray-500' : 'bg-gray-300';
                            
                            return (
                                <div key={d.path} className="flex flex-col gap-0.5">
                                    <div className="flex justify-between items-center text-[10px]">
                                       <div className="flex items-center gap-1.5 truncate">
                                           <span className={clsx("w-1.5 h-1.5 rounded-full shrink-0", d.is_connected ? "bg-green-500" : "bg-red-500")}></span>
                                           <span className="font-bold text-black">{d.path}</span>
                                           <span className="text-text-secondary truncate max-w-[60px]">({d.label})</span>
                                       </div>
                                       <span className="font-mono whitespace-nowrap">{formatSize(used)}</span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className={clsx("h-full", colorClass)} style={{ width: d.is_connected ? `${percent}%` : '0%' }}></div>
                                    </div>
                                </div>
                            );
                        })}
                     </div>
                 </div>
              </div>

              {/* Activité Récente */}
              <div className="bg-white border border-border rounded-sm p-6 flex-1 flex flex-col min-h-0 overflow-hidden">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary border-b border-border pb-4 mb-4 shrink-0">Activité Récente</h3>
                 <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {activity.map((log) => (
                        <div key={log.id} className="flex gap-3 group">
                            <div className="flex flex-col items-center pt-1">
                                <div className={clsx(
                                    "w-6 h-6 rounded-full border border-border flex items-center justify-center shrink-0 z-10 bg-white group-hover:border-black transition-colors",
                                    log.type === 'project_created' && "text-black",
                                    log.type === 'project_completed' && "text-green-600",
                                    log.type.includes('added') && "text-blue-600"
                                )}>
                                    {log.type === 'project_created' && <Folder size={12} />}
                                    {log.type === 'project_completed' && <CheckCircle2 size={12} />}
                                    {log.type === 'project_archived' && <Package size={12} />}
                                    {log.type.includes('client') && <UserPlus size={12} />}
                                    {log.type.includes('model') && <UserPlus size={12} />}
                                </div>
                                <div className="w-px h-full bg-border -my-1 group-last:hidden"></div>
                            </div>
                            <div className="pb-2">
                                <p className="text-xs text-black font-medium leading-tight">{log.message}</p>
                                <p className="text-[10px] text-text-secondary mt-0.5 flex items-center gap-1">
                                    <Clock size={8} /> {formatRelativeTime(log.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                 </div>
              </div>
          </div>

          {/* 4. Recent Projects & Quick Actions (Right Column - 2/3) */}
          <div className="flex flex-col gap-6 lg:col-span-2 min-h-0 h-full overflow-hidden">
             
             {/* Derniers Projets */}
             <div className="bg-white border border-border rounded-sm p-6 flex flex-col flex-1 min-h-0">
                 <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary">Derniers Projets</h3>
                    <Link to="/projects" onClick={() => handleQuickAction('View All Projects')} className="text-xs text-black font-medium hover:underline flex items-center gap-1">
                        VOIR TOUT <ArrowRight size={12} />
                    </Link>
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto content-start pr-2">
                    {recentProjects.map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => api.logDebug('Recent Project Click', `Opened ${p.nom}`, 'Dashboard')}
                            className="border border-border p-5 rounded-sm hover:border-black transition-all group cursor-pointer flex flex-col justify-between h-[160px] shrink-0"
                        >
                            <div className="flex justify-between items-start">
                                <div className="w-8 h-8 border border-border rounded-sm flex items-center justify-center text-black bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors">
                                    {renderIcon(p.template_icone)}
                                </div>
                                <span className={clsx(
                                    "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border",
                                    p.statut === 'en_cours' ? "border-black text-black" : "border-transparent text-green-600 bg-green-50"
                                )}>
                                    {p.statut.replace('_', ' ')}
                                </span>
                            </div>
                            
                            <div className="mt-auto">
                                <h4 className="font-medium text-base text-black truncate group-hover:underline decoration-1 underline-offset-4">{p.nom}</h4>
                                <p className="text-xs text-text-secondary mt-0.5">{new Date(p.date_shooting).toLocaleDateString()}</p>
                            </div>

                            <div className="mt-3 pt-2 border-t border-border flex justify-between items-center text-[10px]">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    <span className="font-bold">{p.disque}</span>
                                </div>
                                <span className="font-mono text-text-secondary">{formatSize(p.taille_bytes)}</span>
                            </div>
                        </div>
                    ))}
                    {recentProjects.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center text-gray-300 py-12">
                             <Folder size={32} strokeWidth={1} className="mb-2 opacity-50" />
                             <p className="text-sm">Aucun projet récent</p>
                        </div>
                    )}
                 </div>
             </div>

             {/* Accès Rapide */}
             <div className="bg-white border border-border rounded-sm p-6 shrink-0">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">Accès Rapide</h3>
                 <div className="grid grid-cols-3 gap-4">
                     <Link to="/new-project" onClick={() => handleQuickAction('New Project')} className="flex flex-col items-center gap-2 p-4 border border-border rounded-sm hover:bg-black hover:text-white transition-all group">
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-white group-hover:text-black transition-colors">
                            <Plus size={16} />
                         </div>
                         <span className="text-xs font-medium">Nouveau Projet</span>
                     </Link>
                     <Link to="/clients" onClick={() => handleQuickAction('New Client')} className="flex flex-col items-center gap-2 p-4 border border-border rounded-sm hover:bg-black hover:text-white transition-all group">
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-white group-hover:text-black transition-colors">
                            <UserPlus size={16} />
                         </div>
                         <span className="text-xs font-medium">Nouveau Client</span>
                     </Link>
                     <Link to="/models" onClick={() => handleQuickAction('New Model')} className="flex flex-col items-center gap-2 p-4 border border-border rounded-sm hover:bg-black hover:text-white transition-all group">
                         <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-black group-hover:bg-white group-hover:text-black transition-colors">
                            <UserPlus size={16} />
                         </div>
                         <span className="text-xs font-medium">Nouveau Modèle</span>
                     </Link>
                 </div>
             </div>

          </div>
      </div>
    </div>
  );
}