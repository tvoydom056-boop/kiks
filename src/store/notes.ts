import dayjs from 'dayjs'
import type { PaletteMode } from '@mui/material'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BlockCategory = 'Личное' | 'Работа' | 'Учёба' | 'Без категории'
export type NotePriority = 'Обычная' | 'Важная' | 'Срочная'
export type NoteTag = 'Идея' | 'Задача' | 'Напоминание' | 'Черновик'
export type NoteView = 'list' | 'grid'
export type NotificationChannel = 'Push' | 'Email' | 'SMS'

export interface NoteBlock {
  id: string
  title: string
  category: BlockCategory
  pinned: boolean
  visibleEverywhere: boolean
  createdAt: string
  updatedAt: string
}

export interface NoteItemRecord {
  id: string
  blockId: string
  title: string
  content: string
  datetime: string
  createdAt: string
  updatedAt: string
  priority: NotePriority
  tags: NoteTag[]
  importance: number
  remind: boolean
  completed: boolean
}

export interface AppSettings {
  displayName: string
  birthDate: string | null
  notificationTime: string | null
  defaultView: NoteView
  notifications: NotificationChannel[]
  themeMode: PaletteMode
  autosave: boolean
  fontSize: number
  privacyAccepted: boolean
}

interface CreateBlockInput {
  title: string
  category: BlockCategory
  pinned: boolean
  visibleEverywhere: boolean
}

interface CreateNoteInput {
  blockId: string
  title: string
  content: string
  datetime: string
  priority: NotePriority
  tags: NoteTag[]
  importance: number
  remind: boolean
  completed: boolean
}

interface UpdateNoteInput {
  title?: string
  content?: string
  datetime?: string
  priority?: NotePriority
  tags?: NoteTag[]
  importance?: number
  remind?: boolean
  completed?: boolean
}

interface NotesState {
  blocks: NoteBlock[]
  notes: NoteItemRecord[]
  settings: AppSettings
  createBlock: (payload: CreateBlockInput) => string
  createNote: (payload: CreateNoteInput) => string
  updateNote: (noteId: string, payload: UpdateNoteInput) => void
  saveSettings: (payload: AppSettings) => void
  setThemeMode: (mode: PaletteMode) => void
}

export const BLOCK_CATEGORIES: BlockCategory[] = ['Личное', 'Работа', 'Учёба', 'Без категории']
export const NOTE_PRIORITIES: NotePriority[] = ['Обычная', 'Важная', 'Срочная']
export const NOTE_TAGS: NoteTag[] = ['Идея', 'Задача', 'Напоминание', 'Черновик']
export const NOTIFICATION_CHANNELS: NotificationChannel[] = ['Push', 'Email', 'SMS']

const now = dayjs()
const journalBlockId = 'block-journal'
const workBlockId = 'block-work'
const uncategorizedBlockId = 'block-uncategorized'

const initialBlocks: NoteBlock[] = [
  {
    id: journalBlockId,
    title: 'Личный журнал',
    category: 'Личное',
    pinned: true,
    visibleEverywhere: true,
    createdAt: now.subtract(12, 'day').toISOString(),
    updatedAt: now.subtract(1, 'hour').toISOString(),
  },
  {
    id: workBlockId,
    title: 'Продуктовые идеи',
    category: 'Работа',
    pinned: false,
    visibleEverywhere: true,
    createdAt: now.subtract(7, 'day').toISOString(),
    updatedAt: now.subtract(4, 'hour').toISOString(),
  },
  {
    id: uncategorizedBlockId,
    title: 'Быстрые мысли',
    category: 'Без категории',
    pinned: false,
    visibleEverywhere: true,
    createdAt: now.subtract(2, 'day').toISOString(),
    updatedAt: now.subtract(8, 'hour').toISOString(),
  },
]

