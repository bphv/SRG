export class UsernameValidator {
  private static readonly usernameRegex = /^[a-zA-Z][a-zA-Z0-9._-]{2,31}$/

  static normalize(value: string): string {
    return value.trim().replace(/\s+/g, '-').toLowerCase()
  }

  static isValid(value: string): boolean {
    const normalized = this.normalize(value)
    return this.usernameRegex.test(normalized)
  }
}
