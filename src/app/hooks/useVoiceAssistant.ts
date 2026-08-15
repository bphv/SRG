import { useCallback, useEffect, useState } from 'react'
import { VoiceAssistantService } from '#/app/services/VoiceAssistantService'
import type { VoiceAssistantState } from '#/app/services/VoiceAssistantService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

const VOICE_RESPONSE_PREF_KEY = 'voiceResponseEnabled'

function readVoiceResponsePreference(): boolean {
  try {
    const preferences = WorkspacePreferencesService.getPreferences()
    const record = preferences.filters['voice-assistant'] ?? {}
    const stored = record[VOICE_RESPONSE_PREF_KEY]
    return typeof stored === 'boolean' ? stored : false
  } catch {
    return false
  }
}

function writeVoiceResponsePreference(enabled: boolean): void {
  try {
    const preferences = WorkspacePreferencesService.getPreferences()
    const current = preferences.filters['voice-assistant'] ?? {}
    WorkspacePreferencesService.setFilters('voice-assistant', {
      ...current,
      [VOICE_RESPONSE_PREF_KEY]: enabled,
    })
  } catch {
    // stockage indisponible : preference non persistee
  }
}

export type UseVoiceAssistantResult = {
  state: VoiceAssistantState
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  recognitionAvailable: boolean
  synthesisAvailable: boolean
  voiceResponseEnabled: boolean
  interimTranscript: string
  lastTranscript: string
  lastError: string | null
  startListening: (options?: { language?: string; continuous?: boolean }) => boolean
  stopListening: () => void
  speak: (text: string, options?: { language?: string }) => boolean
  stopSpeaking: () => void
  pauseSpeaking: () => void
  resumeSpeaking: () => void
  setVoiceResponseEnabled: (enabled: boolean) => void
  resetTranscripts: () => void
}

/**
 * Hook React pour Ask SRG vocal.
 *
 * Le texte reconnu (lastTranscript) doit etre injecte par l'appelant dans le
 * pipeline de conversation existant (draft + sendMessage). Aucune architecture
 * parallele n'est creee.
 */
export function useVoiceAssistant(options: { language?: string } = {}): UseVoiceAssistantResult {
  const [state, setState] = useState<VoiceAssistantState>(() => VoiceAssistantService.getState())
  const [interimTranscript, setInterimTranscript] = useState('')
  const [lastTranscript, setLastTranscript] = useState('')
  const [lastError, setLastError] = useState<string | null>(null)
  const [voiceResponseEnabled, setVoiceResponseEnabledState] = useState<boolean>(() => readVoiceResponsePreference())

  useEffect(() => {
    const unsubscribe = VoiceAssistantService.subscribe((next) => setState(next))
    return unsubscribe
  }, [])

  useEffect(() => {
    return () => {
      VoiceAssistantService.stopListening()
      VoiceAssistantService.stopSpeaking()
    }
  }, [])

  const startListening = useCallback(
    (startOptions?: { language?: string; continuous?: boolean }) => {
      setLastError(null)
      setInterimTranscript('')
      return VoiceAssistantService.startListening(
        { language: startOptions?.language ?? options.language ?? 'fr-FR', continuous: startOptions?.continuous },
        {
          onResult: (transcript, isFinal) => {
            if (isFinal) {
              setLastTranscript(transcript)
              setInterimTranscript('')
            } else {
              setInterimTranscript(transcript)
            }
          },
          onError: (error) => setLastError(error),
        },
      )
    },
    [options.language],
  )

  const stopListening = useCallback(() => {
    VoiceAssistantService.stopListening()
  }, [])

  const speak = useCallback(
    (text: string, speakOptions?: { language?: string }) => {
      if (!voiceResponseEnabled) return false
      return VoiceAssistantService.speak(text, { language: speakOptions?.language ?? options.language ?? 'fr-FR' })
    },
    [voiceResponseEnabled, options.language],
  )

  const stopSpeaking = useCallback(() => {
    VoiceAssistantService.stopSpeaking()
  }, [])

  const pauseSpeaking = useCallback(() => {
    VoiceAssistantService.pauseSpeaking()
  }, [])

  const resumeSpeaking = useCallback(() => {
    VoiceAssistantService.resumeSpeaking()
  }, [])

  const setVoiceResponseEnabled = useCallback((enabled: boolean) => {
    setVoiceResponseEnabledState(enabled)
    writeVoiceResponsePreference(enabled)
    if (!enabled) {
      VoiceAssistantService.stopSpeaking()
    }
  }, [])

  const resetTranscripts = useCallback(() => {
    setInterimTranscript('')
    setLastTranscript('')
    setLastError(null)
  }, [])

  return {
    state,
    isListening: state === 'listening',
    isSpeaking: state === 'speaking',
    isProcessing: state === 'processing',
    recognitionAvailable: VoiceAssistantService.isRecognitionAvailable(),
    synthesisAvailable: VoiceAssistantService.isSynthesisAvailable(),
    voiceResponseEnabled,
    interimTranscript,
    lastTranscript,
    lastError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,
    setVoiceResponseEnabled,
    resetTranscripts,
  }
}