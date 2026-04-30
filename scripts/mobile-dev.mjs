import http from 'node:http'
import { spawn } from 'node:child_process'

const PORT = Number(process.env.MOBILE_DEV_PORT || 9000)
const HOST = process.env.MOBILE_DEV_HOST || 'localhost'
const DEFAULT_TARGET = process.env.MOBILE_TARGET || 'RZCXB11DAYX'

const args = process.argv.slice(2)
const targetIndex = args.indexOf('--target')
const target = targetIndex >= 0 && args[targetIndex + 1] ? args[targetIndex + 1] : DEFAULT_TARGET
const isWindows = process.platform === 'win32'

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

function waitForServer(url, timeoutMs = 60000) {
  const startedAt = Date.now()

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume()
        resolve()
      })

      request.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`No se pudo conectar con ${url}`))
          return
        }

        setTimeout(check, 1000)
      })

      request.setTimeout(2000, () => {
        request.destroy()
      })
    }

    check()
  })
}

const quasar = run('npx', ['quasar', 'dev', '-H', '0.0.0.0', '-p', String(PORT)], {
  env: {
    ...process.env,
    QUASAR_MOBILE_DEV: 'true',
  },
})

const shutdown = () => {
  if (!quasar.killed) {
    quasar.kill()
  }
}

process.on('SIGINT', () => {
  shutdown()
  process.exit(130)
})

process.on('SIGTERM', () => {
  shutdown()
  process.exit(143)
})

try {
  await waitForServer(`http://127.0.0.1:${PORT}/`)

  const capacitor = run(
    'npx',
    [
      'cap',
      'run',
      'android',
      '--target',
      target,
      '--live-reload',
      '--host',
      HOST,
      '--port',
      String(PORT),
      '--forwardPorts',
      `${PORT}:${PORT}`,
    ],
    {
      cwd: 'src-capacitor',
    },
  )

  capacitor.on('exit', (code) => {
    shutdown()
    process.exit(code ?? 0)
  })
} catch (error) {
  console.error(error.message)
  shutdown()
  process.exit(1)
}
