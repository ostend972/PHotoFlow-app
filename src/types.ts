

// Définitions de types globaux pour l'application

export interface Client {
  id?: number;
  nom: string;
  entreprise?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  site_web?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Computed fields
  project_count?: number;
  last_project_date?: string;
}

export interface Modele {
  id?: number;
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  instagram?: string;
  taille_cm?: number;
  mensurations?: string;
  cheveux?: string;
  yeux?: string;
  photo_path?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Computed fields
  project_count?: number;
  last_project_date?: string;
}

export interface FolderNode {
  nom: string;
  // Les enfants peuvent être des chaînes (sous-dossiers simples) ou des nœuds complexes
  enfants: (string | FolderNode)[]; 
  // Règles de routage automatique des fichiers (ex: ['RAW', 'JPG'])
  routingRules?: string[];
  // Règles basées sur des mots-clés dans le nom de fichier (ex: ['moodboard', 'contrat'])
  routingKeywords?: string[];
}

export interface Template {
  id?: number;
  nom: string;
  description?: string;
  icone: string;
  couleur: string;
  structure: FolderNode[]; // Stocké en JSON dans la DB
  is_default: number; // SQLite booléen est 0 ou 1
  is_system: number;
  usage_count?: number; // Calculé via jointure
}

export interface Projet {
  id?: number;
  nom: string;
  date_shooting: string;
  chemin: string;
  disque: string;
  cover_image?: string;
  taille_bytes: number;
  statut: 'en_cours' | 'livre' | 'archive';
  notes?: string;
  client_id?: number | null;
  model_ids?: number[]; // Liste des IDs de modèles liés
  template_id?: number;
  client_nom?: string; // Jointure
  client_email?: string; // Jointure
  template_nom?: string; // Jointure
  template_icone?: string; // Jointure
  template_couleur?: string; // Jointure
  nb_fichiers?: number;
  created_at?: string;
  updated_at?: string;
}

export interface SourceFolder {
  path: string;
  fileCount: number;
  size: number;
  rawCount: number;
  jpgCount: number;
  date?: string;
}

export interface AppSettings {
  general: {
    isFirstRun: boolean;
    userName: string;
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en';
    notifications: boolean;
    sound: boolean;
    launchAtStartup: boolean;
    minimizeToTray: boolean;
  };
  folders: {
    defaultDestination: string;
    defaultTemplate: number;
    rootFolderName: string;
    organizeByYear: boolean;
    projectNameFormat: string;
  };
  files: {
    transferMode: 'copy' | 'move';
    includeSubfolders: boolean;
    rawFormats: string[];
    imageFormats: string[];
    conflictResolution: 'rename' | 'overwrite' | 'skip' | 'ask';
  };
  performance: {
    threads: number;
    verifyIntegrity: boolean;
    minFreeSpaceGB: number;
    exifCacheSize: number;
  };
  data: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    debugMode: boolean;
  };
}

export interface ActivityLog {
  id: number;
  type: 'project_created' | 'project_completed' | 'project_archived' | 'client_added' | 'model_added' | 'template_created';
  message: string;
  timestamp: string;
  entity_id?: number;
}

export interface DiskUsage {
  path: string;
  label: string;
  free: number;
  total: number;
  is_connected: boolean;
}

export interface DebugLogEntry {
  timestamp: string;
  action: string;
  details?: string;
  component?: string;
}

// Interface pour la communication IPC
export interface IElectronAPI {
  // Database CRUD
  getTemplates: () => Promise<Template[]>;
  saveTemplate: (tpl: Template) => Promise<number>;
  deleteTemplate: (id: number) => Promise<void>;
  setDefaultTemplate: (id: number) => Promise<void>;
  
  getClients: () => Promise<Client[]>;
  saveClient: (client: Client) => Promise<number>;
  deleteClient: (id: number) => Promise<void>;
  
  getModeles: () => Promise<Modele[]>;
  saveModele: (modele: Modele) => Promise<number>;
  deleteModele: (id: number) => Promise<void>;
  
  getProjets: () => Promise<Projet[]>;
  createProjet: (projet: Projet, sources: string[]) => Promise<number>;
  updateProjectStatus: (id: number, statut: string) => Promise<void>;
  updateProjectNote: (id: number, note: string) => Promise<void>;
  updateProjectDetails: (id: number, updates: Partial<Projet>, reorganize: boolean) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  
  // Activity & Stats
  getActivityLogs: () => Promise<ActivityLog[]>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: AppSettings) => Promise<void>;

  // Filesystem
  selectDirectory: () => Promise<string | null>;
  scanDirectory: (path: string) => Promise<SourceFolder>;
  getDriveSpace: () => Promise<DiskUsage[]>;
  openDirectory: (path: string) => Promise<void>;

  // Debug
  logDebug: (action: string, details?: string, component?: string) => Promise<void>;
  getDebugLogs: () => Promise<DebugLogEntry[]>;
  clearDebugLogs: () => Promise<void>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}