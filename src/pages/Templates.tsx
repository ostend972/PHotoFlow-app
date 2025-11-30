import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Template } from '../types';
import { FolderTreeBuilder } from '../components/templates/FolderTreeBuilder';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check,
} from 'lucide-react';
import * as Icons from 'lucide-react';

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>({});
  
  const availableIcons = ['Camera', 'Heart', 'Building', 'Video', 'Box', 'Calendar', 'Folder', 'Image', 'Music', 'Star'];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data);
  };

  const handleEdit = (tpl: Template) => {
    setCurrentTemplate(JSON.parse(JSON.stringify(tpl)));
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setCurrentTemplate({
      nom: "Nouveau Template",
      description: "",
      icone: "Folder",
      couleur: "#000000",
      structure: [],
      is_default: 0,
      is_system: 0
    });
    setIsEditorOpen(true);
  };

  const handleSave = async () => {
    if (!currentTemplate.nom) return;
    await api.saveTemplate(currentTemplate as Template);
    setIsEditorOpen(false);
    loadTemplates();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Supprimer ce template ?")) {
      await api.deleteTemplate(id);
      loadTemplates();
    }
  };

  const renderIcon = (iconName: string, size = 20) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Folder;
    return <IconComponent size={size} strokeWidth={1.5} />;
  };

  if (isEditorOpen) {
    return (
      <div className="h-full flex flex-col animate-fade-in pt-4 w-full">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border shrink-0">
          <div>
            <h2 className="text-3xl font-light text-black tracking-tight">
              {currentTemplate.id ? 'Édition' : 'Création'}
            </h2>
            <p className="text-xs font-medium uppercase tracking-widest text-text-secondary mt-1">Configuration du template</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsEditorOpen(false)}
              className="px-6 py-2 text-sm font-medium text-black border border-border rounded-full hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium bg-black text-white rounded-full hover:bg-accent-hover flex items-center gap-2 transition-colors"
            >
              <Check size={16} /> Enregistrer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full min-h-0">
          {/* Formulaire Gauche */}
          <div className="lg:col-span-4 space-y-8 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Nom</label>
                <input 
                  type="text" 
                  value={currentTemplate.nom} 
                  onChange={e => setCurrentTemplate({...currentTemplate, nom: e.target.value})}
                  className="w-full px-0 py-3 text-lg border-b border-border bg-transparent focus:border-black outline-none placeholder-gray-300 transition-colors font-medium"
                  placeholder="Nom du template..."
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Description</label>
                <textarea 
                  value={currentTemplate.description} 
                  onChange={e => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                  className="w-full px-4 py-3 border border-border rounded-sm focus:border-black outline-none resize-none text-sm"
                  rows={4}
                  placeholder="Courte description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Couleur (Tag)</label>
                  <input 
                    type="color" 
                    value={currentTemplate.couleur} 
                    onChange={e => setCurrentTemplate({...currentTemplate, couleur: e.target.value})}
                    className="w-full h-10 rounded-sm cursor-pointer border border-border p-1 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wide text-text-secondary mb-2">Icône</label>
                  <div className="relative">
                    <select 
                        value={currentTemplate.icone}
                        onChange={e => setCurrentTemplate({...currentTemplate, icone: e.target.value})}
                        className="w-full px-4 py-2.5 border border-border rounded-sm appearance-none bg-white text-sm focus:border-black outline-none"
                    >
                        {availableIcons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-gray-400">
                        {renderIcon(currentTemplate.icone || 'Folder', 16)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-sm border border-border text-xs text-text-secondary leading-relaxed">
              <p className="font-semibold text-black mb-2 uppercase tracking-wide">Note</p>
              Définissez la structure de dossiers qui sera automatiquement créée lors de l'initialisation d'un nouveau projet utilisant ce template.
            </div>
          </div>

          {/* Builder Droite */}
          <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
            <FolderTreeBuilder 
              structure={currentTemplate.structure || []}
              onChange={(newStructure) => setCurrentTemplate({...currentTemplate, structure: newStructure})}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in pt-4 w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-light text-black tracking-tight">Templates</h2>
          <p className="text-text-secondary mt-2 text-sm font-medium uppercase tracking-wide">Structures de dossiers</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Créer un template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {templates.map((tpl) => (
          <div key={tpl.id} className="bg-white rounded-sm border border-border p-6 hover:border-black transition-all duration-300 group flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-sm bg-gray-50 border border-border flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors duration-300">
                {renderIcon(tpl.icone)}
              </div>
              {tpl.is_default === 1 && (
                <span className="border border-black text-black text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Défaut
                </span>
              )}
            </div>
            
            <h3 className="font-medium text-lg text-black mb-2">{tpl.nom}</h3>
            <p className="text-sm text-text-secondary line-clamp-2 mb-6 flex-1 font-light">{tpl.description}</p>
            
            <div className="pt-4 border-t border-border flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               <button 
                onClick={() => handleEdit(tpl)}
                className="p-2 text-text-secondary hover:text-black rounded-sm transition-colors"
                title="Modifier"
              >
                <Edit3 size={16} />
              </button>
              {!tpl.is_system && (
                <button 
                  onClick={() => tpl.id && handleDelete(tpl.id)}
                  className="p-2 text-text-secondary hover:text-danger rounded-sm transition-colors"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}