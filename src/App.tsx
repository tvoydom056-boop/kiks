import { CssBaseline, ThemeProvider } from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers'
import 'dayjs/locale/ru'
import { useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BlockPage } from './pages/BlockPage'
import { Home } from './pages/Home'
import { NoteEditor } from './pages/NoteEditor'
import { Settings } from './pages/Settings'
import { useNotesStore } from './store/notes'
import { createAppTheme } from './theme'

const App = () => {
  const themeMode = useNotesStore((state) => state.settings.themeMode)
  const fontSize = useNotesStore((state) => state.settings.fontSize)
  const theme = useMemo(() => createAppTheme(themeMode, fontSize), [fontSize, themeMode])

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/block/:id" element={<BlockPage />} />
            <Route path="/block/:id/note/:noteId" element={<NoteEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
