import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ThemeContext } from '../provider/ThemeProvider'
import { sendChatMessage } from '../services/chatService'

export default function FloatingChatButton() {
  const { COLORS } = useContext(ThemeContext)
  const styles = getStyles(COLORS)

  const [modalVisible, setModalVisible] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: '1',
      text: 'Hello! I am RentEase AI Assistant. How can I help you today?',
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
        text: 'Failed to connect to AI Assistant. Please try again.',
        sender: 'ai',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button (FAB) in Left Corner */}
      <TouchableOpacity
        style={styles.floatingButton}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}>
        <Icon name="smart-toy" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Chatbot Popup Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.chatContainer}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Icon name="smart-toy" size={24} color={COLORS.primary} />
                <Text style={styles.headerTitle}>RentEase AI</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}>
                <Icon name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Messages */}
            <FlatList
              data={messages}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.bubble,
                    item.sender === 'user'
                      ? styles.userBubble
                      : styles.aiBubble,
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

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>AI is typing...</Text>
              </View>
            )}

            {/* Input Footer */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask about properties or rentals..."
                placeholderTextColor={COLORS.subText}
                value={inputText}
                onChangeText={setInputText}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Icon name="send" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const getStyles = COLORS =>
  StyleSheet.create({
    /* In FloatingChatButton.js getStyles */
    floatingButton: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 100 : 90, // Places button right above the floating tab bar
      left: 20, // Fixed to left corner
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 10, // Higher Android elevation
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      zIndex: 9999, // Keeps button above all views
    },

    /* Modal Styling */
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    chatContainer: {
      height: '75%',
      backgroundColor: COLORS.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      backgroundColor: COLORS.card,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: COLORS.text,
    },
    closeBtn: {
      padding: 4,
    },
    messageList: {
      padding: 16,
    },
    bubble: {
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
      maxWidth: '82%',
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: COLORS.primary,
      borderBottomRightRadius: 2,
    },
    aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
      borderBottomLeftRadius: 2,
    },
    messageText: {
      fontSize: 13,
      lineHeight: 18,
    },
    userText: {
      color: '#FFFFFF',
    },
    aiText: {
      color: COLORS.text,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 8,
    },
    loadingText: {
      fontSize: 12,
      color: COLORS.subText,
    },
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
      fontSize: 13,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    sendButton: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })
