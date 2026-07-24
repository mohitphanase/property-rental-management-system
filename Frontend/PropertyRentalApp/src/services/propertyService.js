import axios from 'axios'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const getPropertyById = async propertyId => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/properties/${propertyId}`, {
    headers: {
      Token: token,
    },
  })
}
