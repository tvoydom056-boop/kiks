import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNotesStore, type NoteRecord } from '../store/notes'

const schema = z.object({
  sectionId: z.string().min(1, 'Выберите раздел'),
  title: z.string().min(2, 'Минимум 2 символа'),
  content: z.string().min(2, 'Добавьте текст'),
  noteDate: z.custom<Dayjs>((value) => dayjs.isDayjs(value) && value.isValid()),
})

type FormValues = z.infer<typeof schema>

interface NoteEditorDialogProps {
  open: boolean
  onClose: () => void
  initialNote?: NoteRecord | null
}

const getDefaultValues = (note?: NoteRecord | null): FormValues => ({
  sectionId: note?.sectionId ?? 'default-note-section',
  title: note?.title ?? '',
  content: note?.content ?? '',
  noteDate: note?.noteDate ? dayjs(note.noteDate) : dayjs(),
})

export const NoteEditorDialog = ({ open, onClose, initialNote = null }: NoteEditorDialogProps) => {
  const noteSections = useNotesStore((state) => state.noteSections)
  const createNote = useNotesStore((state) => state.createNote)
  const updateNote = useNotesStore((state) => state.updateNote)
  const isEditMode = Boolean(initialNote)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialNote),
  })

  useEffect(() => {
    reset(getDefaultValues(initialNote))
  }, [initialNote, reset])

  const submitHandler = handleSubmit((values) => {
    const payload = {
      sectionId: values.sectionId,
      title: values.title,
      content: values.content,
      noteDate: values.noteDate.toISOString(),
    }

    if (initialNote) {
      updateNote(initialNote.id, payload)
    } else {
      createNote(payload)
    }

    reset(getDefaultValues())
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditMode ? 'Редактировать заметку' : 'Новая заметка'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2.5} onSubmit={submitHandler} sx={{ pt: 1 }}>
          <Controller
            name="sectionId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Раздел"
                error={Boolean(errors.sectionId)}
                helperText={errors.sectionId?.message}
              >
                {noteSections.map((section) => (
                  <MenuItem key={section.id} value={section.id}>
                    {section.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Заголовок" error={Boolean(errors.title)} helperText={errors.title?.message} />
            )}
          />

          <Controller
            name="noteDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Дата записи"
                value={field.value}
                onChange={(value) => field.onChange(value)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: Boolean(errors.noteDate),
                    helperText: errors.noteDate?.message,
                  },
                }}
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
                minRows={6}
                error={Boolean(errors.content)}
                helperText={errors.content?.message}
              />
            )}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={onClose} color="inherit">
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditMode ? 'Сохранить заметку' : 'Создать заметку'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
