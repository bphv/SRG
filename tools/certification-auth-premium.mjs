// SRG Certification Auth Premium — isolation /auth + responsive
// Usage: node tools/certification-auth-premium.mjs
// Vérifie: absence AppShell/panneau bleu, design premium, responsive, inscription 4 étapes

import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'

// Éléments qui NE DOIVENT PAS apparaître sur /auth
const FORBIDDEN_ELEMENTS = [
  'AI Agents',
  'Generate',
  'Workflow Automation',
  'Ask SRG',
  'Workspace actif',
  'tenant-srg-industries-holding',
  'enterprise-user-placeholder',
  'Memory Placeholder',
  'Modules consultés',
  'Conversations Placeholder',
  'Documents Placeholder',
  'Provider OTP',
  'Twilio',
  'Vonage',
  'Orange SMS',
  'MTN SMS',
]

// Éléments qui DOIVENT apparaître sur /auth
const REQUIRED_ELEMENTS = [
  'SRG',
  'Enterprise Intelligence Platform',
  'Creer votre compte SRG',
  'Inscription',
  'Connexion',
]

async function checkAuthPage(page, viewportName) {
  const results = []

  await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
  await page.waitForTimeout(2000)

  const bodyText = await page.evaluate(() => document.body.innerText)

  // Vérifier absence éléments interdits
  for (const forbidden of FORBIDDEN_ELEMENTS) {
    const found = bodyText.includes(forbidden)
    results.push({
      test: `${viewportName} - Absence "${forbidden}"`,
      status: found ? 'FAIL' : 'PASS',
      details: found ? `Élément interdit trouvé: ${forbidden}` : 'Absent comme attendu',
    })
  }

  // Vérifier présence éléments requis
  for (const required of REQUIRED_ELEMENTS) {
    const found = bodyText.includes(required)
    results.push({
      test: `${viewportName} - Présence "${required}"`,
      status: found ? 'PASS' : 'FAIL',
      details: found ? 'Présent comme attendu' : `Élément requis manquant: ${required}`,
    })
  }

  // Vérifier absence sidebar (nav avec sidebar ou aside)
  const hasSidebar = await page.evaluate(() => {
    const sidebar = document.querySelector('aside, [class*="sidebar"], nav[class*="sidebar"]')
    return sidebar !== null && sidebar.offsetParent !== null
  })
  results.push({
    test: `${viewportName} - Absence sidebar`,
    status: hasSidebar ? 'FAIL' : 'PASS',
    details: hasSidebar ? 'Sidebar détectée sur /auth' : 'Pas de sidebar',
  })

  // Vérifier absence overflow horizontal
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth
  })
  results.push({
    test: `${viewportName} - Pas de débordement horizontal`,
    status: overflow ? 'FAIL' : 'PASS',
    details: overflow
      ? `Débordement: scrollWidth=${document.documentElement.scrollWidth} > clientWidth=${document.documentElement.clientWidth}`
      : 'Pas de débordement horizontal',
  })

  // Vérifier stepper visible (desktop uniquement)
  if (viewportName === 'Desktop') {
    const stepperVisible = await page.evaluate(() => {
      const stepper = document.querySelector('ol[aria-label*="Progression"]')
      return stepper !== null && stepper.offsetParent !== null
    })
    results.push({
      test: `${viewportName} - Stepper 4 étapes visible`,
      status: stepperVisible ? 'PASS' : 'FAIL',
      details: stepperVisible ? 'Stepper visible' : 'Stepper non détecté',
    })
  }

  // Vérifier stepper mobile compact
  if (viewportName === 'Mobile') {
    const mobileStepper = await page.evaluate(() => {
      return document.body.innerText.includes('Etape 1 sur 4')
    })
    results.push({
      test: `${viewportName} - Stepper compact mobile`,
      status: mobileStepper ? 'PASS' : 'FAIL',
      details: mobileStepper ? 'Stepper compact "Etape 1 sur 4" détecté' : 'Stepper mobile non détecté',
    })
  }

  return results
}

