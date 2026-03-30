import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import { IconButton, Tooltip } from '@mui/material'
import { useNotesStore } from '../store/notes'

export const ThemeToggle = () => {
  const themeMode = useNotesStore((state) => state.settings.themeMode)
  const setThemeMode = useNotesStore((state) => state.setThemeMode)

  return (
    <Tooltip title={themeMode === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}>
      <IconButton
        color="inherit"
        onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
        aria-label="Переключить тему"
      >
        {themeMode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  )
}
