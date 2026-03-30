import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded'
import StickyNote2RoundedIcon from '@mui/icons-material/StickyNote2Rounded'
import { alpha, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { Link as RouterLink } from 'react-router-dom'
import type { NoteBlock, NoteItemRecord } from '../store/notes'

interface NoteBlockCardProps {
  block: NoteBlock
  notes: NoteItemRecord[]
}

export const NoteBlockCard = ({ block, notes }: NoteBlockCardProps) => {
  const sortedNotes = [...notes].sort(
    (a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf(),
  )
  const latestNote = sortedNotes[0]

  return (
    <Card
      sx={{
        height: '100%',
        backgroundImage: block.pinned
          ? 'linear-gradient(180deg, rgba(245,166,35,0.14), transparent 56%)'
          : 'none',
      }}
    >
      <CardActionArea component={RouterLink} to={`/block/${block.id}`} sx={{ height: '100%' }}>
        <CardContent sx={{ p: 2.5, height: '100%' }}>
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
              <Stack spacing={1} minWidth={0}>
                <Typography variant="h6" noWrap>
                  {block.title}
                </Typography>
                <Chip
                  label={block.category}
                  size="small"
                  sx={{
                    alignSelf: 'flex-start',
                    backgroundColor: alpha('#F5A623', 0.12),
                  }}
                />
              </Stack>
              {block.pinned ? <PushPinRoundedIcon color="primary" fontSize="small" /> : null}
            </Stack>

            <Typography color="text.secondary" sx={{ minHeight: 66 }}>
              {latestNote?.content ?? 'Здесь пока пусто. Создайте первую заметку внутри блока.'}
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mt="auto"
              color="text.secondary"
            >
              <Stack direction="row" spacing={0.75} alignItems="center">
                <StickyNote2RoundedIcon fontSize="small" />
                <Typography variant="body2">{notes.length} заметок</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <AccessTimeRoundedIcon fontSize="small" />
                <Typography variant="body2">{dayjs(block.updatedAt).format('DD.MM.YYYY')}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
