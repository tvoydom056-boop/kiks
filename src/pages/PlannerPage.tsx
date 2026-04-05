import AddRoundedIcon from '@mui/icons-material/AddRounded'
import LibraryAddRoundedIcon from '@mui/icons-material/LibraryAddRounded'
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded'
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fab,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { CreateExerciseDialog } from '../components/CreateExerciseDialog'
import { CreateProgramDrawer } from '../components/CreateProgramDrawer'
import { EmptyState } from '../components/EmptyState'
import { ProgramCard } from '../components/ProgramCard'
import { useNotesStore } from '../store/notes'

export const PlannerPage = () => {
  const [programDrawerOpen, setProgramDrawerOpen] = useState(false)
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false)
  const programs = useNotesStore((state) => state.programs)
  const templates = useNotesStore((state) => state.exerciseTemplates)
  const prescriptions = useNotesStore((state) => state.prescriptions)

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
        <Stack spacing={3}>
          <AppHeader
            title="Планирование"
            subtitle="Соберите недельные сплиты, храните библиотеку упражнений и заранее задавайте рабочие схемы."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setProgramDrawerOpen(true)}
            >
              Новая программа
            </Button>
            <Button
              variant="outlined"
              startIcon={<LibraryAddRoundedIcon />}
              onClick={() => setExerciseDialogOpen(true)}
            >
              Добавить упражнение
            </Button>
          </Stack>

          {programs.length ? (
            <Stack
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {programs.map((program) => (
                <ProgramCard key={program.id} program={program} />
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="Программ пока нет"
              description="Создайте недельный или месячный план, чтобы календарь и аналитика начали работать как система."
              actionLabel="Создать программу"
              onAction={() => setProgramDrawerOpen(true)}
            />
          )}

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Библиотека упражнений</Typography>
                  <MonitorWeightRoundedIcon color="primary" />
                </Stack>
                {templates.map((template) => {
                  const prescription = prescriptions.find((item) => item.templateId === template.id)

                  return (
                    <Stack
                      key={template.id}
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      spacing={1.5}
                      sx={{ py: 1.25, borderBottom: '1px solid', borderColor: 'divider' }}
                    >
                      <Stack spacing={0.75}>
                        <Typography>{template.name}</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip size="small" label={template.muscleGroup} />
                          <Chip size="small" variant="outlined" label={template.equipment} />
                        </Stack>
                      </Stack>
                      <Typography color="text.secondary">
                        {prescription
                          ? `${prescription.sets}×${prescription.reps} · ${prescription.weightKg} кг · отдых ${prescription.restSec} сек`
                          : 'Схема ещё не задана'}
                      </Typography>
                    </Stack>
                  )
                })}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>

      <Fab
        color="primary"
        aria-label="Создать программу"
        onClick={() => setProgramDrawerOpen(true)}
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <AddRoundedIcon />
      </Fab>

      <CreateProgramDrawer open={programDrawerOpen} onClose={() => setProgramDrawerOpen(false)} />
      <CreateExerciseDialog open={exerciseDialogOpen} onClose={() => setExerciseDialogOpen(false)} />
    </>
  )
}
