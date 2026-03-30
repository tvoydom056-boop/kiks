import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded'
import { alpha, Box, Button, Stack, Typography, useTheme } from '@mui/material'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => {
  const theme = useTheme()

  return (
    <Stack
      spacing={2}
      alignItems="center"
      textAlign="center"
      sx={{
        py: 8,
        px: 3,
        borderRadius: 4,
        border: `1px dashed ${alpha(theme.palette.primary.main, 0.4)}`,
        background:
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(245,166,35,0.08), rgba(28,28,28,0.92))'
            : 'linear-gradient(180deg, rgba(245,166,35,0.12), rgba(255,255,255,0.96))',
      }}
    >
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.14),
          boxShadow: `0 18px 36px ${alpha(theme.palette.primary.main, 0.18)}`,
        }}
      >
        <EditNoteRoundedIcon color="primary" sx={{ fontSize: 38 }} />
      </Box>
      <Stack spacing={1} maxWidth={420}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>
      {actionLabel && onAction ? (
        <Button variant="contained" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}
