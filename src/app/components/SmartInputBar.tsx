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
}

const LANGUAGE_OPTIONS = ['Auto Detect Language', 'Français', 'English', 'Español', 'Português', 'Deutsch', 'Italiano', 'العربية', '中文', '日本語']
const CAMERA_STATES: SmartInputCameraState[] = ['Camera Ready', 'Scan Document', 'Scan QR Code', 'Capture Image']
const UPLOAD_TYPES: SmartInputUploadType[] = ['PDF', 'DOCX', 'XLSX', 'PPTX', 'Images', 'Audio', 'Video', 'ZIP', 'CSV', 'JSON', 'XML', 'Plans CAO']

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
      <div className="srg-workspace flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--srg-border)] bg-[var(--srg-surface-strong)] px-3 py-2 shadow-[var(--srg-shadow-sm)]" role="search">
        {!compact ? (
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
              {micEnabled ? 'Stop Recording' : 'Voice Ready'}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={rotateCameraState} aria-label="Camera">
              {cameraState}
            </Button>
            <div className="flex items-center gap-1 rounded-xl border border-[var(--srg-border)] bg-[var(--srg-surface)] px-2 py-1">
              <Button type="button" variant="ghost" size="sm" onClick={() => addUploadPlaceholder(lastUploadType)} aria-label="Upload placeholder">
                +
              </Button>
              <select
                value={lastUploadType}
                onChange={(event) => addUploadPlaceholder(event.target.value as SmartInputUploadType)}
                aria-label="Upload file type"
                className="w-auto border-0 bg-transparent text-xs text-[var(--srg-text-body)]"
              >
                {UPLOAD_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
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

      {!compact && showDropzone ? (
        <div
          className="rounded-2xl border border-dashed border-[var(--srg-border)] bg-[var(--srg-surface)] px-4 py-3 text-xs text-[var(--srg-text-muted)]"
          aria-label="Dropzone placeholder"
        >
          Déposez vos fichiers ici
        </div>
      ) : null}

      {!compact && filesPlaceholder.length > 0 ? (
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
