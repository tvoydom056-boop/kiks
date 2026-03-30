import { zodResolver } from '@hookform/resolvers/zod'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Button,
  Checkbox,
  Drawer,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { BLOCK_CATEGORIES, useNotesStore, type BlockCategory } from '../store/notes'

const createBlockSchema = z.object({
  title: z.string().min(2, 'Минимум 2 символа'),
  category: z.custom<BlockCategory>((value) => BLOCK_CATEGORIES.includes(value as BlockCategory), {
    message: 'Выберите категорию',
  }),
  pinned: z.boolean(),
  visibleEverywhere: z.boolean().refine((value) => value, {
    message: 'Подтвердите доступность блока на всех устройствах',
  }),
})

type CreateBlockFormValues = z.infer<typeof createBlockSchema>

interface CreateBlockDrawerProps {
  open: boolean
  onClose: () => void
}

const defaultValues: CreateBlockFormValues = {
  title: '',
  category: 'Личное',
  pinned: false,
  visibleEverywhere: false,
}

export const CreateBlockDrawer = ({ open, onClose }: CreateBlockDrawerProps) => {
  const createBlock = useNotesStore((state) => state.createBlock)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBlockFormValues>({
    resolver: zodResolver(createBlockSchema),
    defaultValues,
  })

  const submitHandler = handleSubmit((values) => {
    createBlock(values)
    reset(defaultValues)
    onClose()
  })

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
      <Stack component="form" onSubmit={submitHandler} spacing={3} sx={{ p: 3, height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <div>
            <Typography variant="h5">Новый блок</Typography>
            <Typography color="text.secondary">Создайте пространство для заметок по теме.</Typography>
          </div>
          <Button onClick={onClose} color="inherit" startIcon={<CloseRoundedIcon />}>
            Закрыть
          </Button>
        </Stack>

        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Название блока"
              placeholder="Например, Идеи для поездок"
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
              fullWidth
            />
          )}
        />

        <FormControl error={Boolean(errors.category)} fullWidth>
          <InputLabel id="block-category-label">Категория</InputLabel>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <Select {...field} labelId="block-category-label" label="Категория">
                {BLOCK_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <FormHelperText>{errors.category?.message}</FormHelperText>
        </FormControl>

        <Controller
          name="pinned"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
              label="Закрепить наверху"
            />
          )}
        />

        <Controller
          name="visibleEverywhere"
          control={control}
          render={({ field }) => (
            <FormControl error={Boolean(errors.visibleEverywhere)}>
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Подтверждаю, что блок виден на всех устройствах"
              />
              <FormHelperText>{errors.visibleEverywhere?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ mt: 'auto' }}>
          Создать блок
        </Button>
      </Stack>
    </Drawer>
  )
}
