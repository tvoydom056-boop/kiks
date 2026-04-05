import dayjs from 'dayjs'
import type { PaletteMode } from '@mui/material'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MuscleGroup =
  | 'Кисть'
  | 'Пальцы'
  | 'Пронация'
  | 'Луч'
  | 'Боковое давление'
  | 'Спина'
  | 'Плечо'

export type EquipmentType = 'Стол' | 'Резина' | 'Блок' | 'Гантель' | 'Ремень'
export type WorkoutStatus = 'planned' | 'completed' | 'missed'
export type NoteView = 'list' | 'grid'
export type NotificationChannel = 'Push' | 'Email' | 'SMS'

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

export interface ExerciseTemplate {
  id: string
  name: string
  muscleGroup: MuscleGroup
  equipment: EquipmentType
}

export interface ExercisePrescription {
  id: string
  templateId: string
  sets: number
  reps: number
  weightKg: number
  restSec: number
}

export interface WorkingSet {
  id: string
  title: string
  sets: number
  reps: number
  loadKg: number
  restSec: number
}

export interface TrainingPlan {
  workingSets: WorkingSet[]
  drillMoments: string[]
  matchFocusPoints: string[]
}

export interface ProgramDay {
  id: string
  weekday: number
  title: string
  focus: MuscleGroup[]
  exerciseIds: string[]
  trainingPlan: TrainingPlan
}

export interface WorkoutProgram {
  id: string
  name: string
  goal: string
  durationWeeks: number
  pinned: boolean
  createdAt: string
  updatedAt: string
  days: ProgramDay[]
}

export interface WorkoutLogExercise {
  templateId: string
  weightKg: number
  reps: number
  sets: number
}

export interface WorkoutLog {
  id: string
  date: string
  programId: string
  programDayId: string
  title: string
  status: WorkoutStatus
  muscleGroups: MuscleGroup[]
  exercises: WorkoutLogExercise[]
}

export interface NoteSection {
  id: string
  name: string
  createdAt: string
}

export interface NoteRecord {
  id: string
  sectionId: string
  title: string
  content: string
  noteDate: string
  createdAt: string
  updatedAt: string
}

export interface ProgramDayInput {
  id?: string
  weekday: number
  title: string
  focus: MuscleGroup[]
  exerciseIds: string[]
  trainingPlan: TrainingPlan
}

interface CreateProgramInput {
  name: string
  goal: string
  durationWeeks: number
  pinned: boolean
  days: ProgramDayInput[]
}

interface CreateExerciseInput {
  name: string
  muscleGroup: MuscleGroup
  equipment: EquipmentType
  sets: number
  reps: number
  weightKg: number
  restSec: number
}

interface CreateNoteInput {
  sectionId: string
  title: string
  content: string
  noteDate: string
}

interface FitnessState {
  settings: AppSettings
  exerciseTemplates: ExerciseTemplate[]
  prescriptions: ExercisePrescription[]
  programs: WorkoutProgram[]
  workoutLogs: WorkoutLog[]
  noteSections: NoteSection[]
  notes: NoteRecord[]
  createProgram: (payload: CreateProgramInput) => string
  updateProgram: (programId: string, payload: CreateProgramInput) => void
  deleteProgram: (programId: string) => void
  createExerciseTemplate: (payload: CreateExerciseInput) => string
  updateExerciseTemplate: (templateId: string, payload: CreateExerciseInput) => void
  deleteExerciseTemplate: (templateId: string) => void
  createNoteSection: (name: string) => string
  updateNoteSection: (sectionId: string, name: string) => void
  deleteNoteSection: (sectionId: string) => void
  createNote: (payload: CreateNoteInput) => string
  updateNote: (noteId: string, payload: CreateNoteInput) => void
  deleteNote: (noteId: string) => void
  saveSettings: (payload: AppSettings) => void
  setThemeMode: (mode: PaletteMode) => void
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Кисть',
  'Пальцы',
  'Пронация',
  'Луч',
  'Боковое давление',
  'Спина',
  'Плечо',
]
export const EQUIPMENT_TYPES: EquipmentType[] = ['Стол', 'Резина', 'Блок', 'Гантель', 'Ремень']
export const NOTIFICATION_CHANNELS: NotificationChannel[] = ['Push', 'Email', 'SMS']
export const WEEKDAY_OPTIONS = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
  { value: 0, label: 'Воскресенье' },
] as const
export const DEFAULT_NOTE_SECTION_ID = 'default-note-section'

