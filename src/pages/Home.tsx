import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import {
  Card,
  CardContent,
  Chip,
  Container,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { AppHeader } from '../components/AppHeader'
import { EmptyState } from '../components/EmptyState'
import { StatCard } from '../components/StatCard'
import { MUSCLE_GROUPS, useNotesStore } from '../store/notes'

const getVolume = (sets: number, reps: number, weightKg: number) => sets * reps * weightKg
const getOneRepMax = (weightKg: number, reps: number) => (reps <= 1 ? weightKg : weightKg * (1 + reps / 30))

export const Home = () => {
  const settings = useNotesStore((state) => state.settings)
  const logs = useNotesStore((state) => state.workoutLogs)
  const templates = useNotesStore((state) => state.exerciseTemplates)

  const now = dayjs()
  const weekStart = now.startOf('week')
  const prevWeekStart = weekStart.subtract(1, 'week')
  const currentWeekLogs = logs.filter(
    (log) => dayjs(log.date).isAfter(weekStart) && log.status === 'completed',
  )
  const previousWeekLogs = logs.filter(
    (log) =>
      dayjs(log.date).isAfter(prevWeekStart) &&
      dayjs(log.date).isBefore(weekStart) &&
      log.status === 'completed',
  )

  const weeklyVolume = currentWeekLogs
    .flatMap((log) => log.exercises)
    .reduce((sum, exercise) => sum + getVolume(exercise.sets, exercise.reps, exercise.weightKg), 0)
  const previousWeeklyVolume = previousWeekLogs
    .flatMap((log) => log.exercises)
    .reduce((sum, exercise) => sum + getVolume(exercise.sets, exercise.reps, exercise.weightKg), 0)

  const benchHistory = logs
    .flatMap((log) => log.exercises.map((exercise) => ({ ...exercise, date: log.date })))
    .filter((exercise) => exercise.templateId === 'bench-press' && exercise.weightKg > 0)
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  const benchStart = benchHistory[0]
  const benchLatest = benchHistory[benchHistory.length - 1]
  const benchGrowthPercent =
    benchStart && benchLatest ? ((benchLatest.weightKg - benchStart.weightKg) / benchStart.weightKg) * 100 : 0

  const prs = templates
    .map((template) => {
      const best = logs
        .flatMap((log) => log.exercises)
        .filter((exercise) => exercise.templateId === template.id)
        .reduce(
          (max, exercise) => Math.max(max, getOneRepMax(exercise.weightKg, exercise.reps)),
          0,
        )

      return { name: template.name, value: best }
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)

  const bestPr = prs[0]
  const streakDates = logs
    .filter((log) => log.status === 'completed')
    .map((log) => dayjs(log.date).startOf('day').format('YYYY-MM-DD'))
  const streakSet = new Set(streakDates)
  let streak = 0
  let cursor = now.startOf('day')
  while (streakSet.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }

  const muscleCounts = MUSCLE_GROUPS.map((group) => ({
    group,
    count: currentWeekLogs.filter((log) => log.muscleGroups.includes(group)).length,
  }))
  const maxMuscleCount = Math.max(...muscleCounts.map((item) => item.count), 1)
  const weekDelta = weeklyVolume - previousWeeklyVolume

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
      <Stack spacing={3}>
        <AppHeader
          title="Workout Dashboard"
          subtitle={`${settings.displayName}, вот как выглядит ваша неделя по объёму, прогрессу силы и качеству плана.`}
        />

        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <StatCard
            label="Тренировок за неделю"
            value={String(currentWeekLogs.length)}
            caption="Считаются только выполненные сессии"
            icon={<FitnessCenterRoundedIcon color="primary" />}
          />
          <StatCard
            label="Общий тоннаж"
            value={`${weeklyVolume.toLocaleString('ru-RU')} кг`}
            caption="Сумма подходов × повторений × веса"
            icon={<BarChartRoundedIcon color="primary" />}
          />
          <StatCard
            label="Лучший PR"
            value={bestPr ? `${bestPr.value.toFixed(0)} кг` : 'Нет данных'}
            caption={bestPr ? bestPr.name : 'Появится после логов'}
            icon={<EmojiEventsRoundedIcon color="primary" />}
          />
          <StatCard
            label="Текущий стрик"
            value={`${streak} дн.`}
            caption="Подряд выполненные тренировочные дни"
            icon={<BoltRoundedIcon color="primary" />}
          />
        </Stack>

        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
            gap: 2,
          }}
        >
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Прогрессия весов и сила</Typography>
                  <TrendingUpRoundedIcon color="primary" />
                </Stack>
                {benchHistory.length ? (
                  <>
                    <Typography color="text.secondary">
                      На жиме лёжа вы стали сильнее на {benchGrowthPercent.toFixed(1)}% по рабочему весу.
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {benchHistory.map((entry, index) => (
                        <Chip
                          key={`${entry.date}-${index}`}
                          label={`${dayjs(entry.date).format('DD.MM')} · ${entry.weightKg} кг`}
                          color={index === benchHistory.length - 1 ? 'primary' : 'default'}
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Расчёт роста силы строится по динамике рабочего веса в журнале и дополняется оценкой 1RM.
                    </Typography>
                  </>
                ) : (
                  <EmptyState
                    title="Недостаточно данных для графика"
                    description="Как только появятся несколько логов по одному упражнению, здесь отобразится рост силы."
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Сравнение недель</Typography>
                  <InsightsRoundedIcon color="primary" />
                </Stack>
                <Typography variant="h4">
                  {weekDelta >= 0 ? '+' : ''}
                  {weekDelta.toLocaleString('ru-RU')} кг
                </Typography>
                <Typography color="text.secondary">
                  По сравнению с прошлой неделей вы {weekDelta >= 0 ? 'увеличили' : 'снизили'} объём на{' '}
                  {Math.abs(weekDelta).toLocaleString('ru-RU')} кг.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Прошлая неделя: {previousWeeklyVolume.toLocaleString('ru-RU')} кг
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Личные рекорды и 1RM</Typography>
                {prs.length ? (
                  prs.map((pr) => (
                    <Stack key={pr.name} direction="row" justifyContent="space-between" alignItems="center">
                      <Typography>{pr.name}</Typography>
                      <Chip label={`1RM ${pr.value.toFixed(0)} кг`} color="primary" />
                    </Stack>
                  ))
                ) : (
                  <Typography color="text.secondary">Личные рекорды появятся после первых заполненных тренировок.</Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Мышечная карта недели</Typography>
                {muscleCounts.map((item) => (
                  <Stack key={item.group} spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{item.group}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count} сесс.
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / maxMuscleCount) * 100}
                      sx={{ height: 8, borderRadius: 999 }}
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Container>
  )
}
