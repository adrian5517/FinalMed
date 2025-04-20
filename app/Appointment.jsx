import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const NagaMed = () => {
  const navigation = useNavigation();
  const [fullname, setFullname] = useState("Loading...");

  const fetchUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch("https://api.example.com/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setFullname(data.fullname); // Assuming the API returns a `fullname` field
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFullname("User");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={require('../assets/images/bookappointments.png')}
            style={styles.profileImage}
          />
          <Text style={styles.greetingText}>
            Hello, <Text style={styles.fullname}>{fullname}</Text>
          </Text>
          <Text style={styles.locationText}>📍 San Felipe, Naga City</Text>
        </View>

        {/* Search Bar */}
        <Text style={styles.title}>Find your doctor</Text>
        <View style={styles.searchBar}>
          
          <TextInput
            placeholder="Search Doctor, Health issues"
            style={styles.searchInput}
            accessibilityLabel="Search input field"
          />
          <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {/* Online Consultation */}
          <View style={[styles.optionCard, styles.onlineConsultation]}>
            <Text style={styles.optionTitle}>Online Consultation</Text>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Find doctor</Text>
            </TouchableOpacity>
          </View>

          {/* Nearby Clinics */}
          <View style={[styles.optionCard, styles.nearbyClinics]}>
            <Text style={styles.optionTitle}>Nearby Clinics in Naga City</Text>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionButtonText}>Find Clinics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Upcoming Appointments */}
        <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
        <View style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Image
              source={require('../assets/images/bookappointments.png')}
              style={styles.appointmentImage}
            />
            <View>
              <Text style={styles.appointmentDoctor}>Dr. Mario Aquino</Text>
              <Text style={styles.appointmentSpecialization}>Heart Specialist</Text>
            </View>
          </View>
          <Text style={styles.appointmentStatus}>Confirmed</Text>
          <View style={styles.appointmentDetails}>
            <Text>📅 Monday, Jan 4, 2025</Text>
            <Text>⏰ 09:00 AM</Text>
          </View>
          <View style={styles.appointmentActions}>
            <TouchableOpacity style={styles.rescheduleButton}>
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Create New */}
        <TouchableOpacity
          onPress={() => navigation.navigate('CreateAppointment')}
          style={styles.createNewButton}
        >
          <Text style={styles.createNewButtonText}>Create New +</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Chat Button */}
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatList')}
      >
        <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
      </TouchableOpacity>

      
    </View>
  );
};

export default NagaMed;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 15,
    marginBottom: 60,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 5,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  greetingText: {
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'Poppins',
  },
  fullname: {
    color: '#22577A',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  locationText: {
    color: '#777',
    fontFamily: 'Poppins',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 10,
    fontFamily: 'Poppins',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    borderColor: '#000000',
    borderWidth: 0.5,
    padding: 10,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  optionCard: {
    padding: 20,
    borderRadius: 15,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  onlineConsultation: {
    backgroundColor: '#D6EEF9',
    marginRight: 10,
  },
  nearbyClinics: {
    backgroundColor: '#C0F6A1',
  },
  optionTitle: {
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  optionButton: {
    marginTop: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 20,
  },
  optionButtonText: {
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appointmentImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  appointmentDoctor: {
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  appointmentSpecialization: {
    color: '#777',
    fontFamily: 'Poppins',
  },
  appointmentStatus: {
    marginVertical: 10,
    color: '#57CC99',
    textAlign: 'right',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Poppins',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  rescheduleButton: {
    backgroundColor: '#57CC99',
    padding: 10,
    borderRadius: 20,
  },
  cancelButton: {
    backgroundColor: '#E63946',
    padding: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  createNewButton: {
    backgroundColor: '#82C45C',
    padding: 20,
    borderRadius: 13,
    marginTop: 20,
    marginBottom: 70,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  createNewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
    fontFamily: 'Poppins',
  },
  chatButton: {
    position: 'absolute',
    right: 20,
    bottom: 80, 
    backgroundColor: '#007AFF', 
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
