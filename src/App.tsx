import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useMemo } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CalendarPage } from './pages/CalendarPage'
import { Home } from './pages/Home'
import { NotesPage } from './pages/NotesPage'
import { PlannerPage } from './pages/PlannerPage'
import { ProgramPage } from './pages/ProgramPage'
import { Settings } from './pages/Settings'
import { useNotesStore } from './store/notes'
import { createAppTheme } from './theme'

dayjs.locale('ru')

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
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/program/:id" element={<ProgramPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