async function testInscriptionFlow(page) {
  const results = []

  await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
  await page.waitForTimeout(2000)

  // Étape 1: remplir identité (nom, prénom, username, téléphone)
  const timestamp = Date.now()
  const username = `testauth${timestamp}`

  await page.fill('input[placeholder="Votre nom"]', 'TestAuth')
  await page.fill('input[placeholder="Votre prenom"]', 'Premium')
  await page.fill('input[placeholder="Identifiant unique"]', username)
  await page.fill('input[placeholder="+33 6 12 34 56 78"]', `+3361234${String(timestamp).slice(-4)}`)

  // Cliquer Suivant
  await page.click('button:has-text("Suivant")')
  await page.waitForTimeout(500)

  const step2Visible = await page.evaluate(() => document.body.innerText.includes('Email'))
  results.push({
    test: 'Inscription - Étape 1 → Étape 2',
    status: step2Visible ? 'PASS' : 'FAIL',
    details: step2Visible ? 'Étape 2 Coordonnées atteinte' : 'Étape 2 non atteinte',
  })

  // Étape 2: remplir coordonnées (email facultatif, pays, ville, langue déjà pré-remplis)

  await page.click('button:has-text("Suivant")')
  await page.waitForTimeout(500)

  const step3Visible = await page.evaluate(() => document.body.innerText.includes('Mot de passe'))
  results.push({
    test: 'Inscription - Étape 2 → Étape 3',
    status: step3Visible ? 'PASS' : 'FAIL',
    details: step3Visible ? 'Étape 3 Sécurité atteinte' : 'Étape 3 non atteinte',
  })

  // Étape 3: remplir sécurité
  await page.fill('input[placeholder="Mot de passe solide"]', 'TestAuth2026!Secure')
  await page.fill('input[placeholder="Confirmez le mot de passe"]', 'TestAuth2026!Secure')
  await page.locator('input[type="checkbox"]').first().check()
  await page.locator('input[type="checkbox"]').nth(1).check()

  await page.click('button:has-text("Suivant")')
  await page.waitForTimeout(500)

  const step4Visible = await page.evaluate(() => document.body.innerText.includes('Recapitulatif'))
  results.push({
    test: 'Inscription - Étape 3 → Étape 4',
    status: step4Visible ? 'PASS' : 'FAIL',
    details: step4Visible ? 'Étape 4 Confirmation atteinte' : 'Étape 4 non atteinte',
  })

  // Étape 4: créer le compte
  await page.click('button:has-text("Creer le compte")')
  await page.waitForTimeout(3000)

  // Le compte peut être créé puis redirigé vers /account-pending (approbation)
  // ou rester sur /auth avec le matricule affiché. On vérifie les deux cas.
  const currentUrl = page.url()
  const pageText = await page.evaluate(() => document.body.innerText)

  const matriculeVisible = pageText.includes('Matricule') && pageText.includes('SRG')
  const redirectedToPending = currentUrl.includes('/account-pending')
  const accountCreated = matriculeVisible || redirectedToPending || pageText.includes('attente')

  results.push({
    test: 'Inscription - Création compte + matricule',
    status: accountCreated ? 'PASS' : 'FAIL',
    details: matriculeVisible
      ? 'Compte créé avec matricule SRG affiché'
      : redirectedToPending
        ? 'Compte créé, redirection vers /account-pending (approbation requise)'
        : accountCreated
          ? 'Compte créé, en attente d\'approbation'
          : 'Création de compte non détectée',
  })

  return results
}

async function main() {
  const browser = await chromium.launch({ headless: true })
  const allResults = []

  // Desktop 1366x900
  const desktopContext = await browser.newContext({ viewport: { width: 1366, height: 900 } })
  const desktopPage = await desktopContext.newPage()
  allResults.push(...(await checkAuthPage(desktopPage, 'Desktop')))
  allResults.push(...(await testInscriptionFlow(desktopPage)))
  await desktopContext.close()

  // Tablette 768x1024
  const tabletContext = await browser.newContext({ viewport: { width: 768, height: 1024 } })
  const tabletPage = await tabletContext.newPage()
  allResults.push(...(await checkAuthPage(tabletPage, 'Tablette')))
  await tabletContext.close()

  // Mobile 390x844
  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const mobilePage = await mobileContext.newPage()
  allResults.push(...(await checkAuthPage(mobilePage, 'Mobile')))
  await mobileContext.close()

  await browser.close()

  // Afficher résultats
  console.log('========== CERTIFICATION AUTH PREMIUM ==========')
  let passCount = 0
  let failCount = 0
  for (const result of allResults) {
    const icon = result.status === 'PASS' ? '✓' : '✗'
    console.log(`${icon} [${result.status}] ${result.test}`)
    if (result.status === 'FAIL') {
      console.log(`  Details: ${result.details}`)
      failCount++
    } else {
      passCount++
    }
  }
  console.log('=================================================')
  console.log(`TOTAL: ${passCount} PASS / ${failCount} FAIL`)
  console.log(`VERDICT: ${failCount === 0 ? 'AUTH PREMIUM READY' : 'AUTH PREMIUM NOT READY'}`)

  process.exit(failCount === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error('AUTH PREMIUM CERTIFICATION FAILED:', error)
  process.exit(1)
})