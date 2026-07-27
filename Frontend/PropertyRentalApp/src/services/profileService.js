import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

export const changePassword = async data => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.put(`${SERVER_URL}/user/change-password`, data, {
    headers: {
      Token: token,
    },
  })
}
