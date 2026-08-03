import { HistoryWorkspaceService } from '#/app/services/HistoryWorkspaceService'
import { PromptService } from '#/app/services/PromptService'
import type { Prompt } from '#/app/services/PromptService'
import { WorkspaceExchangeService } from '#/app/services/WorkspaceExchangeService'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

function nowIso() {
  return new Date().toISOString()
}

function sanitizeMarkdown(text: string): string {
  return text.replace(/^#+\s?/gm, '').trim()
}

function parseSimpleYaml(yaml: string): Record<string, string> {
  return yaml
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .reduce<Record<string, string>>((acc, line) => {
      const separator = line.indexOf(':')
      if (separator <= 0) return acc
      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
      acc[key] = value
      return acc
    }, {})
}

function nonEmpty(value: string, fallback: string): string {
  return value.trim().length > 0 ? value : fallback
}

function wrapText(text: string, maxChars = 90): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const next = current.length > 0 ? `${current} ${word}` : word
    if (next.length > maxChars && current.length > 0) {
      lines.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current.length > 0) {
    lines.push(current)
  }

  return lines.length > 0 ? lines : ['']
}

async function buildNativePdf(prompt: Prompt): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
  const latestVersion = prompt.versions.at(-1)
  const margin = 48
  const contentWidth = 595.28 - margin * 2
  let cursorY = 800
  let page = doc.addPage([595.28, 841.89])

  const createPage = () => {
    page = doc.addPage([595.28, 841.89])
    page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.98, 0.99, 0.99) })
    cursorY = 800
  }

  page.drawRectangle({ x: 0, y: 0, width: 595.28, height: 841.89, color: rgb(0.98, 0.99, 0.99) })

  const ensureSpace = (needed = 44) => {
    if (cursorY - needed < 56) {
      createPage()
    }
  }

  const drawSection = (title: string, value: string | string[], bold = false) => {
    const values = Array.isArray(value) ? value : [value]
    const estimatedLines = 1 + values.reduce((sum, entry) => sum + wrapText(entry, Math.max(32, Math.floor(contentWidth / 7))).length, 0)
    ensureSpace(estimatedLines * 13 + 16)
    page.drawText(title, { x: margin, y: cursorY, size: 11, font: fontBold, color: rgb(0.08, 0.22, 0.25) })
    cursorY -= 16
    for (const entry of values) {
      const lines = wrapText(entry, Math.max(32, Math.floor(contentWidth / 7)))
      for (const line of lines) {
        page.drawText(line, { x: margin, y: cursorY, size: 9.5, font: bold ? fontBold : font, color: rgb(0.14, 0.19, 0.22) })
        cursorY -= 13
      }
    }
    cursorY -= 8
  }

  page.drawText('Prompt Marketplace Export', { x: margin, y: cursorY, size: 20, font: fontBold, color: rgb(0.06, 0.22, 0.18) })
  cursorY -= 24
  page.drawText(new Date().toLocaleString(), { x: margin, y: cursorY, size: 9, font, color: rgb(0.33, 0.39, 0.42) })
  cursorY -= 30

  drawSection('Title', prompt.name, true)
  drawSection('Description', prompt.description)
  drawSection('Author', latestVersion?.author ?? 'System')
  drawSection('Organization', 'SRG')
  drawSection('Category', prompt.category)
  drawSection('Tags', prompt.tags.length > 0 ? prompt.tags.join(', ') : 'None')
  drawSection('Version', `v${prompt.versions.length}`)
  drawSection(
    'Variables',
    latestVersion?.variables.length
      ? latestVersion.variables.map((variable) => `${variable.name} - ${variable.description} (example: ${variable.example})`)
      : ['None'],
  )
  drawSection('Prompt complete', prompt.content)
  drawSection(
    'Historical',
    PromptService.getHistory(prompt.id).length > 0
      ? PromptService.getHistory(prompt.id).map((version) => `${version.version}. ${version.date} - ${version.comment}`)
      : ['No history available'],
  )
  drawSection('License', 'Proprietary')
  drawSection('AI compatibility', `${prompt.provider} • ${prompt.model} • ${prompt.language}`)

  const bytes = await doc.save()
  return bytes
}

