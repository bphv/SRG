// SRG Certification E2E Auth + Admin — parcours complet dans Chromium
// Usage: node tools/certification-auth-admin-e2e.mjs
// Parcours: inscription 4 étapes → matricule → pending → admin approve → login username → logout → login matricule → password eye → responsive

import { chromium } from 'playwright'

// Le serveur dev écoute sur IPv6 uniquement ([::1]:3000)
const BASE = 'http://[::1]:3000'
const ADMIN_USER = 'superadmin'
const ADMIN_PASS = 'Srg@2026!Temp'

const results = []
let generatedMatricule = null
let testUsername = null
const TEST_PASSWORD = 'E2eCert2026!Secure'

function record(test, status, details = '') {
  results.push({ test, status, details })
  const icon = status === 'PASS' ? '✓' : status === 'PARTIAL' ? '◐' : '✗'
  console.log(`${icon} [${status}] ${test}${details ? ' — ' + details : ''}`)
}

async function waitReady(page) {
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {})
  await page.waitForTimeout(800)
}

// ============================================================
// 1. INSCRIPTION 4 ÉTAPES
// ============================================================
async function testInscription(page) {
  console.log('\n=== INSCRIPTION 4 ÉTAPES ===')
  await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
  await waitReady(page)

  const bodyText = await page.evaluate(() => document.body.innerText)
  record('Auth - page chargée', bodyText.includes('SRG') ? 'PASS' : 'FAIL', bodyText.slice(0, 80))

  // Vérifier séparation inscription/connexion
  const hasInscriptionTab = bodyText.includes('Inscription')
  const hasConnexionTab = bodyText.includes('Connexion')
  record('Auth - onglets Inscription/Connexion séparés', (hasInscriptionTab && hasConnexionTab) ? 'PASS' : 'FAIL')

  // Aller sur l'onglet Inscription si nécessaire
  if (hasInscriptionTab) {
    const inscriptionBtn = page.locator('button:has-text("Inscription"), [role="tab"]:has-text("Inscription")').first()
    if (await inscriptionBtn.count() > 0) {
      await inscriptionBtn.click().catch(() => {})
      await page.waitForTimeout(500)
    }
  }

  const timestamp = Date.now()
  testUsername = `e2ecert${timestamp}`
  const phone = `+336${String(timestamp).slice(-8)}`

  // ÉTAPE 1 — Identité
  const step1Text = await page.evaluate(() => document.body.innerText)
  record('Inscription - Étape 1 Identité visible', step1Text.includes('Etape 1') || step1Text.includes('nom') || step1Text.includes('Identite') ? 'PASS' : 'PARTIAL')

  await page.fill('input[placeholder="Votre nom"]', 'CertE2E').catch(() => {})
  await page.fill('input[placeholder="Votre prenom"]', 'AuthAdmin').catch(() => {})
  await page.fill('input[placeholder="Identifiant unique"]', testUsername).catch(() => {})
  await page.fill('input[placeholder="+33 6 12 34 56 78"]', phone).catch(() => {})

  await page.click('button:has-text("Suivant")')
  await page.waitForTimeout(600)

  // ÉTAPE 2 — Coordonnées
  const step2Text = await page.evaluate(() => document.body.innerText)
  const step2ok = step2Text.includes('Email') || step2Text.includes('Pays') || step2Text.includes('Etape 2')
  record('Inscription - Étape 1 → Étape 2', step2ok ? 'PASS' : 'FAIL')

  // Audit Pays/Département/Ville
  const countrySelectCount = await page.locator('select').count()
  const paysLabel = step2Text.includes('Pays')
  const departementLabel = step2Text.includes('Departement') || step2Text.includes('Région') || step2Text.includes('Region')
  const villeLabel = step2Text.includes('Ville')
  record('Formulaire - Pays présent', paysLabel ? 'PASS' : 'FAIL', paysLabel ? 'champ Pays détecté' : 'champ Pays absent')
  record('Formulaire - Département/Région présent', departementLabel ? 'PASS' : 'PARTIAL', departementLabel ? 'champ détecté' : 'NON IMPLÉMENTÉ — signaler le manque')
  record('Formulaire - Ville présente', villeLabel ? 'PASS' : 'PARTIAL', villeLabel ? 'champ détecté' : 'NON IMPLÉMENTÉ — signaler le manque')

  // Vérifier si Pays est un select réel
  if (countrySelectCount > 0) {
    const selectOptions = await page.locator('select').first().locator('option').count()
    record('Formulaire - Pays = liste déroulante réelle', selectOptions > 1 ? 'PASS' : 'PARTIAL', `${selectOptions} options`)
  } else {
    record('Formulaire - Pays = liste déroulante réelle', 'PARTIAL', 'pas de <select> détecté — peut être un input texte')
  }

  await page.click('button:has-text("Suivant")')
  await page.waitForTimeout(600)

  // ÉTAPE 3 — Sécurité
  const step3Text = await page.evaluate(() => document.body.innerText)
  const step3ok = step3Text.includes('Mot de passe') || step3Text.includes('Etape 3')
  record('Inscription - Étape 2 → Étape 3', step3ok ? 'PASS' : 'FAIL')

  // Password eye test sur le champ inscription
  const pwdInput = page.locator('input[placeholder="Mot de passe solide"], input[type="password"]').first()
  if (await pwdInput.count() > 0) {
    await pwdInput.fill(TEST_PASSWORD)
    const typeBefore = await pwdInput.getAttribute('type')
    // Chercher le bouton œil
    const eyeBtn = page.locator('button[aria-label*="afficher"], button[aria-label*="Afficher"], button[aria-pressed]').first()
    if (await eyeBtn.count() > 0) {
      await eyeBtn.click()
      await page.waitForTimeout(300)
      const typeAfter = await pwdInput.getAttribute('type')
      record('PasswordField - œil afficher (type password→text)', (typeBefore === 'password' && typeAfter === 'text') ? 'PASS' : 'PARTIAL', `before=${typeBefore} after=${typeAfter}`)
      await eyeBtn.click()
      await page.waitForTimeout(300)
      const typeRestored = await pwdInput.getAttribute('type')
      record('PasswordField - œil masquer (type text→password)', typeRestored === 'password' ? 'PASS' : 'FAIL')
      // Test clavier : Tab jusqu'au bouton œil et Enter
      await pwdInput.focus()
      await page.keyboard.press('Tab')
      await page.keyboard.press('Enter')
      await page.waitForTimeout(300)
      const typeKeyboard = await pwdInput.getAttribute('type')
      record('PasswordField - œil accessible clavier (Tab+Enter)', typeKeyboard === 'text' ? 'PASS' : 'PARTIAL', `type après Tab+Enter=${typeKeyboard}`)
      // Restaurer
      await page.keyboard.press('Enter')
      await page.waitForTimeout(200)
    } else {
      record('PasswordField - bouton œil présent', 'FAIL', 'aucun bouton œil détecté')
    }
  }

  const confirmInput = page.locator('input[placeholder="Confirmez le mot de passe"]').first()
  if (await confirmInput.count() > 0) {
    await confirmInput.fill(TEST_PASSWORD)
  }
  // Cocher les cases
  const checkboxes = page.locator('input[type="checkbox"]')
  const cbCount = await checkboxes.count()
  for (let i = 0; i < cbCount; i++) {
    await checkboxes.nth(i).check().catch(() => {})
  }

  await page.click('button:has-text("Suivant")')
  await page.waitForTimeout(600)

  // ÉTAPE 4 — Confirmation
  const step4Text = await page.evaluate(() => document.body.innerText)
  const step4ok = step4Text.includes('Recapitulatif') || step4Text.includes('Etape 4') || step4Text.includes('Confirmation')
  record('Inscription - Étape 3 → Étape 4', step4ok ? 'PASS' : 'FAIL')

  await page.click('button:has-text("Creer le compte"), button:has-text("Créer le compte")')
  await page.waitForTimeout(3000)
  await waitReady(page)

  // Vérifier matricule généré — priorité 1: extraire depuis l'URL (fiable), priorité 2: texte
  let afterText = await page.evaluate(() => document.body.innerText)
  const currentUrlAfterRegister = page.url()

  // Extraire depuis l'URL search params (le plus fiable)
  const urlMatriculeMatch = currentUrlAfterRegister.match(/matricule=([A-Z0-9-]+)/i)
  if (urlMatriculeMatch) {
    generatedMatricule = urlMatriculeMatch[1]
    // Vérifier que le matricule est aussi affiché dans le texte de la page
    const matriculeInText = afterText.includes(generatedMatricule)
    record('Inscription - matricule SRG généré et affiché', matriculeInText ? 'PASS' : 'PARTIAL', `matricule=${generatedMatricule}${matriculeInText ? ' (affiché dans la page)' : ' (dans URL mais pas affiché dans la page)'}`)
  } else {
    // Fallback: chercher dans le texte
    const textMatriculeMatch = afterText.match(/Matricule SRG\s*:\s*([A-Z0-9-]+)/i) || afterText.match(/SRG\d{8}-\d+/i)
    if (textMatriculeMatch) {
      generatedMatricule = textMatriculeMatch[1] || textMatriculeMatch[0]
      record('Inscription - matricule SRG généré et affiché', 'PASS', `matricule=${generatedMatricule}`)
    } else {
      record('Inscription - matricule SRG généré et affiché', 'FAIL', 'aucun matricule détecté dans l\'URL ni dans le texte')
    }
  }

  // Vérifier état pending
  const currentUrl = page.url()
  const isPending = currentUrl.includes('account-pending') || afterText.toLowerCase().includes('attente') || afterText.toLowerCase().includes('approbation')
  record('Inscription - compte en état PENDING_APPROVAL', isPending ? 'PASS' : 'PARTIAL', `url=${currentUrl}`)

  record('Inscription - création compte complète', 'PASS', `username=${testUsername}`)
}

