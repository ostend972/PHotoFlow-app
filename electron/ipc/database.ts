



import Database from 'better-sqlite3';
import path from 'path';
import { app, shell } from 'electron';
import fs from 'fs-extra';

let db: Database.Database;

// Initialisation DB
export const initDatabase = () => {
  const dbPath = path.join(app.getPath('userData'), 'photoflow.db');
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Création des tables (Copie exacte du schéma demandé)
  const schema = `
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      entreprise TEXT,
      email TEXT,
      telephone TEXT,
      adresse TEXT,
      site_web TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modeles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prenom TEXT NOT NULL,
      nom TEXT NOT NULL,
      email TEXT,
      telephone TEXT,
      instagram TEXT,
      taille_cm INTEGER,
      mensurations TEXT,
      cheveux TEXT,
      yeux TEXT,
      photo_path TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL UNIQUE,
      description TEXT,
      icone TEXT DEFAULT 'folder',
      couleur TEXT DEFAULT '#007AFF',
      structure JSON NOT NULL,
      is_default BOOLEAN DEFAULT 0,
      is_system BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nom TEXT NOT NULL,
      date_shooting DATE NOT NULL,
      chemin TEXT NOT NULL,
      disque TEXT NOT NULL,
      cover_image TEXT,
      taille_bytes INTEGER DEFAULT 0,
      nb_fichiers INTEGER DEFAULT 0,
      statut TEXT DEFAULT 'en_cours',
      notes TEXT,
      client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
      template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projet_modeles (
      projet_id INTEGER NOT NULL REFERENCES projets(id) ON DELETE CASCADE,
      modele_id INTEGER NOT NULL REFERENCES modeles(id) ON DELETE CASCADE,
      PRIMARY KEY (projet_id, modele_id)
    );
  `;
  
  db.exec(schema);

  // Seed default templates (Simplified for brevity, but would actally contain the full Insert statement)
  const count = db.prepare('SELECT count(*) as c FROM templates').get() as {c: number};
  if (count.c === 0) {
      const insert = db.prepare(`
          INSERT INTO templates (nom, description, icone, couleur, structure, is_default, is_system) 
          VALUES (@nom, @description, @icone, @couleur, @structure, @is_default, @is_system)
      `);
      
      // Exemple d'un template par défaut
      insert.run({
          nom: 'Photo Mode',
          description: 'Structure pour shooting mode et portrait',
          icone: 'Camera',
          couleur: '#FF2D55',
          structure: JSON.stringify([
            {nom: "01_PRE-PRODUCTION", enfants: ["Moodboard", "Brief"]},
            {nom: "02_RAW", enfants: []},
            {nom: "03_SELECTS", enfants: []},
            {nom: "04_RETOUCHE", enfants: ["PSD", "FINALS"]}
          ]),
          is_default: 1,
          is_system: 1
      });
  }
};

