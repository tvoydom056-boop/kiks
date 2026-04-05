import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import LibraryAddRoundedIcon from '@mui/icons-material/LibraryAddRounded'
import SportsMmaRoundedIcon from '@mui/icons-material/SportsMmaRounded'
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fab,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { CreateExerciseDialog } from '../components/CreateExerciseDialog'
import { CreateProgramDrawer } from '../components/CreateProgramDrawer'
import { EmptyState } from '../components/EmptyState'
import { ProgramCard } from '../components/ProgramCard'
import { useNotesStore, type ExerciseTemplate, type ExercisePrescription, type WorkoutProgram } from '../store/notes'

export const PlannerPage = () => {
  const [programDrawerOpen, setProgramDrawerOpen] = useState(false)
  const [exerciseDialogOpen, setExerciseDialogOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<WorkoutProgram | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<ExerciseTemplate | null>(null)
  const [editingPrescription, setEditingPrescription] = useState<ExercisePrescription | null>(null)
  const programs = useNotesStore((state) => state.programs)
  const templates = useNotesStore((state) => state.exerciseTemplates)
  const prescriptions = useNotesStore((state) => state.prescriptions)
  const deleteProgram = useNotesStore((state) => state.deleteProgram)
  const deleteExerciseTemplate = useNotesStore((state) => state.deleteExerciseTemplate)

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
        <Stack spacing={3}>
          <AppHeader
            title="План подготовки"
            subtitle="Соберите циклы под армрестлинг, храните библиотеку движений и задавайте план на тренировку внутри каждого дня."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => {
                setEditingProgram(null)
                setProgramDrawerOpen(true)
              }}
            >
              Новый цикл
            </Button>
            <Button
              variant="outlined"
              startIcon={<LibraryAddRoundedIcon />}
              onClick={() => {
                setEditingTemplate(null)
                setEditingPrescription(null)
                setExerciseDialogOpen(true)
              }}
            >
              Добавить движение
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
                <ProgramCard
                  key={program.id}
                  program={program}
                  onEdit={(currentProgram) => {
                    setEditingProgram(currentProgram)
                    setProgramDrawerOpen(true)
                  }}
                  onDelete={(currentProgram) => deleteProgram(currentProgram.id)}
                />
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="Циклов пока нет"
              description="Создайте первый план подготовки, чтобы календарь, дашборд и деталка программы начали работать как единая система."
              actionLabel="Создать цикл"
              onAction={() => setProgramDrawerOpen(true)}
            />
          )}

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Библиотека движений</Typography>
                  <SportsMmaRoundedIcon color="primary" />
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
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                        <Typography color="text.secondary">
                          {prescription
                            ? `${prescription.sets}×${prescription.reps} · ${prescription.weightKg} кг · отдых ${prescription.restSec} сек`
                            : 'Схема ещё не задана'}
                        </Typography>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditingTemplate(template)
                              setEditingPrescription(prescription ?? null)
                              setExerciseDialogOpen(true)
                            }}
                          >
                            <EditRoundedIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => deleteExerciseTemplate(template.id)}>
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </Stack>
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
        aria-label="Создать цикл"
        onClick={() => {
          setEditingProgram(null)
          setProgramDrawerOpen(true)
        }}
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <AddRoundedIcon />
      </Fab>

      <CreateProgramDrawer
        open={programDrawerOpen}
        onClose={() => {
          setProgramDrawerOpen(false)
          setEditingProgram(null)
        }}
        initialProgram={editingProgram}
      />
      <CreateExerciseDialog
        open={exerciseDialogOpen}
        onClose={() => {
          setExerciseDialogOpen(false)
          setEditingTemplate(null)
          setEditingPrescription(null)
        }}
        initialTemplate={editingTemplate}
        initialPrescription={editingPrescription}
      />
    </>
  )
}
