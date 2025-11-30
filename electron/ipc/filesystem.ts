import { ipcMain, dialog, shell } from 'electron';
import fs from 'fs-extra';
import path from 'path';

export const filesystemHandlers = {
  selectDirectory: async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  },

  scanDirectory: async (dirPath: string) => {
    try {
      const files = await fs.readdir(dirPath);
      let fileCount = 0;
      let size = 0;
      let rawCount = 0;
      let jpgCount = 0;
      
      const rawExtensions = ['.ARW', '.CR2', '.CR3', '.NEF', '.DNG', '.RAF'];
      const jpgExtensions = ['.JPG', '.JPEG'];

      for (const file of files) {
        const filePath = path.join(dirPath, file);
        try {
          const stats = await fs.stat(filePath);
          if (stats.isFile()) {
            fileCount++;
            size += stats.size;
            
            const ext = path.extname(file).toUpperCase();
            if (rawExtensions.includes(ext)) rawCount++;
            if (jpgExtensions.includes(ext)) jpgCount++;
          }
        } catch (e) {
          // Ignore unreadable files
        }
      }

      // TODO: Try to read date from first file (EXIF)
      // For now, return current date or empty
      const date = new Date().toISOString().split('T')[0];

      return {
        path: dirPath,
        fileCount,
        size,
        rawCount,
        jpgCount,
        date
      };
    } catch (error) {
      console.error('Error scanning directory:', error);
      throw error;
    }
  },

  getDriveSpace: async () => {
    // Note: 'check-disk-space' requires a native module or exec command. 
    // For simplicity in this demo, we mock it or use a simple logic if available.
    // In a real app, use a library like 'node-disk-info'
    return [
       { path: "C:", label: "System", free: 100000000000, total: 500000000000, is_connected: true }
    ];
  },

  openDirectory: async (dirPath: string) => {
    await shell.openPath(dirPath);
  }
};