const now = dayjs()

const defaultTrainingPlan = (): TrainingPlan => ({
  workingSets: [
    {
      id: crypto.randomUUID(),
      title: 'Подъём на пронацию',
      sets: 4,
      reps: 6,
      loadKg: 22,
      restSec: 90,
    },
  ],
  drillMoments: ['Старт с удержанием кисти', 'Выход в верх через пронацию'],
  matchFocusPoints: ['Не терять угол в кисти', 'Давить вверх прежде чем уходить вбок'],
})

const normalizeTrainingPlan = (value?: Partial<TrainingPlan>): TrainingPlan => ({
  workingSets:
    value?.workingSets?.map((item) => ({
      id: item.id ?? crypto.randomUUID(),
      title: item.title ?? 'Рабочий подход',
      sets: Number(item.sets ?? 3),
      reps: Number(item.reps ?? 5),
      loadKg: Number(item.loadKg ?? 0),
      restSec: Number(item.restSec ?? 60),
    })) ?? defaultTrainingPlan().workingSets,
  drillMoments:
    value?.drillMoments?.filter((item): item is string => Boolean(item?.trim())) ??
    defaultTrainingPlan().drillMoments,
  matchFocusPoints:
    value?.matchFocusPoints?.filter((item): item is string => Boolean(item?.trim())) ??
    defaultTrainingPlan().matchFocusPoints,
})

const normalizeProgramDay = (day: ProgramDayInput): ProgramDay => ({
  id: day.id ?? crypto.randomUUID(),
  weekday: day.weekday,
  title: day.title,
  focus: day.focus,
  exerciseIds: day.exerciseIds,
  trainingPlan: normalizeTrainingPlan(day.trainingPlan),
})

const normalizePrograms = (value: unknown): WorkoutProgram[] =>
  Array.isArray(value)
    ? value.map((program) => {
        const typedProgram = program as WorkoutProgram

        return {
          ...typedProgram,
          days: Array.isArray(typedProgram.days)
            ? typedProgram.days.map((day) => ({
                ...day,
                trainingPlan: normalizeTrainingPlan(day.trainingPlan),
              }))
            : [],
        }
      })
    : []

const normalizeNoteSections = (value: unknown): NoteSection[] => {
  const sections = Array.isArray(value) ? (value as NoteSection[]) : []
  const hasDefault = sections.some((section) => section.id === DEFAULT_NOTE_SECTION_ID)

  return hasDefault
    ? sections
    : [
        {
          id: DEFAULT_NOTE_SECTION_ID,
          name: 'Без раздела',
          createdAt: now.toISOString(),
        },
        ...sections,
      ]
}

const normalizeNotes = (value: unknown): NoteRecord[] =>
  Array.isArray(value)
    ? (value as NoteRecord[]).map((note) => ({
        ...note,
        sectionId: note.sectionId || DEFAULT_NOTE_SECTION_ID,
        noteDate: note.noteDate || note.createdAt,
      }))
    : []

const exerciseTemplates: ExerciseTemplate[] = [
  { id: 'table-toproll', name: 'Выход в верх на столе', muscleGroup: 'Пронация', equipment: 'Стол' },
  { id: 'pronation-rise', name: 'Подъём на пронацию', muscleGroup: 'Пронация', equipment: 'Блок' },
  { id: 'cupping-hold', name: 'Статическое удержание кисти', muscleGroup: 'Кисть', equipment: 'Ремень' },
  { id: 'side-pressure', name: 'Боковое давление в блоке', muscleGroup: 'Боковое давление', equipment: 'Блок' },
  { id: 'finger-containment', name: 'Удержание пальцев резиной', muscleGroup: 'Пальцы', equipment: 'Резина' },
  { id: 'riser-dumbbell', name: 'Подъём на луч с гантелью', muscleGroup: 'Луч', equipment: 'Гантель' },
]

const prescriptions: ExercisePrescription[] = [
  { id: 'pres-1', templateId: 'table-toproll', sets: 6, reps: 3, weightKg: 0, restSec: 75 },
  { id: 'pres-2', templateId: 'pronation-rise', sets: 4, reps: 6, weightKg: 24, restSec: 90 },
  { id: 'pres-3', templateId: 'cupping-hold', sets: 5, reps: 12, weightKg: 32, restSec: 60 },
  { id: 'pres-4', templateId: 'side-pressure', sets: 5, reps: 5, weightKg: 28, restSec: 105 },
  { id: 'pres-5', templateId: 'finger-containment', sets: 4, reps: 15, weightKg: 18, restSec: 45 },
  { id: 'pres-6', templateId: 'riser-dumbbell', sets: 4, reps: 8, weightKg: 16, restSec: 75 },
]

