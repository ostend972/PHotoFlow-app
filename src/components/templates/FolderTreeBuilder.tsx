

import React, { useState } from 'react';
import { 
  Folder, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit2,
  Settings,
  X,
  Check,
  Tag
} from 'lucide-react';
import { FolderNode } from '../../types';
import { clsx } from 'clsx';

interface FolderTreeBuilderProps {
  structure: FolderNode[];
  onChange: (newStructure: FolderNode[]) => void;
}

// Catégories de fichiers supportées pour le routage
const FILE_CATEGORIES = [
  { id: 'RAW', label: 'RAW', desc: '.arw, .cr2, .nef...' },
  { id: 'JPG', label: 'JPG', desc: '.jpg, .jpeg' },
  { id: 'TIFF', label: 'TIFF', desc: '.tif, .tiff' },
  { id: 'PSD', label: 'PSD', desc: '.psd, .psb' },
  { id: 'VIDEO', label: 'VIDEO', desc: '.mp4, .mov...' },
  { id: 'XMP', label: 'XMP', desc: 'Sidecars' },
];

const TreeNode = ({ 
  node, 
  path, 
  onUpdate, 
  onDelete,
  onOpenSettings
}: { 
  node: FolderNode | string, 
  path: number[], 
  onUpdate: (path: number[], newNode: FolderNode | string) => void,
  onDelete: (path: number[]) => void,
  onOpenSettings: (path: number[], node: FolderNode) => void
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const isString = typeof node === 'string';
  const name = isString ? node : node.nom;
  const rules = !isString ? (node as FolderNode).routingRules || [] : [];
  const keywords = !isString ? (node as FolderNode).routingKeywords || [] : [];
  const children = !isString ? (node as FolderNode).enfants : [];

  const handleAddChild = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Convert to FolderNode if it's a string
    const baseNode: FolderNode = isString 
        ? { nom: node as string, enfants: [] } 
        : { ...(node as FolderNode) };
    
    baseNode.enfants = [...(baseNode.enfants || []), { nom: "Nouveau dossier", enfants: [] }];
    
    onUpdate(path, baseNode);
    setIsOpen(true);
  };

  const handleOpenSettingsWrapper = () => {
      // Convert to FolderNode if it's a string to allow attaching rules
      const baseNode: FolderNode = isString 
        ? { nom: node as string, enfants: [] } 
        : { ...(node as FolderNode) };

      if (isString) {
          onUpdate(path, baseNode);
      }
      onOpenSettings(path, baseNode);
  };

  const handleNameChange = (val: string) => {
    if (isString) {
      onUpdate(path, val);
    } else {
      onUpdate(path, { ...(node as FolderNode), nom: val });
    }
  };

  return (
    <div className="pl-6 border-l border-border/50 ml-2 relative">
      <div className={clsx(
        "flex items-center gap-3 py-1.5 group pr-2 transition-colors",
      )}>
        {/* Toggle Expand/Collapse */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "p-0.5 text-gray-400 hover:text-black transition-colors", 
            (isString || children.length === 0) && "invisible"
          )}
        >
          {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>

        {/* Icone */}
        <div className="text-black">
          <Folder 
            size={14} 
            strokeWidth={1.5} 
            fill={isString || children.length === 0 ? "none" : "currentColor"} 
            className={isString || children.length === 0 ? "text-black" : "text-black/10"} 
          />
        </div>

        {/* Nom éditable + Badges */}
        <div className="flex-1 min-w-[200px] flex items-center gap-2">
          {isEditing ? (
            <input 
              autoFocus
              type="text"
              className="w-full px-1 py-0.5 text-sm bg-transparent border-b border-black outline-none font-medium"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => setIsEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="text-sm text-text-primary hover:underline decoration-1 underline-offset-2 cursor-text select-none"
                onDoubleClick={() => setIsEditing(true)}
              >
                {name}
              </span>
              
              {/* Badges pour les extensions */}
              {!isString && rules.length > 0 && (
                <div className="flex gap-1">
                  {rules.map(rule => (
                    <span key={rule} className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded-sm font-medium tracking-wide">
                      {rule}
                    </span>
                  ))}
                </div>
              )}

              {/* Badges pour les mots-clés */}
              {!isString && keywords.length > 0 && (
                <div className="flex gap-1">
                  {keywords.map(kw => (
                    <span key={kw} className="text-[9px] bg-gray-100 text-text-secondary border border-gray-200 px-1.5 py-0.5 rounded-sm font-medium tracking-wide flex items-center gap-1">
                      <Tag size={8} /> "{kw}"
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions (Visibles au survol) */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-opacity">
          <button 
            onClick={handleAddChild}
            title="Ajouter un sous-dossier"
            className="text-gray-400 hover:text-black transition-colors"
          >
            <Plus size={12} />
          </button>
          <button 
            onClick={handleOpenSettingsWrapper}
            title="Règles de routage"
            className="text-gray-400 hover:text-black transition-colors"
          >
            <Settings size={12} />
          </button>
          <button 
            onClick={() => setIsEditing(true)}
            title="Renommer"
            className="text-gray-400 hover:text-black transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button 
            onClick={() => onDelete(path)}
            title="Supprimer"
            className="text-gray-400 hover:text-danger transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Enfants récursifs */}
      {!isString && isOpen && children && (
        <div className="mt-0.5">
          {children.map((child, idx) => (
            <TreeNode 
              key={idx} 
              node={child} 
              path={[...path, idx]} 
              onUpdate={onUpdate}
              onDelete={onDelete}
              onOpenSettings={onOpenSettings}
            />
          ))}
          {children.length === 0 && (
            <div className="pl-8 text-[10px] text-gray-300 italic py-1 tracking-wide">Vide</div>
          )}
        </div>
      )}
    </div>
  );
};

export function FolderTreeBuilder({ structure, onChange }: FolderTreeBuilderProps) {
  const [editingNodePath, setEditingNodePath] = useState<number[] | null>(null);
  const [editingNodeData, setEditingNodeData] = useState<FolderNode | null>(null);
  const [keywordInput, setKeywordInput] = useState("");

  const updateNode = (currentStructure: FolderNode[], path: number[], newNode: FolderNode | string): FolderNode[] => {
    if (path.length === 0) return currentStructure;
    const [currentIndex, ...restPath] = path;
    const newLevel = [...currentStructure];
    
    if (path.length === 1) {
      // @ts-ignore
      newLevel[currentIndex] = newNode;
      return newLevel;
    }

    const childNode = newLevel[currentIndex];
    if (typeof childNode !== 'string') {
        const updatedChild = { 
            ...childNode, 
            enfants: updateNode(childNode.enfants as FolderNode[], restPath, newNode) 
        };
        newLevel[currentIndex] = updatedChild;
    }
    
    return newLevel;
  };

  const deleteNode = (currentStructure: FolderNode[], path: number[]): FolderNode[] => {
    const [currentIndex, ...restPath] = path;
    
    if (path.length === 1) {
        return currentStructure.filter((_, i) => i !== currentIndex);
    }

    const newLevel = [...currentStructure];
    const childNode = newLevel[currentIndex];
    
    if (typeof childNode !== 'string') {
        const updatedChild = {
            ...childNode,
            enfants: deleteNode(childNode.enfants as FolderNode[], restPath)
        };
        newLevel[currentIndex] = updatedChild;
    }

    return newLevel;
  };

  const handleUpdate = (path: number[], newNode: FolderNode | string) => {
    onChange(updateNode(structure, path, newNode));
  };

  const handleDelete = (path: number[]) => {
    onChange(deleteNode(structure, path));
  };

  const addRootFolder = () => {
    onChange([...structure, { nom: "Nouveau dossier racine", enfants: [] }]);
  };

  const handleOpenSettings = (path: number[], node: FolderNode) => {
    setEditingNodePath(path);
    setEditingNodeData({ ...node });
    setKeywordInput("");
  };

  const handleSaveSettings = () => {
    if (editingNodePath && editingNodeData) {
      handleUpdate(editingNodePath, editingNodeData);
      setEditingNodePath(null);
      setEditingNodeData(null);
    }
  };

  const toggleRule = (rule: string) => {
    if (!editingNodeData) return;
    const currentRules = editingNodeData.routingRules || [];
    const newRules = currentRules.includes(rule)
      ? currentRules.filter(r => r !== rule)
      : [...currentRules, rule];
    setEditingNodeData({ ...editingNodeData, routingRules: newRules });
  };

  const addKeyword = () => {
    if (!editingNodeData || !keywordInput.trim()) return;
    const currentKeywords = editingNodeData.routingKeywords || [];
    if (currentKeywords.includes(keywordInput.trim())) return;
    
    setEditingNodeData({
      ...editingNodeData,
      routingKeywords: [...currentKeywords, keywordInput.trim()]
    });
    setKeywordInput("");
  };

  const removeKeyword = (kw: string) => {
    if (!editingNodeData) return;
    setEditingNodeData({
      ...editingNodeData,
      routingKeywords: (editingNodeData.routingKeywords || []).filter(k => k !== kw)
    });
  };

  return (
    <div className="bg-white rounded-sm border border-border overflow-hidden flex flex-col h-[600px] relative">
      <div className="p-4 border-b border-border bg-white flex justify-between items-center">
        <span className="text-xs font-medium uppercase tracking-widest text-text-secondary">Arborescence</span>
        <button 
          onClick={addRootFolder}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-black border border-border hover:border-black rounded-full transition-colors"
        >
          <Plus size={12} />
          Ajouter racine
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {structure.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-300">
            <Folder size={32} strokeWidth={1} className="mb-4 opacity-30" />
            <p className="text-sm font-light">Structure vide</p>
          </div>
        ) : (
          structure.map((node, idx) => (
            <TreeNode 
              key={idx} 
              node={node} 
              path={[idx]} 
              onUpdate={handleUpdate} 
              onDelete={handleDelete}
              onOpenSettings={handleOpenSettings}
            />
          ))
        )}
      </div>

      {/* Settings Modal Overlay */}
      {editingNodePath && editingNodeData && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-white border border-border shadow-2xl rounded-sm w-full max-w-sm max-h-[90%] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50">
              <h3 className="font-medium text-sm flex items-center gap-2">
                <Settings size={14} />
                Règles de routage
              </h3>
              <button onClick={() => setEditingNodePath(null)} className="text-gray-400 hover:text-black">
                <X size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-xs text-text-secondary mb-4">
                Configurez le tri automatique pour le dossier <span className="font-medium text-black">"{editingNodeData.nom}"</span>.
              </p>

              {/* Section Types de fichiers */}
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3">Par type de fichier</h4>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {FILE_CATEGORIES.map(cat => {
                  const isActive = editingNodeData.routingRules?.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleRule(cat.id)}
                      className={clsx(
                        "flex flex-col items-start p-3 border rounded-sm transition-all duration-200 text-left",
                        isActive 
                          ? "border-black bg-black text-white" 
                          : "border-border hover:border-black hover:bg-gray-50"
                      )}
                    >
                      <div className="flex justify-between w-full mb-1">
                        <span className="font-bold text-xs">{cat.label}</span>
                        {isActive && <Check size={12} />}
                      </div>
                      <span className={clsx("text-[10px]", isActive ? "text-gray-300" : "text-gray-400")}>
                        {cat.desc}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Section Mots-clés */}
              <h4 className="text-xs font-bold uppercase tracking-widest text-black mb-3">Par mot-clé (Nom du fichier)</h4>
              <div className="space-y-3">
                  <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        placeholder="Ex: moodboard, contrat..."
                        className="flex-1 border border-border rounded-sm px-3 py-1.5 text-xs outline-none focus:border-black"
                        onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                      />
                      <button 
                        onClick={addKeyword}
                        disabled={!keywordInput.trim()}
                        className="bg-black text-white px-3 py-1.5 rounded-sm text-xs font-medium hover:bg-accent-hover disabled:opacity-50"
                      >
                        Ajouter
                      </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                      {editingNodeData.routingKeywords?.map((kw, idx) => (
                          <div key={idx} className="bg-gray-100 border border-gray-200 pl-2 pr-1 py-1 rounded-sm flex items-center gap-1">
                              <span className="text-xs font-medium text-text-primary">{kw}</span>
                              <button onClick={() => removeKeyword(kw)} className="text-gray-400 hover:text-danger p-0.5">
                                  <X size={12} />
                              </button>
                          </div>
                      ))}
                      {(!editingNodeData.routingKeywords || editingNodeData.routingKeywords.length === 0) && (
                          <span className="text-[10px] text-gray-400 italic">Aucun mot-clé défini.</span>
                      )}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Les fichiers contenant ces mots seront déplacés ici.
                  </p>
              </div>
            </div>

            <div className="p-4 border-t border-border flex justify-end gap-2 bg-gray-50 mt-auto">
              <button 
                onClick={() => setEditingNodePath(null)}
                className="px-4 py-2 text-xs font-medium text-text-secondary hover:text-black transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-black text-white text-xs font-medium rounded-full hover:bg-accent-hover transition-colors"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
