import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StatusScreen({ route }) {
  const { userId: paramUserId } = route?.params || {};

  const [fullname, setFullname] = useState(null);
  const [userId, setUserId] = useState(paramUserId || null);
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (e) {
        console.error('Error fetching user:', e);
      }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        
        console.log('Status Screen Auth Debug:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          hasUserId: !!userId,
          userId: userId
        });

        if (!token) {
          console.error('Token is missing. Please log in again.');
          Alert.alert(
            "Authentication Error",
            "Please log in again to view your appointments.",
            [{ text: "OK" }]
          );
          return;
        }

        if (!userId) {
          console.error('User ID is missing. Please log in again.');
          Alert.alert(
            "Authentication Error",
            "Please log in again to view your appointments.",
            [{ text: "OK" }]
          );
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    const fetchAppointments = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found");
          return;
        }

        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        console.log("Fetching appointments for user:", userId);

        const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log("Appointment response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          console.error("Appointment fetch error:", {
            status: response.status,
            statusText: response.statusText,
            errorData
          });
          throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Appointments fetched successfully:", data);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching appointments:", error.message);
        setAppointments([]);
        Alert.alert(
          "Error",
          "Failed to load appointments. Please try again later.",
          [{ text: "OK" }]
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchDoctors = async () => {
      try {
        const doctorRes = await axios.get('https://nagamedserver.onrender.com/api/doctorauth/');
        if (doctorRes.data && doctorRes.data.success && doctorRes.data.data) {
          setDoctors(doctorRes.data.data);
        } else {
          setDoctors([]);
        }
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
        setDoctors([]);
      }
    };

    const fetchClinics = async () => {
      try {
        const clinicRes = await axios.get('https://nagamedserver.onrender.com/api/clinic');
        if (clinicRes.data) {
          setClinics(clinicRes.data);
        } else {
          setClinics([]);
        }
      } catch (error) {
        console.error('Failed to fetch clinics:', error);
        setClinics([]);
      } finally {
        setLoading(false);
      }
    };

    // Check auth first
    checkAuth();
    
    // Then fetch data
    if (userId) {
      fetchAppointments();
    }
    fetchDoctors();
    fetchClinics();
  }, [userId]);

  const formatAvailability = (availability) => {
    if (!availability || !Array.isArray(availability)) return 'Not available';
    return availability.map(avail => `${avail.day}: ${avail.time}`).join('\n');
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return '#48BB78';
      case 'pending':
        return '#ECC94B';
      case 'cancelled':
        return '#F56565';
      default:
        return '#718096';
    }
  };

  const handleUpdateAppointment = async (appointmentId, newStatus) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          appointmentId,
          status: newStatus 
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Update appointment error:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to update appointment: ${response.status} ${response.statusText}`);
      }

      // Refresh appointments after update
      await fetchAppointments();
      Alert.alert("Success", "Appointment status updated successfully");
    } catch (error) {
      console.error("Error updating appointment:", error.message);
      Alert.alert("Error", "Failed to update appointment status. Please try again.");
    }
  };

  const handleDeleteAppointment = async (appointmentId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        throw new Error("User ID not found");
      }

      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Delete appointment error:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to delete appointment: ${response.status} ${response.statusText}`);
      }

      // Refresh appointments after deletion
      await fetchAppointments();
      Alert.alert("Success", "Appointment deleted successfully");
    } catch (error) {
      console.error("Error deleting appointment:", error.message);
      Alert.alert("Error", "Failed to delete appointment. Please try again.");
    }
  };

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
          <View style={styles.patientDetails}>
            <Text style={styles.patientName}>{fullname || 'Loading...'}</Text>
            <Text style={styles.patientId}>Patient ID: {userId || 'N/A'}</Text>
          </View>
        </View>
      </View>

      {/* Appointments Section */}
      <Text style={styles.sectionTitle}>Your Appointments</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading appointments...</Text>
      ) : appointments.length === 0 ? (
        <Text style={styles.loadingText}>No appointments scheduled</Text>
      ) : (
        appointments.map((appointment) => (
          <View key={appointment._id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <View style={styles.appointmentInfo}>
                <Text style={styles.appointmentDateTime}>
                  {formatDateTime(appointment.appointment_date_time)}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
                  <Text style={styles.statusText}>{appointment.status}</Text>
                </View>
              </View>
              <Text style={styles.appointmentId}>ID: {appointment.appointment_id}</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.appointmentLabel}>Doctor ID:</Text>
              <Text style={styles.appointmentValue}>{appointment.doctor_id}</Text>
              <Text style={styles.appointmentLabel}>Clinic ID:</Text>
              <Text style={styles.appointmentValue}>{appointment.clinic_id}</Text>
            </View>
            <View style={styles.appointmentActions}>
              {appointment.status === 'Pending' && (
                <>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleUpdateAppointment(appointment._id, 'Approved')}
                  >
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={() => handleDeleteAppointment(appointment._id)}
                  >
                    <Text style={styles.actionButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))
      )}

      {/* Doctors Section */}
      <Text style={styles.sectionTitle}>Available Doctors</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading doctors...</Text>
      ) : doctors.length === 0 ? (
        <Text style={styles.loadingText}>No doctors available at the moment</Text>
      ) : (
        doctors.map((doctor) => (
          <View key={doctor._id} style={styles.doctorCard}>
            <View style={styles.doctorHeader}>
              <Image 
                source={{ uri: doctor.profilePicture }} 
                style={styles.doctorImage}
              />
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>{doctor.fullname}</Text>
                <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
                <Text style={styles.doctorContact}>📞 {doctor.contact}</Text>
                <Text style={styles.doctorAddress}>📍 {doctor.address}</Text>
              </View>
            </View>
            <View style={styles.availabilitySection}>
              <Text style={styles.availabilityTitle}>Availability:</Text>
              <Text style={styles.availabilityText}>{formatAvailability(doctor.availability)}</Text>
            </View>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Clinics Section */}
      <Text style={styles.sectionTitle}>Available Clinics</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading clinics...</Text>
      ) : clinics.length === 0 ? (
        <Text style={styles.loadingText}>No clinics available at the moment</Text>
      ) : (
        clinics.map((clinic) => (
          <View key={clinic._id} style={styles.clinicCard}>
            <View style={styles.clinicInfo}>
              <Text style={styles.clinicName}>{clinic.clinic_name}</Text>
              <View style={styles.clinicDetails}>
                <Text style={styles.clinicAddress}>📍 {clinic.address}</Text>
                <Text style={styles.clinicContact}>📞 {clinic.contact}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.clinicButton}>
              <Ionicons name="arrow-forward" size={24} color="#28B6F6" />
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
    backgroundColor: "#f5f7fa",
    padding: 16,
  },
  patientCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#28B6F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  patientDetails: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  patientId: {
    fontSize: 14,
    color: "#718096",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
    marginVertical: 20,
  },
  doctorCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  doctorHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#28B6F6",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 4,
  },
  doctorContact: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 2,
  },
  doctorAddress: {
    fontSize: 14,
    color: "#718096",
  },
  availabilitySection: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  availabilityTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 8,
  },
  availabilityText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 20,
  },
  bookButton: {
    backgroundColor: "#28B6F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  clinicCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  clinicDetails: {
    gap: 4,
  },
  clinicAddress: {
    fontSize: 14,
    color: "#718096",
  },
  clinicContact: {
    fontSize: 14,
    color: "#718096",
  },
  clinicButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F7FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  appointmentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  appointmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  appointmentInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentDateTime: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginRight: 16,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  appointmentId: {
    fontSize: 14,
    color: "#718096",
  },
  appointmentDetails: {
    flex: 1,
  },
  appointmentLabel: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  appointmentValue: {
    fontSize: 14,
    color: "#2D3748",
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#48BB78',
  },
  cancelButton: {
    backgroundColor: '#F56565',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

