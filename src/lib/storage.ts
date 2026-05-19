// ─── File Storage Abstraction ─────────────────────────────────────────────────

import { promises as fs } from 'fs'
import path from 'path'

export interface StorageProvider {
  upload(relativePath: string, data: Buffer, contentType: string): Promise<string>
  download(relativePath: string): Promise<Buffer>
  delete(relativePath: string): Promise<void>
  exists(relativePath: string): Promise<boolean>
  list(prefix: string): Promise<string[]>
}

export class LocalStorageProvider implements StorageProvider {
  private basePath: string

  constructor(basePath: string) {
    this.basePath = basePath
  }

  private fullPath(relativePath: string): string {
    return path.join(this.basePath, relativePath)
  }

  async upload(relativePath: string, data: Buffer, _contentType: string): Promise<string> {
    const fullPath = this.fullPath(relativePath)
    const dir = path.dirname(fullPath)
    await fs.mkdir(dir, { recursive: true })
    await fs.writeFile(fullPath, data)
    return relativePath
  }

  async download(relativePath: string): Promise<Buffer> {
    const fullPath = this.fullPath(relativePath)
    return fs.readFile(fullPath)
  }

  async delete(relativePath: string): Promise<void> {
    const fullPath = this.fullPath(relativePath)
    try {
      await fs.unlink(fullPath)
    } catch {
      // File may not exist
    }
  }

  async exists(relativePath: string): Promise<boolean> {
    try {
      await fs.access(this.fullPath(relativePath))
      return true
    } catch {
      return false
    }
  }

  async list(prefix: string): Promise<string[]> {
    const dir = this.fullPath(prefix)
    const files: string[] = []
    try {
      const entries = await fs.readdir(dir, { recursive: true })
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.toString())
        const stat = await fs.stat(fullPath)
        if (stat.isFile()) {
          files.push(path.join(prefix, entry.toString()))
        }
      }
    } catch {
      // Directory may not exist
    }
    return files
  }
}

// Default storage instance
const STORAGE_ROOT = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage')

// Ensure directories exist on import
async function ensureDirs() {
  for (const dir of ['documents', 'images', 'avatars', 'exports', 'temp']) {
    await fs.mkdir(path.join(STORAGE_ROOT, dir), { recursive: true })
  }
}

export const storage = new LocalStorageProvider(STORAGE_ROOT)

// Initialize
ensureDirs().catch(() => {})
