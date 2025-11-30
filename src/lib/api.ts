










import { Template, Client, Modele, Projet, IElectronAPI, AppSettings, ActivityLog, DiskUsage, SourceFolder, DebugLogEntry } from '../types';

// Mock data pour le mode navigateur (sans Electron)
const MOCK_TEMPLATES: Template[] = [
  {
    id: 1,
    nom: 'Photo Mode',
    description: 'Structure pour shooting mode et portrait',
    icone: 'Camera',
    couleur: '#FF2D55',
    structure: [
      { nom: "01_PRE-PRODUCTION", enfants: ["Moodboard", "References", "Brief"] },
      { nom: "02_RAW", enfants: [] },
      { nom: "03_SELECTS", enfants: [] },
      { nom: "04_RETOUCHE", enfants: ["PSD", "FINALS"] },
      { nom: "05_EXPORT", enfants: ["Web", "Print", "Instagram"] },
    ],
    is_default: 1,
    is_system: 1,
    usage_count: 12
  },
  {
    id: 2,
    nom: 'Mariage',
    description: 'Structure complète pour reportage mariage',
    icone: 'Heart',
    couleur: '#FF9500',
    structure: [],
    is_default: 0,
    is_system: 1,
    usage_count: 5
  },
  {
    id: 3,
    nom: 'Corporate',
    description: 'Structure pour shooting entreprise',
    icone: 'Building',
    couleur: '#007AFF',
    structure: [],
    is_default: 0,
    is_system: 1,
    usage_count: 8
  }
];

let MOCK_CLIENTS: Client[] = [
  { id: 1, nom: "Zara Mode", entreprise: "Inditex", email: "contact@zara.com", telephone: "01 23 45 67 89", created_at: "2023-01-15T10:00:00Z" },
  { id: 2, nom: "Famille Dupont", email: "dupont@email.com", telephone: "06 12 34 56 78", notes: "Client fidèle", created_at: "2023-05-20T10:00:00Z" },
  { id: 3, nom: "Tech Corp", entreprise: "Tech Corp SA", email: "marketing@techcorp.com", created_at: "2023-11-01T10:00:00Z" }
];

let MOCK_MODELES: Modele[] = [
  { id: 1, prenom: "Sarah", nom: "Connor", email: "sarah@model.com", instagram: "@sarah.c", taille_cm: 175, yeux: "Verts", cheveux: "Bruns", created_at: "2023-02-10T10:00:00Z" },
  { id: 2, prenom: "John", nom: "Doe", email: "john@doe.com", instagram: "@john.d", taille_cm: 182, created_at: "2023-03-15T10:00:00Z" }
];

let MOCK_PROJECTS: Projet[] = [
  {
    id: 101,
    nom: "Campagne Été 2024",
    date_shooting: "2024-01-15",
    chemin: "/Volumes/SSD_EXT/2024/Campagne_Ete",
    disque: "SSD_EXT",
    taille_bytes: 4500000000,
    nb_fichiers: 1250,
    statut: 'en_cours',
    notes: "Shooting extérieur au parc. Client très satisfait.",
    client_id: 1,
    client_nom: "Zara Mode",
    client_email: "contact@zara.com",
    template_nom: "Photo Mode",
    template_icone: "Camera",
    template_couleur: "#FF2D55",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-16T14:30:00Z"
  },
  {
    id: 102,
    nom: "Mariage Sophie & Thomas",
    date_shooting: "2023-10-02",
    chemin: "/Volumes/ARCHIVE/2023/Mariage_ST",
    disque: "ARCHIVE",
    taille_bytes: 128000000000,
    nb_fichiers: 3400,
    statut: 'livre',
    notes: "Album livré le 20/12",
    client_id: 2,
    client_nom: "Famille Dupont",
    template_nom: "Mariage",
    template_icone: "Heart",
    template_couleur: "#FF9500",
    created_at: "2023-10-02T09:00:00Z",
    updated_at: "2023-12-20T11:00:00Z"
  },
  {
    id: 103,
    nom: "Shooting Produit Packshot",
    date_shooting: "2024-02-01",
    chemin: "/Volumes/SSD_EXT/2024/Packshot_Luxe",
    disque: "SSD_EXT",
    taille_bytes: 2500000000,
    nb_fichiers: 450,
    statut: 'en_cours',
    client_id: 3,
    client_nom: "Tech Corp",
    template_nom: "Produit",
    template_icone: "Box",
    template_couleur: "#5856D6",
    created_at: "2024-02-01T09:00:00Z",
    updated_at: "2024-02-01T09:00:00Z"
  }
];

