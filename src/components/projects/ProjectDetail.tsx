



import React, { useState, useEffect, useRef } from 'react';
import { Projet } from '../../types';
import { 
  X, 
  Calendar, 
  HardDrive, 
  FolderOpen, 
  Save,
  Trash2,
  Clock,
  User,
  MoreVertical,
  ChevronDown,
  Camera,
  Edit2,
  Check,
  AlertTriangle
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '../../lib/api';

interface ProjectDetailProps {
  project: Projet;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProjectDetail({ project, onClose, onUpdate }: ProjectDetailProps) {
  const [notes, setNotes] = useState(project.notes || '');
  const [status, setStatus] = useState(project.statut);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Path Editing State
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [pathValue, setPathValue] = useState(project.chemin);
  const [pathError, setPathError] = useState('');

  useEffect(() => {
    setNotes(project.notes || '');
    setStatus(project.statut);
    setPathValue(project.chemin);
    setIsEditingPath(false);
  }, [project]);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    await api.updateProjectNote(project.id!, notes);
    setIsSaving(false);
    onUpdate();
  };

  const handleChangeStatus = async (newStatus: string) => {
    setStatus(newStatus as any);
    await api.updateProjectStatus(project.id!, newStatus);
    onUpdate();
  };

  const handleDelete = async () => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce projet du registre ? Les fichiers ne seront pas supprimés.")) {
      await api.deleteProject(project.id!);
      onClose();
      onUpdate();
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = async () => {
              const base64 = reader.result as string;
              // Save immediately
              await api.updateProjectDetails(project.id!, { cover_image: base64 }, false);
              onUpdate();
          };
          reader.readAsDataURL(file);
      }
  };

  const savePath = async () => {
      if (pathValue === project.chemin) {
          setIsEditingPath(false);
          return;
      }
      if (!pathValue.trim()) {
          setPathError('Le chemin ne peut pas être vide');
          return;
      }

      // Ask for reorganization
      const confirmReorg = window.confirm(
          "Le chemin du dossier a changé.\nVoulez-vous déplacer automatiquement les fichiers vers le nouvel emplacement ?\n\nOK = Oui, déplacer les fichiers\nAnnuler = Non, changer seulement le chemin dans la base de données"
      );

      await api.updateProjectDetails(project.id!, { chemin: pathValue }, confirmReorg);
      setIsEditingPath(false);
      onUpdate();
  };

  const renderIcon = (iconName: string | undefined) => {
    const IconComponent = (Icons as any)[iconName || 'Folder'] || Icons.Folder;
    return <IconComponent size={16} strokeWidth={1.5} />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-white border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col">
      {/* Header Image Cover */}
      <div className="relative w-full h-48 bg-gray-100 group">
          {project.cover_image ? (
              <img src={project.cover_image} className="w-full h-full object-cover" alt="Cover" />
          ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                  <Camera size={32} />
                  <span className="text-xs uppercase mt-2 font-medium">Ajouter une couverture</span>
              </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-black px-4 py-2 rounded-full text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                  {project.cover_image ? 'Changer l\'image' : 'Ajouter une image'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/60 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors"
          >
             <X size={16} />
          </button>
      </div>

      <div className="p-6 border-b border-border flex justify-between items-start">
        <div className="flex-1">
           <h2 className="text-2xl font-medium text-black leading-tight break-words">{project.nom}</h2>
           <span className={clsx(
                "inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border",
                project.statut === 'en_cours' ? "border-black text-black" : "border-transparent text-success bg-green-50"
            )}>
                {project.statut.replace('_', ' ')}
            </span>
        </div>
        <div className="relative">
           <button className="p-2 hover:bg-gray-100 rounded-sm">
             <MoreVertical size={16} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Info Blocks */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar size={16} className="text-text-secondary shrink-0" />
            <span className="font-mono">{new Date(project.date_shooting).toLocaleDateString()}</span>
          </div>
          
          {/* Editable Path */}
          <div className="flex items-start gap-3 text-sm group">
            <FolderOpen size={16} className="text-text-secondary shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                {isEditingPath ? (
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={pathValue}
                            onChange={(e) => setPathValue(e.target.value)}
                            className="w-full border-b border-black outline-none font-mono text-xs py-1"
                            autoFocus
                        />
                        <button onClick={savePath} className="text-success hover:bg-green-50 p-1 rounded"><Check size={14} /></button>
                        <button onClick={() => { setIsEditingPath(false); setPathValue(project.chemin); }} className="text-danger hover:bg-red-50 p-1 rounded"><X size={14} /></button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                         <span className="truncate text-text-secondary font-mono text-xs" title={project.chemin}>{project.chemin}</span>
                         <button onClick={() => setIsEditingPath(true)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition-opacity p-1">
                             <Edit2 size={12} />
                         </button>
                    </div>
                )}
                {pathError && <p className="text-xs text-danger mt-1">{pathError}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <HardDrive size={16} className="text-text-secondary shrink-0" />
            <span>{formatSize(project.taille_bytes || 0)} <span className="text-text-secondary">({project.nb_fichiers || 0} fichiers)</span></span>
          </div>
        </div>

        <div className="border-t border-border"></div>

        {/* Client & Template Grid */}
        <div className="grid grid-cols-2 gap-4">
            {/* Template */}
            <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Template</label>
            <div className="flex flex-col gap-2 p-3 border border-border rounded-sm bg-gray-50/30">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-sm bg-white border border-border flex items-center justify-center text-black">
                        {renderIcon(project.template_icone)}
                    </div>
                    <span className="text-sm font-medium truncate">{project.template_nom || 'Standard'}</span>
                </div>
            </div>
            </div>

            {/* Client */}
            <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Client</label>
            <div className="flex flex-col gap-2 p-3 border border-border rounded-sm bg-gray-50/30 hover:border-black transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-medium">
                        {project.client_nom ? project.client_nom.substring(0, 2).toUpperCase() : '??'}
                    </div>
                    <span className="text-sm font-medium truncate">{project.client_nom || 'Aucun'}</span>
                </div>
            </div>
            </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Statut du projet</label>
          <div className="relative">
            <select 
              value={status}
              onChange={(e) => handleChangeStatus(e.target.value)}
              className={clsx(
                "w-full appearance-none border border-border px-4 py-3 rounded-sm text-sm font-medium focus:outline-none focus:border-black transition-colors bg-white",
              )}
            >
              <option value="en_cours">En cours</option>
              <option value="livre">Livré / Terminé</option>
              <option value="archive">Archivé</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-4 pointer-events-none" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Notes</label>
          <textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSaveNotes}
            className="w-full h-32 p-3 text-sm border border-border rounded-sm resize-none focus:border-black outline-none transition-colors bg-gray-50/30"
            placeholder="Ajouter une note..."
          />
          <div className="flex justify-end mt-2">
            {isSaving && <span className="text-xs text-text-secondary animate-pulse">Enregistrement...</span>}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-2 pt-4 border-t border-border">
          <div className="flex justify-between text-xs text-text-secondary">
             <span>Créé le</span>
             <span className="font-mono">{project.created_at ? new Date(project.created_at).toLocaleDateString() : '-'}</span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary">
             <span>Dernière modification</span>
             <span className="font-mono">{project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '-'}</span>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-gray-50/30 flex gap-3">
        <button 
          onClick={() => api.openDirectory(project.chemin)}
          className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-3 rounded-sm text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          <FolderOpen size={16} /> Ouvrir dossier
        </button>
        <button 
          onClick={handleDelete}
          className="px-4 py-3 border border-border text-text-secondary hover:text-danger hover:border-danger rounded-sm transition-colors"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}