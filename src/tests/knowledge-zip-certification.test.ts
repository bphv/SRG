import { describe, expect, it } from 'vitest'
import { KnowledgeWorkspaceService } from '#/app/services/KnowledgeWorkspaceService'

const createdUrls: string[] = []

class MemoryStorage {
  private map = new Map<string, string>()

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }

  removeItem(key: string): void {
    this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }
}

function installWindow() {
  const storage = new MemoryStorage()
  const windowLike = {
    localStorage: storage,
    URL: {
      createObjectURL: () => {
        const value = `blob://cert-${Math.random().toString(16).slice(2)}`
        createdUrls.push(value)
        return value
      },
      revokeObjectURL: () => undefined,
    },
    document: {
      createElement: () => ({
        href: '',
        download: '',
        click: () => undefined,
      }),
    },
  }

  Object.defineProperty(globalThis, 'window', { value: windowLike, configurable: true })
  Object.defineProperty(globalThis, 'document', { value: windowLike.document, configurable: true })
  Object.defineProperty(globalThis, 'URL', { value: windowLike.URL, configurable: true })
}

async function fileFromPath(path: string, name: string): Promise<File> {
  const fs = await import('node:fs/promises')
  const data = await fs.readFile(path)
  return new File([data], name, { type: 'application/zip' })
}

describe('Knowledge ZIP certification', () => {
  it('imports a valid ZIP and blocks unsafe/oversized conditions', async () => {
    installWindow()

    const fs = await import('node:fs/promises')
    await fs.access('tmp/cert-good.zip')
    await fs.access('tmp/cert-too-many.zip')
    await fs.access('tmp/cert-dangerous.zip')
    await fs.access('tmp/cert-traversal.zip')
    await fs.access('tmp/cert-too-large.zip')

    const before = KnowledgeWorkspaceService.getStore().documents.length

    const good = await fileFromPath('tmp/cert-good.zip', 'cert-good.zip')
    const goodRecord = await KnowledgeWorkspaceService.importZipArchive(good, 'cert-admin')
    expect(goodRecord.archiveType).toBe('zip')
    expect(goodRecord.tree.length).toBe(4)

    const after = KnowledgeWorkspaceService.getStore()
    const newDocs = after.documents.slice(0, after.documents.length - before)
    expect(newDocs.length).toBeGreaterThanOrEqual(4)

    const titles = after.documents.map((item) => item.title)
    expect(titles).toContain('test.txt')
    expect(titles).toContain('rapport.md')
    expect(titles).toContain('donnees.json')
    expect(titles).toContain('test2.txt')

    const sources = after.documents.slice(0, 12).map((item) => item.source)
    expect(sources.some((value) => value.includes('zip:cert-good.zip'))).toBe(true)

    const lastImport = after.imports.at(0)
    expect(lastImport?.type).toBe('zip')

    const query = KnowledgeWorkspaceService.filterDocuments({
      search: 'rapport',
      category: 'all',
      tag: '',
      author: '',
      date: '',
      type: 'all',
      status: 'all',
      favoritesOnly: false,
      sort: 'updatedAt:desc',
      semanticUi: false,
    })
    expect(query.some((item) => item.title === 'rapport.md')).toBe(true)

    const rag = KnowledgeWorkspaceService.buildRagContext({
      documentIds: goodRecord.linkedDocumentIds,
      categories: [],
      collectionIds: [],
      chunkCount: 4,
    })
    expect(rag.chunkCount).toBeGreaterThan(0)

    const tooMany = await fileFromPath('tmp/cert-too-many.zip', 'cert-too-many.zip')
    await expect(KnowledgeWorkspaceService.importZipArchive(tooMany, 'cert-admin')).rejects.toThrow(/too many files/i)

    const dangerous = await fileFromPath('tmp/cert-dangerous.zip', 'cert-dangerous.zip')
    const dangerousRecord = await KnowledgeWorkspaceService.importZipArchive(dangerous, 'cert-admin')
    expect(dangerousRecord.tree.some((item) => item.path.endsWith('.ps1'))).toBe(false)

    const traversal = await fileFromPath('tmp/cert-traversal.zip', 'cert-traversal.zip')
    await expect(KnowledgeWorkspaceService.importZipArchive(traversal, 'cert-admin')).rejects.toThrow(/unsafe path/i)

    const huge = await fileFromPath('tmp/cert-too-large.zip', 'cert-too-large.zip')
    await expect(KnowledgeWorkspaceService.importZipArchive(huge, 'cert-admin')).rejects.toThrow(/uncompressed volume limit/i)
  })
})
