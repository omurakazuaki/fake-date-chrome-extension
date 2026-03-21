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
    applied,
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
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="caption"
          sx={{ display: 'block', wordBreak: 'break-all' }}
        >
          {origin}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={enabled}
              onChange={handleSwitchChange}
              size="small"
            />
          }
          label={enabled ? 'Enabled' : 'Disabled'}
          sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
        />
      </Box>
      {enabled && (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
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
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                          altAxis: true,
                          tether: false,
                        },
                      },
                      {
                        name: 'flip',
                        options: { fallbackPlacements: ['top-start'] },
                      },
                    ],
                  },
                }}
              />
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
                  popper: {
                    placement: 'bottom-start',
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                          altAxis: true,
                          tether: false,
                        },
                      },
                      {
                        name: 'flip',
                        options: { fallbackPlacements: ['top-start'] },
                      },
                    ],
                  },
                }}
              />
            </LocalizationProvider>
          </Stack>

          {history.length > 0 && (
            <Box
              sx={{
                mb: 1.5,
                maxHeight: '80px',
                overflowY: 'auto',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                p: 0.75,
              }}
            >
              <Typography
                variant="caption"
                sx={{ mb: 0.25, display: 'block', fontWeight: 'bold' }}
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
                  />
                ))}
              </Stack>
            </Box>
          )}

          <FormGroup sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={autoReload}
                  onChange={handleAutoReloadChange}
                  disabled={!enabled}
                  size="small"
                />
              }
              label="Automatic reload"
              sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
            />
          </FormGroup>
          <FormGroup sx={{ mb: 1.5 }}>
            <FormLabel sx={{ fontSize: '0.75rem' }}>Time lapse mode</FormLabel>
            <RadioGroup value={timeLapse} onChange={handleTimeLapseChange}>
              <FormControlLabel
                value="RESET"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2">Reset on reload</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Restart from the set time on each page load
                    </Typography>
                  </Box>
                }
                disabled={!enabled}
                sx={{
                  mb: 0.5,
                  alignItems: 'flex-start',
                  '& .MuiRadio-root': { pt: 0.5 },
                }}
              />
              <FormControlLabel
                value="KEEP"
                control={<Radio size="small" />}
                label={
                  <Box>
                    <Typography variant="body2">Continue</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Time keeps advancing from when it was set
                    </Typography>
                  </Box>
                }
                disabled={!enabled}
                sx={{
                  alignItems: 'flex-start',
                  '& .MuiRadio-root': { pt: 0.5 },
                }}
              />
            </RadioGroup>
          </FormGroup>
          <FormGroup sx={{ mb: 1.5 }}>
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
          <Button
            variant="contained"
            onClick={handleApply}
            disabled={!hasChanges && !applied}
            fullWidth
            size="small"
            color={applied ? 'success' : 'primary'}
            startIcon={applied ? '\u2714' : undefined}
          >
            {applied ? 'Applied!' : 'Apply'}
          </Button>
        </>
      )}
    </Box>
  )
}