const programs: WorkoutProgram[] = [
  {
    id: 'kiks-toproll-camp',
    name: 'kiks: верх и контроль кисти',
    goal: 'Собрать уверенный старт в верх, удержать кисть в центре и усилить боковое давление под спарринги.',
    durationWeeks: 6,
    pinned: true,
    createdAt: now.subtract(6, 'week').toISOString(),
    updatedAt: now.subtract(1, 'day').toISOString(),
    days: [
      {
        id: 'kiks-mon',
        weekday: 1,
        title: 'Понедельник — стол и пронация',
        focus: ['Пронация', 'Кисть', 'Луч'],
        exerciseIds: ['table-toproll', 'pronation-rise', 'riser-dumbbell'],
        trainingPlan: {
          workingSets: [
            { id: 'ws-1', title: 'Подъём на пронацию', sets: 4, reps: 6, loadKg: 24, restSec: 90 },
            { id: 'ws-2', title: 'Подъём на луч с гантелью', sets: 4, reps: 8, loadKg: 16, restSec: 75 },
          ],
          drillMoments: ['Старт с малой амплитудой на столе', 'Удержание кисти после команды Ready Go'],
          matchFocusPoints: ['Сразу забирать высоту', 'Не открывать пальцы под давлением соперника'],
        },
      },
      {
        id: 'kiks-wed',
        weekday: 3,
        title: 'Среда — боковое давление и пальцы',
        focus: ['Боковое давление', 'Пальцы', 'Спина'],
        exerciseIds: ['side-pressure', 'finger-containment', 'table-toproll'],
        trainingPlan: {
          workingSets: [
            { id: 'ws-3', title: 'Боковое давление в блоке', sets: 5, reps: 5, loadKg: 28, restSec: 105 },
            { id: 'ws-4', title: 'Удержание пальцев резиной', sets: 4, reps: 15, loadKg: 18, restSec: 45 },
          ],
          drillMoments: ['Подрыв локтем без провала плеча', 'Заведение кисти внутрь при контакте'],
          matchFocusPoints: ['Не уходить в чистый бок без кисти', 'Держать плечо за рукой'],
        },
      },
      {
        id: 'kiks-fri',
        weekday: 5,
        title: 'Пятница — контроль центра и удержания',
        focus: ['Кисть', 'Пронация', 'Плечо'],
        exerciseIds: ['cupping-hold', 'table-toproll', 'pronation-rise'],
        trainingPlan: {
          workingSets: [
            { id: 'ws-5', title: 'Статическое удержание кисти', sets: 5, reps: 12, loadKg: 32, restSec: 60 },
            { id: 'ws-6', title: 'Выход в верх на столе', sets: 6, reps: 3, loadKg: 0, restSec: 75 },
          ],
          drillMoments: ['Удержание центра 5 секунд', 'Перевод в финиш без потери кисти'],
          matchFocusPoints: ['Дышать и не срываться в рывок', 'Дожимать через кисть, а не только корпусом'],
        },
      },
    ],
  },
]

