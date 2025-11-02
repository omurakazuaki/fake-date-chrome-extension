import { createTheme, ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Form from './components/Form.tsx'
import './main.css'

const theme = createTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <Form />
    </ThemeProvider>
  </StrictMode>,
)
