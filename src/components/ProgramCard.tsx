import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import { alpha, Card, CardActionArea, CardContent, Chip, IconButton, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { WEEKDAY_OPTIONS, type WorkoutProgram } from '../store/notes'

interface ProgramCardProps {
  program: WorkoutProgram
  onEdit?: (program: WorkoutProgram) => void
  onDelete?: (program: WorkoutProgram) => void
}

export const ProgramCard = ({ program, onEdit, onDelete }: ProgramCardProps) => {
  const totalWorkingSets = program.days.reduce((sum, day) => sum + day.trainingPlan.workingSets.length, 0)
  const totalDrills = program.days.reduce((sum, day) => sum + day.trainingPlan.drillMoments.length, 0)

  return (
    <Card
      sx={{
        height: '100%',
        backgroundImage: program.pinned
          ? 'linear-gradient(180deg, rgba(245,166,35,0.15), transparent 58%)'
          : 'none',
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={1}>
              <Typography variant="h6">{program.name}</Typography>
              <Typography color="text.secondary">{program.goal}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              {program.pinned ? <PushPinRoundedIcon color="primary" /> : null}
              {onEdit ? (
                <IconButton size="small" onClick={() => onEdit(program)} aria-label="Редактировать цикл">
                  <EditRoundedIcon fontSize="small" />
                </IconButton>
              ) : null}
              {onDelete ? (
                <IconButton size="small" onClick={() => onDelete(program)} aria-label="Удалить цикл">
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              ) : null}
            </Stack>
          </Stack>

          <CardActionArea component={RouterLink} to={`/program/${program.id}`} sx={{ borderRadius: 3, p: 0.5, mt: -0.5 }}>
            <Stack spacing={2} sx={{ p: 1 }}>
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

              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip size="small" label={`${totalWorkingSets} рабочих блоков`} />
                <Chip size="small" variant="outlined" label={`${totalDrills} отработки`} />
              </Stack>

              <Typography variant="body2" color="text.secondary">
                {program.durationWeeks} недель · {program.days.length} дня подготовки
              </Typography>
            </Stack>
          </CardActionArea>
        </Stack>
      </CardContent>
    </Card>
  )
}