const workoutLogs: WorkoutLog[] = [
  {
    id: 'log-1',
    date: now.subtract(13, 'day').toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-mon',
    title: 'Стол и пронация',
    status: 'completed',
    muscleGroups: ['Пронация', 'Кисть', 'Луч'],
    exercises: [
      { templateId: 'pronation-rise', sets: 4, reps: 6, weightKg: 20 },
      { templateId: 'riser-dumbbell', sets: 4, reps: 8, weightKg: 14 },
    ],
  },
  {
    id: 'log-2',
    date: now.subtract(11, 'day').toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-wed',
    title: 'Боковое давление и пальцы',
    status: 'completed',
    muscleGroups: ['Боковое давление', 'Пальцы', 'Спина'],
    exercises: [
      { templateId: 'side-pressure', sets: 5, reps: 5, weightKg: 24 },
      { templateId: 'finger-containment', sets: 4, reps: 15, weightKg: 14 },
    ],
  },
  {
    id: 'log-3',
    date: now.subtract(9, 'day').toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-fri',
    title: 'Контроль центра и удержания',
    status: 'completed',
    muscleGroups: ['Кисть', 'Пронация', 'Плечо'],
    exercises: [
      { templateId: 'cupping-hold', sets: 5, reps: 12, weightKg: 28 },
      { templateId: 'table-toproll', sets: 6, reps: 3, weightKg: 0 },
    ],
  },
  {
    id: 'log-4',
    date: now.subtract(6, 'day').toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-mon',
    title: 'Стол и пронация',
    status: 'completed',
    muscleGroups: ['Пронация', 'Кисть', 'Луч'],
    exercises: [
      { templateId: 'pronation-rise', sets: 4, reps: 6, weightKg: 24 },
      { templateId: 'riser-dumbbell', sets: 4, reps: 8, weightKg: 16 },
    ],
  },
  {
    id: 'log-5',
    date: now.subtract(4, 'day').toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-wed',
    title: 'Боковое давление и пальцы',
    status: 'missed',
    muscleGroups: ['Боковое давление', 'Пальцы', 'Спина'],
    exercises: [],
  },
  {
    id: 'log-6',
    date: now.subtract(2, 'day').toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-fri',
    title: 'Контроль центра и удержания',
    status: 'completed',
    muscleGroups: ['Кисть', 'Пронация', 'Плечо'],
    exercises: [
      { templateId: 'cupping-hold', sets: 5, reps: 12, weightKg: 32 },
      { templateId: 'table-toproll', sets: 6, reps: 3, weightKg: 0 },
    ],
  },
  {
    id: 'log-7',
    date: now.toISOString(),
    programId: 'kiks-toproll-camp',
    programDayId: 'kiks-mon',
    title: 'Сегодня — стол и пронация',
    status: 'planned',
    muscleGroups: ['Пронация', 'Кисть', 'Луч'],
    exercises: [],
  },
]

const noteSections: NoteSection[] = [
  { id: DEFAULT_NOTE_SECTION_ID, name: 'Без раздела', createdAt: now.subtract(20, 'day').toISOString() },
  { id: 'notes-wrestling', name: 'Борьба', createdAt: now.subtract(18, 'day').toISOString() },
  { id: 'notes-exercises', name: 'Упражнения', createdAt: now.subtract(18, 'day').toISOString() },
  { id: 'notes-training', name: 'Тренировка', createdAt: now.subtract(18, 'day').toISOString() },
]

