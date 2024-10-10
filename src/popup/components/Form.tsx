import {
  Box,
  FormControlLabel,
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
    timeLapse,
    handleSwitchChange,
    handleDateChange,
    handleTimeLapseChange,
  } = useForm()

  return (
    <>
      <Box sx={{ m: 2 }}>
        <FormControlLabel
          control={<Switch checked={enabled} onChange={handleSwitchChange} />}
          label={origin}
          sx={{ mb: 2, ml: 0 }}
        />
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
        <FormLabel>Time Lapse</FormLabel>
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
      </Box>
    </>
  )
}
