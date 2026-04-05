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
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
  useNotesStore,
  type EquipmentType,
  type MuscleGroup,
} from '../store/notes'

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
  muscleGroup: z.custom<MuscleGroup>((value) => MUSCLE_GROUPS.includes(value as MuscleGroup)),
  equipment: z.custom<EquipmentType>((value) => EQUIPMENT_TYPES.includes(value as EquipmentType)),
  sets: z.number().min(1).max(10),
  reps: z.number().min(1).max(30),
  weightKg: z.number().min(0).max(400),
  restSec: z.number().min(15).max(300),
})

type FormValues = z.infer<typeof schema>

const defaultValues: FormValues = {
  name: '',
  muscleGroup: 'Грудь',
  equipment: 'Штанга',
  sets: 4,
  reps: 8,
  weightKg: 60,
  restSec: 90,
}

interface CreateExerciseDialogProps {
  open: boolean
  onClose: () => void
}

export const CreateExerciseDialog = ({ open, onClose }: CreateExerciseDialogProps) => {
  const createExerciseTemplate = useNotesStore((state) => state.createExerciseTemplate)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const submitHandler = handleSubmit((values) => {
    createExerciseTemplate(values)
    reset(defaultValues)
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Новое упражнение</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2.5} onSubmit={submitHandler} sx={{ pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Название упражнения" error={Boolean(errors.name)} helperText={errors.name?.message} />
            )}
          />

          <FormControl error={Boolean(errors.muscleGroup)}>
            <InputLabel id="muscle-group-label">Группа мышц</InputLabel>
            <Controller
              name="muscleGroup"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="muscle-group-label" label="Группа мышц">
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
            <InputLabel id="equipment-label">Тип</InputLabel>
            <Controller
              name="equipment"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="equipment-label" label="Тип">
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
                  label="Повторения"
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
                  label="Вес, кг"
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
              Сохранить упражнение
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
