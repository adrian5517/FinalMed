import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ChatList = () => {
  const navigation = useNavigation();

  const doctors = [
    {
      id: 1,
      name: 'Dr. Rodrigo Batumbakal',
      message: 'Makalugin payo ko doc 😢',
      time: '09:45 AM',
      isOnline: true,
    },
    {
      id: 2,
      name: 'Dr. Mary Jane',
      message: 'Ano po ang feeling na makulit ang nurse? 😎',
      time: '12:45 AM',
      isOnline: true,
    },
    {
      id: 3,
      name: 'Dr. Mario Aquino',
      message: 'Painom na doc?! 😎',
      time: '09:45 AM',
      isOnline: true,
    },
    {
      id: 4,
      name: 'Dr. Jeff Pilapil',
      message: 'Paabot nga doc dito lang?',
      time: '09:45 AM',
      isOnline: false,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          <Text style={styles.nagaText}>Naga </Text>
          <Text style={styles.medText}>Med </Text>
          <Text style={styles.chatText}>Chat</Text>
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search message..."
          placeholderTextColor="#999"
        />
        <TouchableOpacity style={styles.sendButton}>
          <Ionicons name="send" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.chatList}>
        {doctors.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={styles.chatItem}
            onPress={() => navigation.navigate('ChatConversation', { doctor })}
          >
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                {/* You can replace this with an Image component */}
                <Text style={styles.avatarText}>
                  {doctor.name.charAt(0)}
                </Text>
              </View>
              {doctor.isOnline && <View style={styles.onlineIndicator} />}
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.lastMessage}>{doctor.message}</Text>
            </View>
            <Text style={styles.timeText}>{doctor.time}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="calendar" size={24} color="#82C45C" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="document-text-outline" size={24} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  nagaText: {
    color: '#000',
  },
  medText: {
    color: '#82C45C',
  },
  chatText: {
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
  },
  onlineIndicator: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  navItem: {
    padding: 10,
  },
  activeNavItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
});

export default ChatList; 