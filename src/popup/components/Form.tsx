import {
  Box,
  Button,
  Chip,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import { useForm } from '../hooks/useForm'

export default function Form() {
  const {
    origin,
    enabled,
    date,
    autoReload,
    timeLapse,
    timeSpeed,
    history,
    hasChanges,
    handleSwitchChange,
    handleDateChange,
    handleAutoReloadChange,
    handleTimeLapseChange,
    handleTimeSpeedChange,
    handleApply,
    handleHistorySelect,
    handleHistoryDelete,
  } = useForm()

  return (
    <Box sx={{ p: 1.5, maxHeight: '600px', overflowY: 'auto' }}>
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="caption"
          sx={{ mb: 0.5, display: 'block', wordBreak: 'break-all' }}
        >
          {origin}
        </Typography>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={handleSwitchChange} />}
          label={enabled ? 'Enabled' : 'Disabled'}
        />
      </Box>
      {enabled && (
        <>
          {history.length > 0 && (
            <Box
              sx={{
                mb: 1.5,
                maxHeight: '120px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.5, display: 'block', fontWeight: 'bold' }}
              >
                History
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {history.map((item, index) => (
                  <Chip
                    key={index}
                    label={dayjs(item.date).format('YYYY/MM/DD HH:mm:ss')}
                    onClick={() => handleHistorySelect(item)}
                    onDelete={() => handleHistoryDelete(item.date)}
                    size="small"
                    color={date?.format() === item.date ? 'primary' : 'default'}
                    sx={{ mb: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>
          )}
          <FormGroup sx={{ mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date"
                value={date}
                onChange={handleDateChange}
                disabled={!enabled}
                views={['year', 'month', 'day']}
                format="YYYY/MM/DD"
                slotProps={{
                  textField: { size: 'small', fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Time"
                value={date}
                onChange={handleDateChange}
                disabled={!enabled}
                ampm={false}
                views={['hours', 'minutes', 'seconds']}
                format="HH:mm:ss"
                slotProps={{
                  textField: { size: 'small', fullWidth: true },
                }}
              />
            </LocalizationProvider>
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoReload}
                  onChange={handleAutoReloadChange}
                  disabled={!enabled}
                />
              }
              label="Automatic reload"
            />
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 0.5, fontSize: '0.875rem' }}>
              Time lapse mode
            </FormLabel>
            <RadioGroup value={timeLapse} onChange={handleTimeLapseChange}>
              <FormControlLabel
                value="RESET"
                control={<Radio size="small" />}
                label="Reset on reload"
                disabled={!enabled}
                sx={{
                  my: -1,
                  '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                }}
              />
              <FormControlLabel
                value="KEEP"
                control={<Radio size="small" />}
                label="Keep"
                disabled={!enabled}
                sx={{
                  my: -1,
                  '& .MuiFormControlLabel-label': { fontSize: '0.875rem' },
                }}
              />
            </RadioGroup>
          </FormGroup>
          <FormGroup sx={{ mb: 2 }}>
            <TextField
              label="Time speed (x0 = stop)"
              type="number"
              value={timeSpeed}
              onChange={handleTimeSpeedChange}
              disabled={!enabled}
              size="small"
              fullWidth
              slotProps={{
                htmlInput: { min: 0, step: 0.1 },
                input: {
                  startAdornment: (
                    <Typography sx={{ mr: 0.5, color: 'text.secondary' }}>
                      x
                    </Typography>
                  ),
                },
              }}
            />
          </FormGroup>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleApply}
              disabled={!hasChanges}
              fullWidth
              size="small"
            >
              Apply
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
