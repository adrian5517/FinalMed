import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const ChatConversation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctor } = route.params;
  const [message, setMessage] = useState('');

  const messages = [
    {
      id: 1,
      text: 'Hi, Aling puting Komusta ang pagmati?',
      sender: 'doctor',
      time: '09:45 AM',
    },
    {
      id: 2,
      text: 'Medyo , Okay naman doc\npero garo masasakit arang\nmasaya ano dow bulong\nkan doc?',
      sender: 'user',
      time: '09:46 AM',
    },
    {
      id: 3,
      text: 'Aram mo kung ano bulong jan?',
      sender: 'doctor',
      time: '09:47 AM',
    },
    {
      id: 4,
      text: 'Ano po doc ?',
      sender: 'user',
      time: '09:48 AM',
    },
    {
      id: 5,
      text: 'Kwarta hahahah char',
      sender: 'doctor',
      time: '09:49 AM',
    },
    {
      id: 6,
      text: 'Hyp ka doc kurulag payo\nko saimo',
      sender: 'user',
      time: '09:50 AM',
    },
    {
      id: 7,
      text: 'Pabunot mo',
      sender: 'doctor',
      time: '09:51 AM',
    },
    {
      id: 8,
      text: 'B*toooo moo dooooc!!!!!',
      sender: 'user',
      time: '09:52 AM',
    },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.doctorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctor.name.charAt(0)}</Text>
          </View>
          <View>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView style={styles.messagesContainer}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.sender === 'user' ? styles.userMessage : styles.doctorMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.sender === 'user'
                  ? styles.userBubble
                  : styles.doctorBubble,
              ]}
            >
              <Text style={[
                styles.messageText,
                msg.sender === 'user' ? styles.userMessageText : styles.doctorMessageText,
              ]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type here..."
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="camera-outline" size={24} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.attachButton}>
            <Ionicons name="image-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
  },
  onlineStatus: {
    fontSize: 12,
    color: '#4CAF50',
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageWrapper: {
    marginBottom: 10,
    flexDirection: 'row',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  doctorMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderTopRightRadius: 4,
  },
  doctorBubble: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  doctorMessageText: {
    color: '#000',
  },
  inputContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
  },
  attachButton: {
    padding: 8,
  },
});

export default ChatConversation; 