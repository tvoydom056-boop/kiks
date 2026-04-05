import { zodResolver } from '@hookform/resolvers/zod'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import {
  Button,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { MUSCLE_GROUPS, WEEKDAY_OPTIONS, useNotesStore, type WorkoutProgram } from '../store/notes'

const workingSetSchema = z.object({
  id: z.string(),
  title: z.string().min(2, 'Минимум 2 символа'),
  sets: z.number().min(1).max(10),
  reps: z.number().min(1).max(30),
  loadKg: z.number().min(0).max(200),
  restSec: z.number().min(15).max(300),
})

const trainingPlanSchema = z.object({
  workingSets: z.array(workingSetSchema).min(1, 'Добавьте хотя бы один рабочий подход'),
  drillMoments: z.array(z.string().min(2, 'Минимум 2 символа')).min(1, 'Добавьте хотя бы один момент отработки'),
  matchFocusPoints: z
    .array(z.string().min(2, 'Минимум 2 символа'))
    .min(1, 'Добавьте хотя бы один акцент на борьбу'),
})

const daySchema = z.object({
  id: z.string(),
  weekday: z.number().min(0).max(6),
  title: z.string().min(2, 'Минимум 2 символа'),
  focus: z.array(z.enum(MUSCLE_GROUPS)).min(1, 'Выберите хотя бы одну зону акцента'),
  exerciseIds: z.array(z.string()).min(1, 'Добавьте хотя бы одно движение'),
  trainingPlan: trainingPlanSchema,
})

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  goal: z.string().min(10, 'Опишите цель цикла'),
  durationWeeks: z.number().min(1).max(52),
  pinned: z.boolean(),
  days: z.array(daySchema).min(1, 'Нужен хотя бы один тренировочный день'),
})

type FormValues = z.infer<typeof schema>

interface CreateProgramDrawerProps {
  open: boolean
  onClose: () => void
  initialProgram?: WorkoutProgram | null
}

const createDefaultWorkingSet = () => ({
  id: crypto.randomUUID(),
  title: 'Подъём на пронацию',
  sets: 4,
  reps: 6,
  loadKg: 22,
  restSec: 90,
})

const createDefaultDay = () => ({
  id: crypto.randomUUID(),
  weekday: 1,
  title: 'Понедельник — стол и кисть',
  focus: ['Кисть', 'Пронация'] as Array<(typeof MUSCLE_GROUPS)[number]>,
  exerciseIds: [] as string[],
  trainingPlan: {
    workingSets: [createDefaultWorkingSet()],
    drillMoments: ['Старт без потери кисти'],
    matchFocusPoints: ['Забирать высоту сразу после команды'],
  },
})

const createEmptyDayState = () => ({
  id: crypto.randomUUID(),
  weekday: 1,
  title: '',
  focus: [] as Array<(typeof MUSCLE_GROUPS)[number]>,
  exerciseIds: [] as string[],
  trainingPlan: {
    workingSets: [createDefaultWorkingSet()],
    drillMoments: [],
    matchFocusPoints: [],
  },
})

const getDefaultValues = (program?: WorkoutProgram | null): FormValues =>
  program
    ? {
        name: program.name,
        goal: program.goal,
        durationWeeks: program.durationWeeks,
        pinned: program.pinned,
        days: program.days.map((day) => ({
          id: day.id,
          weekday: day.weekday,
          title: day.title,
          focus: day.focus,
          exerciseIds: day.exerciseIds,
          trainingPlan: {
            workingSets: day.trainingPlan.workingSets.map((setItem) => ({ ...setItem })),
            drillMoments: [...day.trainingPlan.drillMoments],
            matchFocusPoints: [...day.trainingPlan.matchFocusPoints],
          },
        })),
      }
    : {
        name: '',
        goal: '',
        durationWeeks: 6,
        pinned: false,
        days: [createDefaultDay()],
      }

