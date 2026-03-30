import AddRoundedIcon from '@mui/icons-material/AddRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { Box, Button, Container, Fab, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import { useMemo, useState } from 'react'
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom'
import { CreateNoteDialog } from '../components/CreateNoteDialog'
import { DateGroupHeader } from '../components/DateGroupHeader'
import { EmptyState } from '../components/EmptyState'
import { NoteItem } from '../components/NoteItem'
import { useNotesStore } from '../store/notes'

dayjs.locale('ru')

export const BlockPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { id } = useParams()
  const navigate = useNavigate()
  const blocks = useNotesStore((state) => state.blocks)
  const notes = useNotesStore((state) => state.notes)
  const block = blocks.find((item) => item.id === id)

  const groupedNotes = useMemo(() => {
    const items = notes
      .filter((note) => note.blockId === id)
      .sort((a, b) => dayjs(b.datetime).valueOf() - dayjs(a.datetime).valueOf())

    return items.reduce<Record<string, typeof items>>((accumulator, note) => {
      const key = dayjs(note.datetime).format('YYYY-MM-DD')
      accumulator[key] = [...(accumulator[key] ?? []), note]
      return accumulator
    }, {})
  }, [id, notes])

  if (!block) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <EmptyState
          title="Блок не найден"
          description="Похоже, этот блок был удален или ссылка устарела. Вернитесь на главную и выберите другой."
          actionLabel="На главную"
          onAction={() => navigate('/')}
        />
      </Container>
    )
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, pb: 12 }}>
        <Stack spacing={3}>
          <Button
            component={RouterLink}
            to="/"
            startIcon={<ArrowBackRoundedIcon />}
            color="inherit"
            sx={{ alignSelf: 'flex-start' }}
          >
            Назад
          </Button>

          <Stack spacing={0.75}>
            <Typography variant="h4">{block.title}</Typography>
            <Typography color="text.secondary">
              {block.category} · {notes.filter((note) => note.blockId === block.id).length} заметок
            </Typography>
          </Stack>

          {Object.keys(groupedNotes).length ? (
            <Stack spacing={2}>
              {Object.entries(groupedNotes).map(([date, items]) => (
                <Box key={date}>
                  <DateGroupHeader label={dayjs(date).format('D MMMM')} />
                  <Box sx={{ pt: 1 }}>
                    {items.map((note) => (
                      <NoteItem key={note.id} blockId={block.id} note={note} />
                    ))}
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="В этом блоке ещё нет заметок"
              description="Добавьте первую запись, чтобы начать хронологию идей, задач или личных заметок."
              actionLabel="Создать заметку"
              onAction={() => setDialogOpen(true)}
            />
          )}
        </Stack>
      </Container>

      <Fab
        color="primary"
        aria-label="Создать заметку"
        onClick={() => setDialogOpen(true)}
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <AddRoundedIcon />
      </Fab>

      <CreateNoteDialog open={dialogOpen} blockId={block.id} onClose={() => setDialogOpen(false)} />
    </>
  )
}