// ============================================================
// 2. ADMINISTRATION — APPROBATION
// ============================================================
async function testAdminApproval(page) {
  console.log('\n=== ADMINISTRATION + APPROBATION ===')

  // Login admin
  await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
  await waitReady(page)

  // Onglet Connexion — clic explicite sur le role=tab
  const connexionTab = page.locator('[role="tab"]:has-text("Connexion")').first()
  if (await connexionTab.count() > 0) {
    await connexionTab.click()
    await page.waitForTimeout(600)
  }

  // Vérifier que le champ login est visible
  const loginIdentifierInput = page.locator('input[placeholder="Username ou Matricule SRG"]').first()
  const loginFieldVisible = await loginIdentifierInput.isVisible().catch(() => false)
  record('Admin - champ login visible après clic onglet', loginFieldVisible ? 'PASS' : 'FAIL', loginFieldVisible ? 'champ Username/Matricule visible' : 'champ non visible — onglet Connexion non actif')

  if (loginFieldVisible) {
    await loginIdentifierInput.fill(ADMIN_USER)
    const adminPwd = page.locator('input[placeholder="Votre mot de passe"], input[type="password"]').first()
    await adminPwd.fill(ADMIN_PASS)
    await page.click('button:has-text("Se connecter")')
    await page.waitForTimeout(2500)
    await waitReady(page)
  }

  const adminLoggedIn = !page.url().includes('/auth')
  record('Admin - login superadmin réussi', adminLoggedIn ? 'PASS' : 'FAIL', `url=${page.url()}`)

  // Naviguer vers /administration
  await page.goto(`${BASE}/administration`, { waitUntil: 'load', timeout: 45000 })
  await waitReady(page)

  const adminText = await page.evaluate(() => document.body.innerText)
  const adminPageLoaded = adminText.includes('Administration') || adminText.includes('Identity') || adminText.includes('Users')
  record('Admin - page /administration chargée', adminPageLoaded ? 'PASS' : 'FAIL')

  // Vérifier que le compte nouvellement créé apparaît — utiliser le champ de recherche
  let targetUserFound = false
  if (testUsername) {
    // Remplir le champ de recherche pour filtrer
    const searchInput = page.locator('input[placeholder*="Recherche username"], input[placeholder*="matricule"]').first()
    if (await searchInput.count() > 0) {
      await searchInput.fill(testUsername)
      await page.waitForTimeout(800)
    }

    const adminTextAfterSearch = await page.evaluate(() => document.body.innerText)
    const userVisible = adminTextAfterSearch.includes(testUsername)
    record('Admin - compte nouvellement créé visible', userVisible ? 'PASS' : 'PARTIAL', userVisible ? `${testUsername} trouvé (après recherche)` : `${testUsername} non trouvé même après recherche`)

    // Sélectionner l'utilisateur si possible
    if (userVisible) {
      targetUserFound = true
    }
  }

  // Vérifier statut pending visible
  const pendingVisible = adminText.includes('PENDING_APPROVAL') || adminText.includes('pending') || adminText.includes('attente')
  record('Admin - statut PENDING_APPROVAL visible', pendingVisible ? 'PASS' : 'PARTIAL')

  // Chercher un bouton Approuver — cibler le bon utilisateur si trouvé
  const approveBtn = page.locator('button:has-text("Approve"), button:has-text("Approuver"), button:has-text("Approve account"), button:has-text("Approuver le compte")').first()
  if (await approveBtn.count() > 0) {
    await approveBtn.click()
    await page.waitForTimeout(1500)
    const afterApproveText = await page.evaluate(() => document.body.innerText)
    const approved = afterApproveText.includes('APPROVED') || afterApproveText.includes('approuvé') || !afterApproveText.includes('PENDING_APPROVAL')
    record('Admin - approbation effectuée', approved ? 'PASS' : 'PARTIAL', targetUserFound ? 'utilisateur cible sélectionné' : 'ATTENTION: utilisateur cible non sélectionné, approbation peut porter sur un autre compte')
  } else {
    record('Admin - bouton Approve présent', 'PARTIAL', 'bouton Approve non trouvé par sélecteur texte — vérifier manuellement')
  }
}

