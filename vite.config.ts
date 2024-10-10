import { crx, defineManifest } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const manifest = defineManifest({
  manifest_version: 3,
  name: 'Fake Date',
  description: 'JavaScriptのDateオブジェクトをモック化します。',
  version: '1.0.0',
  permissions: ['storage', 'tabs', 'scripting'],
  host_permissions: ['<all_urls>'],
  action: {
    default_icon: 'icon128.png',
    default_title: 'Fake Date',
    default_popup: 'src/popup/index.html',
  },
  background: {
    service_worker: 'src/background/index.ts',
  },
})

export default defineConfig({
  plugins: [react(), crx({ manifest })],
})
