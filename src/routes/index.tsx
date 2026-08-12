import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useAskSrgRuntimeContext } from '#/app/contexts/AskSrgRuntimeContext'
import { useTheme } from '#/app/hooks/useTheme'

type PlusAction = {
  id: string
  label: string
  run: () => void
}

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const askSrgRuntime = useAskSrgRuntimeContext()
  const { resolvedMode, setMode } = useTheme()
  const [input, setInput] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const scannerInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', closeOnOutsideClick)
    return () => window.removeEventListener('mousedown', closeOnOutsideClick)
  }, [isMenuOpen])

  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])

  useEffect(() => {
    return () => {
      if (recognitionRef.current && typeof recognitionRef.current.stop === 'function') {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const submitInput = (rawValue: string) => {
    const command = rawValue.trim() || 'Ask SRG universal input'
    askSrgRuntime.pushRecentCommand(command)
    navigate({ to: '/chat' })
  }

  const startVoiceRecognition = () => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognitionCtor) {
      setInput((current) => (current ? `${current} Micro indisponible` : 'Micro indisponible'))
      return
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionCtor()
      recognition.lang = 'fr-FR'
      recognition.continuous = false
      recognition.interimResults = false
      recognition.onresult = (event: any) => {
        const transcript = event?.results?.[0]?.[0]?.transcript ?? ''
        if (transcript) {
          setInput((current) => (current ? `${current} ${transcript}` : transcript))
        }
      }
      recognition.onend = () => setIsRecording(false)
      recognition.onerror = () => setIsRecording(false)
      recognitionRef.current = recognition
    }

    if (isRecording) {
      recognitionRef.current.stop()
      setIsRecording(false)
      return
    }

    setIsRecording(true)
    recognitionRef.current.start()
  }

  const openCameraCapture = () => {
    cameraInputRef.current?.click()
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const openPhotoPicker = () => {
    photoInputRef.current?.click()
  }

  const openVideoPicker = () => {
    videoInputRef.current?.click()
  }

  const openAudioPicker = () => {
    audioInputRef.current?.click()
  }

  const openScannerPicker = () => {
    scannerInputRef.current?.click()
  }

  const selectFile = (file?: File | null, label?: string) => {
    if (!file) return
    const value = label ? `${label}: ${file.name}` : file.name
    setInput(value)
    askSrgRuntime.pushRecentCommand(value)
    inputRef.current?.focus()
  }

  const navigateFromMenu = (label: string, to: string) => {
    askSrgRuntime.pushRecentCommand(label)
    setInput(label)
    navigate({ to: to as never })
  }

  const exportCurrentInput = () => {
    const payload = (input.trim() || 'Ask SRG export').concat('\n')
    const blob = new Blob([payload], { type: 'text/plain;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'ask-srg-export.txt'
    link.click()
    URL.revokeObjectURL(objectUrl)
    askSrgRuntime.pushRecentCommand('Export')
  }

  const menuActions: PlusAction[] = [
    { id: 'camera', label: 'Camera', run: openCameraCapture },
    { id: 'telechargement', label: 'Telechargement', run: openFilePicker },
    { id: 'photo', label: 'Photo', run: openPhotoPicker },
    { id: 'video', label: 'Video', run: openVideoPicker },
    { id: 'audio', label: 'Audio', run: openAudioPicker },
    { id: 'scanner', label: 'Scanner', run: openScannerPicker },
    { id: 'reunion', label: 'Reunion', run: () => navigateFromMenu('Reunion', '/reviews') },
    { id: 'nouvelle-tache', label: 'Nouvelle tache', run: () => navigateFromMenu('Nouvelle tache', '/workflow-automation') },
    { id: 'nouveau-rapport', label: 'Nouveau rapport', run: () => navigateFromMenu('Nouveau rapport', '/generate') },
    { id: 'nouvelle-note', label: 'Nouvelle note', run: () => navigateFromMenu('Nouvelle note', '/knowledge-center') },
    { id: 'workflow', label: 'Workflow', run: () => navigateFromMenu('Workflow', '/workflow-automation') },
    { id: 'import', label: 'Import', run: openFilePicker },
    { id: 'export', label: 'Export', run: exportCurrentInput },
    { id: 'knowledge-center', label: 'Knowledge Center', run: () => navigateFromMenu('Knowledge Center', '/knowledge-center') },
  ]

  const footerLanguageLabel = askSrgRuntime.session.language || 'Francais'
  const footerThemeLabel = resolvedMode === 'light' ? 'Theme clair' : 'Theme sombre'

  const toggleFooterLanguage = () => {
    const current = askSrgRuntime.session.language.toLowerCase()
    const nextLanguage = current.includes('fr') ? 'English' : 'Francais'
    askSrgRuntime.updateSession({ language: nextLanguage })
  }

  const toggleFooterTheme = () => {
    setMode(resolvedMode === 'light' ? 'dark' : 'light')
  }

  return (
    <main className="srg-hero-stage relative min-h-screen overflow-hidden text-white" aria-label="Hero officiel SRG">
      <div className="srg-hero-media" aria-hidden="true">
        <img
          src="/design/hero-home-webp_04.png"
          alt=""
          className="srg-hero-image"
          decoding="async"
          fetchPriority="high"
        />
        <div className="srg-hero-wave" />
      </div>

      <div className="srg-home-shell">
        <section className="srg-home-overlay" aria-label="Actions Home SRG">
          <div className="srg-home-intro" aria-label="Presentation Ask SRG">
            <button
              type="button"
              className="srg-home-orb-button"
              aria-label="Ouvrir la conversation Ask SRG"
              onClick={() => navigate({ to: '/chat' })}
            >
              <span className="srg-home-orb-wrap" aria-hidden>
                <span className="srg-home-orb-halo" />
                <span className="srg-home-orb-glow" />
                <span className="srg-home-orb-core" />
              </span>
            </button>

            <div className="srg-home-intro-copy">
              <p className="srg-home-intro-kicker">Bonjour, Je suis</p>
              <p className="srg-home-intro-title">Ask SRG</p>
              <p className="srg-home-intro-text">
                Votre assistant intelligent pour vous accompagner
                <br />
                dans tous vos metiers, vos projets et vos decisions.
              </p>
              <span className="srg-home-intro-accent" aria-hidden />
            </div>
          </div>

          <form
            className="srg-home-universal"
            onSubmit={(event) => {
              event.preventDefault()
              submitInput(input)
            }}
          >
            <div className="srg-home-input-card">
              <div className="srg-home-input-row">
                <button type="button" className="srg-home-icon-btn" aria-label="Menu plus" onClick={() => setIsMenuOpen((current) => !current)}>
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onInput={(event) => {
                    const target = event.currentTarget
                    target.style.height = '0px'
                    target.style.height = `${Math.max(44, target.scrollHeight)}px`
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      submitInput(input)
                    }
                  }}
                  rows={1}
                  placeholder="Que souhaitez-vous faire aujourd'hui ?"
                  className="srg-home-input"
                  aria-label="Champ universel Ask SRG"
                />
                <button type="button" className="srg-home-icon-btn" aria-label="Microphone" onClick={startVoiceRecognition}>
                  {isRecording ? (
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <circle cx="12" cy="12" r="7" />
                      <circle cx="12" cy="12" r="3.2" className="srg-icon-fill" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <rect x="9" y="4" width="6" height="10" rx="3" />
                      <path d="M7 11a5 5 0 0 0 10 0M12 16v4M9 20h6" />
                    </svg>
                  )}
                </button>
                <button type="submit" className="srg-home-send-btn" aria-label="Envoyer">
                  <svg viewBox="0 0 24 24" aria-hidden>
                    <path d="M4 11.5 19.5 4l-3.8 16L11 13 4 11.5Z" />
                  </svg>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(event) => {
                  selectFile(event.target.files?.[0], 'Fichier')
                  event.currentTarget.value = ''
                }}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                onChange={(event) => {
                  selectFile(event.target.files?.[0], 'Camera')
                  event.currentTarget.value = ''
                }}
              />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  selectFile(event.target.files?.[0], 'Photo')
                  event.currentTarget.value = ''
                }}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(event) => {
                  selectFile(event.target.files?.[0], 'Video')
                  event.currentTarget.value = ''
                }}
              />
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(event) => {
                  selectFile(event.target.files?.[0], 'Audio')
                  event.currentTarget.value = ''
                }}
              />
              <input
                ref={scannerInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(event) => {
                  selectFile(event.target.files?.[0], 'Scanner')
                  event.currentTarget.value = ''
                }}
              />

              {isMenuOpen ? (
                <div ref={menuRef} className="srg-plus-menu" role="menu" aria-label="Actions rapides">
                  {menuActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      className="srg-plus-menu-item"
                      onClick={() => {
                        setIsMenuOpen(false)
                        action.run()
                      }}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </form>

          <div className="srg-home-cta-row">
            <Link
              to="/auth"
              className="rounded-2xl bg-[#1f4fff] px-8 py-3 text-base font-semibold text-white no-underline shadow-[0_14px_28px_rgba(20,72,255,0.42)] transition hover:bg-[#123fe0]"
            >
              Creer un compte
            </Link>
            <Link
              to="/auth"
              className="rounded-2xl border border-white/70 bg-white/92 px-8 py-3 text-base font-semibold text-[#0f254f] no-underline transition hover:bg-white"
            >
              Se connecter
            </Link>
          </div>

        </section>

        <div className="srg-home-footer" aria-label="Liens Home SRG">
          <div className="srg-home-footer-group">
            <Link to="/business-policy" className="srg-home-footer-link">
              <svg viewBox="0 0 24 24" aria-hidden>
                <path d="M12 3 5 6v6c0 4.4 2.9 8.3 7 9.6 4.1-1.3 7-5.2 7-9.6V6l-7-3Z" />
              </svg>
              Confidentialite
            </Link>
            <span className="srg-home-footer-divider" aria-hidden />
            <Link to="/about" className="srg-home-footer-link">
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M9.75 9a2.25 2.25 0 0 1 4.1 1.26c0 1.8-1.85 2.15-1.85 3.54" />
                <circle cx="12" cy="16.8" r="0.9" className="srg-home-footer-fill" />
              </svg>
              Aide
            </Link>
          </div>

          <div className="srg-home-footer-group">
            <button type="button" className="srg-home-footer-link" onClick={toggleFooterLanguage}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M3.5 12h17M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
              {footerLanguageLabel}
            </button>
            <span className="srg-home-footer-divider" aria-hidden />
            <button type="button" className="srg-home-footer-link" onClick={toggleFooterTheme}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2.8v2.2M12 19v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.8 12H5M19 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
              </svg>
              {footerThemeLabel}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
