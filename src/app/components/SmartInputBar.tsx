import { useEffect, useMemo, useRef, useState } from 'react'
import Button from '#/app/components/ui/Button'
import { notificationService } from '#/app/services/NotificationService'
import { WorkspacePreferencesService } from '#/app/services/WorkspacePreferencesService'

export type SmartInputMode = 'search' | 'conversation' | 'command' | 'text'

type SmartInputCameraState = 'Camera Ready' | 'Scan Document' | 'Scan QR Code' | 'Capture Image'
type SmartInputUploadType = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX' | 'Images' | 'Audio' | 'Video' | 'ZIP' | 'CSV' | 'JSON' | 'XML' | 'Plans CAO'

type SmartInputBarProps = {
  value?: string
  onValueChange?: (value: string) => void
  onSubmit?: (value: string) => void
  placeholder?: string
  persistKey?: string
  instant?: boolean
  mode?: SmartInputMode
  onModeChange?: (mode: SmartInputMode) => void
  compact?: boolean
  submitLabel?: string
  ariaLabel?: string
  suggestions?: string[]
  onMicrophoneToggle?: (enabled: boolean) => void
  microphoneEnabled?: boolean
  showDropzone?: boolean
  persistState?: boolean
  enableNotifications?: boolean
  showModeSelector?: boolean
  showLanguageSelector?: boolean
  showAuxiliaryPanel?: boolean
}

const LANGUAGE_OPTIONS = ['Auto Detect Language', 'Français', 'English', 'Español', 'Português', 'Deutsch', 'Italiano', 'العربية', '中文', '日本語']
const CAMERA_STATES: SmartInputCameraState[] = ['Camera Ready', 'Scan Document', 'Scan QR Code', 'Capture Image']
const UPLOAD_TYPES: SmartInputUploadType[] = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'Images', 'Audio', 'Video', 'ZIP', 'CSV', 'JSON', 'XML', 'Plans CAO']
const PLUS_MENU_ACTIONS = [
  'Telecharger document',
  'Photo',
  'Scanner',
  'Audio',
  'Video',
  'Reunion',
  'Nouvelle tache',
  'Nouveau workflow',
  'Nouveau rapport',
  'Nouvelle note',
] as const

function getStoredRecord(persistKey?: string) {
  if (!persistKey) return {}
  return WorkspacePreferencesService.getPreferences().filters[persistKey] ?? {}
}

function getStoredString(record: Record<string, string | boolean | number>, key: string, fallback: string) {
  const value = record[key]
  return typeof value === 'string' ? value : fallback
}

function getStoredBoolean(record: Record<string, string | boolean | number>, key: string, fallback: boolean) {
  const value = record[key]
  return typeof value === 'boolean' ? value : fallback
}