export const CreateProgramDrawer = ({
  open,
  onClose,
  initialProgram = null,
}: CreateProgramDrawerProps) => {
  const createProgram = useNotesStore((state) => state.createProgram)
  const updateProgram = useNotesStore((state) => state.updateProgram)
  const exerciseTemplates = useNotesStore((state) => state.exerciseTemplates)
  const isEditMode = Boolean(initialProgram)
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialProgram),
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'days',
  })
  const days = useWatch({ control, name: 'days' }) ?? []

  useEffect(() => {
    reset(getDefaultValues(initialProgram))
  }, [initialProgram, reset])

  const submitHandler = handleSubmit((values) => {
    if (initialProgram) {
      updateProgram(initialProgram.id, values)
    } else {
      createProgram(values)
    }

    reset(getDefaultValues())
    onClose()
  })

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: 560 } } }}>
      <Stack component="form" spacing={3} onSubmit={submitHandler} sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Stack spacing={0.75}>
          <Typography variant="h5">{isEditMode ? 'Редактировать цикл' : 'Новый цикл kiks'}</Typography>
          <Typography color="text.secondary">
            Соберите план подготовки под армрестлинг: рабочие подходы, моменты отработки и акценты на борьбу.
          </Typography>
        </Stack>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Название цикла" error={Boolean(errors.name)} helperText={errors.name?.message} />
          )}
        />

        <Controller
          name="goal"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Цель цикла"
              multiline
              minRows={3}
              error={Boolean(errors.goal)}
              helperText={errors.goal?.message}
            />
          )}
        />

        <Controller
          name="durationWeeks"
          control={control}
          render={({ field }) => (
            <TextField
              label="Длительность, недель"
              type="number"
              value={field.value}
              onChange={(event) => field.onChange(Number(event.target.value))}
            />
          )}
        />

        <Controller
          name="pinned"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
              label="Показывать цикл первым"
            />
          )}
        />

        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Тренировочные дни</Typography>
            <Button startIcon={<AddRoundedIcon />} onClick={() => append(createDefaultDay())}>
              Добавить день
            </Button>
          </Stack>

          {fields.map((field, index) => {
            const day = days[index] ?? createEmptyDayState()

            return (
              <Stack key={field.id} spacing={2} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1">День {index + 1}</Typography>
                  {fields.length > 1 ? (
                    <IconButton color="inherit" onClick={() => remove(index)} aria-label="Удалить день">
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  ) : null}
                </Stack>

                <Controller
                  name={`days.${index}.weekday`}
                  control={control}
                  render={({ field: dayField }) => (
                    <TextField
                      select
                      label="День недели"
                      value={dayField.value}
                      onChange={(event) => dayField.onChange(Number(event.target.value))}
                    >
                      {WEEKDAY_OPTIONS.map((dayOption) => (
                        <MenuItem key={dayOption.value} value={dayOption.value}>
                          {dayOption.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name={`days.${index}.title`}
                  control={control}
                  render={({ field: dayField }) => (
                    <TextField
                      {...dayField}
                      label="Название дня"
                      error={Boolean(errors.days?.[index]?.title)}
                      helperText={errors.days?.[index]?.title?.message}
                    />
                  )}
                />

                <Controller
                  name={`days.${index}.focus`}
                  control={control}
                  render={({ field: dayField }) => (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Зоны акцента
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {MUSCLE_GROUPS.map((group) => {
                          const selected = dayField.value.includes(group)

                          return (
                            <Chip
                              key={group}
                              label={group}
                              color={selected ? 'primary' : 'default'}
                              onClick={() =>
                                dayField.onChange(
                                  selected
                                    ? dayField.value.filter((item) => item !== group)
                                    : [...dayField.value, group],
                                )
                              }
                            />
                          )
                        })}
                      </Stack>
                      <Typography variant="caption" color="error">
                        {errors.days?.[index]?.focus?.message}
                      </Typography>
                    </Stack>
                  )}
                />

                <Controller
                  name={`days.${index}.exerciseIds`}
                  control={control}
                  render={({ field: dayField }) => (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Движения и упражнения
                      </Typography>
                      {exerciseTemplates.map((exercise) => (
                        <FormControlLabel
                          key={exercise.id}
                          control={
                            <Checkbox
                              checked={dayField.value.includes(exercise.id)}
                              onChange={(_, checked) =>
                                dayField.onChange(
                                  checked
                                    ? [...dayField.value, exercise.id]
                                    : dayField.value.filter((item) => item !== exercise.id),
                                )
                              }
                            />
                          }
                          label={exercise.name}
                        />
                      ))}
                      <Typography variant="caption" color="error">
                        {errors.days?.[index]?.exerciseIds?.message}
                      </Typography>
                    </Stack>
                  )}
                />

                <Divider />

                <Stack spacing={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2">План на тренировку</Typography>
                    <Button
                      size="small"
                      startIcon={<AddRoundedIcon />}
                      onClick={() =>
                        setValue(
                          `days.${index}.trainingPlan.workingSets`,
                          [...day.trainingPlan.workingSets, createDefaultWorkingSet()],
                          { shouldValidate: true },
                        )
                      }
                    >
                      Подход
                    </Button>
                  </Stack>

                  {day.trainingPlan.workingSets.map((workingSet, workingSetIndex) => (
                    <Stack
                      key={workingSet.id}
                      spacing={1.5}
                      sx={{ p: 1.5, borderRadius: 2, backgroundColor: 'background.default' }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">Рабочий подход {workingSetIndex + 1}</Typography>
                        {day.trainingPlan.workingSets.length > 1 ? (
                          <IconButton
                            size="small"
                            onClick={() =>
                              setValue(
                                `days.${index}.trainingPlan.workingSets`,
                                day.trainingPlan.workingSets.filter((_, currentIndex) => currentIndex !== workingSetIndex),
                                { shouldValidate: true },
                              )
                            }
                          >
                            <DeleteOutlineRoundedIcon fontSize="small" />
                          </IconButton>
                        ) : null}
                      </Stack>

                      <Controller
                        name={`days.${index}.trainingPlan.workingSets.${workingSetIndex}.title`}
                        control={control}
                        render={({ field: setField }) => <TextField {...setField} label="Движение" />}
                      />

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Controller
                          name={`days.${index}.trainingPlan.workingSets.${workingSetIndex}.sets`}
                          control={control}
                          render={({ field: setField }) => (
                            <TextField
                              label="Подходы"
                              type="number"
                              value={setField.value}
                              onChange={(event) => setField.onChange(Number(event.target.value))}
                            />
                          )}
                        />
                        <Controller
                          name={`days.${index}.trainingPlan.workingSets.${workingSetIndex}.reps`}
                          control={control}
                          render={({ field: setField }) => (
                            <TextField
                              label="Повторы"
                              type="number"
                              value={setField.value}
                              onChange={(event) => setField.onChange(Number(event.target.value))}
                            />
                          )}
                        />
                        <Controller
                          name={`days.${index}.trainingPlan.workingSets.${workingSetIndex}.loadKg`}
                          control={control}
                          render={({ field: setField }) => (
                            <TextField
                              label="Нагрузка, кг"
                              type="number"
                              value={setField.value}
                              onChange={(event) => setField.onChange(Number(event.target.value))}
                            />
                          )}
                        />
                        <Controller
                          name={`days.${index}.trainingPlan.workingSets.${workingSetIndex}.restSec`}
                          control={control}
                          render={({ field: setField }) => (
                            <TextField
                              label="Отдых, сек"
                              type="number"
                              value={setField.value}
                              onChange={(event) => setField.onChange(Number(event.target.value))}
                            />
                          )}
                        />
                      </Stack>
                    </Stack>
                  ))}

                  <Controller
                    name={`days.${index}.trainingPlan.drillMoments`}
                    control={control}
                    render={({ field: dayField }) => (
                      <TextField
                        label="Моменты отработки"
                        multiline
                        minRows={3}
                        value={dayField.value.join('\n')}
                        onChange={(event) =>
                          dayField.onChange(
                            event.target.value
                              .split('\n')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          )
                        }
                        helperText={errors.days?.[index]?.trainingPlan?.drillMoments?.message ?? 'По одному пункту на строку'}
                        error={Boolean(errors.days?.[index]?.trainingPlan?.drillMoments)}
                      />
                    )}
                  />

                  <Controller
                    name={`days.${index}.trainingPlan.matchFocusPoints`}
                    control={control}
                    render={({ field: dayField }) => (
                      <TextField
                        label="На чем делать акцент во время борьбы"
                        multiline
                        minRows={3}
                        value={dayField.value.join('\n')}
                        onChange={(event) =>
                          dayField.onChange(
                            event.target.value
                              .split('\n')
                              .map((item) => item.trim())
                              .filter(Boolean),
                          )
                        }
                        helperText={
                          errors.days?.[index]?.trainingPlan?.matchFocusPoints?.message ??
                          'Короткие тезисы, по одному на строку'
                        }
                        error={Boolean(errors.days?.[index]?.trainingPlan?.matchFocusPoints)}
                      />
                    )}
                  />
                </Stack>
              </Stack>
            )
          })}
        </Stack>

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 'auto' }}>
          {isEditMode ? 'Сохранить цикл' : 'Создать цикл'}
        </Button>
      </Stack>
    </Drawer>
  )
}
