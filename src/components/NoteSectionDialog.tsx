import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Dialog, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useNotesStore, type NoteSection } from '../store/notes'

const schema = z.object({
  name: z.string().min(2, 'Минимум 2 символа'),
})

type FormValues = z.infer<typeof schema>

interface NoteSectionDialogProps {
  open: boolean
  onClose: () => void
  initialSection?: NoteSection | null
}

const getDefaultValues = (section?: NoteSection | null): FormValues => ({
  name: section?.name ?? '',
})

export const NoteSectionDialog = ({
  open,
  onClose,
  initialSection = null,
}: NoteSectionDialogProps) => {
  const createNoteSection = useNotesStore((state) => state.createNoteSection)
  const updateNoteSection = useNotesStore((state) => state.updateNoteSection)
  const isEditMode = Boolean(initialSection)
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(initialSection),
  })

  useEffect(() => {
    reset(getDefaultValues(initialSection))
  }, [initialSection, reset])

  const submitHandler = handleSubmit((values) => {
    if (initialSection) {
      updateNoteSection(initialSection.id, values.name)
    } else {
      createNoteSection(values.name)
    }

    reset(getDefaultValues())
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{isEditMode ? 'Редактировать раздел' : 'Новый раздел'}</DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={2.5} onSubmit={submitHandler} sx={{ pt: 1 }}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="Название раздела" error={Boolean(errors.name)} helperText={errors.name?.message} />
            )}
          />

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={onClose} color="inherit">
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditMode ? 'Сохранить' : 'Создать'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