const notes: NoteRecord[] = [
  {
    id: 'note-1',
    sectionId: 'notes-wrestling',
    title: 'Старт слева',
    content: 'На старте не бросать плечо вперёд. Сначала забирать высоту кистью, потом подключать бок.',
    noteDate: now.subtract(2, 'day').toISOString(),
    createdAt: now.subtract(2, 'day').toISOString(),
    updatedAt: now.subtract(2, 'day').toISOString(),
  },
  {
    id: 'note-2',
    sectionId: 'notes-exercises',
    title: 'Пронация через блок',
    content: 'Оставить 4x6 на 24 кг. Если техника не плывёт, со следующей недели добавить ещё 2 кг.',
    noteDate: now.subtract(1, 'day').toISOString(),
    createdAt: now.subtract(1, 'day').toISOString(),
    updatedAt: now.subtract(1, 'day').toISOString(),
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

export const useNotesStore = create<FitnessState>()(
  persist(
    (set) => ({
      settings: initialSettings,
      exerciseTemplates,
      prescriptions,
      programs,
      workoutLogs,
      noteSections,
      notes,
      createProgram: (payload) => {
        const id = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        set((state) => ({
          programs: [
            {
              id,
              name: payload.name,
              goal: payload.goal,
              durationWeeks: payload.durationWeeks,
              pinned: payload.pinned,
              createdAt: timestamp,
              updatedAt: timestamp,
              days: payload.days.map((day) => normalizeProgramDay(day)),
            },
            ...state.programs,
          ],
        }))

        return id
      },
      updateProgram: (programId, payload) => {
        const timestamp = new Date().toISOString()

        set((state) => ({
          programs: state.programs.map((program) =>
            program.id === programId
              ? {
                  ...program,
                  name: payload.name,
                  goal: payload.goal,
                  durationWeeks: payload.durationWeeks,
                  pinned: payload.pinned,
                  updatedAt: timestamp,
                  days: payload.days.map((day) => normalizeProgramDay(day)),
                }
              : program,
          ),
        }))
      },
      deleteProgram: (programId) =>
        set((state) => ({
          programs: state.programs.filter((program) => program.id !== programId),
          workoutLogs: state.workoutLogs.filter((log) => log.programId !== programId),
        })),
      createExerciseTemplate: (payload) => {
        const templateId = crypto.randomUUID()
        const prescriptionId = crypto.randomUUID()

        set((state) => ({
          exerciseTemplates: [
            {
              id: templateId,
              name: payload.name,
              muscleGroup: payload.muscleGroup,
              equipment: payload.equipment,
            },
            ...state.exerciseTemplates,
          ],
          prescriptions: [
            {
              id: prescriptionId,
              templateId,
              sets: payload.sets,
              reps: payload.reps,
              weightKg: payload.weightKg,
              restSec: payload.restSec,
            },
            ...state.prescriptions,
          ],
        }))

        return templateId
      },
      updateExerciseTemplate: (templateId, payload) =>
        set((state) => ({
          exerciseTemplates: state.exerciseTemplates.map((template) =>
            template.id === templateId
              ? {
                  ...template,
                  name: payload.name,
                  muscleGroup: payload.muscleGroup,
                  equipment: payload.equipment,
                }
              : template,
          ),
          prescriptions: state.prescriptions.map((prescription) =>
            prescription.templateId === templateId
              ? {
                  ...prescription,
                  sets: payload.sets,
                  reps: payload.reps,
                  weightKg: payload.weightKg,
                  restSec: payload.restSec,
                }
              : prescription,
          ),
        })),
      deleteExerciseTemplate: (templateId) =>
        set((state) => ({
          exerciseTemplates: state.exerciseTemplates.filter((template) => template.id !== templateId),
          prescriptions: state.prescriptions.filter((prescription) => prescription.templateId !== templateId),
          programs: state.programs.map((program) => ({
            ...program,
            days: program.days.map((day) => ({
              ...day,
              exerciseIds: day.exerciseIds.filter((exerciseId) => exerciseId !== templateId),
            })),
          })),
          workoutLogs: state.workoutLogs.map((log) => ({
            ...log,
            exercises: log.exercises.filter((exercise) => exercise.templateId !== templateId),
          })),
        })),
      createNoteSection: (name) => {
        const id = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        set((state) => ({
          noteSections: [...state.noteSections, { id, name, createdAt: timestamp }],
        }))

        return id
      },
      updateNoteSection: (sectionId, name) =>
        set((state) => ({
          noteSections: state.noteSections.map((section) =>
            section.id === sectionId ? { ...section, name } : section,
          ),
        })),
      deleteNoteSection: (sectionId) =>
        set((state) => ({
          noteSections: state.noteSections.filter(
            (section) => section.id !== sectionId || section.id === DEFAULT_NOTE_SECTION_ID,
          ),
          notes: state.notes.map((note) =>
            note.sectionId === sectionId ? { ...note, sectionId: DEFAULT_NOTE_SECTION_ID } : note,
          ),
        })),
      createNote: (payload) => {
        const id = crypto.randomUUID()
        const timestamp = new Date().toISOString()

        set((state) => ({
          notes: [
            {
              id,
              sectionId: payload.sectionId,
              title: payload.title,
              content: payload.content,
              noteDate: payload.noteDate,
              createdAt: timestamp,
              updatedAt: timestamp,
            },
            ...state.notes,
          ],
        }))

        return id
      },
      updateNote: (noteId, payload) => {
        const timestamp = new Date().toISOString()

        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? {
                  ...note,
                  sectionId: payload.sectionId,
                  title: payload.title,
                  content: payload.content,
                  noteDate: payload.noteDate,
                  updatedAt: timestamp,
                }
              : note,
          ),
        }))
      },
      deleteNote: (noteId) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId),
        })),
      saveSettings: (payload) => set(() => ({ settings: payload })),
      setThemeMode: (mode) =>
        set((state) => ({
          settings: {
            ...state.settings,
            themeMode: mode,
          },
        })),
    }),
    {
      name: 'kiks-armwrestling-store',
      version: 3,
      migrate: (persistedState) => {
        const typedState = persistedState as Partial<FitnessState> | undefined

        return {
          ...typedState,
          programs: normalizePrograms(typedState?.programs),
          noteSections: normalizeNoteSections(typedState?.noteSections),
          notes: normalizeNotes(typedState?.notes),
        }
      },
    },
  ),
)
