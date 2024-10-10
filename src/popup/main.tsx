import { ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Form from './components/Form.tsx'
import './main.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={{}}>
      <Form />
    </ThemeProvider>
  </StrictMode>,
)
