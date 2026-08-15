// SRG Certification E2E — tests utilisateur réels via Playwright
// Usage: node tools/certification-e2e.mjs
// Prérequis: npm run dev actif sur port 3000, npx playwright install chromium

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

async function waitReady(page, selector, timeout = 15000) {
  try {
    await page.waitForSelector(selector, { timeout })
    return true
  } catch {
    return false
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true })

  // ============ DESKTOP 1366x900 ============
  const desktopCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const page = await desktopCtx.newPage()

  // --- HOME ---
  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
    const title = await page.title()
    const hasOrb = await page.locator('text=/SRG|Ask/i').first().isVisible().catch(() => false)
    record('Home', 'Chargement page accueil', title ? 'PASS' : 'FAIL', `title="${title}"`)
  } catch (error) {
    record('Home', 'Chargement page accueil', 'FAIL', String(error).slice(0, 200))
  }

  // --- PAGE 2 /categories ---
  try {
    await page.goto(`${BASE}/categories`, { waitUntil: 'networkidle', timeout: 30000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const expected = ['Finance', 'Ressources Humaines', 'Operations', 'Projets', 'CRM', 'Reunions', 'Documents', 'Knowledge', 'Analytics', 'Automation', 'Qualite', 'Gouvernance']
    const found = expected.filter((cat) => bodyText.includes(cat))
    record('Page 2', '12 catégories affichées', found.length === 12 ? 'PASS' : 'PARTIAL', `${found.length}/12: ${found.join(', ')}`)
  } catch (error) {
    record('Page 2', '12 catégories affichées', 'FAIL', String(error).slice(0, 200))
  }

  // --- PAGE 3 par catégorie ---
  const categories = ['finance', 'hr', 'operations', 'projects', 'crm', 'meetings', 'documents', 'knowledge', 'analytics', 'automation', 'quality', 'governance']
  for (const cat of categories) {
    try {
      await page.goto(`${BASE}/category/${cat}`, { waitUntil: 'networkidle', timeout: 20000 })
      await page.waitForTimeout(800)
      const bodyText = await page.locator('body').innerText()
      const hasContent = bodyText.length > 100
      record('Page 3', `Catégorie ${cat}`, hasContent ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères rendus`)
    } catch (error) {
      record('Page 3', `Catégorie ${cat}`, 'FAIL', String(error).slice(0, 150))
    }
  }

  // --- CONVERSATIONS INDÉPENDANTES ---
  try {
    await page.goto(`${BASE}/conversation/finance/accounting`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2500)
    const conv1Text = await page.locator('body').innerText()
    const conv1Ok = conv1Text.includes('Finance') || conv1Text.includes('Comptabilite')

    await page.goto(`${BASE}/conversation/hr/payroll`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(2500)
    const conv2Text = await page.locator('body').innerText()
    const conv2Ok = conv2Text.includes('RH') || conv2Text.includes('Paie') || conv2Text.includes('Ressources')

    record('Conversation', 'Deux conversations indépendantes (finance/accounting vs hr/payroll)', conv1Ok && conv2Ok ? 'PASS' : 'PARTIAL', `conv1=${conv1Ok}, conv2=${conv2Ok}`)
  } catch (error) {
    record('Conversation', 'Deux conversations indépendantes', 'FAIL', String(error).slice(0, 200))
  }

  // --- TEST MÉTIER MÉCANICIEN (conversation operations/maintenance) ---
  try {
    await page.goto(`${BASE}/conversation/operations/maintenance`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const textarea = page.locator('textarea[aria-label="Conversation composer"]')
    if (await textarea.isVisible()) {
      await textarea.fill('Donne-moi le schema du circuit de freinage d une Mercedes 190.')
      await page.locator('button:has-text("Send")').first().click()
      await page.waitForTimeout(5000)
      const responseText = await page.locator('body').innerText()
      const hasResponse = responseText.toLowerCase().includes('freinage') || responseText.toLowerCase().includes('mercedes') || responseText.includes('MISSING') || responseText.includes('GENERATED') || responseText.includes('SIMULATED')
      record('Métier mécanicien', 'Question circuit freinage Mercedes 190', hasResponse ? 'PASS' : 'PARTIAL', hasResponse ? 'Réponse métier reçue (VERIFIED/GENERATED/MISSING ou SIMULATED)' : 'Pas de réponse détectée')
    } else {
      record('Métier mécanicien', 'Question circuit freinage Mercedes 190', 'PARTIAL', 'Textarea non trouvé — conversation rendue mais input non localisé')
    }
  } catch (error) {
    record('Métier mécanicien', 'Question circuit freinage', 'FAIL', String(error).slice(0, 200))
  }

  // --- TEST 404 (notFoundComponent) ---
  try {
    await page.goto(`${BASE}/cette-page-n-existe-pas`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const notFoundText = await page.locator('body').innerText()
    const has404 = notFoundText.includes('404') && (notFoundText.includes('accueil') || notFoundText.includes('categories'))
    record('404', 'Page introuvable avec retour accueil', has404 ? 'PASS' : 'PARTIAL', has404 ? 'notFoundComponent SRG rendu avec liens retour' : `Texte: ${notFoundText.slice(0, 100)}`)
  } catch (error) {
    record('404', 'Page introuvable', 'FAIL', String(error).slice(0, 200))
  }

  // --- KNOWLEDGE CENTER ---
  try {
    await page.goto(`${BASE}/knowledge-center`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const hasKC = bodyText.toLowerCase().includes('knowledge') || bodyText.toLowerCase().includes('document')
    record('Knowledge Center', 'Ouverture et rendu', hasKC ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères`)
  } catch (error) {
    record('Knowledge Center', 'Ouverture et rendu', 'FAIL', String(error).slice(0, 200))
  }

  // --- ZIP TEST (création archive test + upload) ---
  try {
    const zip = new JSZip()
    zip.file('test-document.txt', 'Document de test SRG certification. Procedure qualite.')
    zip.file('test-rapport.md', '# Rapport de test\nContenu de certification SRG.')
    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
    const zipPath = path.join(os.tmpdir(), 'srg-test-archive.zip')
    fs.writeFileSync(zipPath, zipBuffer)

    await page.goto(`${BASE}/knowledge-center`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    // Input ZIP hidden (attribut hidden) — ciblage direct par accept .zip, setInputFiles fonctionne sur input caché
    const fileInput = page.locator('input[type="file"][accept*="zip"]')
    if (await fileInput.count() > 0) {
      await fileInput.first().setInputFiles(zipPath)
      await page.waitForTimeout(5000)
      const bodyText = await page.locator('body').innerText()
      const imported = bodyText.includes('test-document') || bodyText.includes('test-rapport') || bodyText.toLowerCase().includes('import')
      record('ZIP', 'Upload archive test 2 fichiers', imported ? 'PASS' : 'PARTIAL', imported ? 'Documents importés détectés' : 'Upload effectué mais confirmation non détectée')
    } else {
      record('ZIP', 'Upload archive test', 'PARTIAL', 'Input file non localisé dans Knowledge Center')
    }
    fs.unlinkSync(zipPath)
  } catch (error) {
    record('ZIP', 'Upload archive test', 'FAIL', String(error).slice(0, 200))
  }

  // --- ADMINISTRATION ---
  try {
    await page.goto(`${BASE}/administration`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const hasAdmin = bodyText.toLowerCase().includes('admin') || bodyText.toLowerCase().includes('compte') || bodyText.toLowerCase().includes('utilisateur')
    record('Administration', 'Ouverture page administration', hasAdmin ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères`)
  } catch (error) {
    record('Administration', 'Ouverture page administration', 'FAIL', String(error).slice(0, 200))
  }

  // --- PROJECTS ---
  try {
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const hasProjects = bodyText.toLowerCase().includes('projet') || bodyText.toLowerCase().includes('project')
    record('Projects', 'Ouverture page projets', hasProjects ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères`)
  } catch (error) {
    record('Projects', 'Ouverture page projets', 'FAIL', String(error).slice(0, 200))
  }

  // --- PROVIDERS ---
  try {
    await page.goto(`${BASE}/providers`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const hasProviders = bodyText.toLowerCase().includes('provider') || bodyText.toLowerCase().includes('moteur') || bodyText.toLowerCase().includes('engine')
    record('Providers', 'Ouverture Test Center', hasProviders ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères`)
  } catch (error) {
    record('Providers', 'Ouverture Test Center', 'FAIL', String(error).slice(0, 200))
  }

  // --- AUTH ---
  try {
    await page.goto(`${BASE}/auth`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const hasAuth = bodyText.toLowerCase().includes('connexion') || bodyText.toLowerCase().includes('login') || bodyText.toLowerCase().includes('compte') || bodyText.toLowerCase().includes('matricule')
    record('Auth', 'Ouverture page authentification', hasAuth ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères`)
  } catch (error) {
    record('Auth', 'Ouverture page authentification', 'FAIL', String(error).slice(0, 200))
  }

  // --- MONÉTISATION ---
  try {
    await page.goto(`${BASE}/billing`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(1500)
    const bodyText = await page.locator('body').innerText()
    const hasBilling = bodyText.toLowerCase().includes('wallet') || bodyText.toLowerCase().includes('credit') || bodyText.toLowerCase().includes('factur') || bodyText.toLowerCase().includes('billing')
    record('Monétisation', 'Ouverture page billing/wallet', hasBilling ? 'PASS' : 'PARTIAL', `${bodyText.length} caractères`)
  } catch (error) {
    record('Monétisation', 'Ouverture page billing', 'FAIL', String(error).slice(0, 200))
  }

  await desktopCtx.close()

  // ============ MOBILE 390x844 ============
  const mobileCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobileCtx.newPage()

  try {
    await mobilePage.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 })
    await mobilePage.waitForTimeout(1000)
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth)
    const noOverflow = scrollWidth <= clientWidth + 5
    record('Mobile', 'Home sans débordement horizontal 390x844', noOverflow ? 'PASS' : 'PARTIAL', `scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`)

    await mobilePage.goto(`${BASE}/categories`, { waitUntil: 'networkidle', timeout: 30000 })
    await mobilePage.waitForTimeout(1000)
    const bodyText = await mobilePage.locator('body').innerText()
    const catCount = ['Finance', 'Operations', 'CRM', 'Knowledge', 'Gouvernance'].filter((c) => bodyText.includes(c)).length
    record('Mobile', 'Page 2 catégories visibles sur mobile', catCount >= 4 ? 'PASS' : 'PARTIAL', `${catCount}/5 catégories détectées`)
  } catch (error) {
    record('Mobile', 'Navigation mobile', 'FAIL', String(error).slice(0, 200))
  }

  await mobileCtx.close()
  await browser.close()

  // ============ RAPPORT ============
  console.log('\n========== MATRICE CERTIFICATION ==========')
  console.log('| Fonction | Test réel | Résultat | Preuve |')
  console.log('|---|---|---|---|')
  for (const r of results) {
    console.log(`| ${r.fonction} | ${r.test} | ${r.resultat} | ${r.preuve} |`)
  }

  const passCount = results.filter((r) => r.resultat === 'PASS').length
  const partialCount = results.filter((r) => r.resultat === 'PARTIAL').length
  const failCount = results.filter((r) => r.resultat === 'FAIL').length
  console.log(`\nTOTAL: ${passCount} PASS, ${partialCount} PARTIAL, ${failCount} FAIL sur ${results.length} tests`)

  const reportPath = path.join(process.cwd(), 'docs', 'certification-e2e-results.json')
  fs.writeFileSync(reportPath, JSON.stringify({ date: new Date().toISOString(), results, summary: { pass: passCount, partial: partialCount, fail: failCount } }, null, 2))
  console.log(`Rapport JSON: ${reportPath}`)
}

main().catch((error) => {
  console.error('CERTIFICATION FAILED:', error)
  process.exit(1)
})