import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { Box, Button, Chip, Container, Paper, Stack, TextField, Typography } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useEffect, useRef } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { useNotesStore } from '../store/notes'

dayjs.locale('ru')

interface NoteEditorFormValues {
  title: string
  content: string
}

export const NoteEditor = () => {
  const { id, noteId } = useParams()
  const notes = useNotesStore((state) => state.notes)
  const autosave = useNotesStore((state) => state.settings.autosave)
  const updateNote = useNotesStore((state) => state.updateNote)
  const note = notes.find((item) => item.id === noteId && item.blockId === id)
  const lastSavedRef = useRef('')
  const { control, reset, getValues } = useForm<NoteEditorFormValues>({
    defaultValues: {
      title: note?.title ?? '',
      content: note?.content ?? '',
    },
  })

  const watchedTitle = useWatch({ control, name: 'title' })
  const watchedContent = useWatch({ control, name: 'content' })

  useEffect(() => {
    if (!note) {
      return
    }

    reset({
      title: note.title,
      content: note.content,
    })
    lastSavedRef.current = JSON.stringify({
      title: note.title,
      content: note.content,
    })
  }, [note, reset])

  useEffect(() => {
    if (!note || !autosave) {
      return
    }

    const nextSnapshot = JSON.stringify({
      title: watchedTitle,
      content: watchedContent,
    })

    if (nextSnapshot === lastSavedRef.current) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      updateNote(note.id, {
        title: watchedTitle.trim() || 'Без названия',
        content: watchedContent,
      })
      lastSavedRef.current = nextSnapshot
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [autosave, note, updateNote, watchedContent, watchedTitle])

  if (!note) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <EmptyState
          title="Заметка не найдена"
          description="Откройте другой блок или создайте новую заметку, если запись была удалена."
        />
      </Container>
    )
  }

  const saveImmediately = () => {
    const values = getValues()
    const nextSnapshot = JSON.stringify(values)

    if (nextSnapshot === lastSavedRef.current) {
      return
    }

    updateNote(note.id, {
      title: values.title.trim() || 'Без названия',
      content: values.content,
    })
    lastSavedRef.current = nextSnapshot
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, pb: 8 }}>
      <Stack spacing={3}>
        <Button
          component={RouterLink}
          to={`/block/${id}`}
          startIcon={<ArrowBackRoundedIcon />}
          color="inherit"
          sx={{ alignSelf: 'flex-start' }}
        >
          К блоку
        </Button>

        <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Stack spacing={3}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  variant="standard"
                  placeholder="Заголовок"
                  fullWidth
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: { xs: 28, sm: 36 }, fontWeight: 700 },
                  }}
                  onBlur={() => {
                    field.onBlur()
                    saveImmediately()
                  }}
                />
              )}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
              <Typography color="text.secondary">
                {dayjs(note.datetime).format('D MMMM YYYY, HH:mm')} · Обновлено{' '}
                {dayjs(note.updatedAt).format('HH:mm')}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography color="text.secondary">{watchedContent.length} символов</Typography>
                {note.completed ? (
                  <Chip size="small" icon={<CheckCircleRoundedIcon />} color="success" label="Выполнена" />
                ) : null}
              </Stack>
            </Stack>

            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Начните писать..."
                  fullWidth
                  multiline
                  minRows={16}
                  onBlur={() => {
                    field.onBlur()
                    saveImmediately()
                  }}
                />
              )}
            />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Автосохранение {autosave ? 'включено' : 'выключено'}.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
