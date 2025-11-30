import { app } from 'electron';
import path from 'path';
import fs from 'fs-extra';
import { AppSettings } from '../../src/types';

const SETTINGS_FILE = path.join(app.getPath('userData'), 'settings.json');

const DEFAULT_SETTINGS: AppSettings = {
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
    defaultDestination: '',
    defaultTemplate: 1,
    rootFolderName: 'PROJETS_PHOTO',
    organizeByYear: true,
    projectNameFormat: '{DATE}_{NOM}'
  },
  files: {
    transferMode: 'copy',
    includeSubfolders: true,
    rawFormats: ['.ARW', '.CR2', '.CR3', '.NEF', '.DNG', '.RAF', '.ORF'],
    imageFormats: ['.JPG', '.JPEG', '.PNG', '.TIFF'],
    conflictResolution: 'rename'
  },
  performance: {
    threads: 4,
    verifyIntegrity: false,
    minFreeSpaceGB: 1,
    exifCacheSize: 0
  },
  data: {
    autoBackup: true,
    backupFrequency: 'weekly',
    debugMode: false
  }
};

export const settingsHandlers = {
  getSettings: async (): Promise<AppSettings> => {
    try {
      if (await fs.pathExists(SETTINGS_FILE)) {
        const data = await fs.readJSON(SETTINGS_FILE);
        // Merge with defaults in case new keys were added
        const merged = { ...DEFAULT_SETTINGS, ...data };
        // Deep merge
        merged.general = { ...DEFAULT_SETTINGS.general, ...(data.general || {}) };
        merged.folders = { ...DEFAULT_SETTINGS.folders, ...(data.folders || {}) };
        merged.files = { ...DEFAULT_SETTINGS.files, ...(data.files || {}) };
        merged.performance = { ...DEFAULT_SETTINGS.performance, ...(data.performance || {}) };
        merged.data = { ...DEFAULT_SETTINGS.data, ...(data.data || {}) };
        return merged;
      }
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('Error reading settings:', error);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: AppSettings): Promise<void> => {
    try {
      await fs.writeJSON(SETTINGS_FILE, settings, { spaces: 2 });
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }
};