import {
  Box,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
} from '@mui/material'
import { LocalizationProvider, StaticDateTimePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { useForm } from '../hooks/useForm'

export default function Form() {
  const {
    origin,
    enabled,
    date,
    autoReload,
    timeLapse,
    handleSwitchChange,
    handleDateChange,
    handleAutoReloadChange,
    handleTimeLapseChange,
  } = useForm()

  return (
    <Box sx={{ m: 2 }}>
      <Box>
        <FormLabel>{origin}</FormLabel>
        <Switch checked={enabled} onChange={handleSwitchChange} />
      </Box>
      {enabled && (
        <>
          <FormGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <StaticDateTimePicker
                slots={{
                  toolbar: () => <></>,
                  actionBar: () => <></>,
                }}
                ampm={false}
                value={date}
                onChange={handleDateChange}
                disabled={!enabled}
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
              />
            </LocalizationProvider>
          </FormGroup>
          <FormGroup>
            <FormLabel>Automatic reload</FormLabel>
            <Switch
              checked={autoReload}
              onChange={handleAutoReloadChange}
              disabled={!enabled}
            />
          </FormGroup>
          <FormGroup>
            <FormLabel>Time lapse mode</FormLabel>
            <RadioGroup row value={timeLapse} onChange={handleTimeLapseChange}>
              <FormControlLabel
                value="RESET"
                control={<Radio size="small" />}
                label="Reset on reload"
                disabled={!enabled}
              />
              <FormControlLabel
                value="KEEP"
                control={<Radio size="small" />}
                label="Keep"
                disabled={!enabled}
              />
              <FormControlLabel
                value="STOP"
                control={<Radio size="small" />}
                label="Stop"
                disabled={!enabled}
              />
            </RadioGroup>
          </FormGroup>
        </>
      )}
    </Box>
  )
}