function getStoredFiles(record: Record<string, string | boolean | number>) {
  const raw = record.files
  if (typeof raw !== 'string') return [] as string[]
  try {
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

export default function SmartInputBar({
  value,
  onValueChange,
  onSubmit,
  placeholder = 'Search...',
  persistKey,
  instant = false,
  mode = 'search',
  onModeChange,
  compact = false,
  submitLabel = 'Send',
  ariaLabel,
  suggestions,
  onMicrophoneToggle,
  microphoneEnabled,
  showDropzone = true,
  persistState = true,
  enableNotifications = false,
  showModeSelector = true,
  showLanguageSelector = true,
  showAuxiliaryPanel = true,
}: SmartInputBarProps) {
  const onSubmitRef = useRef(onSubmit)

  useEffect(() => {
    onSubmitRef.current = onSubmit
  }, [onSubmit])

  const isControlled = value !== undefined
  const storedRecord = useMemo(() => getStoredRecord(persistKey), [persistKey])

  const [internalValue, setInternalValue] = useState(() => {
    if (value !== undefined) return value
    return getStoredString(storedRecord, 'query', '')
  })
  const [recentSearches, setRecentSearches] = useState<string[]>(() => WorkspacePreferencesService.getPreferences().recentSearches)
  const [inputMode, setInputMode] = useState<SmartInputMode>(() => {
    const storedMode = getStoredString(storedRecord, 'mode', mode)
    return storedMode === 'search' || storedMode === 'conversation' || storedMode === 'command' || storedMode === 'text'
      ? storedMode
      : mode
  })
  const [language, setLanguage] = useState(() => getStoredString(storedRecord, 'language', 'Auto Detect Language'))
  const [micEnabled, setMicEnabled] = useState(() => getStoredBoolean(storedRecord, 'microEnabled', microphoneEnabled ?? false))
  const [cameraState, setCameraState] = useState<SmartInputCameraState>(() => {
    const storedCamera = getStoredString(storedRecord, 'cameraState', 'Camera Ready')
    return CAMERA_STATES.includes(storedCamera as SmartInputCameraState) ? storedCamera as SmartInputCameraState : 'Camera Ready'
  })
  const [lastUploadType, setLastUploadType] = useState<SmartInputUploadType>(() => {
    const storedUpload = getStoredString(storedRecord, 'lastUploadType', 'PDF')
    return UPLOAD_TYPES.includes(storedUpload as SmartInputUploadType) ? storedUpload as SmartInputUploadType : 'PDF'
  })
  const [filesPlaceholder, setFilesPlaceholder] = useState<string[]>(() => getStoredFiles(storedRecord))
  const favoriteScope = persistKey ? `smart-input-${persistKey}` : 'smart-input-global'
  const [showMenu, setShowMenu] = useState(false)
  const [favoriteQueries, setFavoriteQueries] = useState<string[]>(() => WorkspacePreferencesService.getPreferences().favorites[favoriteScope] ?? [])
  const recentDocuments = useMemo(() => filesPlaceholder.slice(0, 4), [filesPlaceholder])

  useEffect(() => {
    if (value !== undefined && value !== internalValue) {
      setInternalValue(value)
    }
  }, [value, internalValue])

  useEffect(() => {
    if (microphoneEnabled === undefined || microphoneEnabled === micEnabled) return
    setMicEnabled(microphoneEnabled)
  }, [microphoneEnabled, micEnabled])

  useEffect(() => {
    if (!instant) return
    onSubmitRef.current?.(internalValue)
  }, [instant, internalValue])

  useEffect(() => {
    if (!persistState || !persistKey) return
    const currentFilters = WorkspacePreferencesService.getPreferences().filters[persistKey] ?? {}
    WorkspacePreferencesService.setFilters(persistKey, {
      ...currentFilters,
      query: internalValue,
      language,
      mode: inputMode,
      microEnabled: micEnabled,
      cameraState,
      lastUploadType,
      files: JSON.stringify(filesPlaceholder.slice(0, 12)),
    })
  }, [persistState, persistKey, internalValue, language, inputMode, micEnabled, cameraState, lastUploadType, filesPlaceholder])

  useEffect(() => {
    setFavoriteQueries(WorkspacePreferencesService.getPreferences().favorites[favoriteScope] ?? [])
  }, [favoriteScope])

  useEffect(() => {
    if (!enableNotifications || compact) return
    notificationService.publish({
      title: 'Voice Ready',
      message: 'Voice placeholder mode is ready.',
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    notificationService.publish({
      title: 'Camera Ready',
      message: 'Camera placeholder mode is ready.',
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    notificationService.publish({
      title: 'Upload Ready',
      message: 'Upload placeholder mode is ready.',
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
    notificationService.publish({
      title: 'Language Ready',
      message: 'Auto language detection placeholder is ready.',
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }, [enableNotifications, compact])

  const allSuggestions = suggestions ?? recentSearches
  const filteredSuggestions = internalValue.trim()
    ? allSuggestions.filter((item) => item.toLowerCase().includes(internalValue.trim().toLowerCase())).slice(0, 8)
    : allSuggestions.slice(0, 8)

  const listId = persistKey
    ? `${persistKey}-smart-input-history`
    : `${placeholder.replace(/\s+/g, '-').toLowerCase()}-smart-input-history`

  const submitValue = (nextValue: string) => {
    onSubmit?.(nextValue)
    WorkspacePreferencesService.pushRecentSearch(nextValue)
    setRecentSearches(WorkspacePreferencesService.getPreferences().recentSearches)
    if (persistKey) {
      const currentFilters = WorkspacePreferencesService.getPreferences().filters[persistKey] ?? {}
      WorkspacePreferencesService.setFilters(persistKey, {
        ...currentFilters,
        query: nextValue,
      })
    }
  }

  const toggleFavorite = () => {
    const normalized = currentValue.trim()
    if (!normalized) return
    const exists = favoriteQueries.includes(normalized)
    const next = exists
      ? favoriteQueries.filter((item) => item !== normalized)
      : [normalized, ...favoriteQueries].slice(0, 16)
    WorkspacePreferencesService.setFavorites(favoriteScope, next)
    setFavoriteQueries(next)
  }

  const updateValue = (nextValue: string) => {
    if (!isControlled) {
      setInternalValue(nextValue)
    } else {
      setInternalValue(nextValue)
    }
    onValueChange?.(nextValue)
  }

  const toggleMicrophone = () => {
    const next = !micEnabled
    setMicEnabled(next)
    onMicrophoneToggle?.(next)

    if (!enableNotifications) return
    notificationService.publish({
      title: next ? 'Start Recording' : 'Stop Recording',
      message: next ? 'Microphone placeholder recording started.' : 'Microphone placeholder recording stopped.',
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

  const rotateCameraState = () => {
    const index = CAMERA_STATES.indexOf(cameraState)
    const next = CAMERA_STATES[(index + 1) % CAMERA_STATES.length]
    setCameraState(next)

    if (!enableNotifications) return
    notificationService.publish({
      title: next,
      message: `Camera placeholder state: ${next}.`,
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

  const addUploadPlaceholder = (type: SmartInputUploadType) => {
    setLastUploadType(type)
    setFilesPlaceholder((current) => [`${type} placeholder`, ...current].slice(0, 12))

    if (!enableNotifications) return
    notificationService.publish({
      title: 'Upload Ready',
      message: `${type} placeholder attached.`,
      level: 'info',
      priority: 'low',
      category: 'system',
      read: false,
      channels: ['email'],
    })
  }

  const currentValue = value !== undefined ? value : internalValue

  return (
    <div className="space-y-3">
      <div className="srg-smart-input srg-workspace" role="search" aria-label={ariaLabel ?? placeholder}>
        {!compact && showModeSelector ? (
          <select
            value={inputMode}
            onChange={(event) => {
              const nextMode = event.target.value as SmartInputMode
              setInputMode(nextMode)
              onModeChange?.(nextMode)
            }}
            aria-label="Input mode"
            className="w-auto rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-2 text-xs text-[var(--srg-text-body)]"
          >
            <option value="search">Recherche</option>
            <option value="conversation">Conversation</option>
            <option value="command">Commandes</option>
            <option value="text">Texte libre</option>
          </select>
        ) : null}

        <button
          type="button"
          className="srg-smart-icon-btn"
          aria-label="Recherche"
          onClick={() => submitValue(currentValue)}
        >
          <span aria-hidden>🔍</span>
          <span className="hidden sm:inline">Recherche</span>
        </button>

        <input
          aria-label={ariaLabel ?? placeholder}
          value={currentValue}
          list={listId}
          onChange={(event) => updateValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              submitValue(currentValue)
            }
          }}
          placeholder={placeholder}
          className="min-w-[12rem] flex-1 rounded-xl border-0 bg-transparent px-2 text-sm text-[var(--srg-text-body)] outline-none placeholder:text-[var(--srg-text-muted)] focus-visible:ring-2 focus-visible:ring-[var(--srg-color-primary-500)]"
        />

        <datalist id={listId}>
          {filteredSuggestions.map((item) => <option key={item} value={item} />)}
        </datalist>

        {currentValue ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              updateValue('')
              submitValue('')
            }}
            aria-label="Clear input"
          >
            Clear
          </Button>
        ) : null}

        {!compact ? (
          <>
            <Button type="button" variant="secondary" size="sm" onClick={toggleMicrophone} aria-label="Microphone">
              <span aria-hidden>🎤</span>
              <span className="hidden md:inline">Micro</span>
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={rotateCameraState} aria-label="Camera">
              <span aria-hidden>📷</span>
              <span className="hidden md:inline">Camera</span>
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => addUploadPlaceholder(lastUploadType)} aria-label="Documents">
              <span aria-hidden>📎</span>
              <span className="hidden md:inline">Documents</span>
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowMenu((current) => !current)} aria-label="Menu plus" aria-expanded={showMenu}>
              <span aria-hidden>➕</span>
              <span className="hidden md:inline">Menu +</span>
            </Button>
            {showLanguageSelector ? (
              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value)
                  if (enableNotifications) {
                    notificationService.publish({
                      title: 'Language Ready',
                      message: `Auto language placeholder set to ${event.target.value}.`,
                      level: 'info',
                      priority: 'low',
                      category: 'system',
                      read: false,
                      channels: ['email'],
                    })
                  }
                }}
                aria-label="Auto Detect Language"
                className="w-auto rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-2 text-xs text-[var(--srg-text-body)]"
              >
                {LANGUAGE_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            ) : null}
          </>
        ) : null}

        <Button
          type="button"
          size="sm"
          onClick={() => submitValue(currentValue)}
          aria-label={submitLabel}
        >
          {submitLabel}
        </Button>
      </div>

      {!compact && showAuxiliaryPanel ? (
        <div className="srg-smart-toolbar">
          <p className="srg-label">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {filteredSuggestions.slice(0, 5).map((item) => (
              <button
                key={item}
                type="button"
                className="srg-smart-chip"
                onClick={() => {
                  updateValue(item)
                  submitValue(item)
                }}
              >
                {item}
              </button>
            ))}
            {filteredSuggestions.length === 0 ? <span className="text-xs text-[var(--srg-text-muted)]">Aucune suggestion</span> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button type="button" className="srg-smart-chip" onClick={() => setShowMenu((current) => !current)}>Historique</button>
            <button type="button" className="srg-smart-chip" onClick={toggleFavorite}>Favoris</button>
            <button type="button" className="srg-smart-chip" onClick={() => submitValue(currentValue)}>Partager</button>
            <button type="button" className="srg-smart-chip" onClick={() => submitValue(currentValue)}>Exporter</button>
          </div>
          {showMenu ? (
            <div className="grid gap-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface)] p-3 lg:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Historique</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {recentSearches.slice(0, 8).map((item) => (
                    <button key={`history-${item}`} type="button" className="srg-smart-chip" onClick={() => updateValue(item)}>{item}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Favoris</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {favoriteQueries.slice(0, 8).map((item) => (
                    <button key={`favorite-${item}`} type="button" className="srg-smart-chip" onClick={() => updateValue(item)}>{item}</button>
                  ))}
                  {favoriteQueries.length === 0 ? <span className="text-xs text-[var(--srg-text-muted)]">Ajoutez un favori depuis la requete courante.</span> : null}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Menu +</p>
                <div className="mt-2 grid gap-2">
                  {PLUS_MENU_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="srg-smart-action"
                      onClick={() => {
                        const payload = `${action} placeholder`
                        updateValue(payload)
                        submitValue(payload)
                      }}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {recentDocuments.length > 0 ? (
            <div className="mt-3 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--srg-text-muted)]">Documents recents</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {recentDocuments.map((item) => (
                  <span key={item} className="srg-smart-chip">{item}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!compact && showDropzone && showAuxiliaryPanel ? (
        <div
          className="rounded-2xl border border-dashed border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-xs text-[var(--srg-text-muted)]"
          aria-label="Dropzone placeholder"
        >
          Déposez vos fichiers ici
        </div>
      ) : null}

      {!compact && showAuxiliaryPanel && filesPlaceholder.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Placeholder files list">
          {filesPlaceholder.map((file, index) => (
            <span key={`${file}-${index}`} className="rounded-full border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-1 text-xs text-[var(--srg-text-muted)]">
              {file}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
