import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import FolderRoundedIcon from '@mui/icons-material/FolderRounded'
import NoteAltRoundedIcon from '@mui/icons-material/NoteAltRounded'
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fab,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { EmptyState } from '../components/EmptyState'
import { NoteEditorDialog } from '../components/NoteEditorDialog'
import { NoteSectionDialog } from '../components/NoteSectionDialog'
import { DEFAULT_NOTE_SECTION_ID, useNotesStore, type NoteRecord, type NoteSection } from '../store/notes'

export const NotesPage = () => {
  const [noteDialogOpen, setNoteDialogOpen] = useState(false)
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false)
  const [activeSectionId, setActiveSectionId] = useState<'all' | string>('all')
  const [editingNote, setEditingNote] = useState<NoteRecord | null>(null)
  const [editingSection, setEditingSection] = useState<NoteSection | null>(null)
  const sections = useNotesStore((state) => state.noteSections)
  const notes = useNotesStore((state) => state.notes)
  const deleteNote = useNotesStore((state) => state.deleteNote)
  const deleteNoteSection = useNotesStore((state) => state.deleteNoteSection)

  const filteredNotes = useMemo(
    () =>
      notes
        .filter((note) => activeSectionId === 'all' || note.sectionId === activeSectionId)
        .sort((a, b) => dayjs(b.noteDate).valueOf() - dayjs(a.noteDate).valueOf()),
    [activeSectionId, notes],
  )

  const notesByDate = useMemo(() => {
    const groups = new Map<string, NoteRecord[]>()

    filteredNotes.forEach((note) => {
      const key = dayjs(note.noteDate).format('YYYY-MM-DD')
      const current = groups.get(key) ?? []
      current.push(note)
      groups.set(key, current)
    })

    return Array.from(groups.entries())
  }, [filteredNotes])

  const getSectionName = (sectionId: string) =>
    sections.find((section) => section.id === sectionId)?.name ?? 'Без раздела'

  return (
    <>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
        <Stack spacing={3}>
          <AppHeader
            title="Заметки"
            subtitle="Фиксируйте мысли по дням, разбивайте записи по разделам и возвращайтесь к ним как к дневнику подготовки."
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setNoteDialogOpen(true)}>
              Новая заметка
            </Button>
            <Button variant="outlined" startIcon={<FolderRoundedIcon />} onClick={() => setSectionDialogOpen(true)}>
              Новый раздел
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="Все"
              color={activeSectionId === 'all' ? 'primary' : 'default'}
              onClick={() => setActiveSectionId('all')}
            />
            {sections.map((section) => (
              <Stack key={section.id} direction="row" spacing={0.5} alignItems="center">
                <Chip
                  label={section.name}
                  color={activeSectionId === section.id ? 'primary' : 'default'}
                  onClick={() => setActiveSectionId(section.id)}
                />
                {section.id !== DEFAULT_NOTE_SECTION_ID ? (
                  <>
                    <IconButton size="small" onClick={() => { setEditingSection(section); setSectionDialogOpen(true) }}>
                      <EditRoundedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteNoteSection(section.id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : null}
              </Stack>
            ))}
          </Stack>

          {notesByDate.length ? (
            <Stack spacing={2.5}>
              {notesByDate.map(([dateKey, dayNotes]) => (
                <Stack key={dateKey} spacing={1.5}>
                  <Typography variant="h6">{dayjs(dateKey).format('D MMMM YYYY')}</Typography>
                  <Stack
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                      gap: 2,
                    }}
                  >
                    {dayNotes.map((note) => (
                      <Card key={note.id}>
                        <CardContent>
                          <Stack spacing={1.5}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                              <Stack spacing={0.75}>
                                <Typography variant="h6">{note.title}</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  <Chip size="small" label={getSectionName(note.sectionId)} />
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={`Изменено ${dayjs(note.updatedAt).format('HH:mm')}`}
                                  />
                                </Stack>
                              </Stack>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton size="small" onClick={() => { setEditingNote(note); setNoteDialogOpen(true) }}>
                                  <EditRoundedIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={() => deleteNote(note.id)}>
                                  <DeleteOutlineRoundedIcon fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Stack>
                            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                              {note.content}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ) : (
            <EmptyState
              title="Заметок пока нет"
              description="Создайте запись и ведите заметки по дням: борьба, упражнения, тренировка или любые свои разделы."
              actionLabel="Добавить заметку"
              onAction={() => setNoteDialogOpen(true)}
            />
          )}
        </Stack>
      </Container>

      <Fab
        color="primary"
        aria-label="Создать заметку"
        onClick={() => setNoteDialogOpen(true)}
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <NoteAltRoundedIcon />
      </Fab>

      <NoteEditorDialog
        open={noteDialogOpen}
        onClose={() => {
          setNoteDialogOpen(false)
          setEditingNote(null)
        }}
        initialNote={editingNote}
      />
      <NoteSectionDialog
        open={sectionDialogOpen}
        onClose={() => {
          setSectionDialogOpen(false)
          setEditingSection(null)
        }}
        initialSection={editingSection}
      />
    </>
  )
}
