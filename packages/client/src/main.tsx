import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { partyHostAtom } from '@fake-goes-party/common'
import { createStore, Provider } from 'jotai'

const store = createStore()
store.set(partyHostAtom, import.meta.env.VITE_PARTYKIT_HOST || "localhost:1999")

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
