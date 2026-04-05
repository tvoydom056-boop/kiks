import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded'
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded'
import SportsMmaRoundedIcon from '@mui/icons-material/SportsMmaRounded'
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

const getLoadVolume = (sets: number, reps: number, weightKg: number) => sets * reps * weightKg

export const Home = () => {
  const settings = useNotesStore((state) => state.settings)
  const logs = useNotesStore((state) => state.workoutLogs)
  const programs = useNotesStore((state) => state.programs)

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

  const currentWeekDays = programs.flatMap((program) => program.days)
  const currentWeekPlans = currentWeekLogs
    .map((log) => currentWeekDays.find((day) => day.id === log.programDayId))
    .filter((day): day is (typeof currentWeekDays)[number] => Boolean(day))

  const totalLoad = currentWeekLogs
    .flatMap((log) => log.exercises)
    .reduce((sum, exercise) => sum + getLoadVolume(exercise.sets, exercise.reps, exercise.weightKg), 0)
  const previousTotalLoad = previousWeekLogs
    .flatMap((log) => log.exercises)
    .reduce((sum, exercise) => sum + getLoadVolume(exercise.sets, exercise.reps, exercise.weightKg), 0)
  const tableSessions = currentWeekLogs.filter((log) => log.exercises.some((exercise) => exercise.templateId === 'table-toproll')).length
  const totalDrills = currentWeekPlans.reduce((sum, day) => sum + day.trainingPlan.drillMoments.length, 0)

  const pronationHistory = logs
    .flatMap((log) => log.exercises.map((exercise) => ({ ...exercise, date: log.date })))
    .filter((exercise) => exercise.templateId === 'pronation-rise' && exercise.weightKg > 0)
    .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  const pronationStart = pronationHistory[0]
  const pronationLatest = pronationHistory[pronationHistory.length - 1]
  const pronationGrowthPercent =
    pronationStart && pronationLatest
      ? ((pronationLatest.weightKg - pronationStart.weightKg) / pronationStart.weightKg) * 100
      : 0

  const bestLoad = logs
    .flatMap((log) => log.exercises)
    .reduce(
      (best, exercise) => (exercise.weightKg > best.value ? { id: exercise.templateId, value: exercise.weightKg } : best),
      { id: '', value: 0 },
    )

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

  const focusCounts = MUSCLE_GROUPS.map((group) => ({
    group,
    count: currentWeekLogs.filter((log) => log.muscleGroups.includes(group)).length,
  }))
  const maxFocusCount = Math.max(...focusCounts.map((item) => item.count), 1)
  const weekDelta = totalLoad - previousTotalLoad

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
      <Stack spacing={3}>
        <AppHeader
          title="kiks"
          subtitle={`${settings.displayName}, вот как выглядит ваша неделя по столу, кисти, пронации и качеству отработки.`}
        />

        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          <StatCard
            label="Столовых сессий"
            value={String(tableSessions)}
            caption="Считаются выполненные тренировки с работой на столе"
            icon={<SportsMmaRoundedIcon color="primary" />}
          />
          <StatCard
            label="Нагрузка недели"
            value={`${totalLoad.toLocaleString('ru-RU')} кг`}
            caption="Сумма подходов, повторов и рабочей нагрузки"
            icon={<BarChartRoundedIcon color="primary" />}
          />
          <StatCard
            label="Лучшая нагрузка"
            value={bestLoad.value ? `${bestLoad.value.toFixed(0)} кг` : 'Нет данных'}
            caption={bestLoad.id ? 'Лучший рабочий вес по движению' : 'Появится после первых логов'}
            icon={<EmojiEventsRoundedIcon color="primary" />}
          />
          <StatCard
            label="Текущий стрик"
            value={`${streak} дн.`}
            caption="Подряд выполненные дни подготовки"
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
                  <Typography variant="h6">Прогрессия пронации</Typography>
                  <TrendingUpRoundedIcon color="primary" />
                </Stack>
                {pronationHistory.length ? (
                  <>
                    <Typography color="text.secondary">
                      В подъёме на пронацию вы выросли на {pronationGrowthPercent.toFixed(1)}% по рабочему весу.
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {pronationHistory.map((entry, index) => (
                        <Chip
                          key={`${entry.date}-${index}`}
                          label={`${dayjs(entry.date).format('DD.MM')} · ${entry.weightKg} кг`}
                          color={index === pronationHistory.length - 1 ? 'primary' : 'default'}
                        />
                      ))}
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Этот блок отражает, насколько уверенно растёт ваш ключевой armwrestling-паттерн.
                    </Typography>
                  </>
                ) : (
                  <EmptyState
                    title="Недостаточно данных по пронации"
                    description="Как только появятся несколько логов по подъёму на пронацию, здесь отобразится динамика."
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
                  По сравнению с прошлой неделей вы {weekDelta >= 0 ? 'добавили' : 'снизили'} нагрузку на{' '}
                  {Math.abs(weekDelta).toLocaleString('ru-RU')} кг.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Прошлая неделя: {previousTotalLoad.toLocaleString('ru-RU')} кг
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
                <Typography variant="h6">План на текущую неделю</Typography>
                <Typography variant="h4">{totalDrills}</Typography>
                <Typography color="text.secondary">
                  Моментов отработки уже привязано к выполненным дням этой недели.
                </Typography>
                {currentWeekPlans.slice(0, 3).map((day) => (
                  <Stack key={day.id} spacing={0.5}>
                    <Typography>{day.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {day.trainingPlan.matchFocusPoints.join(' · ')}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Карта акцентов недели</Typography>
                {focusCounts.map((item) => (
                  <Stack key={item.group} spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">{item.group}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.count} сесс.
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(item.count / maxFocusCount) * 100}
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
