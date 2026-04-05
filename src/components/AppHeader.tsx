import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import HomeRoundedIcon from '@mui/icons-material/HomeRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { IconButton, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { ThemeToggle } from './ThemeToggle'

interface AppHeaderProps {
  title: string
  subtitle: string
}

const navItems = [
  { to: '/', label: 'Дашборд', icon: <HomeRoundedIcon /> },
  { to: '/planner', label: 'Планы', icon: <FitnessCenterRoundedIcon /> },
  { to: '/calendar', label: 'Календарь', icon: <CalendarMonthRoundedIcon /> },
]

export const AppHeader = ({ title, subtitle }: AppHeaderProps) => {
  const location = useLocation()

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="h3">{title}</Typography>
          <Typography color="text.secondary">{subtitle}</Typography>
        </Stack>

        <Stack direction="row" spacing={0.5}>
          <IconButton component={RouterLink} to="/settings" color="inherit" aria-label="Настройки">
            <SettingsRoundedIcon />
          </IconButton>
          <ThemeToggle />
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {navItems.map((item) => (
          <IconButton
            key={item.to}
            component={RouterLink}
            to={item.to}
            color={location.pathname === item.to ? 'primary' : 'default'}
            aria-label={item.label}
          >
            {item.icon}
          </IconButton>
        ))}
      </Stack>
    </Stack>
  )
}
