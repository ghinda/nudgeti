import fs from 'fs/promises'

const args = process.argv.slice(2)
let manifest = JSON.parse(await fs.readFile('./manifest.json', 'utf8'))
const firefox = {
  browser_specific_settings: {
    gecko: {
      id: '{8d602839-c5f4-4ef4-ad5d-216489973284}',
      strict_min_version: '42.0'
    }
  }
}

if (args.length && args[0] === 'firefox') {
  manifest = { ...manifest, ...firefox }
}

await fs.writeFile('./extension/manifest.json', JSON.stringify(manifest, null, 2))
