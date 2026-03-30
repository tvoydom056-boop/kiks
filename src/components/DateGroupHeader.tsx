import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import { Box, Stack, Typography, useTheme } from '@mui/material'

interface DateGroupHeaderProps {
  label: string
}

export const DateGroupHeader = ({ label }: DateGroupHeaderProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        py: 1,
        backdropFilter: 'blur(18px)',
        backgroundColor:
          theme.palette.mode === 'dark' ? 'rgba(13,13,13,0.82)' : 'rgba(250,250,250,0.86)',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <CalendarMonthRoundedIcon color="primary" fontSize="small" />
        <Typography variant="subtitle1">{label}</Typography>
      </Stack>
    </Box>
  )
}
