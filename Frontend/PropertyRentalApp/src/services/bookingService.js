import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

export const getBookings = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  console.log('JWT Token:', token)

  return axios.get(`${SERVER_URL}/bookings/user`, {
    headers: {
      Token: token,
      'Content-Type': 'application/json',
    },
  })
}
export const deleteBooking = async bookingId => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.delete(`${SERVER_URL}/bookings/${bookingId}`, {
    headers: {
      Token: token,
    },
  })
}
export const addBooking = async booking => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.post(`${SERVER_URL}/bookings`, booking, {
    headers: {
      Token: token,
    },
  })
}
