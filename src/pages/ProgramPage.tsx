import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import SportsMmaRoundedIcon from '@mui/icons-material/SportsMmaRounded'
import { Button, Card, CardContent, Chip, Container, Divider, Stack, Typography } from '@mui/material'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useNotesStore, WEEKDAY_OPTIONS } from '../store/notes'

export const ProgramPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const programs = useNotesStore((state) => state.programs)
  const templates = useNotesStore((state) => state.exerciseTemplates)
  const prescriptions = useNotesStore((state) => state.prescriptions)
  const program = programs.find((item) => item.id === id)

  if (!program) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <EmptyState
          title="Цикл не найден"
          description="Вернитесь в планировщик и выберите другой цикл."
          actionLabel="К циклам"
          onAction={() => navigate('/planner')}
        />
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
      <Stack spacing={3}>
        <Button
          component={RouterLink}
          to="/planner"
          startIcon={<ArrowBackRoundedIcon />}
          color="inherit"
          sx={{ alignSelf: 'flex-start' }}
        >
          К циклам
        </Button>

        <Stack spacing={1}>
          <Typography variant="h4">{program.name}</Typography>
          <Typography color="text.secondary">{program.goal}</Typography>
          <Typography variant="body2" color="text.secondary">
            Длительность: {program.durationWeeks} недель
          </Typography>
        </Stack>

        {program.days.map((day) => (
          <Card key={day.id}>
            <CardContent>
              <Stack spacing={2.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <div>
                    <Typography variant="h6">{day.title}</Typography>
                    <Typography color="text.secondary">
                      {WEEKDAY_OPTIONS.find((item) => item.value === day.weekday)?.label}
                    </Typography>
                  </div>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {day.focus.map((focus) => (
                      <Chip key={focus} label={focus} color="primary" size="small" />
                    ))}
                  </Stack>
                </Stack>

                <Stack spacing={1.25}>
                  <Typography variant="subtitle2">Библиотека движений дня</Typography>
                  {day.exerciseIds.map((exerciseId) => {
                    const template = templates.find((item) => item.id === exerciseId)
                    const prescription = prescriptions.find((item) => item.templateId === exerciseId)

                    if (!template) {
                      return null
                    }

                    return (
                      <Stack
                        key={exerciseId}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ p: 1.5, borderRadius: 3, backgroundColor: 'background.default' }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <SportsMmaRoundedIcon color="primary" fontSize="small" />
                          <Typography>{template.name}</Typography>
                        </Stack>
                        <Typography color="text.secondary">
                          {prescription
                            ? `${prescription.sets}×${prescription.reps} · ${prescription.weightKg} кг · отдых ${prescription.restSec} сек`
                            : 'Схема будет добавлена позже'}
                        </Typography>
                      </Stack>
                    )
                  })}
                </Stack>

                <Divider />

                <Stack spacing={2}>
                  <Typography variant="subtitle2">План на тренировку</Typography>

                  <Stack spacing={1.25}>
                    <Typography variant="body2" color="text.secondary">
                      Рабочие подходы
                    </Typography>
                    {day.trainingPlan.workingSets.map((workingSet) => (
                      <Stack
                        key={workingSet.id}
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        spacing={1}
                        sx={{ p: 1.5, borderRadius: 3, backgroundColor: 'background.default' }}
                      >
                        <Typography>{workingSet.title}</Typography>
                        <Typography color="text.secondary">
                          {workingSet.sets}×{workingSet.reps} · {workingSet.loadKg} кг · отдых {workingSet.restSec} сек
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Моменты отработки
                    </Typography>
                    {day.trainingPlan.drillMoments.map((item) => (
                      <Chip key={item} label={item} variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                    ))}
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      На чем делать акцент во время борьбы
                    </Typography>
                    {day.trainingPlan.matchFocusPoints.map((item) => (
                      <Chip key={item} label={item} color="primary" sx={{ alignSelf: 'flex-start' }} />
                    ))}
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  )
}
