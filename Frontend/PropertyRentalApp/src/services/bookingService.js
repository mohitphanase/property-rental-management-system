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
