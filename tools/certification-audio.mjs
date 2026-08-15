// SRG Certification Audio — tests réels microphone + haut-parleur via Playwright Chromium
// Usage: node tools/certification-audio.mjs
// Résultats: PASS / FAIL / NOT AVAILABLE / NOT CERTIFIED

import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'

async function main() {
  // Permissions: dans Chromium headless, getUserMedia nécessite des flags spécifiques.
  // On lance avec --use-fake-ui-for-media-stream et --use-fake-device-for-media-stream
  // pour simuler un périphérique audio si disponible, sinon on détecte NOT AVAILABLE.
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  })

  const context = await browser.newContext({
    permissions: ['microphone'],
    viewport: { width: 1366, height: 900 },
  })
  const page = await context.newPage()
  await page.goto(BASE, { waitUntil: 'load', timeout: 45000 })
  await page.waitForTimeout(3000)
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {})

  // ============ TEST MICROPHONE ============
  const micResult = await page.evaluate(async () => {
    const result = { getUserMedia: 'NOT_CERTIFIED', mediaRecorder: 'NOT_CERTIFIED', speechRecognition: 'NOT_CERTIFIED', details: '' }
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        result.getUserMedia = 'NOT_AVAILABLE'
        result.details = 'navigator.mediaDevices.getUserMedia absent'
        return result
      }
      result.getUserMedia = 'AVAILABLE'

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const tracks = stream.getAudioTracks()
      if (tracks.length === 0) {
        result.getUserMedia = 'FAIL'
        result.details = 'getUserMedia OK mais aucun audio track'
        return result
      }
      result.getUserMedia = 'PASS'
      result.details = `audio track: ${tracks[0].label || 'fake-device'}`

      // MediaRecorder
      if (typeof MediaRecorder === 'undefined') {
        result.mediaRecorder = 'NOT_AVAILABLE'
      } else {
        try {
          const recorder = new MediaRecorder(stream)
          const chunks = []
          recorder.ondataavailable = (event) => chunks.push(event.data)
          const stopped = new Promise((resolve) => {
            recorder.onstop = resolve
          })
          recorder.start()
          await new Promise((resolve) => setTimeout(resolve, 800))
          recorder.stop()
          await stopped
          const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
          result.mediaRecorder = blob.size > 0 ? 'PASS' : 'FAIL'
          result.details += ` | MediaRecorder ${blob.size} bytes (${recorder.mimeType || 'unknown mime'})`
        } catch (recorderError) {
          result.mediaRecorder = 'FAIL'
          result.details += ` | MediaRecorder error: ${String(recorderError).slice(0, 100)}`
        }
      }

      // SpeechRecognition
      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SpeechRecognitionCtor) {
        result.speechRecognition = 'NOT_AVAILABLE'
        result.details += ' | SpeechRecognition absent (headless Chromium)'
      } else {
        result.speechRecognition = 'AVAILABLE'
        result.details += ' | SpeechRecognition constructeur present'
      }

      tracks.forEach((track) => track.stop())
      return result
    } catch (error) {
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        result.getUserMedia = 'NOT_AVAILABLE'
        result.details = `Permission micro refusee: ${error.name}`
      } else if (error.name === 'NotFoundError') {
        result.getUserMedia = 'NOT_AVAILABLE'
        result.details = 'Aucun peripherique audio detecte'
      } else {
        result.getUserMedia = 'FAIL'
        result.details = `Erreur: ${error.name} ${error.message}`.slice(0, 150)
      }
      return result
    }
  })

  // ============ TEST HAUT-PARLEUR (speechSynthesis) ============
  const speakerResult = await page.evaluate(async () => {
    const result = { speechSynthesis: 'NOT_CERTIFIED', voices: 0, speak: 'NOT_CERTIFIED', details: '' }
    try {
      if (!('speechSynthesis' in window)) {
        result.speechSynthesis = 'NOT_AVAILABLE'
        result.details = 'window.speechSynthesis absent'
        return result
      }
      result.speechSynthesis = 'AVAILABLE'

      // Attendre les voix (chargement asynchrone)
      let voices = window.speechSynthesis.getVoices()
      if (voices.length === 0) {
        await new Promise((resolve) => {
          const handler = () => resolve()
          window.speechSynthesis.addEventListener('voiceschanged', handler, { once: true })
          setTimeout(resolve, 2000)
        })
        voices = window.speechSynthesis.getVoices()
      }
      result.voices = voices.length
      result.details = `${voices.length} voix disponibles`

      const utterance = new SpeechSynthesisUtterance('Test audio SRG.')
      const done = new Promise((resolve) => {
        utterance.onend = () => resolve('ended')
        utterance.onerror = (event) => resolve(`error:${event.error}`)
        setTimeout(() => resolve('timeout'), 5000)
      })
      window.speechSynthesis.speak(utterance)
      const outcome = await done
      if (outcome === 'ended') {
        result.speak = 'PASS'
        result.details += ' | utterance terminee correctement'
      } else if (outcome.startsWith('error')) {
        // Dans headless sans audio output, 'not-allowed' ou 'synthesis-unavailable' possible
        result.speak = 'NOT_CERTIFIED'
        result.details += ` | utterance ${outcome} (environnement headless sans sortie audio)`
      } else {
        result.speak = 'NOT_CERTIFIED'
        result.details += ' | utterance timeout (pas de sortie audio headless)'
      }
      window.speechSynthesis.cancel()
      return result
    } catch (error) {
      result.speechSynthesis = 'FAIL'
      result.details = `Erreur: ${String(error).slice(0, 150)}`
      return result
    }
  })

  await browser.close()

  console.log('========== CERTIFICATION AUDIO ==========')
  console.log('MICROPHONE:')
  console.log(`  getUserMedia: ${micResult.getUserMedia}`)
  console.log(`  MediaRecorder: ${micResult.mediaRecorder}`)
  console.log(`  SpeechRecognition: ${micResult.speechRecognition}`)
  console.log(`  Details: ${micResult.details}`)
  console.log('HAUT-PARLEUR:')
  console.log(`  speechSynthesis: ${speakerResult.speechSynthesis}`)
  console.log(`  Voix: ${speakerResult.voices}`)
  console.log(`  Speak: ${speakerResult.speak}`)
  console.log(`  Details: ${speakerResult.details}`)
}

main().catch((error) => {
  console.error('AUDIO CERTIFICATION FAILED:', error)
  process.exit(1)
})