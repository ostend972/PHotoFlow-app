





import { contextBridge, ipcRenderer } from 'electron';

// Exposition de l'API sécurisée au renderer
contextBridge.exposeInMainWorld('electron', {
  getTemplates: () => ipcRenderer.invoke('getTemplates'),
  saveTemplate: (tpl: any) => ipcRenderer.invoke('saveTemplate', tpl),
  deleteTemplate: (id: number) => ipcRenderer.invoke('deleteTemplate', id),
  setDefaultTemplate: (id: number) => ipcRenderer.invoke('setDefaultTemplate', id),
  
  getClients: () => ipcRenderer.invoke('getClients'),
  saveClient: (client: any) => ipcRenderer.invoke('saveClient', client),
  deleteClient: (id: number) => ipcRenderer.invoke('deleteClient', id),
  
  getModeles: () => ipcRenderer.invoke('getModeles'),
  saveModele: (modele: any) => ipcRenderer.invoke('saveModele', modele),
  deleteModele: (id: number) => ipcRenderer.invoke('deleteModele', id),
  
  getProjets: () => ipcRenderer.invoke('getProjets'),
  createProjet: (p: any, s: string[]) => ipcRenderer.invoke('createProjet', p, s),
  updateProjectStatus: (id: number, s: string) => ipcRenderer.invoke('updateProjectStatus', id, s),
  updateProjectNote: (id: number, n: string) => ipcRenderer.invoke('updateProjectNote', id, n),
  updateProjectDetails: (id: number, u: any, r: boolean) => ipcRenderer.invoke('updateProjectDetails', id, u, r),
  deleteProject: (id: number) => ipcRenderer.invoke('deleteProject', id),
  
  getSettings: () => ipcRenderer.invoke('getSettings'),
  saveSettings: (s: any) => ipcRenderer.invoke('saveSettings', s),
  
  selectDirectory: () => ipcRenderer.invoke('selectDirectory'),
  scanDirectory: (path: string) => ipcRenderer.invoke('scanDirectory', path),
  getDriveSpace: () => ipcRenderer.invoke('getDriveSpace'),
  openDirectory: (path: string) => ipcRenderer.invoke('openDirectory', path),

  // Debug (mocked for now in IPC, or passed through if implemented on backend)
  logDebug: (a: string, d?: string, c?: string) => ipcRenderer.invoke('logDebug', a, d, c),
  getDebugLogs: () => ipcRenderer.invoke('getDebugLogs'),
  clearDebugLogs: () => ipcRenderer.invoke('clearDebugLogs'),
});