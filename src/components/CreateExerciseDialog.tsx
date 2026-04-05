import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
  useNotesStore,
  type EquipmentType,
  type ExerciseTemplate,
  type ExercisePrescription,
  type MuscleGroup,
} from '../store/notes'

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  muscleGroup: z.custom<MuscleGroup>((value) => MUSCLE_GROUPS.includes(value as MuscleGroup)),
  equipment: z.custom<EquipmentType>((value) => EQUIPMENT_TYPES.includes(value as EquipmentType)),
  sets: z.number().min(1).max(10),
  reps: z.number().min(1).max(30),
  weightKg: z.number().min(0).max(200),
  restSec: z.number().min(15).max(300),
})

type FormValues = z.infer<typeof schema>

interface CreateExerciseDialogProps {
  open: boolean
  onClose: () => void
  initialTemplate?: ExerciseTemplate | null
  initialPrescription?: ExercisePrescription | null
}

const getDefaultValues = (
  template?: ExerciseTemplate | null,
  prescription?: ExercisePrescription | null,
): FormValues => ({
  name: template?.name ?? '',
  muscleGroup: template?.muscleGroup ?? 'Кисть',
  equipment: template?.equipment ?? 'Ремень',
  sets: prescription?.sets ?? 4,
  reps: prescription?.reps ?? 6,
  weightKg: prescription?.weightKg ?? 20,
  restSec: prescription?.restSec ?? 90,
})

export const CreateExerciseDialog = ({
  open,
  onClose,
  initialTemplate = null,
  initialPrescription = null,
}: CreateExerciseDialogProps) => {
  const createExerciseTemplate = useNotesStore((state) => state.createExerciseTemplate)
  const updateExerciseTemplate = useNotesStore((state) => state.updateExerciseTemplate)
  const isEditMode = Boolean(initialTemplate)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialTemplate, initialPrescription),
  })

  useEffect(() => {
    reset(getDefaultValues(initialTemplate, initialPrescription))
  }, [initialPrescription, initialTemplate, reset])

  const submitHandler = handleSubmit((values) => {
    if (initialTemplate) {
      updateExerciseTemplate(initialTemplate.id, values)
    } else {
      createExerciseTemplate(values)
    }

    reset(getDefaultValues())
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Редактировать движение' : 'Новое движение'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2.5} onSubmit={submitHandler} sx={{ pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Название движения" error={Boolean(errors.name)} helperText={errors.name?.message} />
            )}
          />

          <FormControl error={Boolean(errors.muscleGroup)}>
            <InputLabel id="muscle-group-label">Зона акцента</InputLabel>
            <Controller
              name="muscleGroup"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="muscle-group-label" label="Зона акцента">
                  {MUSCLE_GROUPS.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.muscleGroup?.message}</FormHelperText>
          </FormControl>

          <FormControl error={Boolean(errors.equipment)}>
            <InputLabel id="equipment-label">Инвентарь</InputLabel>
            <Controller
              name="equipment"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="equipment-label" label="Инвентарь">
                  {EQUIPMENT_TYPES.map((item) => (
                    <MenuItem key={item} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            <FormHelperText>{errors.equipment?.message}</FormHelperText>
          </FormControl>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="sets"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Подходы"
                  type="number"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              )}
            />
            <Controller
              name="reps"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Повторы"
                  type="number"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              )}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="weightKg"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Нагрузка, кг"
                  type="number"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              )}
            />
            <Controller
              name="restSec"
              control={control}
              render={({ field }) => (
                <TextField
                  label="Отдых, сек"
                  type="number"
                  value={field.value}
                  onChange={(event) => field.onChange(Number(event.target.value))}
                />
              )}
            />
          </Stack>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={onClose} color="inherit">
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditMode ? 'Сохранить изменения' : 'Сохранить движение'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
