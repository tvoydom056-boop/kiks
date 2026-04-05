import { zodResolver } from '@hookform/resolvers/zod'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import {
  Button,
  Checkbox,
  Chip,
  Drawer,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'
import { MUSCLE_GROUPS, WEEKDAY_OPTIONS, useNotesStore } from '../store/notes'

const daySchema = z.object({
  weekday: z.number().min(0).max(6),
  title: z.string().min(2, 'Минимум 2 символа'),
  focus: z.array(z.enum(MUSCLE_GROUPS)).min(1, 'Выберите хотя бы одну группу мышц'),
  exerciseIds: z.array(z.string()).min(1, 'Добавьте хотя бы одно упражнение'),
})

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  goal: z.string().min(10, 'Опишите цель программы'),
  durationWeeks: z.number().min(1).max(52),
  pinned: z.boolean(),
  days: z.array(daySchema).min(1, 'Нужен хотя бы один тренировочный день'),
})

type FormValues = z.infer<typeof schema>

interface CreateProgramDrawerProps {
  open: boolean
  onClose: () => void
}

const defaultValues: FormValues = {
  name: '',
  goal: '',
  durationWeeks: 8,
  pinned: false,
  days: [
    {
      weekday: 1,
      title: 'Понедельник — верх тела',
      focus: ['Грудь', 'Плечи'],
      exerciseIds: [],
    },
  ],
}

export const CreateProgramDrawer = ({ open, onClose }: CreateProgramDrawerProps) => {
  const createProgram = useNotesStore((state) => state.createProgram)
  const exerciseTemplates = useNotesStore((state) => state.exerciseTemplates)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'days',
  })

  const submitHandler = handleSubmit((values) => {
    createProgram(values)
    reset(defaultValues)
    onClose()
  })

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', md: 520 } } }}>
      <Stack component="form" spacing={3} onSubmit={submitHandler} sx={{ p: 3, height: '100%', overflowY: 'auto' }}>
        <Stack spacing={0.75}>
          <Typography variant="h5">Новая программа</Typography>
          <Typography color="text.secondary">
            Соберите недельный план и заранее задайте структуру упражнений, подходов и отдыха.
          </Typography>
        </Stack>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Название программы" error={Boolean(errors.name)} helperText={errors.name?.message} />
          )}
        />

        <Controller
          name="goal"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Цель"
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
              label="Показывать программу первой"
            />
          )}
        />

        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Тренировочные дни</Typography>
            <Button
              startIcon={<AddRoundedIcon />}
              onClick={() =>
                append({
                  weekday: 3,
                  title: 'Новый день',
                  focus: ['Спина'],
                  exerciseIds: [],
                })
              }
            >
              Добавить день
            </Button>
          </Stack>

          {fields.map((field, index) => (
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
                    {WEEKDAY_OPTIONS.map((day) => (
                      <MenuItem key={day.value} value={day.value}>
                        {day.label}
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
                      Группы мышц
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
                      Упражнения
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
            </Stack>
          ))}
        </Stack>

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 'auto' }}>
          Сохранить программу
        </Button>
      </Stack>
    </Drawer>
  )
}
