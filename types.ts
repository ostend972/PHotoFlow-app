
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
}

export interface FolderNode {
  nom: string;
  // Les enfants peuvent être des chaînes (sous-dossiers simples) ou des nœuds complexes
  enfants: (string | FolderNode)[]; 
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
  taille_bytes: number;
  statut: 'en_cours' | 'livre' | 'archive';
  notes?: string;
  client_id?: number;
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

// Interface pour la communication IPC
export interface IElectronAPI {
  // Database CRUD
  getTemplates: () => Promise<Template[]>;
  saveTemplate: (tpl: Template) => Promise<number>;
  deleteTemplate: (id: number) => Promise<void>;
  setDefaultTemplate: (id: number) => Promise<void>;
  
  getClients: () => Promise<Client[]>;
  saveClient: (client: Client) => Promise<number>;
  
  getModeles: () => Promise<Modele[]>;
  
  getProjets: () => Promise<Projet[]>;
  createProjet: (projet: Projet, sources: string[]) => Promise<number>;
  updateProjectStatus: (id: number, statut: string) => Promise<void>;
  updateProjectNote: (id: number, note: string) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  
  // Filesystem
  selectDirectory: () => Promise<string | null>;
  getDriveSpace: () => Promise<{path: string, free: number, total: number}[]>;
  openDirectory: (path: string) => Promise<void>;
}
