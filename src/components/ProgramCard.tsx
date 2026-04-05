import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import { alpha, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { WEEKDAY_OPTIONS, type WorkoutProgram } from '../store/notes'

interface ProgramCardProps {
  program: WorkoutProgram
}

export const ProgramCard = ({ program }: ProgramCardProps) => (
  <Card
    sx={{
      height: '100%',
      backgroundImage: program.pinned
        ? 'linear-gradient(180deg, rgba(245,166,35,0.15), transparent 58%)'
        : 'none',
    }}
  >
    <CardActionArea component={RouterLink} to={`/program/${program.id}`} sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Typography variant="h6">{program.name}</Typography>
              <Typography color="text.secondary">{program.goal}</Typography>
            </Stack>
            {program.pinned ? <PushPinRoundedIcon color="primary" /> : null}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {program.days.map((day) => (
              <Chip
                key={day.id}
                size="small"
                icon={<CalendarTodayRoundedIcon />}
                label={WEEKDAY_OPTIONS.find((item) => item.value === day.weekday)?.label ?? 'День'}
                sx={{ backgroundColor: alpha('#F5A623', 0.12) }}
              />
            ))}
          </Stack>

          <Typography variant="body2" color="text.secondary" mt="auto">
            {program.durationWeeks} недель · {program.days.length} тренировочных дня
          </Typography>
        </Stack>
      </CardContent>
    </CardActionArea>
  </Card>
)
