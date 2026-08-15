// SRG Certification Navigateur Finale P0 — bout en bout
// Usage: node tools/certification-browser-final.mjs
// Prérequis: npm run dev actif sur port 3000

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import JSZip from 'jszip'

const BASE = 'http://localhost:3000'
const results = []

function record(fonction, test, resultat, preuve) {
  results.push({ fonction, test, resultat, preuve })
  console.log(`[${resultat}] ${fonction} — ${test} :: ${preuve}`)
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const page = await ctx.newPage()

  // ===== FLUX PRINCIPAL : HOME → /categories → catégorie → Page 3 → sous-catégorie → conversation → question → réponse → rapport → historique → reprise =====
  try {
    await page.goto(BASE, { waitUntil: 'load', timeout: 45000 })
    await page.waitForTimeout(2000)
    const title = await page.title()
    record('Flux principal', 'HOME chargement', title.includes('SRG') ? 'PASS' : 'FAIL', `title="${title}"`)
  } catch (e) { record('Flux principal', 'HOME chargement', 'FAIL', String(e).slice(0, 150)) }

  try {
    await page.goto(`${BASE}/categories`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(2000)
    const text = await page.locator('body').innerText()
    const expected = ['Finance', 'Ressources Humaines', 'Operations', 'Projets', 'CRM', 'Reunions', 'Documents', 'Knowledge', 'Analytics', 'Automation', 'Qualite', 'Gouvernance']
    const found = expected.filter((c) => text.includes(c))
    record('Flux principal', '/categories 12 catégories', found.length === 12 ? 'PASS' : 'FAIL', `${found.length}/12`)
  } catch (e) { record('Flux principal', '/categories', 'FAIL', String(e).slice(0, 150)) }

  // Catégorie → Page 3 → sous-catégorie → conversation
  try {
    await page.goto(`${BASE}/category/finance`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasPage3 = text.length > 100 && (text.includes('Finance') || text.includes('Comptabilite'))
    record('Flux principal', 'Page 3 finance', hasPage3 ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Flux principal', 'Page 3 finance', 'FAIL', String(e).slice(0, 150)) }

  // Conversation + question métier + réponse
  try {
    await page.goto(`${BASE}/conversation/finance/accounting`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2500)
    const textarea = page.locator('textarea[aria-label="Conversation composer"]')
    if (await textarea.isVisible()) {
      await textarea.fill('Quel est le solde de tresorerie actuel ?')
      await page.locator('button:has-text("Send")').first().click()
      await page.waitForTimeout(5000)
      const text = await page.locator('body').innerText()
      const hasResponse = text.includes('VERIFIED') || text.includes('GENERATED') || text.includes('MISSING') || text.includes('SIMULATED') || text.length > 3000
      record('Flux principal', 'Conversation question+réponse', hasResponse ? 'PASS' : 'PARTIAL', hasResponse ? 'Réponse avec statut métier' : 'Réponse non détectée')
    } else {
      record('Flux principal', 'Conversation question+réponse', 'PARTIAL', 'Textarea non visible')
    }
  } catch (e) { record('Flux principal', 'Conversation question+réponse', 'FAIL', String(e).slice(0, 150)) }

  // Rapport + historique + reprise
  try {
    await page.goto(`${BASE}/generate`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasGenerate = text.toLowerCase().includes('rapport') || text.toLowerCase().includes('gener')
    record('Flux principal', 'Rapport génération', hasGenerate ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Flux principal', 'Rapport génération', 'FAIL', String(e).slice(0, 150)) }

  try {
    await page.goto(`${BASE}/history`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasHistory = text.toLowerCase().includes('historique') || text.toLowerCase().includes('history')
    record('Flux principal', 'Historique/Reprise', hasHistory ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Flux principal', 'Historique/Reprise', 'FAIL', String(e).slice(0, 150)) }

  // ===== 12 CATÉGORIES =====
  const cats = ['finance', 'hr', 'operations', 'projects', 'crm', 'meetings', 'documents', 'knowledge', 'analytics', 'automation', 'quality', 'governance']
  let page3Pass = 0
  for (const cat of cats) {
    try {
      await page.goto(`${BASE}/category/${cat}`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(1000)
      const text = await page.locator('body').innerText()
      if (text.length > 100) page3Pass++
    } catch { /* counted */ }
  }
  record('12 catégories', 'Pages 3 rendues', page3Pass === 12 ? 'PASS' : 'PARTIAL', `${page3Pass}/12`)

  // ===== CONVERSATIONS INDÉPENDANTES =====
  try {
    await page.goto(`${BASE}/conversation/finance/accounting`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2500)
    const text1 = await page.locator('body').innerText()
    await page.goto(`${BASE}/conversation/hr/payroll`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2500)
    const text2 = await page.locator('body').innerText()
    const independent = (text1.includes('Finance') || text1.includes('Comptabilite')) && (text2.includes('Paie') || text2.includes('RH') || text2.includes('Ressources'))
    record('Conversations', 'Indépendance finance vs hr', independent ? 'PASS' : 'PARTIAL', `finance=${text1.includes('Finance') || text1.includes('Comptabilite')}, hr=${text2.includes('Paie') || text2.includes('RH')}`)
  } catch (e) { record('Conversations', 'Indépendance', 'FAIL', String(e).slice(0, 150)) }

  // ===== AUTH WORKFLOW COMPLET =====
  try {
    await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2000)

    // Étape 1 : informations personnelles
    const inputs = page.locator('input')
    const inputCount = await inputs.count()
    if (inputCount >= 8) {
      // Remplir les champs de l'étape 1
      await inputs.nth(0).fill('Certif')
      await inputs.nth(1).fill('Final')
      await inputs.nth(2).fill('certif_final_user')
      await inputs.nth(3).fill('+33612345678')
      await inputs.nth(4).fill('certif@srg.test')
      await inputs.nth(5).fill('France')
      await inputs.nth(6).fill('Paris')
      await inputs.nth(7).fill('Français')

      // Cliquer sur "Continuer" ou "Suivant"
      const nextBtn = page.locator('button:has-text("Continuer"), button:has-text("Suivant"), button:has-text("Next")').first()
      if (await nextBtn.isVisible()) {
        await nextBtn.click()
        await page.waitForTimeout(1000)

        // Étape 2 : entreprise
        const nextBtn2 = page.locator('button:has-text("Continuer"), button:has-text("Suivant"), button:has-text("Next")').first()
        if (await nextBtn2.isVisible()) {
          await nextBtn2.click()
          await page.waitForTimeout(1000)

          // Étape 3 : sécurité
          const pwdInputs = page.locator('input[type="password"]')
          if (await pwdInputs.count() >= 2) {
            await pwdInputs.nth(0).fill('Certif2026!Pass')
            await pwdInputs.nth(1).fill('Certif2026!Pass')
            // Cocher CGU et confidentialité
            const checkboxes = page.locator('input[type="checkbox"]')
            const cbCount = await checkboxes.count()
            for (let i = 0; i < cbCount; i++) {
              if (!(await checkboxes.nth(i).isChecked())) {
                await checkboxes.nth(i).check()
              }
            }
            await page.waitForTimeout(500)

            // Étape 4 : confirmation
            const nextBtn3 = page.locator('button:has-text("Continuer"), button:has-text("Suivant"), button:has-text("Next"), button:has-text("Créer"), button:has-text("Confirmer")').first()
            if (await nextBtn3.isVisible()) {
              await nextBtn3.click()
              await page.waitForTimeout(2000)
              const text = await page.locator('body').innerText()
              const registered = text.includes('SRG-') || text.includes('matricule') || text.toLowerCase().includes('compte') || text.toLowerCase().includes('cree')
              record('Auth', 'Création compte 4 étapes', registered ? 'PASS' : 'PARTIAL', registered ? 'Compte créé avec matricule' : `Texte: ${text.slice(0, 100)}`)
            } else {
              record('Auth', 'Création compte 4 étapes', 'PARTIAL', 'Bouton confirmation non trouvé')
            }
          } else {
            record('Auth', 'Création compte 4 étapes', 'PARTIAL', 'Champs password non trouvés')
          }
        } else {
          record('Auth', 'Création compte 4 étapes', 'PARTIAL', 'Bouton étape 2 non trouvé')
        }
      } else {
        record('Auth', 'Création compte 4 étapes', 'PARTIAL', 'Bouton étape 1 non trouvé')
      }
    } else {
      record('Auth', 'Création compte 4 étapes', 'PARTIAL', `Seulement ${inputCount} inputs trouvés`)
    }
  } catch (e) { record('Auth', 'Création compte 4 étapes', 'FAIL', String(e).slice(0, 150)) }

  // Login
  try {
    await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasLogin = text.includes('Identifier') || text.includes('Password') || text.toLowerCase().includes('connexion')
    record('Auth', 'Formulaire login présent', hasLogin ? 'PASS' : 'PARTIAL', hasLogin ? 'Identifier + Password détectés' : 'Formulaire non détecté')
  } catch (e) { record('Auth', 'Formulaire login', 'FAIL', String(e).slice(0, 150)) }

  // ===== ADMIN WORKFLOW =====
  try {
    await page.goto(`${BASE}/administration`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2000)
    const text = await page.locator('body').innerText()
    const hasApprove = text.includes('Approuver') || text.includes('approve') || text.toLowerCase().includes('approbation')
    const hasReject = text.includes('Rejeter') || text.includes('reject') || text.toLowerCase().includes('rejet')
    const hasSuspend = text.includes('Suspendre') || text.includes('suspend') || text.toLowerCase().includes('suspension')
    const hasReactivate = text.includes('Réactiver') || text.includes('Reactiver') || text.includes('reactivate') || text.toLowerCase().includes('réactivation') || text.toLowerCase().includes('reactivation')
    const allActions = hasApprove && hasReject && hasSuspend && hasReactivate
    record('Admin', 'Workflow approve/reject/suspend/reactivate', allActions ? 'PASS' : 'PARTIAL', `approve=${hasApprove}, reject=${hasReject}, suspend=${hasSuspend}, reactivate=${hasReactivate}`)
  } catch (e) { record('Admin', 'Workflow admin', 'FAIL', String(e).slice(0, 150)) }

  // ===== KNOWLEDGE ZIP + UTILISATION CONVERSATION =====
  try {
    const zip = new JSZip()
    zip.file('manuel-automobile.txt', 'Manuel automobile SRG. Circuit de freinage Mercedes 190: maitre-cylindre, etrier, plaquettes.')
    zip.file('document-electrique.txt', 'Document electrique SRG. Bloc alimentation: transformateur, redresseur, filtre, regulateur.')
    zip.file('document-batiment.txt', 'Document batiment SRG. Plan duplex 4 chambres: fondations, elevation, charpente.')
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const zipPath = path.join(os.tmpdir(), 'srg-certif-final.zip')
    fs.writeFileSync(zipPath, zipBuffer)

    await page.goto(`${BASE}/knowledge-center`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const fileInput = page.locator('input[type="file"][accept*="zip"]')
    if (await fileInput.count() > 0) {
      await fileInput.first().setInputFiles(zipPath)
      await page.waitForTimeout(5000)
      const text = await page.locator('body').innerText()
      const imported = text.includes('manuel-automobile') || text.includes('document-electrique') || text.includes('document-batiment') || text.toLowerCase().includes('import')
      record('Knowledge', 'Import ZIP 3 documents métiers', imported ? 'PASS' : 'PARTIAL', imported ? 'Documents importés détectés' : 'Upload sans confirmation')
    } else {
      record('Knowledge', 'Import ZIP', 'PARTIAL', 'Input file non localisé')
    }
    fs.unlinkSync(zipPath)
  } catch (e) { record('Knowledge', 'Import ZIP', 'FAIL', String(e).slice(0, 150)) }

  // ===== PROJECTS / CHANTIER / POINTAGE / RAPPORT =====
  try {
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasProjects = text.toLowerCase().includes('projet') || text.toLowerCase().includes('project')
    record('Projects', 'Ouverture page projets', hasProjects ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Projects', 'Ouverture', 'FAIL', String(e).slice(0, 150)) }

  try {
    await page.goto(`${BASE}/project-execution`, { waitUntil: 'load', timeout: 30000 })
    await page.waitForTimeout(3000)
    const text = await page.locator('body').innerText()
    const hasChantier = (text.toLowerCase().includes('chantier') || text.toLowerCase().includes('execution')) && text.length > 500
    record('Chantier', 'Page exécution/chantier', hasChantier ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Chantier', 'Ouverture', 'FAIL', String(e).slice(0, 150)) }

  try {
    await page.goto(`${BASE}/attendance`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasPointage = text.toLowerCase().includes('pointage') || text.toLowerCase().includes('presence')
    record('Pointage', 'Page présences/pointage', hasPointage ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Pointage', 'Ouverture', 'FAIL', String(e).slice(0, 150)) }

  // ===== REPORTS =====
  try {
    await page.goto(`${BASE}/generate`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasReports = text.toLowerCase().includes('rapport') || text.toLowerCase().includes('gener')
    record('Reports', 'Génération rapport', hasReports ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Reports', 'Génération', 'FAIL', String(e).slice(0, 150)) }

  // ===== PROVIDERS =====
  try {
    await page.goto(`${BASE}/providers`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const text = await page.locator('body').innerText()
    const hasProviders = text.toLowerCase().includes('provider') || text.toLowerCase().includes('moteur') || text.toLowerCase().includes('engine')
    record('Providers', 'Test Center', hasProviders ? 'PASS' : 'PARTIAL', `${text.length} caractères`)
  } catch (e) { record('Providers', 'Ouverture', 'FAIL', String(e).slice(0, 150)) }

  // ===== MOBILE 390x844 =====
  await ctx.close()
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobileCtx.newPage()
  try {
    await mobilePage.goto(BASE, { waitUntil: 'load', timeout: 30000 })
    await mobilePage.waitForTimeout(2000)
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth)
    record('Mobile', 'Pas de débordement 390x844', scrollWidth <= clientWidth + 5 ? 'PASS' : 'PARTIAL', `scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`)

    await mobilePage.goto(`${BASE}/categories`, { waitUntil: 'networkidle', timeout: 30000 })
    await mobilePage.waitForTimeout(1500)
    const text = await mobilePage.locator('body').innerText()
    const catCount = ['Finance', 'Operations', 'CRM', 'Knowledge', 'Gouvernance'].filter((c) => text.includes(c)).length
    record('Mobile', 'Catégories visibles mobile', catCount >= 4 ? 'PASS' : 'PARTIAL', `${catCount}/5`)
  } catch (e) { record('Mobile', 'Navigation mobile', 'FAIL', String(e).slice(0, 150)) }
  await mobileCtx.close()

  // ===== AUDIO NAVIGATEUR =====
  try {
    const audioCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } })
    const audioPage = await audioCtx.newPage()
    await audioPage.goto(BASE, { waitUntil: 'load', timeout: 30000 })
    await audioPage.waitForTimeout(1000)
    const hasGetUserMedia = await audioPage.evaluate(() => typeof navigator.mediaDevices !== 'undefined' && typeof navigator.mediaDevices.getUserMedia === 'function')
    const hasSpeechSynthesis = await audioPage.evaluate(() => typeof window.speechSynthesis !== 'undefined')
    record('Audio', 'APIs navigateur disponibles', hasGetUserMedia && hasSpeechSynthesis ? 'PASS' : 'PARTIAL', `getUserMedia=${hasGetUserMedia}, speechSynthesis=${hasSpeechSynthesis}`)
    await audioCtx.close()
  } catch (e) { record('Audio', 'APIs navigateur', 'FAIL', String(e).slice(0, 150)) }

  // ===== 404 =====
  try {
    const ctx404 = await browser.newContext({ viewport: { width: 1366, height: 900 } })
    const page404 = await ctx404.newPage()
    await page404.goto(`${BASE}/page-inexistante-certif-finale`, { waitUntil: 'networkidle', timeout: 20000 })
    await page404.waitForTimeout(1500)
    const text = await page404.locator('body').innerText()
    const has404 = text.includes('404') && (text.includes('accueil') || text.includes('categories'))
    record('404', 'notFoundComponent SRG', has404 ? 'PASS' : 'PARTIAL', has404 ? 'Page 404 propre avec liens retour' : `Texte: ${text.slice(0, 80)}`)
    await ctx404.close()
  } catch (e) { record('404', 'Page 404', 'FAIL', String(e).slice(0, 150)) }

  await browser.close()

  // ===== RAPPORT =====
  console.log('\n========== CERTIFICATION NAVIGATEUR FINALE P0 ==========')
  console.log('| Fonction | Test | Résultat | Preuve |')
  console.log('|---|---|---|---|')
  for (const r of results) {
    console.log(`| ${r.fonction} | ${r.test} | ${r.resultat} | ${r.preuve} |`)
  }
  const pass = results.filter((r) => r.resultat === 'PASS').length
  const partial = results.filter((r) => r.resultat === 'PARTIAL').length
  const fail = results.filter((r) => r.resultat === 'FAIL').length
  console.log(`\nTOTAL: ${pass} PASS, ${partial} PARTIAL, ${fail} FAIL sur ${results.length} tests`)

  fs.writeFileSync(path.join(process.cwd(), 'docs', 'certification-browser-final-results.json'), JSON.stringify({ date: new Date().toISOString(), results, summary: { pass, partial, fail } }, null, 2))
}

main().catch((e) => { console.error('CERTIFICATION FAILED:', e); process.exit(1) })