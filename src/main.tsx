import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Shell from './Shell'
import { I18nProvider } from './lib/i18n'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <Shell />
    </I18nProvider>
  </StrictMode>,
)
