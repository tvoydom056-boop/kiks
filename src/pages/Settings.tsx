import { zodResolver } from '@hookform/resolvers/zod'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import {
  Alert,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Radio,
  RadioGroup,
  Slider,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import { z } from 'zod'
import {
  NOTIFICATION_CHANNELS,
  useNotesStore,
  type AppSettings,
  type NotificationChannel,
  type NoteView,
} from '../store/notes'

const settingsSchema = z.object({
  displayName: z.string().min(2, 'Введите отображаемое имя'),
  birthDate: z.custom<Dayjs | null>((value) => value === null || (dayjs.isDayjs(value) && value.isValid())),
  notificationTime: z.custom<Dayjs | null>(
    (value) => value === null || (dayjs.isDayjs(value) && value.isValid()),
  ),
  defaultView: z.custom<NoteView>((value) => value === 'list' || value === 'grid'),
  notifications: z.array(z.custom<NotificationChannel>()),
  themeMode: z.enum(['light', 'dark']),
  autosave: z.boolean(),
  fontSize: z.number().min(12).max(24),
  privacyAccepted: z.boolean().refine((value) => value, {
    message: 'Нужно согласиться с политикой конфиденциальности',
  }),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

const mapSettingsToForm = (settings: AppSettings): SettingsFormValues => ({
  displayName: settings.displayName,
  birthDate: settings.birthDate ? dayjs(settings.birthDate) : null,
  notificationTime: settings.notificationTime ? dayjs(settings.notificationTime) : null,
  defaultView: settings.defaultView,
  notifications: settings.notifications,
  themeMode: settings.themeMode,
  autosave: settings.autosave,
  fontSize: settings.fontSize,
  privacyAccepted: settings.privacyAccepted,
})

export const Settings = () => {
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const settings = useNotesStore((state) => state.settings)
  const saveSettings = useNotesStore((state) => state.saveSettings)
  const setThemeMode = useNotesStore((state) => state.setThemeMode)
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: mapSettingsToForm(settings),
  })
  const fontSize = useWatch({ control, name: 'fontSize' })

  const submitHandler = handleSubmit((values) => {
    saveSettings({
      displayName: values.displayName,
      birthDate: values.birthDate ? values.birthDate.toISOString() : null,
      notificationTime: values.notificationTime ? values.notificationTime.toISOString() : null,
      defaultView: values.defaultView,
      notifications: values.notifications,
      themeMode: values.themeMode,
      autosave: values.autosave,
      fontSize: values.fontSize,
      privacyAccepted: values.privacyAccepted,
    })
    setSnackbarOpen(true)
  })

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 3, sm: 5 }, pb: 10 }}>
      <Stack spacing={3} component="form" onSubmit={submitHandler}>
        <Button
          component={RouterLink}
          to="/"
          startIcon={<ArrowBackRoundedIcon />}
          color="inherit"
          sx={{ alignSelf: 'flex-start' }}
        >
          На дашборд
        </Button>

        <Stack spacing={0.75}>
          <Typography variant="h4">Настройки</Typography>
          <Typography color="text.secondary">
            Персонализируйте дашборд, уведомления и общее поведение фитнес-трекера.
          </Typography>
        </Stack>

        <Controller
          name="displayName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Отображаемое имя"
              error={Boolean(errors.displayName)}
              helperText={errors.displayName?.message}
              fullWidth
            />
          )}
        />

        <Controller
          name="birthDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Дата рождения"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.birthDate),
                  helperText: errors.birthDate?.message,
                },
              }}
            />
          )}
        />

        <Controller
          name="notificationTime"
          control={control}
          render={({ field }) => (
            <TimePicker
              label="Предпочтительное время уведомлений"
              value={field.value}
              onChange={(value) => field.onChange(value)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: Boolean(errors.notificationTime),
                  helperText: errors.notificationTime?.message,
                },
              }}
            />
          )}
        />

        <FormControl error={Boolean(errors.defaultView)}>
          <Typography variant="subtitle2" gutterBottom>
            Вид карточек по умолчанию
          </Typography>
          <Controller
            name="defaultView"
            control={control}
            render={({ field }) => (
              <RadioGroup row {...field}>
                <FormControlLabel value="list" control={<Radio />} label="Список" />
                <FormControlLabel value="grid" control={<Radio />} label="Сетка" />
              </RadioGroup>
            )}
          />
        </FormControl>

        <FormControl>
          <Typography variant="subtitle2" gutterBottom>
            Уведомления
          </Typography>
          <Controller
            name="notifications"
            control={control}
            render={({ field }) => (
              <FormGroup row>
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <FormControlLabel
                    key={channel}
                    control={
                      <Checkbox
                        checked={field.value.includes(channel)}
                        onChange={(_, checked) =>
                          field.onChange(
                            checked
                              ? [...field.value, channel]
                              : field.value.filter((item) => item !== channel),
                          )
                        }
                      />
                    }
                    label={channel}
                  />
                ))}
              </FormGroup>
            )}
          />
        </FormControl>

        <Controller
          name="themeMode"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value === 'dark'}
                  onChange={(_, checked) => {
                    const nextMode = checked ? 'dark' : 'light'
                    field.onChange(nextMode)
                    setValue('themeMode', nextMode)
                    setThemeMode(nextMode)
                  }}
                />
              }
              label="Тёмная тема"
            />
          )}
        />

        <Controller
          name="autosave"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
              label="Автосохранение данных"
            />
          )}
        />

        <Controller
          name="fontSize"
          control={control}
          render={({ field }) => (
            <div>
              <Typography gutterBottom>Размер шрифта: {fontSize}px</Typography>
              <Slider
                value={field.value}
                onChange={(_, value) => field.onChange(value)}
                min={12}
                max={24}
                step={1}
                valueLabelDisplay="auto"
              />
            </div>
          )}
        />

        <Controller
          name="privacyAccepted"
          control={control}
          render={({ field }) => (
            <FormControl error={Boolean(errors.privacyAccepted)}>
              <FormControlLabel
                control={<Checkbox checked={field.value} onChange={(_, checked) => field.onChange(checked)} />}
                label="Я согласен с политикой конфиденциальности"
              />
              <FormHelperText>{errors.privacyAccepted?.message}</FormHelperText>
            </FormControl>
          )}
        />

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
          Сохранить настройки
        </Button>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2500}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSnackbarOpen(false)}>
          Настройки сохранены
        </Alert>
      </Snackbar>
    </Container>
  )
}