const initialNotes: NoteItemRecord[] = [
  {
    id: 'note-journal-1',
    blockId: journalBlockId,
    title: 'Маршрут на апрель',
    content:
      'Собрать короткий список мест, куда хочется выбраться на длинных выходных, и сохранить ссылки на билеты.',
    datetime: now.subtract(2, 'hour').toISOString(),
    createdAt: now.subtract(2, 'hour').toISOString(),
    updatedAt: now.subtract(1, 'hour').toISOString(),
    priority: 'Важная',
    tags: ['Идея', 'Напоминание'],
    importance: 7,
    remind: true,
    completed: false,
  },
  {
    id: 'note-work-1',
    blockId: workBlockId,
    title: 'Новый онбординг',
    content:
      'Подумать над сценарием первого запуска: короткий тур, шаблоны заметок и мягкое предложение включить синхронизацию.',
    datetime: now.subtract(1, 'day').toISOString(),
    createdAt: now.subtract(1, 'day').toISOString(),
    updatedAt: now.subtract(4, 'hour').toISOString(),
    priority: 'Срочная',
    tags: ['Задача', 'Черновик'],
    importance: 9,
    remind: true,
    completed: false,
  },
  {
    id: 'note-quick-1',
    blockId: uncategorizedBlockId,
    title: 'Подарок на май',
    content: 'Сравнить три варианта и записать, что нравится в каждом, пока идея не вылетела из головы.',
    datetime: now.subtract(3, 'day').toISOString(),
    createdAt: now.subtract(3, 'day').toISOString(),
    updatedAt: now.subtract(8, 'hour').toISOString(),
    priority: 'Обычная',
    tags: ['Идея'],
    importance: 5,
    remind: false,
    completed: false,
  },
]

const initialSettings: AppSettings = {
  displayName: 'Дарья',
  birthDate: now.subtract(27, 'year').toISOString(),
  notificationTime: now.hour(9).minute(30).second(0).millisecond(0).toISOString(),
  defaultView: 'list',
  notifications: ['Push', 'Email'],
  themeMode: 'dark',
  autosave: true,
  fontSize: 16,
  privacyAccepted: true,
}

const updateBlockTimestamp = (blocks: NoteBlock[], blockId: string, updatedAt: string) =>
  blocks.map((block) => (block.id === blockId ? { ...block, updatedAt } : block))

export const useNotesStore = create<NotesState>()(
  persist(
    (set) => ({
      blocks: initialBlocks,
      notes: initialNotes,
      settings: initialSettings,
      createBlock: (payload) => {
        const id = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        set((state) => ({
          blocks: [
            {
              id,
              title: payload.title,
              category: payload.category,
              pinned: payload.pinned,
              visibleEverywhere: payload.visibleEverywhere,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.blocks,
          ],
        }))

        return id
      },
      createNote: (payload) => {
        const id = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        set((state) => ({
          notes: [
            {
              id,
              blockId: payload.blockId,
              title: payload.title,
              content: payload.content,
              datetime: payload.datetime,
              createdAt: timestamp,
              updatedAt: timestamp,
              priority: payload.priority,
              tags: payload.tags,
              importance: payload.importance,
              remind: payload.remind,
              completed: payload.completed,
            },
            ...state.notes,
          ],
          blocks: updateBlockTimestamp(state.blocks, payload.blockId, timestamp),
        }))

        return id
      },
      updateNote: (noteId, payload) => {
        const timestamp = new Date().toISOString()

        set((state) => {
          const currentNote = state.notes.find((note) => note.id === noteId)

          if (!currentNote) {
            return state
          }

          return {
            notes: state.notes.map((note) =>
              note.id === noteId
                ? {
                    ...note,
                    ...payload,
                    updatedAt: timestamp,
                  }
                : note,
            ),
            blocks: updateBlockTimestamp(state.blocks, currentNote.blockId, timestamp),
          }
        })
      },
      saveSettings: (payload) => {
        set(() => ({
          settings: payload,
        }))
      },
      setThemeMode: (mode) => {
        set((state) => ({
          settings: {
            ...state.settings,
            themeMode: mode,
          },
        }))
      },
    }),
    {
      name: 'notes-app-store',
    },
  ),
)
