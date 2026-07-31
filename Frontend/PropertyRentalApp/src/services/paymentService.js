import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

export const addPayment = async (bookingId, amount) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.post(
    `${SERVER_URL}/payments`,
    {
      bookingId,
      amount,
    },
    {
      headers: {
        Token: token,
      },
    }
  )
}
export const getPaymentByBooking = async bookingId => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/payments/booking/${bookingId}`, {
    headers: {
      Token: token,
    },
  })
}
