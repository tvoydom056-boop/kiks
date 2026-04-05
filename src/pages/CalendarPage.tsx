import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded'
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded'
import { alpha, Card, CardContent, Chip, Container, Stack, Typography, useTheme } from '@mui/material'
import dayjs from 'dayjs'
import { AppHeader } from '../components/AppHeader'
import { useNotesStore, WEEKDAY_OPTIONS } from '../store/notes'

export const CalendarPage = () => {
  const theme = useTheme()
  const programs = useNotesStore((state) => state.programs)
  const logs = useNotesStore((state) => state.workoutLogs)
  const currentMonth = dayjs()
  const start = currentMonth.startOf('month').startOf('week')
  const days = Array.from({ length: 35 }, (_, index) => start.add(index, 'day'))
  const streakDates = new Set(
    logs
      .filter((log) => log.status === 'completed')
      .map((log) => dayjs(log.date).startOf('day').format('YYYY-MM-DD')),
  )
  let streak = 0
  let cursor = dayjs().startOf('day')
  while (streakDates.has(cursor.format('YYYY-MM-DD'))) {
    streak += 1
    cursor = cursor.subtract(1, 'day')
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
      <Stack spacing={3}>
        <AppHeader
          title="Календарь kiks"
          subtitle="Здесь видно расписание столовых тренировок, историю выполнения и ближайшие дни под отработку."
        />

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Card sx={{ flex: 1.3 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{currentMonth.format('MMMM YYYY')}</Typography>
                  <Chip color="primary" label={`Стрик: ${streak} дн.`} />
                </Stack>

                <Stack
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: 1,
                  }}
                >
                  {WEEKDAY_OPTIONS.map((day) => (
                    <Typography key={day.value} variant="caption" color="text.secondary" textAlign="center">
                      {day.label.slice(0, 2)}
                    </Typography>
                  ))}

                  {days.map((date) => {
                    const dayKey = date.startOf('day').format('YYYY-MM-DD')
                    const log = logs.find((item) => dayjs(item.date).startOf('day').format('YYYY-MM-DD') === dayKey)
                    const plannedProgramDay = programs
                      .flatMap((program) => program.days.map((programDay) => ({ program, programDay })))
                      .find((item) => item.programDay.weekday === date.day())

                    const isCurrentMonth = date.month() === currentMonth.month()
                    const backgroundColor =
                      log?.status === 'completed'
                        ? alpha(theme.palette.success.main, 0.2)
                        : log?.status === 'missed'
                          ? alpha(theme.palette.grey[500], 0.16)
                          : log?.status === 'planned'
                            ? alpha(theme.palette.primary.main, 0.16)
                            : alpha(theme.palette.background.paper, 0.5)

                    return (
                      <Stack
                        key={dayKey}
                        sx={{
                          minHeight: 108,
                          p: 1,
                          borderRadius: 3,
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor,
                          opacity: isCurrentMonth ? 1 : 0.45,
                          minWidth: 0,
                          overflow: 'hidden',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            lineHeight: 1,
                            fontWeight: 700,
                            minHeight: 18,
                            flexShrink: 0,
                          }}
                        >
                          {date.format('D')}
                        </Typography>
                        <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1, justifyContent: 'space-between' }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              lineHeight: 1.35,
                              overflowWrap: 'anywhere',
                              wordBreak: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {log?.title ?? plannedProgramDay?.programDay.title ?? 'Восстановление кисти'}
                          </Typography>
                          {log?.status ? (
                            <Chip
                              size="small"
                              label={
                                log.status === 'completed'
                                  ? 'Выполнено'
                                  : log.status === 'missed'
                                    ? 'Пропуск'
                                    : 'По плану'
                              }
                              sx={{ alignSelf: 'flex-start', maxWidth: '100%', flexShrink: 0 }}
                            />
                          ) : null}
                        </Stack>
                      </Stack>
                    )
                  })}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ flex: 0.8 }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarMonthRoundedIcon color="primary" />
                  <Typography variant="h6">Статусы месяца</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleRoundedIcon color="success" />
                  <Typography>Зелёные дни — столовая тренировка выполнена</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <RemoveCircleRoundedIcon color="disabled" />
                  <Typography>Серые дни — подготовка пропущена</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScheduleRoundedIcon color="primary" />
                  <Typography>Янтарные дни — по плану отработка или борьба</Typography>
                </Stack>

                <Typography variant="subtitle1" sx={{ pt: 1 }}>
                  Ближайшие сессии
                </Typography>
                {logs
                  .filter((log) => dayjs(log.date).isAfter(dayjs().subtract(1, 'day')))
                  .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
                  .slice(0, 4)
                  .map((log) => (
                    <Stack
                      key={log.id}
                      spacing={0.5}
                      sx={{ p: 1.5, borderRadius: 3, backgroundColor: 'background.default' }}
                    >
                      <Typography>{log.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(log.date).format('D MMMM')} ·{' '}
                        {log.status === 'completed'
                          ? 'выполнено'
                          : log.status === 'missed'
                            ? 'пропущено'
                            : 'по плану'}
                      </Typography>
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
