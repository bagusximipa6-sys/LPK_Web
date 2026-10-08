import { verifyToken } from '@clerk/backend'
import postgres from 'postgres'
import type { VercelRequest, VercelResponse } from '@vercel/node'

type StudentInput = {
  fullName: string
  phone: string
  birthDate: string
  gender: string
  address: string
  education: string
  program: string
}

type StudentRow = StudentInput & {
  updatedAt: string
}

const allowedGenders = new Set(['Laki-laki', 'Perempuan'])
const allowedEducation = new Set(['SMP/sederajat', 'SMA/SMK/sederajat', 'Diploma', 'Sarjana', 'Lainnya'])
const allowedPrograms = new Set([
  'Bahasa Jepang dan kaiwa',
  'Persiapan kerja Jepang',
  'Persiapan JFT/JLPT',
  'Persiapan interview dan budaya kerja',
  'Program terkait SSW/Tokutei Ginou',
])

let sqlClient: ReturnType<typeof postgres> | undefined

function getSqlClient() {
  const databaseUrl = process.env.DATABASE_URL
    ?? process.env.POSTGRES_URL
    ?? process.env.POSTGRES_PRISMA_URL
    ?? process.env.POSTGRES_URL_NON_POOLING

  if (!databaseUrl) throw new Error('PostgreSQL connection environment variable is missing')
  sqlClient ??= postgres(databaseUrl, { max: 1, prepare: false, idle_timeout: 20, connect_timeout: 10 })
  return sqlClient
}

function sendError(response: VercelResponse, status: number, error: string) {
  return response.status(status).json({ error })
}

function readStudentInput(body: unknown): StudentInput | null {
  if (!body || typeof body !== 'object') return null
  const value = body as Record<string, unknown>
  const keys: (keyof StudentInput)[] = ['fullName', 'phone', 'birthDate', 'gender', 'address', 'education', 'program']

  if (keys.some((key) => typeof value[key] !== 'string')) return null

  const input = Object.fromEntries(keys.map((key) => [key, (value[key] as string).trim()])) as StudentInput
  const parsedBirthDate = /^\d{4}-\d{2}-\d{2}$/.test(input.birthDate)
    ? new Date(`${input.birthDate}T00:00:00.000Z`)
    : null
  if (
    input.fullName.length < 2 || input.fullName.length > 160
    || input.phone.length < 8 || input.phone.length > 32
    || !/^[+\d().\-\s]+$/.test(input.phone)
    || input.address.length < 5 || input.address.length > 1000
    || !parsedBirthDate
    || Number.isNaN(parsedBirthDate.valueOf())
    || parsedBirthDate.toISOString().slice(0, 10) !== input.birthDate
    || !allowedGenders.has(input.gender)
    || !allowedEducation.has(input.education)
    || !allowedPrograms.has(input.program)
  ) return null

  return input
}

function toStudent(row: Record<string, unknown>): StudentRow {
  return {
    fullName: String(row.full_name),
    phone: String(row.phone),
    birthDate: String(row.birth_date),
    gender: String(row.gender),
    address: String(row.address),
    education: String(row.education),
    program: String(row.program),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'private, no-store, max-age=0')
  response.setHeader('Vary', 'Authorization')
  response.setHeader('Allow', 'GET, PUT')

  if (request.method !== 'GET' && request.method !== 'PUT') {
    return sendError(response, 405, 'Method not allowed')
  }

  const secretKey = process.env.CLERK_SECRET_KEY
  if (!secretKey) return sendError(response, 500, 'Layanan pendaftaran belum dikonfigurasi.')

  const authorization = request.headers.authorization
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!bearer) return sendError(response, 401, 'Silakan masuk untuk mengakses data pendaftaran.')

  let userId: string
  try {
    const claims = await verifyToken(bearer, { secretKey })
    if (typeof claims.sub !== 'string' || !claims.sub.startsWith('user_')) {
      return sendError(response, 401, 'Sesi masuk tidak valid. Silakan masuk kembali.')
    }
    userId = claims.sub
  } catch {
    return sendError(response, 401, 'Sesi masuk tidak valid atau sudah berakhir. Silakan masuk kembali.')
  }

  try {
    const sql = getSqlClient()

    if (request.method === 'GET') {
      const rows = await sql<Record<string, unknown>[]>`
        SELECT full_name, phone, birth_date::text AS birth_date, gender, address, education, program, updated_at
        FROM yumenari_students
        WHERE clerk_user_id = ${userId}
        LIMIT 1
      `
      return response.status(200).json({ student: rows[0] ? toStudent(rows[0]) : null })
    }

    const input = readStudentInput(request.body)
    if (!input) return sendError(response, 400, 'Periksa kembali data pendaftaran yang diisi.')

    const rows = await sql<Record<string, unknown>[]>`
      INSERT INTO yumenari_students (
        clerk_user_id, full_name, phone, birth_date, gender, address, education, program, updated_at
      ) VALUES (
        ${userId}, ${input.fullName}, ${input.phone}, ${input.birthDate}, ${input.gender},
        ${input.address}, ${input.education}, ${input.program}, NOW()
      )
      ON CONFLICT (clerk_user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        birth_date = EXCLUDED.birth_date,
        gender = EXCLUDED.gender,
        address = EXCLUDED.address,
        education = EXCLUDED.education,
        program = EXCLUDED.program,
        updated_at = NOW()
      RETURNING full_name, phone, birth_date::text AS birth_date, gender, address, education, program, updated_at
    `

    return response.status(200).json({ student: toStudent(rows[0]) })
  } catch {
    return sendError(response, 500, 'Database pendaftaran belum siap. Periksa koneksi dan schema database.')
  }
}
