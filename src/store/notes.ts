import dayjs from 'dayjs'
import type { PaletteMode } from '@mui/material'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MuscleGroup =
  | 'Грудь'
  | 'Спина'
  | 'Ноги'
  | 'Плечи'
  | 'Руки'
  | 'Пресс'
  | 'Кардио'

export type EquipmentType = 'Штанга' | 'Гантели' | 'Тренажёр' | 'Собственный вес'
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

export interface ProgramDay {
  id: string
  weekday: number
  title: string
  focus: MuscleGroup[]
  exerciseIds: string[]
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

interface CreateProgramInput {
  name: string
  goal: string
  durationWeeks: number
  pinned: boolean
  days: Array<{
    weekday: number
    title: string
    focus: MuscleGroup[]
    exerciseIds: string[]
  }>
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

interface FitnessState {
  settings: AppSettings
  exerciseTemplates: ExerciseTemplate[]
  prescriptions: ExercisePrescription[]
  programs: WorkoutProgram[]
  workoutLogs: WorkoutLog[]
  createProgram: (payload: CreateProgramInput) => string
  createExerciseTemplate: (payload: CreateExerciseInput) => string
  saveSettings: (payload: AppSettings) => void
  setThemeMode: (mode: PaletteMode) => void
}

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Грудь',
  'Спина',
  'Ноги',
  'Плечи',
  'Руки',
  'Пресс',
  'Кардио',
]
export const EQUIPMENT_TYPES: EquipmentType[] = ['Штанга', 'Гантели', 'Тренажёр', 'Собственный вес']
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

const now = dayjs()

const exerciseTemplates: ExerciseTemplate[] = [
  { id: 'bench-press', name: 'Жим лёжа', muscleGroup: 'Грудь', equipment: 'Штанга' },
  { id: 'barbell-row', name: 'Тяга штанги в наклоне', muscleGroup: 'Спина', equipment: 'Штанга' },
  { id: 'squat', name: 'Приседания', muscleGroup: 'Ноги', equipment: 'Штанга' },
  { id: 'shoulder-press', name: 'Жим гантелей сидя', muscleGroup: 'Плечи', equipment: 'Гантели' },
  { id: 'pull-up', name: 'Подтягивания', muscleGroup: 'Спина', equipment: 'Собственный вес' },
  { id: 'plank', name: 'Планка', muscleGroup: 'Пресс', equipment: 'Собственный вес' },
]

const prescriptions: ExercisePrescription[] = [
  { id: 'pres-1', templateId: 'bench-press', sets: 4, reps: 8, weightKg: 80, restSec: 90 },
  { id: 'pres-2', templateId: 'shoulder-press', sets: 3, reps: 10, weightKg: 22, restSec: 75 },
  { id: 'pres-3', templateId: 'barbell-row', sets: 4, reps: 8, weightKg: 70, restSec: 90 },
  { id: 'pres-4', templateId: 'pull-up', sets: 4, reps: 10, weightKg: 0, restSec: 60 },
  { id: 'pres-5', templateId: 'squat', sets: 5, reps: 5, weightKg: 110, restSec: 120 },
  { id: 'pres-6', templateId: 'plank', sets: 3, reps: 1, weightKg: 0, restSec: 45 },
]

const programs: WorkoutProgram[] = [
  {
    id: 'strength-split',
    name: 'Силовой сплит',
    goal: 'Рост силы в базовых упражнениях и стабильный тоннаж по неделе.',
    durationWeeks: 8,
    pinned: true,
    createdAt: now.subtract(8, 'week').toISOString(),
    updatedAt: now.subtract(1, 'day').toISOString(),
    days: [
      {
        id: 'strength-mon',
        weekday: 1,
        title: 'Понедельник — грудь и плечи',
        focus: ['Грудь', 'Плечи'],
        exerciseIds: ['pres-1', 'pres-2'],
      },
      {
        id: 'strength-wed',
        weekday: 3,
        title: 'Среда — спина',
        focus: ['Спина', 'Руки'],
        exerciseIds: ['pres-3', 'pres-4'],
      },
      {
        id: 'strength-fri',
        weekday: 5,
        title: 'Пятница — ноги',
        focus: ['Ноги', 'Пресс'],
        exerciseIds: ['pres-5', 'pres-6'],
      },
    ],
  },
]

const workoutLogs: WorkoutLog[] = [
  {
    id: 'log-1',
    date: now.subtract(13, 'day').toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-mon',
    title: 'Понедельник — грудь и плечи',
    status: 'completed',
    muscleGroups: ['Грудь', 'Плечи'],
    exercises: [
      { templateId: 'bench-press', sets: 4, reps: 8, weightKg: 75 },
      { templateId: 'shoulder-press', sets: 3, reps: 10, weightKg: 20 },
    ],
  },
  {
    id: 'log-2',
    date: now.subtract(11, 'day').toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-wed',
    title: 'Среда — спина',
    status: 'completed',
    muscleGroups: ['Спина', 'Руки'],
    exercises: [
      { templateId: 'barbell-row', sets: 4, reps: 8, weightKg: 65 },
      { templateId: 'pull-up', sets: 4, reps: 10, weightKg: 0 },
    ],
  },
  {
    id: 'log-3',
    date: now.subtract(9, 'day').toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-fri',
    title: 'Пятница — ноги',
    status: 'completed',
    muscleGroups: ['Ноги', 'Пресс'],
    exercises: [
      { templateId: 'squat', sets: 5, reps: 5, weightKg: 105 },
      { templateId: 'plank', sets: 3, reps: 1, weightKg: 0 },
    ],
  },
  {
    id: 'log-4',
    date: now.subtract(6, 'day').toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-mon',
    title: 'Понедельник — грудь и плечи',
    status: 'completed',
    muscleGroups: ['Грудь', 'Плечи'],
    exercises: [
      { templateId: 'bench-press', sets: 4, reps: 8, weightKg: 80 },
      { templateId: 'shoulder-press', sets: 3, reps: 10, weightKg: 22 },
    ],
  },
  {
    id: 'log-5',
    date: now.subtract(4, 'day').toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-wed',
    title: 'Среда — спина',
    status: 'missed',
    muscleGroups: ['Спина', 'Руки'],
    exercises: [],
  },
  {
    id: 'log-6',
    date: now.subtract(2, 'day').toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-fri',
    title: 'Пятница — ноги',
    status: 'completed',
    muscleGroups: ['Ноги', 'Пресс'],
    exercises: [
      { templateId: 'squat', sets: 5, reps: 5, weightKg: 110 },
      { templateId: 'plank', sets: 3, reps: 1, weightKg: 0 },
    ],
  },
  {
    id: 'log-7',
    date: now.toISOString(),
    programId: 'strength-split',
    programDayId: 'strength-mon',
    title: 'Сегодня — грудь и плечи',
    status: 'planned',
    muscleGroups: ['Грудь', 'Плечи'],
    exercises: [],
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
              days: payload.days.map((day) => ({
                id: crypto.randomUUID(),
                weekday: day.weekday,
                title: day.title,
                focus: day.focus,
                exerciseIds: day.exerciseIds,
              })),
            },
            ...state.programs,
          ],
        }))

        return id
      },
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
      name: 'fitness-tracker-store',
    },
  ),
)