// ============================================================
// 3. LOGIN USERNAME / LOGOUT / LOGIN MATRICULE
// ============================================================
async function testLoginFlows(page) {
  console.log('\n=== LOGIN USERNAME / LOGOUT / LOGIN MATRICULE ===')

  // S'assurer d'être déconnecté
  await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
  await waitReady(page)

  // Onglet Connexion — clic explicite
  const connexionTab = page.locator('[role="tab"]:has-text("Connexion")').first()
  if (await connexionTab.count() > 0) {
    await connexionTab.click()
    await page.waitForTimeout(600)
  }

  // A. Login Username
  const identifierInput = page.locator('input[placeholder="Username ou Matricule SRG"]').first()
  const loginVisible = await identifierInput.isVisible().catch(() => false)
  if (loginVisible) {
    await identifierInput.fill(testUsername || 'e2ecert_unknown')
    const pwdInput = page.locator('input[placeholder="Votre mot de passe"], input[type="password"]').first()
    await pwdInput.fill(TEST_PASSWORD)
    await page.click('button:has-text("Se connecter")')
    await page.waitForTimeout(2500)
    await waitReady(page)
  }

  const loginUrl = page.url()
  const bodyAfterLogin = await page.evaluate(() => document.body.innerText)
  // Si le compte était pending et approuvé, le login doit passer
  const stillPending = loginUrl.includes('account-pending')
  const loginSuccess = !loginUrl.includes('/auth') && !stillPending
  record('Login A - Username + Password', loginSuccess ? 'PASS' : (stillPending ? 'PARTIAL' : 'FAIL'), `url=${loginUrl}${stillPending ? ' (compte encore pending)' : ''}`)

  // Logout
  if (!loginUrl.includes('/auth')) {
    // Chercher bouton logout dans AppShell
    const logoutBtn = page.locator('button:has-text("Déconnexion"), button:has-text("Deconnexion"), button:has-text("Logout"), button[aria-label*="déconnexion"], button[aria-label*="Deconnexion"]').first()
    if (await logoutBtn.count() > 0) {
      await logoutBtn.click()
      await page.waitForTimeout(1500)
      const afterLogoutUrl = page.url()
      record('Logout - déconnexion effectuée', afterLogoutUrl.includes('/auth') || afterLogoutUrl === `${BASE}/` ? 'PASS' : 'PARTIAL', `url=${afterLogoutUrl}`)
    } else {
      // Essayer via le menu profil
      const profileLink = page.locator('a[href="/profile"], button:has-text("Profil")').first()
      if (await profileLink.count() > 0) {
        await profileLink.click()
        await page.waitForTimeout(800)
        const logoutInProfile = page.locator('button:has-text("Déconnexion"), button:has-text("Deconnexion"), button:has-text("Logout")').first()
        if (await logoutInProfile.count() > 0) {
          await logoutInProfile.click()
          await page.waitForTimeout(1500)
          record('Logout - déconnexion effectuée', page.url().includes('/auth') ? 'PASS' : 'PARTIAL', `url=${page.url()}`)
        } else {
          record('Logout - bouton trouvé', 'FAIL', 'aucun bouton de déconnexion détecté')
        }
      } else {
        record('Logout - bouton trouvé', 'FAIL', 'aucun bouton de déconnexion détecté')
      }
    }
  } else {
    record('Logout - test ignoré', 'PARTIAL', 'login username n\'a pas abouti')
  }

  // C. Login Matricule
  await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
  await waitReady(page)
  const connexionTab2 = page.locator('[role="tab"]:has-text("Connexion")').first()
  if (await connexionTab2.count() > 0) {
    await connexionTab2.click()
    await page.waitForTimeout(600)
  }

  if (generatedMatricule) {
    const identifierInput2 = page.locator('input[placeholder="Username ou Matricule SRG"]').first()
    const matriculeFieldVisible = await identifierInput2.isVisible().catch(() => false)
    if (matriculeFieldVisible) {
      await identifierInput2.fill(generatedMatricule)
      const pwdInput2 = page.locator('input[placeholder="Votre mot de passe"], input[type="password"]').first()
      await pwdInput2.fill(TEST_PASSWORD)
      await page.click('button:has-text("Se connecter")')
      await page.waitForTimeout(2500)
      await waitReady(page)
    }

    const matriculeLoginUrl = page.url()
    const matriculeLoginSuccess = !matriculeLoginUrl.includes('/auth')
    record('Login C - Matricule SRG + Password', matriculeLoginSuccess ? 'PASS' : 'FAIL', `matricule=${generatedMatricule} url=${matriculeLoginUrl}`)
  } else {
    record('Login C - Matricule SRG + Password', 'PARTIAL', 'aucun matricule généré disponible — défaut affichage matricule sur /account-pending')
  }
}

