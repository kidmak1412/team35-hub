import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: '/team35-hub/', // <--- บรรทัดนี้สำคัญมาก! เปลี่ยน team35-hub เป็นชื่อ Repository ใน GitHub ของคุณ
})