import React, { createContext, useState, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Define Light Theme
const lightTheme = {
  primary: '#007BFF', // Your main blue
  background: '#F8F9FA', // Off-white background
  card: '#FFFFFF', // White cards
  text: '#212529', // Dark text
  subText: '#6C757D', // Gray text
  border: '#E9ECEF', // Light borders
  error: '#DC3545', // Red
  success: '#28A745', // Green
  warning: '#F5A623', // Orange
  cancelled: '#6C757D', // Gray
  placeholder: '#ADB5BD',
}

// Define Dark Theme
const darkTheme = {
  primary: '#3B82F6', // Slightly brighter blue for dark mode visibility
  background: '#121212', // Very dark background
  card: '#1E1E1E', // Slightly lighter dark cards
  text: '#F8F9FA', // White text
  subText: '#ADB5BD', // Light gray text
  border: '#333333', // Dark borders
  error: '#FF6B6B', // Softer red
  success: '#28A745', // Green
  warning: '#F5A623', // Orange
  cancelled: '#6C757D', // Gray
  placeholder: '#495057',
}

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme() // Gets phone's default theme (iOS/Android)
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark')

  // Load saved theme when app opens
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme')
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark')
        }
      } catch (error) {
        console.log('Error loading theme', error)
      }
    }
    loadTheme()
  }, [])

  // The function that flips the switch
  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode
      setIsDarkMode(newTheme)
      await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light')
    } catch (error) {
      console.log('Error saving theme', error)
    }
  }

  // Provide the correct colors based on the state
  const COLORS = isDarkMode ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, COLORS }}>
      {children}
    </ThemeContext.Provider>
  )
}
