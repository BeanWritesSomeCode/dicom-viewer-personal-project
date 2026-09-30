import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteCommonjs } from '@originjs/vite-plugin-commonjs'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // for dicom-parser
    viteCommonjs(),
    tailwindcss(),
  ],
  // for dev mode
  optimizeDeps: {
    exclude:['@cornerstonejs/dicom-image-loader'],
    include:['dicom-parser'],
  },
  worker: {
    format: 'es',
  },
})
