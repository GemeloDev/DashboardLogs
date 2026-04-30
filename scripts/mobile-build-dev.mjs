import fs from 'node:fs'
import { spawn } from 'node:child_process'

const isWindows = process.platform === 'win32'

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {}
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce((env, line) => {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        return env
      }

      const separatorIndex = trimmed.indexOf('=')

      if (separatorIndex === -1) {
        return env
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

      if (key) {
        env[key] = value
      }

      return env
    }, {})
}

function run(command, args, options = {}) {
  if (isWindows) {
    return spawn('cmd.exe', ['/d', '/s', '/c', command, ...args], {
      shell: false,
      stdio: 'inherit',
      ...options,
    })
  }

  return spawn(command, args, {
    shell: false,
    stdio: 'inherit',
    ...options,
  })
}

const env = {
  ...process.env,
  ...readEnvFile('.env'),
  ...readEnvFile('.env.development'),
}

const build = run('npx', ['quasar', 'build', '-m', 'capacitor', '-T', 'android'], { env })

build.on('exit', (code) => {
  process.exit(code ?? 0)
})

build.on('error', (error) => {
  console.error(error)
  process.exit(1)
})