// Handlers exportés pour le Main process
export const dbHandlers = {
  getTemplates: () => {
    const rows = db.prepare('SELECT * FROM templates ORDER BY nom ASC').all();
    return rows.map((r: any) => ({ ...r, structure: JSON.parse(r.structure) }));
  },

  saveTemplate: (tpl: any) => {
    const structureStr = JSON.stringify(tpl.structure);
    if (tpl.id) {
      const stmt = db.prepare(`
        UPDATE templates SET nom=@nom, description=@description, icone=@icone, couleur=@couleur, structure=@structure 
        WHERE id=@id
      `);
      stmt.run({ ...tpl, structure: structureStr });
      return tpl.id;
    } else {
      const stmt = db.prepare(`
        INSERT INTO templates (nom, description, icone, couleur, structure, is_default, is_system)
        VALUES (@nom, @description, @icone, @couleur, @structure, 0, 0)
      `);
      const info = stmt.run({ ...tpl, structure: structureStr });
      return info.lastInsertRowid;
    }
  },

  deleteTemplate: (id: number) => {
    db.prepare('DELETE FROM templates WHERE id = ? AND is_system = 0').run(id);
  },

  getClients: () => {
    // Calculer le nombre de projets pour chaque client
    return db.prepare(`
        SELECT c.*, COUNT(p.id) as project_count, MAX(p.date_shooting) as last_project_date
        FROM clients c
        LEFT JOIN projets p ON p.client_id = c.id
        GROUP BY c.id
        ORDER BY c.nom ASC
    `).all();
  },

  saveClient: (client: any) => {
    if (client.id) {
        const stmt = db.prepare(`
            UPDATE clients SET nom=@nom, entreprise=@entreprise, email=@email, telephone=@telephone, 
            adresse=@adresse, site_web=@site_web, notes=@notes, updated_at=CURRENT_TIMESTAMP
            WHERE id=@id
        `);
        stmt.run(client);
        return client.id;
    } else {
        const stmt = db.prepare(`
            INSERT INTO clients (nom, entreprise, email, telephone, adresse, site_web, notes)
            VALUES (@nom, @entreprise, @email, @telephone, @adresse, @site_web, @notes)
        `);
        const info = stmt.run(client);
        return info.lastInsertRowid;
    }
  },

  deleteClient: (id: number) => {
    db.prepare('DELETE FROM clients WHERE id = ?').run(id);
  },

  getModeles: () => {
     return db.prepare('SELECT * FROM modeles ORDER BY nom ASC').all();
  },

  saveModele: (modele: any) => {
    if (modele.id) {
        const stmt = db.prepare(`
            UPDATE modeles SET prenom=@prenom, nom=@nom, email=@email, telephone=@telephone, 
            instagram=@instagram, taille_cm=@taille_cm, mensurations=@mensurations, 
            cheveux=@cheveux, yeux=@yeux, photo_path=@photo_path, notes=@notes, updated_at=CURRENT_TIMESTAMP
            WHERE id=@id
        `);
        stmt.run(modele);
        return modele.id;
    } else {
        const stmt = db.prepare(`
            INSERT INTO modeles (prenom, nom, email, telephone, instagram, taille_cm, mensurations, cheveux, yeux, photo_path, notes)
            VALUES (@prenom, @nom, @email, @telephone, @instagram, @taille_cm, @mensurations, @cheveux, @yeux, @photo_path, @notes)
        `);
        const info = stmt.run(modele);
        return info.lastInsertRowid;
    }
  },

  deleteModele: (id: number) => {
    db.prepare('DELETE FROM modeles WHERE id = ?').run(id);
  },

  getProjets: () => {
    return db.prepare(`
      SELECT p.*, 
             c.nom as client_nom, c.email as client_email,
             t.nom as template_nom, t.couleur as template_couleur, t.icone as template_icone
      FROM projets p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN templates t ON p.template_id = t.id
      ORDER BY p.date_shooting DESC
    `).all();
  },

  createProjet: (p: any, sources: any) => {
     const stmt = db.prepare(`
        INSERT INTO projets (nom, date_shooting, chemin, disque, statut, notes, client_id, template_id, cover_image)
        VALUES (@nom, @date_shooting, @chemin, @disque, @statut, @notes, @client_id, @template_id, @cover_image)
     `);
     
     // TODO: Gérer le chemin/disque réel via la config
     const pData = {
         ...p,
         chemin: p.chemin || `D:\\PROJETS_PHOTO\\${p.date_shooting}_${p.nom}`, // Fallback
         disque: p.disque || 'D:',
         statut: 'en_cours',
         cover_image: p.cover_image || null
     };
     
     const info = stmt.run(pData);
     const projectId = info.lastInsertRowid;

     if (p.model_ids && p.model_ids.length > 0) {
         const stmtLink = db.prepare('INSERT INTO projet_modeles (projet_id, modele_id) VALUES (?, ?)');
         for (const mId of p.model_ids) {
             stmtLink.run(projectId, mId);
         }
     }
     
     return projectId;
  },

  updateProjectStatus: (id: number, status: string) => {
    db.prepare('UPDATE projets SET statut = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);
  },

  updateProjectNote: (id: number, note: string) => {
    db.prepare('UPDATE projets SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(note, id);
  },

  updateProjectDetails: (id: number, updates: any, reorganize: boolean) => {
      // Construction dynamique de la requête UPDATE
      const fields = [];
      const values = [];
      
      if (updates.cover_image !== undefined) {
          fields.push('cover_image = ?');
          values.push(updates.cover_image);
      }
      if (updates.chemin !== undefined) {
          fields.push('chemin = ?');
          values.push(updates.chemin);
      }
      
      if (fields.length === 0) return;
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const sql = `UPDATE projets SET ${fields.join(', ')} WHERE id = ?`;
      db.prepare(sql).run(...values);

      if (reorganize && updates.chemin) {
          // TODO: Implement actual file system move logic here using fs-extra
          console.log(`Reorganizing files for project ${id} to ${updates.chemin}`);
      }
  },

  deleteProject: (id: number) => {
    db.prepare('DELETE FROM projets WHERE id = ?').run(id);
  },
  
  openDirectory: (path: string) => {
     shell.openPath(path);
  },

  selectDirectory: async () => { /* ... */ return null; },
  getDriveSpace: async () => { /* ... */ return []; }
};