import axios from 'axios'
import { SERVER_URL } from '../utils/config'

export const getPropertyImages = propertyId => {
  return axios.get(`${SERVER_URL}/properties/images/${propertyId}`)
}
