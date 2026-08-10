import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ThemeContext } from '../provider/ThemeProvider'
import { sendChatMessage } from '../services/chatService'

export default function ChatScreen() {
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am RentEase AI Assistant. How can I help you with properties, bookings, or rental queries today?',
      sender: 'ai',
    },
  ])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!inputText.trim() || loading) return

    const userMsg = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'user',
    }
    setMessages(prev => [...prev, userMsg])
    const prompt = inputText.trim()
    setInputText('')
    setLoading(true)

    try {
      const response = await sendChatMessage(prompt)
      const aiReply =
        response?.data?.reply || "I didn't receive a clear response."
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        text: aiReply,
        sender: 'ai',
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: 'Failed to connect to AI Assistant. Please check your network connection.',
        sender: 'ai',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header Bar */}
        <View style={styles.header}>
          <Icon name="smart-toy" size={28} color={COLORS.primary} />
          <Text style={styles.headerTitle}>RentEase AI Assistant</Text>
        </View>

        {/* Message Bubble List */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}>
              <Text
                style={[
                  styles.messageText,
                  item.sender === 'user' ? styles.userText : styles.aiText,
                ]}>
                {item.text}
              </Text>
            </View>
          )}
        />

        {/* Typing Loader Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>RentEase AI is typing...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask anything about properties or bookings..."
            placeholderTextColor={COLORS.subText}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Icon name="send" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.card,
      gap: 10,
    },
    headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
    messageList: { padding: 16 },
    bubble: {
      padding: 14,
      borderRadius: 16,
      marginBottom: 12,
      maxWidth: '80%',
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: COLORS.primary,
      borderBottomRightRadius: 2,
    },
    aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderBottomLeftRadius: 2,
    },
    messageText: { fontSize: 14, lineHeight: 20 },
    userText: { color: '#FFFFFF' },
    aiText: { color: COLORS.text },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 8,
    },
    loadingText: { fontSize: 12, color: COLORS.subText },
    inputContainer: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      gap: 10,
    },
    textInput: {
      flex: 1,
      backgroundColor: COLORS.background,
      color: COLORS.text,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    sendButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      width: 46,
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
