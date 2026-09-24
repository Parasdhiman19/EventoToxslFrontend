import * as Yup from 'yup'

export const eventValidationSchema = Yup.object({
  title: Yup.string().trim().required('Event title is required'),
  category: Yup.string().required('Select a category'),
  description: Yup.string().min(20, 'Provide at least 20 characters').required('Description is required'),
  date: Yup.string().required('Event date is required'),
  startTime: Yup.string().required('Start time is required'),
  endTime: Yup.string().test('is-after-start', 'End time must be later than start time', function (value) {
    const { startTime } = this.parent
    if (startTime && value) {
      return value > startTime
    }
    return true
  }),
  venueName: Yup.string().when('isOnline', {
    is: false,
    then: (schema) => schema.required('Venue name is required for in-person events'),
  }),
  city: Yup.string().when('isOnline', {
    is: false,
    then: (schema) => schema.required('City is required for in-person events'),
  }),
})

export const defaultEventInitialValues = {
  title: '',
  category: 'Music & Concerts',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  venueName: '',
  address: '',
  city: '',
  isOnline: false,
  status: 'published',
}
