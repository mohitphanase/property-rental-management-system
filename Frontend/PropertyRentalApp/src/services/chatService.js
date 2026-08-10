import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

export const sendChatMessage = async userMessage => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  return axios.post(
    `${SERVER_URL}/api/chat`,
    { message: userMessage },
    {
      headers: {
        Token: token,
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    }
  )
}