function downloadPdfBytes(fileName: string, bytes: Uint8Array): void {
  if (typeof window === 'undefined') return
  const safeBytes = bytes.slice()
  const blob = new Blob([safeBytes], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  window.URL.revokeObjectURL(url)
}

export class PromptImportExportService {
  static async importFromFile(file: File, projectId: string): Promise<Prompt | null> {
    const ext = file.name.toLowerCase().split('.').pop() || ''
    const text = await file.text()

    if (ext === 'json') {
      const parsed = JSON.parse(text) as Partial<Prompt>
      if (!parsed.name || !parsed.content) return null
      const prompt = PromptService.createPrompt({
        projectId,
        name: parsed.name,
        description: parsed.description ?? 'Imported from JSON',
        category: parsed.category ?? 'utility',
        tags: parsed.tags ?? [],
        content: parsed.content,
        provider: parsed.provider ?? 'OpenAI',
        model: parsed.model ?? 'gpt-5',
        language: parsed.language ?? 'Français',
        variables: parsed.versions?.[0]?.variables ?? [],
      })
      this.logImport(prompt.id, `JSON:${file.name}`)
      return prompt
    }

    if (ext === 'md' || ext === 'markdown') {
      const body = sanitizeMarkdown(text)
      const prompt = PromptService.createPrompt({
        projectId,
        name: file.name.replace(/\.(md|markdown)$/i, ''),
        description: 'Imported from Markdown',
        category: 'utility',
        tags: ['imported', 'markdown'],
        content: body,
        provider: 'OpenAI',
        model: 'gpt-5',
        language: 'Français',
        variables: [],
      })
      this.logImport(prompt.id, `MD:${file.name}`)
      return prompt
    }

    if (ext === 'txt') {
      const prompt = PromptService.createPrompt({
        projectId,
        name: file.name.replace(/\.txt$/i, ''),
        description: 'Imported from TXT',
        category: 'utility',
        tags: ['imported', 'txt'],
        content: text,
        provider: 'OpenAI',
        model: 'gpt-5',
        language: 'Français',
        variables: [],
      })
      this.logImport(prompt.id, `TXT:${file.name}`)
      return prompt
    }

    if (ext === 'yaml' || ext === 'yml') {
      const parsed = parseSimpleYaml(text)
      const prompt = PromptService.createPrompt({
        projectId,
        name: nonEmpty(parsed.name, file.name.replace(/\.(yaml|yml)$/i, '')),
        description: nonEmpty(parsed.description, 'Imported from YAML'),
        category: nonEmpty(parsed.category, 'utility') as Prompt['category'],
        tags: parsed.tags ? parsed.tags.split(',').map((tag) => tag.trim()) : ['imported', 'yaml'],
        content: parsed.content,
        provider: nonEmpty(parsed.provider, 'OpenAI') as Prompt['provider'],
        model: nonEmpty(parsed.model, 'gpt-5'),
        language: nonEmpty(parsed.language, 'Français') as Prompt['language'],
        variables: [],
      })
      this.logImport(prompt.id, `YAML:${file.name}`)
      return prompt
    }

    return null
  }

  static exportPrompt(prompt: Prompt, format: 'json' | 'markdown' | 'txt' | 'pdf'): void {
    if (format === 'json') {
      WorkspaceExchangeService.downloadJson(`${prompt.name}.json`, prompt)
      this.logExport(prompt.id, 'JSON')
      return
    }

    if (format === 'markdown') {
      const markdown = `# ${prompt.name}\n\n${prompt.description}\n\n## Prompt\n\n${prompt.content}`
      WorkspaceExchangeService.downloadText(`${prompt.name}.md`, markdown, 'text/markdown;charset=utf-8')
      this.logExport(prompt.id, 'Markdown')
      return
    }

    if (format === 'txt') {
      WorkspaceExchangeService.downloadText(`${prompt.name}.txt`, `${prompt.name}\n\n${prompt.content}`)
      this.logExport(prompt.id, 'TXT')
      return
    }

    void this.exportNativePdf(prompt)
  }

  static async copyToClipboard(prompt: Prompt): Promise<void> {
    if (typeof navigator === 'undefined') return
    await navigator.clipboard.writeText(prompt.content)
    this.logExport(prompt.id, 'Clipboard')
  }

  private static logImport(promptId: string, source: string): void {
    HistoryWorkspaceService.addRecord({
      id: `history-import-${Date.now()}`,
      promptName: 'Prompt import',
      promptText: source,
      output: promptId,
      provider: 'workspace',
      model: 'import',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'creation',
      entityType: 'prompt',
      entityId: promptId,
    })
  }

  private static logExport(promptId: string, target: string): void {
    HistoryWorkspaceService.addRecord({
      id: `history-export-${Date.now()}`,
      promptName: 'Prompt export',
      promptText: target,
      output: promptId,
      provider: 'workspace',
      model: 'export',
      status: 'completed',
      durationMs: 0,
      tokensInput: 0,
      tokensOutput: 0,
      costEstimate: 0,
      createdAt: nowIso(),
      requestKind: 'collaboration',
      eventType: 'modification',
      entityType: 'prompt',
      entityId: promptId,
    })
  }

  private static async exportNativePdf(prompt: Prompt): Promise<void> {
    const bytes = await buildNativePdf(prompt)
    downloadPdfBytes(`${prompt.name}.pdf`, bytes)
    this.logExport(prompt.id, 'PDF')
  }
}
