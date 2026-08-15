import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ThemeContext } from '../provider/ThemeProvider'
import { sendChatMessage } from '../services/chatService'

const SUGGESTIONS = [
  { icon: 'home-work', label: 'Find a property' },
  { icon: 'event-available', label: 'My bookings' },
  { icon: 'support-agent', label: 'Talk to support' },
]

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

  const sendPrompt = async prompt => {
    if (!prompt.trim() || loading) return

    const userMsg = {
      id: Date.now().toString(),
      text: prompt.trim(),
      sender: 'user',
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setLoading(true)

    try {
      const response = await sendChatMessage(prompt.trim())
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

  const handleSend = () => sendPrompt(inputText)

  const showSuggestions = messages.length === 1 && !loading

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View style={styles.headerAvatar}>
            <Icon name="smart-toy" size={22} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>RentEase Assistant</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.headerSubtitle}>Online, ready to help</Text>
            </View>
          </View>
        </View>

        {/* Message Bubble List */}
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            loading ? (
              <View style={styles.aiRow}>
                <View style={styles.avatarCircle}>
                  <Icon name="smart-toy" size={16} color={COLORS.primary} />
                </View>
                <View
                  style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                  <View style={styles.typingDot} />
                  <View style={[styles.typingDot, styles.typingDotMid]} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const isUser = item.sender === 'user'
            return (
              <View style={isUser ? styles.userRow : styles.aiRow}>
                {!isUser && (
                  <View style={styles.avatarCircle}>
                    <Icon name="smart-toy" size={16} color={COLORS.primary} />
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isUser ? styles.userBubble : styles.aiBubble,
                  ]}>
                  <Text
                    style={[
                      styles.messageText,
                      isUser ? styles.userText : styles.aiText,
                    ]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            )
          }}
        />

        {/* Quick Suggestion Chips */}
        {showSuggestions && (
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={s => s.label}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.chip}
                activeOpacity={0.7}
                onPress={() => sendPrompt(item.label)}>
                <Icon name={item.icon} size={15} color={COLORS.primary} />
                <Text style={styles.chipText}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputPill}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask anything about properties or bookings..."
              placeholderTextColor={COLORS.subText}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
            />
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.8}
            disabled={!inputText.trim() || loading}
            onPress={handleSend}>
            <Icon name="arrow-upward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const shadow = (elevation = 3, color = '#000', opacity = 0.08) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: elevation / 2 },
  shadowOpacity: opacity,
  shadowRadius: elevation,
  elevation,
})

const getStyles = COLORS =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: COLORS.background },
    container: { flex: 1 },

    /* Header */
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.card,
      gap: 12,
    },
    headerAvatar: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: COLORS.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: 2,
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.success || '#22C55E',
    },
    headerSubtitle: { fontSize: 12, color: COLORS.subText, fontWeight: '500' },

    /* Message list */
    messageList: { padding: 16, paddingBottom: 8 },
    aiRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginBottom: 12,
      maxWidth: '88%',
      alignSelf: 'flex-start',
      gap: 8,
    },
    userRow: {
      alignSelf: 'flex-end',
      marginBottom: 12,
      maxWidth: '80%',
    },
    avatarCircle: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: COLORS.primary + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 2,
    },
    bubble: {
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderRadius: 18,
      flexShrink: 1,
    },
    userBubble: {
      backgroundColor: COLORS.primary,
      borderBottomRightRadius: 4,
      ...shadow(4, COLORS.primary, 0.25),
    },
    aiBubble: {
      backgroundColor: COLORS.card,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderBottomLeftRadius: 4,
    },
    messageText: { fontSize: 14, lineHeight: 20 },
    userText: { color: '#FFFFFF', fontWeight: '500' },
    aiText: { color: COLORS.text },

    /* Typing indicator */
    typingBubble: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 14,
    },
    typingDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: COLORS.subText,
      opacity: 0.5,
    },
    typingDotMid: {
      opacity: 0.9,
    },

    /* Suggestion chips */
    chipsRow: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: COLORS.primary + '12',
      borderWidth: 1,
      borderColor: COLORS.primary + '30',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginRight: 8,
    },
    chipText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: COLORS.primary,
    },

    /* Input bar */
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 12,
      backgroundColor: COLORS.card,
      borderTopWidth: 1,
      borderTopColor: COLORS.border,
      gap: 10,
    },
    inputPill: {
      flex: 1,
      backgroundColor: COLORS.background,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
      paddingHorizontal: 16,
      justifyContent: 'center',
      minHeight: 46,
      maxHeight: 110,
    },
    textInput: {
      color: COLORS.text,
      fontSize: 14,
      paddingVertical: 12,
    },
    sendButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 23,
      width: 46,
      height: 46,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadow(5, COLORS.primary, 0.3),
    },
    sendButtonDisabled: {
      backgroundColor: COLORS.border,
      shadowOpacity: 0,
      elevation: 0,
    },
  })
