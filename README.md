# Yumenari Global

Landing page responsif untuk persiapan kerja dan program ke Jepang.

## Menjalankan

```bash
npm install
npm run dev
```

Pemeriksaan produksi: `npm run build`. Pemeriksaan gaya kode: `npm run lint`.

## Pendaftaran siswa dan deployment Vercel

Data pendaftaran disimpan di PostgreSQL melalui fungsi serverless `api/students.ts`. Fungsi memverifikasi bearer token Clerk di server dan membatasi akses data ke `userId` dari token. Browser tidak mengakses database atau secret key secara langsung.

1. Jalankan `database/schema.sql` satu kali pada database PostgreSQL untuk membuat tabel `yumenari_students`.
2. Tambahkan environment variables berikut di Vercel untuk setiap environment yang digunakan:
  - `VITE_CLERK_PUBLISHABLE_KEY` untuk client Clerk.
  - `CLERK_SECRET_KEY` untuk verifikasi sesi server.
  - `DATABASE_URL` atau `POSTGRES_URL` untuk koneksi PostgreSQL. API juga mengenali `POSTGRES_PRISMA_URL` dan `POSTGRES_URL_NON_POOLING`.
3. Isi environment variables yang sama pada `.env.local` untuk development. Jangan commit file environment atau mengirim nilainya lewat chat.
4. Redeploy project setelah SQL schema dan environment variables siap.

URL PostgreSQL dan secret Clerk adalah konfigurasi server-only, kecuali publishable key Clerk yang memang digunakan di client. Tabel menyimpan satu pendaftaran per akun Clerk.

## Konten dan aset

Teks, FAQ, pilihan program, jadwal, detail kontak, URL WhatsApp, dan aset hero berada di `src/content/site.ts`.

Letakkan logo asli tanpa mengubah artwork di `public/images/logo-gakkou.png` dan `public/images/logo-ygi.png`. Logo navbar dipilih lewat konstanta `NAVBAR_LOGO`; logo footer memakai `FOOTER_LOGO`. Jika file belum tersedia, halaman menampilkan placeholder.

Foto hero saat ini memakai gambar ilustratif dari Unsplash; ganti URL-nya pada `src/content/site.ts` dengan foto berlisensi dan disetujui brand sebelum publikasi.# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
