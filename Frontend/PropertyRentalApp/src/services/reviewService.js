import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SERVER_URL, TOKEN_KEY } from '../utils/config'

// Helper function to build request configuration with auth token
const getHeaders = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY)
  return {
    headers: {
      Token: token,
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  }
}

// 1. Fetch reviews for a specific property
export const getPropertyReviews = async propertyId => {
  try {
    const config = await getHeaders()
    return await axios.get(`${SERVER_URL}/reviews/${propertyId}`, config)
  } catch (error) {
    console.error('Error fetching property reviews:', error?.response || error)
    throw error
  }
}

// 2. Submit a new review for a property
export const addPropertyReview = async review => {
  try {
    const config = await getHeaders()
    const payload = {
      property_Id: Number(review.propertyId),
      rating: Number(review.rating),
      comment: review.comment?.trim() || '',
    }
    return await axios.post(`${SERVER_URL}/reviews`, payload, config)
  } catch (error) {
    console.error('Error adding property review:', error?.response || error)
    throw error
  }
}

// 3. Fetch reviews created by the authenticated user
export const getMyReviews = async () => {
  try {
    const config = await getHeaders()
    return await axios.get(`${SERVER_URL}/reviews/user`, config)
  } catch (error) {
    console.error('Error fetching my reviews:', error?.response || error)
    throw error
  }
}

// 4. Delete a review by review ID
export const deleteReview = async reviewId => {
  try {
    const config = await getHeaders()
    return await axios.delete(`${SERVER_URL}/reviews/${reviewId}`, config)
  } catch (error) {
    console.error('Error deleting review:', error?.response || error)
    throw error
  }
}
