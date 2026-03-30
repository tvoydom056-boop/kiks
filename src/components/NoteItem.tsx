import ArrowOutwardRoundedIcon from '@mui/icons-material/ArrowOutwardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import PriorityHighRoundedIcon from '@mui/icons-material/PriorityHighRounded'
import { alpha, Card, CardActionArea, Chip, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { Link as RouterLink } from 'react-router-dom'
import type { NoteItemRecord } from '../store/notes'

interface NoteItemProps {
  blockId: string
  note: NoteItemRecord
}

export const NoteItem = ({ blockId, note }: NoteItemProps) => (
  <Card sx={{ mb: 1.5 }}>
    <CardActionArea component={RouterLink} to={`/block/${blockId}/note/${note.id}`}>
      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="subtitle1" noWrap>
            {note.title}
          </Typography>
          <ArrowOutwardRoundedIcon color="action" fontSize="small" />
        </Stack>

        <Typography color="text.secondary">{note.content || 'Без текста'}</Typography>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            icon={<PriorityHighRoundedIcon />}
            label={note.priority}
            sx={{
              backgroundColor:
                note.priority === 'Срочная'
                  ? alpha('#ef4444', 0.16)
                  : note.priority === 'Важная'
                    ? alpha('#F5A623', 0.18)
                    : undefined,
            }}
          />
          {note.completed ? (
            <Chip size="small" icon={<CheckCircleRoundedIcon />} label="Выполнена" color="success" />
          ) : null}
          <Typography variant="caption" color="text.secondary">
            {dayjs(note.datetime).format('HH:mm')}
          </Typography>
        </Stack>
      </Stack>
    </CardActionArea>
  </Card>
)