let MOCK_SETTINGS: AppSettings = {
  general: {
    isFirstRun: true,
    userName: '',
    theme: 'system',
    language: 'fr',
    notifications: true,
    sound: true,
    launchAtStartup: false,
    minimizeToTray: false
  },
  folders: {
    defaultDestination: 'D:\\PROJETS_PHOTO',
    defaultTemplate: 1,
    rootFolderName: 'PROJETS_PHOTO',
    organizeByYear: true,
    projectNameFormat: '{DATE}_{NOM}'
  },
  files: {
    transferMode: 'copy',
    includeSubfolders: true,
    rawFormats: ['.ARW', '.CR2', '.CR3', '.NEF', '.DNG'],
    imageFormats: ['.JPG', '.JPEG', '.PNG', '.TIFF'],
    conflictResolution: 'rename'
  },
  performance: {
    threads: 4,
    verifyIntegrity: false,
    minFreeSpaceGB: 1,
    exifCacheSize: 45
  },
  data: {
    autoBackup: true,
    backupFrequency: 'weekly',
    debugMode: false
  }
};

let MOCK_ACTIVITY: ActivityLog[] = [
  { id: 1, type: 'project_created', message: 'Wedding_Dupont créé', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), entity_id: 101 },
  { id: 2, type: 'client_added', message: 'Client "Nike France" ajouté', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), entity_id: 1 },
  { id: 3, type: 'model_added', message: 'Modèle "Marie D." modifié', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(), entity_id: 1 },
  { id: 4, type: 'project_completed', message: 'Corporate_Nike → Terminé', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), entity_id: 103 },
  { id: 5, type: 'project_created', message: 'Portrait_Sophie créé', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), entity_id: 104 }
];

const MOCK_DISK_USAGE: DiskUsage[] = [
    { path: "C:", label: "Système", free: 120000000000, total: 500000000000, is_connected: true },
    { path: "D:", label: "Données", free: 550000000000, total: 1000000000000, is_connected: true },
    { path: "E:", label: "Backup 1", free: 300000000000, total: 500000000000, is_connected: true },
    { path: "F:", label: "Archives", free: 0, total: 500000000000, is_connected: false },
    { path: "G:", label: "SSD Portable", free: 400000000000, total: 1000000000000, is_connected: true },
    { path: "H:", label: "Backup 2", free: 800000000000, total: 2000000000000, is_connected: true },
    { path: "I:", label: "SD Card", free: 12000000000, total: 64000000000, is_connected: true }
];

// In-memory logs
let MOCK_DEBUG_LOGS: DebugLogEntry[] = [];

// Helper to compute stats for mock
const computeClientStats = (client: Client): Client => {
  const clientProjects = MOCK_PROJECTS.filter(p => p.client_id === client.id);
  const sortedProjects = [...clientProjects].sort((a, b) => new Date(b.date_shooting).getTime() - new Date(a.date_shooting).getTime());
  return {
    ...client,
    project_count: clientProjects.length,
    last_project_date: sortedProjects[0]?.date_shooting
  };
};

const computeModelStats = (model: Modele): Modele => {
  return {
    ...model,
    project_count: Math.floor(Math.random() * 10),
    last_project_date: new Date().toISOString()
  };
};

const _log = (action: string, details?: string, component: string = 'API') => {
  // Always log to console in dev
  console.log(`[${component}] ${action} ${details || ''}`);
  // Add to debug store
  MOCK_DEBUG_LOGS.unshift({
    timestamp: new Date().toISOString(),
    action,
    details,
    component
  });
  // Cap at 1000
  if (MOCK_DEBUG_LOGS.length > 1000) MOCK_DEBUG_LOGS.pop();
};

