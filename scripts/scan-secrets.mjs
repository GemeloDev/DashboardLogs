import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const ignoredDirs = new Set(['.git', 'node_modules', 'dist', '.quasar', 'certs'])
const ignoredFiles = new Set(['package-lock.json'])
const findings = []

const privateKeyRegex = new RegExp('-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE ' + 'KEY-----')

const patterns = [
  { name: 'private key', regex: privateKeyRegex },
  { name: 'generic secret assignment', regex: /\b(?:secret|api[_-]?key|apikey|password|passwd|token)\b\s*[:=]\s*['"][A-Za-z0-9_\-./+=]{20,}['"]/i },
  { name: 'bearer token', regex: /\bBearer\s+[A-Za-z0-9_\-.=]{20,}/i },
  { name: 'jwt', regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
]

const scanFile = (file) => {
  if (ignoredFiles.has(relative(root, file).replaceAll('\\', '/'))) return

  let content
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    return
  }

  const lines = content.split(/\r?\n/)
  lines.forEach((line, index) => {
    for (const pattern of patterns) {
      if (pattern.regex.test(line)) {
        findings.push({
          file: relative(root, file),
          line: index + 1,
          type: pattern.name,
        })
      }
    }
  })
}

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue

    const path = join(dir, entry)
    const stat = statSync(path)

    if (stat.isDirectory()) {
      walk(path)
    } else if (stat.isFile()) {
      scanFile(path)
    }
  }
}

walk(root)

if (findings.length) {
  console.error('Potential secrets found:')
  findings.forEach((finding) => {
    console.error(`- ${finding.file}:${finding.line} (${finding.type})`)
  })
  process.exit(1)
}

console.log('No obvious secrets found.')
