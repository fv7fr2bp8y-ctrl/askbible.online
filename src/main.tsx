import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PoetryApp } from './App'
import { I18nProvider } from './lib/i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <PoetryApp />
    </I18nProvider>
  </StrictMode>,
)
