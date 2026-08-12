import fs from 'node:fs'
import path from 'node:path'
import JSZip from 'jszip'

const outDir = path.resolve('tmp')
fs.mkdirSync(outDir, { recursive: true })

async function writeZip(name, build) {
  const zip = new JSZip()
  await build(zip)
  const buffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 9 } })
  const full = path.join(outDir, name)
  fs.writeFileSync(full, buffer)
  return { full, size: buffer.byteLength }
}

const created = []

created.push(
  await writeZip('cert-good.zip', async (zip) => {
    zip.file('test.txt', 'SRG certification text file')
    zip.file('rapport.md', '# Rapport\n\nContenu du rapport de certification.')
    zip.file('donnees.json', JSON.stringify({ type: 'certification', ok: true }, null, 2))
    zip.file('sous-dossier/test2.txt', 'Sous dossier test')
  }),
)

created.push(
  await writeZip('cert-too-many.zip', async (zip) => {
    for (let i = 1; i <= 420; i += 1) {
      zip.file(`bulk/f${i}.txt`, `file ${i}`)
    }
  }),
)

created.push(
  await writeZip('cert-dangerous.zip', async (zip) => {
    zip.file('readme.txt', 'safe file')
    zip.file('scripts/evil.ps1', 'Write-Host "danger"')
  }),
)

created.push(
  await writeZip('cert-traversal.zip', async (zip) => {
    zip.file('../escape.txt', 'traversal attempt')
    zip.file('nested/ok.txt', 'ok file')
  }),
)

created.push(
  await writeZip('cert-too-large.zip', async (zip) => {
    const big = 'A'.repeat(130 * 1024 * 1024)
    zip.file('huge/big.txt', big)
  }),
)

console.log(JSON.stringify(created, null, 2))
