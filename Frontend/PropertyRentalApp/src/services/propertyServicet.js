import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

export const getProperties = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/properties`, {
    headers: {
      Token: token,
    },
  })
}

export const getPropertyById = async propertyId => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/properties/${propertyId}`, {
    headers: {
      Token: token,
    },
  })
}
export const getPropertyDetails = async propertyId => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)

  return axios.get(`${SERVER_URL}/properties/details/${propertyId}`, {
    headers: {
      Token: token,
    },
  })
}
