import react from '@vitejs/plugin-react'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import studentsHandler from './api/students.js'

function studentsApiDevPlugin(localEnv: Record<string, string>): Plugin {
  return {
    name: 'students-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/students', async (request, response, next) => {
        if (request.method !== 'GET' && request.method !== 'PUT') {
          next()
          return
        }

        try {
          for (const key of [
            'CLERK_SECRET_KEY',
            'DATABASE_URL',
            'POSTGRES_URL',
            'POSTGRES_PRISMA_URL',
            'POSTGRES_URL_NON_POOLING',
          ]) {
            if (!process.env[key] && localEnv[key]) process.env[key] = localEnv[key]
          }

          let body: unknown
          if (request.method === 'PUT') {
            const chunks: Buffer[] = []
            let size = 0
            for await (const chunk of request) {
              const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
              size += buffer.length
              if (size > 16_384) {
                response.statusCode = 413
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify({ error: 'Ukuran data pendaftaran terlalu besar.' }))
                return
              }
              chunks.push(buffer)
            }
            try {
              body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
            } catch {
              response.statusCode = 400
              response.setHeader('Content-Type', 'application/json')
              response.end(JSON.stringify({ error: 'Format data pendaftaran tidak valid.' }))
              return
            }
          }

          const vercelRequest = Object.assign(request, { body, query: {}, cookies: {} }) as VercelRequest
          const vercelResponse = Object.assign(response, {
            status(statusCode: number) {
              response.statusCode = statusCode
              return vercelResponse
            },
            json(value: unknown) {
              response.setHeader('Content-Type', 'application/json; charset=utf-8')
              response.end(JSON.stringify(value))
              return vercelResponse
            },
            send(value: unknown) {
              response.end(value)
              return vercelResponse
            },
          }) as VercelResponse

          await studentsHandler(vercelRequest, vercelResponse)
        } catch {
          if (!response.headersSent) {
            response.statusCode = 500
            response.setHeader('Content-Type', 'application/json')
            response.end(JSON.stringify({ error: 'Layanan pendaftaran tidak dapat dijangkau.' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), studentsApiDevPlugin(loadEnv(mode, process.cwd(), ''))],
}))
