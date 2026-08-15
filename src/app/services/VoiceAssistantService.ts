/**
 * VoiceAssistantService — service vocal reutilisable pour Ask SRG.
 *
 * - Speech Recognition : micro -> texte (pipeline existant ConversationWorkspace).
 * - Speech Synthesis : reponse SRG -> haut-parleur.
 *
 * Aucune architecture parallele : le texte reconnu doit etre injecte dans le
 * pipeline de conversation existant (draft + sendMessage).
 */

export type VoiceAssistantState =
  | 'idle'
  | 'ready'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'paused'
  | 'stopped'
  | 'unavailable'

export type VoiceRecognitionCallbacks = {
  onStart?: () => void
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort?: () => void
  onresult: ((event: any) => void) | null
  onerror: ((event: any) => void) | null
  onend: (() => void) | null
}

function getSpeechRecognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null
  const candidate = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  return typeof candidate === 'function' ? candidate : null
}

function resolveLanguageTag(language: string): string {
  const normalized = language.trim().toLowerCase()
  if (normalized.startsWith('en')) return 'en-US'
  if (normalized.startsWith('es') || normalized.startsWith('esp')) return 'es-ES'
  if (normalized.startsWith('de')) return 'de-DE'
  if (normalized.startsWith('it')) return 'it-IT'
  if (normalized.startsWith('pt')) return 'pt-BR'
  if (normalized.startsWith('ar')) return 'ar-SA'
  if (normalized.startsWith('zh')) return 'zh-CN'
  if (normalized.startsWith('ja')) return 'ja-JP'
  return 'fr-FR'
}

export class VoiceAssistantService {
  private static recognitionInstance: SpeechRecognitionLike | null = null
  private static currentState: VoiceAssistantState = 'idle'
  private static listeners = new Set<(state: VoiceAssistantState) => void>()

  static isRecognitionAvailable(): boolean {
    return getSpeechRecognitionConstructor() !== null
  }

  static isSynthesisAvailable(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  static getState(): VoiceAssistantState {
    return this.currentState
  }

  static subscribe(listener: (state: VoiceAssistantState) => void): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private static setState(next: VoiceAssistantState): void {
    this.currentState = next
    this.listeners.forEach((listener) => listener(next))
  }

  /**
   * Demarre l'ecoute micro. Le texte reconnu est remonte via callbacks.
   * L'appelant est responsable d'injecter le texte dans le pipeline existant.
   */
  static startListening(options: { language?: string; continuous?: boolean } = {}, callbacks: VoiceRecognitionCallbacks = {}): boolean {
    const Ctor = getSpeechRecognitionConstructor()
    if (!Ctor) {
      this.setState('unavailable')
      callbacks.onError?.('SpeechRecognition indisponible sur ce navigateur.')
      return false
    }

    this.stopListening()

    const recognition = new Ctor()
    recognition.lang = resolveLanguageTag(options.language ?? 'fr-FR')
    recognition.continuous = options.continuous ?? false
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      let finalTranscript = ''
      let interimTranscript = ''
      const results = event?.results ?? []
      for (let index = event?.resultIndex ?? 0; index < results.length; index += 1) {
        const chunk = results[index]?.[0]?.transcript ?? ''
        if (results[index]?.isFinal) {
          finalTranscript += chunk
        } else {
          interimTranscript += chunk
        }
      }
      if (interimTranscript) {
        callbacks.onResult?.(interimTranscript, false)
      }
      if (finalTranscript) {
        callbacks.onResult?.(finalTranscript.trim(), true)
      }
    }

    recognition.onerror = (event: any) => {
      const errorCode = event?.error ?? 'unknown'
      this.setState('stopped')
      callbacks.onError?.(errorCode)
    }

    recognition.onend = () => {
      if (this.currentState === 'listening') {
        this.setState('ready')
      }
      callbacks.onEnd?.()
    }

    this.recognitionInstance = recognition
    this.setState('listening')
    callbacks.onStart?.()

    try {
      recognition.start()
    } catch {
      this.setState('stopped')
      callbacks.onError?.('start-failed')
      return false
    }
    return true
  }

  static stopListening(): void {
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.onresult = null
        this.recognitionInstance.onerror = null
        this.recognitionInstance.onend = null
        this.recognitionInstance.stop()
      } catch {
        // ignore
      }
      this.recognitionInstance = null
    }
    if (this.currentState === 'listening') {
      this.setState('stopped')
    }
  }

  static setProcessing(): void {
    this.setState('processing')
  }

  /**
   * Lit un texte via speechSynthesis. Retourne false si indisponible.
   */
  static speak(text: string, options: { language?: string; onEnd?: () => void; onError?: (error: string) => void } = {}): boolean {
    if (!this.isSynthesisAvailable()) {
      options.onError?.('speechSynthesis indisponible sur ce navigateur.')
      return false
    }

    const cleanText = text.trim()
    if (!cleanText) {
      options.onError?.('Texte vide.')
      return false
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(cleanText)
    const lang = resolveLanguageTag(options.language ?? 'fr-FR')
    utterance.lang = lang

    const voices = window.speechSynthesis.getVoices()
    const matchingVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.slice(0, 2).toLowerCase()))
    if (matchingVoice) {
      utterance.voice = matchingVoice
    }

    utterance.onend = () => {
      this.setState('ready')
      options.onEnd?.()
    }
    utterance.onerror = (event) => {
      this.setState('stopped')
      options.onError?.(event.error)
    }

    this.setState('speaking')
    window.speechSynthesis.speak(utterance)
    return true
  }

  static stopSpeaking(): void {
    if (this.isSynthesisAvailable()) {
      window.speechSynthesis.cancel()
    }
    if (this.currentState === 'speaking') {
      this.setState('stopped')
    }
  }

  static pauseSpeaking(): void {
    if (this.isSynthesisAvailable() && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      this.setState('paused')
    }
  }

  static resumeSpeaking(): void {
    if (this.isSynthesisAvailable() && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      this.setState('speaking')
    }
  }

  static getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.isSynthesisAvailable()) return []
    return window.speechSynthesis.getVoices()
  }

  static dispose(): void {
    this.stopListening()
    this.stopSpeaking()
    this.listeners.clear()
    this.setState('idle')
  }
}