const MOCK_API: IElectronAPI = {
  getTemplates: async () => {
    _log('getTemplates', 'Fetching all templates');
    return MOCK_TEMPLATES;
  },
  saveTemplate: async (tpl) => { 
    _log('saveTemplate', `Saving template ${tpl.nom}`); 
    return 99; 
  },
  deleteTemplate: async (id) => {
    _log('deleteTemplate', `Deleting template ID ${id}`);
  },
  setDefaultTemplate: async (id) => {
    _log('setDefaultTemplate', `Setting default ID ${id}`);
  },
  
  getClients: async () => {
    _log('getClients', `Returning ${MOCK_CLIENTS.length} clients`);
    return MOCK_CLIENTS.map(computeClientStats);
  },
  saveClient: async (c) => { 
    if (c.id) {
        _log('saveClient', `Updating client ${c.id}`);
        MOCK_CLIENTS = MOCK_CLIENTS.map(cl => cl.id === c.id ? {...c, updated_at: new Date().toISOString()} : cl);
        return c.id;
    }
    _log('saveClient', `Creating new client ${c.nom}`);
    const newId = Math.floor(Math.random() * 1000);
    const newClient = { ...c, id: newId, created_at: new Date().toISOString() };
    MOCK_CLIENTS.push(newClient);
    MOCK_ACTIVITY.unshift({
        id: Math.random(),
        type: 'client_added',
        message: `Client "${c.nom}" ajouté`,
        timestamp: new Date().toISOString(),
        entity_id: newId
    });
    return newId;
  },
  deleteClient: async (id) => { 
    _log('deleteClient', `Deleting client ${id}`);
    MOCK_CLIENTS = MOCK_CLIENTS.filter(c => c.id !== id); 
  },
  
  getModeles: async () => {
    _log('getModeles', `Returning ${MOCK_MODELES.length} models`);
    return MOCK_MODELES.map(computeModelStats);
  },
  saveModele: async (m) => {
    if (m.id) {
        _log('saveModele', `Updating model ${m.id}`);
        MOCK_MODELES = MOCK_MODELES.map(mo => mo.id === m.id ? {...m, updated_at: new Date().toISOString()} : mo);
        return m.id;
    }
    _log('saveModele', `Creating new model ${m.prenom}`);
    const newId = Math.floor(Math.random() * 1000);
    const newModele = { ...m, id: newId, created_at: new Date().toISOString() };
    MOCK_MODELES.push(newModele);
    return newId;
  },
  deleteModele: async (id) => { 
    _log('deleteModele', `Deleting model ${id}`);
    MOCK_MODELES = MOCK_MODELES.filter(m => m.id !== id); 
  },
  
  getProjets: async () => {
    _log('getProjets', `Returning ${MOCK_PROJECTS.length} projects`);
    return [...MOCK_PROJECTS];
  },
  createProjet: async (p) => { 
    _log('createProjet', `Creating project ${p.nom}`);
    const newId = Math.floor(Math.random() * 1000);
    const newProject = { 
        ...p, 
        id: newId,
        statut: 'en_cours' as const,
        taille_bytes: 12500000000, // Mock size
        nb_fichiers: 450,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    MOCK_PROJECTS.push(newProject);
    MOCK_ACTIVITY.unshift({
        id: Math.random(),
        type: 'project_created',
        message: `Projet "${p.nom}" créé`,
        timestamp: new Date().toISOString(),
        entity_id: newId
    });
    return newId; 
  },
  updateProjectStatus: async (id, status) => {
    _log('updateProjectStatus', `ID ${id} -> ${status}`);
    MOCK_PROJECTS = MOCK_PROJECTS.map(p => p.id === id ? { ...p, statut: status as any } : p);
    const p = MOCK_PROJECTS.find(p => p.id === id);
    if(p) {
        MOCK_ACTIVITY.unshift({
            id: Math.random(),
            type: status === 'livre' ? 'project_completed' : 'project_archived',
            message: `${p.nom} → ${status === 'livre' ? 'Terminé' : 'Archivé'}`,
            timestamp: new Date().toISOString(),
            entity_id: id
        });
    }
  },
  updateProjectNote: async (id, note) => {
    _log('updateProjectNote', `ID ${id}`);
    MOCK_PROJECTS = MOCK_PROJECTS.map(p => p.id === id ? { ...p, notes: note } : p);
  },
  updateProjectDetails: async (id, updates, reorganize) => {
      _log('updateProjectDetails', `ID ${id} Reorg=${reorganize}`, JSON.stringify(updates));
      MOCK_PROJECTS = MOCK_PROJECTS.map(p => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p);
  },
  deleteProject: async (id) => {
    _log('deleteProject', `Deleting project ${id}`);
    MOCK_PROJECTS = MOCK_PROJECTS.filter(p => p.id !== id);
  },
  
  getActivityLogs: async () => MOCK_ACTIVITY,

  getSettings: async () => MOCK_SETTINGS,
  saveSettings: async (s) => { 
    _log('saveSettings', 'Settings updated');
    MOCK_SETTINGS = s; 
  },

  selectDirectory: async () => {
    _log('selectDirectory', 'Opened dialog');
    return "C:\\Users\\Alan\\DCIM\\100CANON";
  },
  scanDirectory: async (path: string): Promise<SourceFolder> => {
      _log('scanDirectory', `Scanning ${path}`);
      return {
          path,
          fileCount: Math.floor(Math.random() * 500) + 50,
          size: Math.floor(Math.random() * 20000000000) + 1000000000,
          rawCount: Math.floor(Math.random() * 400),
          jpgCount: Math.floor(Math.random() * 100),
          date: new Date().toISOString().split('T')[0]
      };
  },
  getDriveSpace: async () => {
    _log('getDriveSpace', 'Fetching disk usage');
    return MOCK_DISK_USAGE;
  },
  openDirectory: async (path) => {
    _log('openDirectory', `Opening ${path}`);
  },

  logDebug: async (action, details, component) => {
      _log(action, details, component);
  },
  getDebugLogs: async () => MOCK_DEBUG_LOGS,
  clearDebugLogs: async () => { MOCK_DEBUG_LOGS = []; }
};

const isElectron = 'electron' in window;
export const api = isElectron ? window.electron : MOCK_API;