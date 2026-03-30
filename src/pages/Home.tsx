import AddRoundedIcon from '@mui/icons-material/AddRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import { Box, Container, Fab, IconButton, Stack, Tab, Tabs, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { CreateBlockDrawer } from '../components/CreateBlockDrawer'
import { EmptyState } from '../components/EmptyState'
import { NoteBlockCard } from '../components/NoteBlockCard'
import { ThemeToggle } from '../components/ThemeToggle'
import { useNotesStore } from '../store/notes'

type HomeFilter = 'all' | 'categorized' | 'uncategorized'

export const Home = () => {
  const [filter, setFilter] = useState<HomeFilter>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const blocks = useNotesStore((state) => state.blocks)
  const notes = useNotesStore((state) => state.notes)
  const displayName = useNotesStore((state) => state.settings.displayName)

  const filteredBlocks = useMemo(() => {
    const sorted = [...blocks].sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return Number(b.pinned) - Number(a.pinned)
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

    if (filter === 'categorized') {
      return sorted.filter((block) => block.category !== 'Без категории')
    }

    if (filter === 'uncategorized') {
      return sorted.filter((block) => block.category === 'Без категории')
    }

    return sorted
  }, [blocks, filter])

  return (
    <>
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, pb: 12 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Stack spacing={1}>
              <Typography variant="h3">Заметки</Typography>
              <Typography color="text.secondary">
                {displayName
                  ? `${displayName}, все важное в одном месте.`
                  : 'Соберите блоки и заметки в одном приложении.'}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5}>
              <IconButton component={RouterLink} to="/settings" color="inherit" aria-label="Настройки">
                <SettingsRoundedIcon />
              </IconButton>
              <ThemeToggle />
            </Stack>
          </Stack>

          <Tabs value={filter} onChange={(_, value: HomeFilter) => setFilter(value)} variant="scrollable">
            <Tab value="all" label="Все" />
            <Tab value="categorized" label="Заметки" />
            <Tab value="uncategorized" label="Без категории" />
          </Tabs>

          {filteredBlocks.length ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              {filteredBlocks.map((block) => (
                <NoteBlockCard
                  key={block.id}
                  block={block}
                  notes={notes.filter((note) => note.blockId === block.id)}
                />
              ))}
            </Box>
          ) : (
            <EmptyState
              title="Подходящих блоков пока нет"
              description="Создайте первый блок и разложите заметки по темам, чтобы рабочий стол выглядел живым и полезным."
              actionLabel="Создать блок"
              onAction={() => setDrawerOpen(true)}
            />
          )}
        </Stack>
      </Container>

      <Fab
        color="primary"
        aria-label="Создать блок"
        onClick={() => setDrawerOpen(true)}
        sx={{ position: 'fixed', right: 24, bottom: 24 }}
      >
        <AddRoundedIcon />
      </Fab>

      <CreateBlockDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  )
}
