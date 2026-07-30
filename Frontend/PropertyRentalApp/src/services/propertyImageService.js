import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

export const getPropertyImages = async propertyId => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/properties/images/${propertyId}`, {
    headers: {
      Token: token,
    },
  })
}
