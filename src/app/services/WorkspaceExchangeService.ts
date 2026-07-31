export class WorkspaceExchangeService {
  static downloadJson(fileName: string, payload: unknown): void {
    this.downloadText(fileName, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8')
  }

  static downloadCsv(fileName: string, rows: string[][]): void {
    const content = rows
      .map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(','))
      .join('\n')
    this.downloadText(fileName, content, 'text/csv;charset=utf-8')
  }

  static downloadText(fileName: string, content: string, mimeType = 'text/plain;charset=utf-8'): void {
    if (typeof window === 'undefined') {
      return
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  static async parseJsonFile<T>(file: File): Promise<T> {
    const text = await file.text()
    return JSON.parse(text) as T
  }

  static createShareLink(resourceType: 'project' | 'prompt', resourceId: string, label: string): string {
    const slug = label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    return `https://share.srg.local/${resourceType}/${resourceId}/${slug}`
  }
}