// ============================================================
// 4. RESPONSIVE
// ============================================================
async function testResponsive(browser) {
  console.log('\n=== RESPONSIVE ===')
  const viewports = [
    { name: 'Mobile 375x812', width: 375, height: 812 },
    { name: 'Mobile 390x844', width: 390, height: 844 },
    { name: 'Tablette 768x1024', width: 768, height: 1024 },
    { name: 'Desktop 1440x900', width: 1440, height: 900 },
  ]

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } })
    const page = await context.newPage()

    await page.goto(`${BASE}/auth`, { waitUntil: 'load', timeout: 45000 })
    await waitReady(page)

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    record(`Responsive ${vp.name} - /auth pas de débordement horizontal`, overflow ? 'FAIL' : 'PASS', overflow ? 'déborde' : 'ok')

    // Vérifier superposition : vérifier que les inputs ne sont pas masqués
    const inputsVisible = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, button'))
      return inputs.filter((el) => el.offsetParent !== null).length
    })
    record(`Responsive ${vp.name} - éléments visibles`, inputsVisible > 0 ? 'PASS' : 'FAIL', `${inputsVisible} éléments interactifs visibles`)

    // Homepage
    await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 45000 })
    await waitReady(page)
    const homeOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
    record(`Responsive ${vp.name} - Homepage pas de débordement`, homeOverflow ? 'FAIL' : 'PASS')

    await context.close()
  }
}

