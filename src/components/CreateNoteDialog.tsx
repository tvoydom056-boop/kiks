import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import dayjs, { type Dayjs } from 'dayjs'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import {
  NOTE_PRIORITIES,
  NOTE_TAGS,
  useNotesStore,
  type NotePriority,
  type NoteTag,
} from '../store/notes'

const createNoteSchema = z.object({
  title: z.string().min(2, 'Минимум 2 символа'),
  content: z.string().max(1000, 'Максимум 1000 символов'),
  date: z.custom<Dayjs>((value) => dayjs.isDayjs(value) && value.isValid(), {
    message: 'Выберите дату',
  }),
  time: z.custom<Dayjs>((value) => dayjs.isDayjs(value) && value.isValid(), {
    message: 'Выберите время',
  }),
  priority: z.custom<NotePriority>((value) => NOTE_PRIORITIES.includes(value as NotePriority), {
    message: 'Выберите приоритет',
  }),
  tags: z.array(z.custom<NoteTag>()),
  importance: z.number().min(1).max(10),
  remind: z.boolean(),
  completed: z.boolean(),
})

type CreateNoteFormValues = z.infer<typeof createNoteSchema>

interface CreateNoteDialogProps {
  open: boolean
  blockId: string
  onClose: () => void
}

const createDefaultValues = (): CreateNoteFormValues => ({
  title: '',
  content: '',
  date: dayjs(),
  time: dayjs(),
  priority: 'Обычная',
  tags: [],
  importance: 7,
  remind: false,
  completed: false,
})

export const CreateNoteDialog = ({ open, blockId, onClose }: CreateNoteDialogProps) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const createNote = useNotesStore((state) => state.createNote)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteFormValues>({
    resolver: zodResolver(createNoteSchema),
    defaultValues: createDefaultValues(),
  })
  const contentValue = useWatch({ control, name: 'content' })
  const importance = useWatch({ control, name: 'importance' })
  const contentLength = contentValue.length

  const submitHandler = handleSubmit((values) => {
    const datetime = values.date
      .hour(values.time.hour())
      .minute(values.time.minute())
      .second(0)
      .millisecond(0)
      .toISOString()

    createNote({
      blockId,
      title: values.title,
      content: values.content,
      datetime,
      priority: values.priority,
      tags: values.tags,
      importance: values.importance,
      remind: values.remind,
      completed: values.completed,
    })

    reset(createDefaultValues())
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>Новая заметка</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={3} onSubmit={submitHandler} sx={{ pt: 1 }}>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Заголовок заметки"
                error={Boolean(errors.title)}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Текст заметки"
                multiline
                minRows={5}
                error={Boolean(errors.content)}
                helperText={errors.content?.message ?? `${contentLength}/1000 символов`}
                fullWidth
              />
            )}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Дата заметки"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? dayjs())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.date),
                      helperText: errors.date?.message,
                    },
                  }}
                />
              )}
            />

            <Controller
              name="time"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label="Время заметки"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? dayjs())}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: Boolean(errors.time),
                      helperText: errors.time?.message,
                    },
                  }}
                />
              )}
            />
          </Stack>

          <FormControl error={Boolean(errors.priority)}>
            <Typography variant="subtitle2" gutterBottom>
              Приоритет
            </Typography>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <RadioGroup row {...field}>
                  {NOTE_PRIORITIES.map((priority) => (
                    <FormControlLabel key={priority} value={priority} control={<Radio />} label={priority} />
                  ))}
                </RadioGroup>
              )}
            />
            <FormHelperText>{errors.priority?.message}</FormHelperText>
          </FormControl>

          <FormControl>
            <Typography variant="subtitle2" gutterBottom>
              Теги
            </Typography>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <FormGroup row>
                  {NOTE_TAGS.map((tag) => (
                    <FormControlLabel
                      key={tag}
                      control={
                        <Checkbox
                          checked={field.value.includes(tag)}
                          onChange={(_, checked) =>
                            field.onChange(
                              checked
                                ? [...field.value, tag]
                                : field.value.filter((item) => item !== tag),
                            )
                          }
                        />
                      }
                      label={tag}
                    />
                  ))}
                </FormGroup>
              )}
            />
          </FormControl>

          <Controller
            name="importance"
            control={control}
            render={({ field }) => (
              <Box>
                <Typography gutterBottom>Важность: {importance}/10</Typography>
                <Slider
                  value={field.value}
                  onChange={(_, value) => field.onChange(value)}
                  valueLabelDisplay="auto"
                  min={1}
                  max={10}
                  step={1}
                />
              </Box>
            )}
          />

          <Controller
            name="remind"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Напомнить об этой заметке"
              />
            )}
          />

          <Controller
            name="completed"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Отметить как выполненную сразу"
              />
            )}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end" pb={1}>
            <Button onClick={onClose} color="inherit">
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              Добавить заметку
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
