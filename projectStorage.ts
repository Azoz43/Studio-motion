import type { MotionProject } from '../core/model';
import { serializeProject, validateProject } from '../core/project';
import { DEFAULT_MAX_PROJECT_JSON_BYTES } from '../security/validation';

export interface KeyValueStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const LAST_OPENED_KEY = 'motion_studio:last_project_id';
const PROJECT_INDEX_KEY = 'motion_studio:project_index';

function projectPrimaryKey(id: string): string {
  return `project:${id}`;
}

function projectBackupKey(id: string): string {
  return `project:${id}:bak`;
}

function projectTempKey(id: string): string {
  return `project:${id}:tmp`;
}

export class ProjectStorageManager {
  constructor(private readonly adapter: KeyValueStorageAdapter) {}

  async saveProject(project: MotionProject): Promise<{ savedAt: string; backedUpPrevious: boolean }> {
    const validated = validateProject(project);
    const json = serializeProject(validated);
    if (json.length > DEFAULT_MAX_PROJECT_JSON_BYTES) {
      throw new Error('Project data exceeds maximum allowed storage size.');
    }

    const tmpKey = projectTempKey(validated.id);
    await this.adapter.setItem(tmpKey, json);
    const stagedReadback = await this.adapter.getItem(tmpKey);
    if (!stagedReadback) {
      throw new Error('Storage write verification failed on temporary slot.');
    }
    validateProject(JSON.parse(stagedReadback));

    const primaryKey = projectPrimaryKey(validated.id);
    const existingRaw = await this.adapter.getItem(primaryKey);
    let backedUpPrevious = false;
    if (existingRaw) {
      try {
        validateProject(JSON.parse(existingRaw));
        await this.adapter.setItem(projectBackupKey(validated.id), existingRaw);
        backedUpPrevious = true;
      } catch {
        // Do not overwrite healthy backup if primary was corrupted
      }
    }

    await this.adapter.setItem(primaryKey, json);
    await this.adapter.removeItem(tmpKey);

    await this.adapter.setItem(LAST_OPENED_KEY, validated.id);
    const indexRaw = await this.adapter.getItem(PROJECT_INDEX_KEY);
    let ids: string[] = [];
    if (indexRaw) {
      try {
        const parsed = JSON.parse(indexRaw);
        if (Array.isArray(parsed)) ids = parsed.filter((x) => typeof x === 'string');
      } catch {
        ids = [];
      }
    }
    if (!ids.includes(validated.id)) {
      ids.push(validated.id);
      await this.adapter.setItem(PROJECT_INDEX_KEY, JSON.stringify(ids));
    }

    return { savedAt: validated.updatedAt ?? new Date().toISOString(), backedUpPrevious };
  }

  async loadProject(projectId: string): Promise<{ project: MotionProject; recoveredFromBackup: boolean }> {
    const primaryRaw = await this.adapter.getItem(projectPrimaryKey(projectId));
    if (primaryRaw) {
      try {
        const project = validateProject(JSON.parse(primaryRaw));
        await this.adapter.setItem(LAST_OPENED_KEY, project.id);
        return { project, recoveredFromBackup: false };
      } catch {
        // Fallback to backup
      }
    }

    const backupRaw = await this.adapter.getItem(projectBackupKey(projectId));
    if (backupRaw) {
      const recovered = validateProject(JSON.parse(backupRaw));
      await this.adapter.setItem(projectPrimaryKey(projectId), serializeProject(recovered));
      await this.adapter.setItem(LAST_OPENED_KEY, recovered.id);
      return { project: recovered, recoveredFromBackup: true };
    }

    throw new Error(`Project "${projectId}" not found or unrecoverable.`);
  }

  async loadLastOpenedProject(): Promise<{ project: MotionProject; recoveredFromBackup: boolean } | null> {
    const lastId = await this.adapter.getItem(LAST_OPENED_KEY);
    if (!lastId) return null;
    try {
      return await this.loadProject(lastId);
    } catch {
      return null;
    }
  }

  async listProjectIds(): Promise<string[]> {
    const indexRaw = await this.adapter.getItem(PROJECT_INDEX_KEY);
    if (!indexRaw) return [];
    try {
      const parsed = JSON.parse(indexRaw);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  }
}

export class InMemoryStorageAdapter implements KeyValueStorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}
