# Yumenari Global

Landing page responsif untuk informasi persiapan kerja dan program ke Jepang serta Korea.

## Menjalankan

```bash
npm install
npm run dev
```

Pemeriksaan produksi: `npm run build`. Pemeriksaan gaya kode: `npm run lint`.

## Konten dan aset

Teks, FAQ, pilihan program, jadwal, detail kontak, URL WhatsApp, dan aset hero berada di `src/content/site.ts`. Ganti placeholder dalam file tersebut sebelum publikasi. Sampai nomor WhatsApp resmi dimasukkan, CTA konsultasi menuju bagian kontak.

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
