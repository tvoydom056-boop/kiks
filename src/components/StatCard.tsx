import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string
  caption: string
  icon: ReactNode
}

export const StatCard = ({ label, value, caption, icon }: StatCardProps) => (
  <Card>
    <CardContent>
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography color="text.secondary">{label}</Typography>
          {icon}
        </Stack>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {caption}
        </Typography>
      </Stack>
    </CardContent>
  </Card>
)
