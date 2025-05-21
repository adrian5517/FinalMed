import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatusScreen({ route }) {
  const { userId: paramUserId, username: paramUsername } = route?.params || {};

  const [fullname, setFullname] = useState(null);
  const [userId, setUserId] = useState(paramUserId || null);
  const [username, setUsername] = useState(paramUsername || null);

  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    async function fetchUserData() {
      try {
        let storedUserId = userId;
        if (!storedUserId) {
          storedUserId = await AsyncStorage.getItem('userId');
          setUserId(storedUserId);
        }
        if (!storedUserId) return;

        const res = await fetch(`https://nagamedserver.onrender.com/api/user/${storedUserId}`);
        const data = await res.json();
        setFullname(data.fullname || 'User');
        setUsername(data.username || 'Unknown');
      } catch (e) {
        console.error('Error fetching user:', e);
      }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorRes = await axios.get('https://nagamedserver.onrender.com/api/doctor');
        setDoctorSchedules(doctorRes.data);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };

    const fetchClinics = async () => {
      try {
        const clinicRes = await axios.get('https://nagamedserver.onrender.com/api/clinic');
        setClinics(clinicRes.data);
      } catch (error) {
        console.error('Failed to fetch clinics:', error);
      }
    };

    fetchDoctors();
    fetchClinics();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Patient Info Card */}
      <View style={styles.patientCard}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {fullname ? fullname.charAt(0) : 'U'}
              {fullname ? fullname.split(' ')[1]?.charAt(0) : ''}
            </Text>
          </View>
          <View>
            <Text style={styles.patientName}>{fullname || 'Loading...'}</Text>
            <Text style={styles.patientId}>Patient ID: {userId || 'N/A'}</Text>
            <Text style={styles.headerLogo}>
              <Text style={styles.nagaText}>Naga</Text>
              <Text style={styles.medText}> Med</Text>
            </Text>
          </View>
        </View>
        <View style={styles.conditionWrapper}>
          <Text style={styles.conditionText}>
            experiencing a heart-related condition and is advised to rest for 3 days
          </Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Slot Info */}
      <View style={styles.timeSlotCard}>
        <Text style={styles.timeSlotText}>
          Time slot available for future, you can extend the reservation time
        </Text>
        <TouchableOpacity style={styles.extendButton}>
          <Text style={styles.extendButtonText}>Extend time</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Details */}
      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="water" size={24} color="#007bff" />
          <Text style={styles.detailText}>Treatment: Blood Testing</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={24} color="#007bff" />
          <Text style={styles.detailText}>Fri, Feb 16 02:00PM - 05:00PM</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="person" size={24} color="#007bff" />
          <Text style={styles.detailText}>Doctor: Dr. Jeff Pilapil</Text>
        </View>
      </View>

      {/* Doctors Section */}
      <Text style={styles.sectionTitle}>Doctors & Schedules</Text>
      {doctorSchedules.length === 0 ? (
        <Text style={styles.loadingText}>Loading doctors...</Text>
      ) : (
        doctorSchedules.map((doctor) => (
          <View key={doctor._id} style={styles.card}>
            <Text style={styles.cardTitle}>{doctor.doctor_name}</Text>
            <Text style={styles.cardText}>Specialization: {doctor.specialization}</Text>
            <Text style={styles.cardText}>Contact: {doctor.contact_info}</Text>
            <Text style={styles.cardText}>
              Availability: {doctor.availability.map(avail => Object.values(avail).join(' ')).join(', ')}
            </Text>
            <Text style={styles.cardText}>License No: {doctor.license_number}</Text>
          </View>
        ))
      )}

      {/* Clinics Section */}
      <Text style={styles.sectionTitle}>Available Clinics</Text>
      {clinics.length === 0 ? (
        <Text style={styles.loadingText}>Loading clinics...</Text>
      ) : (
        clinics.map((clinic) => (
          <View key={clinic._id} style={styles.clinicCard}>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>{clinic.clinic_name}</Text>
              <Text style={styles.clinicDetails}>
                {clinic.address} | {clinic.contact}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="arrow-forward" size={24} color="#007bff" />
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
  },
  nagaText: { color: "#0072CE" },
  medText: { color: "#4CAF50" },
  headerLogo: {
    position: "absolute",
    top: -5,
    right: -140,
    fontSize: 16,
    fontWeight: "bold",
  },
  patientCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  patientId: {
    fontSize: 14,
    color: "#666",
  },
  conditionWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conditionText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  editButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: "#007bff",
  },
  timeSlotCard: {
    backgroundColor: "#B3E5FCAD",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  timeSlotText: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 8,
  },
  extendButton: {
    alignSelf: "flex-end",
    backgroundColor: "#E0F2F1",
    padding: 8,
    borderRadius: 5,
  },
  extendButtonText: {
    color: "#1170B3",
    fontSize: 14,
    fontWeight: "bold",
  },
  appointmentDetails: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    color: "#555",
  },
  clinicCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    alignItems: "center",
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clinicDetails: {
    fontSize: 14,
    color: "#555",
  },
});