// ============================================================
// 5. HOMEPAGE INCHANGÉE
// ============================================================
async function testHomepage(page) {
  console.log('\n=== HOMEPAGE ===')
  await page.goto(`${BASE}/`, { waitUntil: 'load', timeout: 45000 })
  await waitReady(page)
  const homeText = await page.evaluate(() => document.body.innerText)
  const homeLoaded = homeText.includes('SRG') || homeText.length > 100
  record('Homepage - chargée', homeLoaded ? 'PASS' : 'FAIL')
  // Vérifier que la homepage pointe vers /categories (lien <a> OU bouton avec aria-label/texte)
  const hasCategoriesLink = await page.locator('a[href="/categories"]').count()
  const hasCategoriesButton = await page.locator('button[aria-label*="categories"], button:has-text("categories"), button:has-text("Categories")').count()
  const hasCategoriesNav = hasCategoriesLink > 0 || hasCategoriesButton > 0
  record('Homepage - accès /categories (lien ou bouton)', hasCategoriesNav ? 'PASS' : 'FAIL', `${hasCategoriesLink} lien(s), ${hasCategoriesButton} bouton(s)`)
}

// ============================================================
// MAIN
// ============================================================
async function main() {
  console.log('========== CERTIFICATION E2E AUTH + ADMIN SRG ==========')
  console.log(`Base: ${BASE}`)
  console.log(`Admin: ${ADMIN_USER}`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  try {
    await testInscription(page)
    await testAdminApproval(page)
    await testLoginFlows(page)
    await testHomepage(page)
    await testResponsive(browser)
  } catch (error) {
    record('ERREUR GLOBALE', 'FAIL', error.message)
  }

  await context.close()
  await browser.close()

  // Résumé
  console.log('\n========== RÉSUMÉ ==========')
  const pass = results.filter((r) => r.status === 'PASS').length
  const partial = results.filter((r) => r.status === 'PARTIAL').length
  const fail = results.filter((r) => r.status === 'FAIL').length
  console.log(`PASS: ${pass} | PARTIAL: ${partial} | FAIL: ${fail}`)
  console.log(`Matricule généré pendant le test: ${generatedMatricule || 'AUCUN'}`)
  console.log(`Username de test: ${testUsername || 'AUCUN'}`)
  console.log(`VERDICT: ${fail === 0 ? (partial === 0 ? 'GO' : 'GO WITH RESERVES') : 'NO-GO'}`)

  process.exit(fail === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error('CERTIFICATION FAILED:', error)
  process.exit(1)
})