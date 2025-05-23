import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, RefreshControl } from 'react-native';
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
  const [refreshing, setRefreshing] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

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
      setRefreshing(false);
    }
  };

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

  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const email = await AsyncStorage.getItem("userEmail");

      if (token) {
        const response = await fetch("https://nagamedserver.onrender.com/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        let profilePicture = data.profilePicture;

        if (!profilePicture && email) {
          profilePicture = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}`;
        }

        // Convert SVG to PNG for React Native compatibility
        if (profilePicture && profilePicture.includes('api.dicebear.com') && profilePicture.includes('/svg?')) {
          profilePicture = profilePicture.replace('/svg?', '/png?');
        }

        setProfilePicture(profilePicture);
      } else if (email) {
        setProfilePicture(`https://api.dicebear.com/7.x/avataaars/png?seed=${email}`);
      }
    } catch (error) {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        setProfilePicture(`https://api.dicebear.com/7.x/avataaars/png?seed=${email}`);
      }
    }
  };

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

      console.log('Updating appointment:', { appointmentId, newStatus });

      const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/${appointmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
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

      const updatedData = await response.json();
      console.log('Appointment updated successfully:', updatedData);

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

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor ? doctor.fullname : 'Unknown Doctor';
  };

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c._id === clinicId);
    return clinic ? clinic.clinic_name : 'Unknown Clinic';
  };

  // Refresh handler for pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#28B6F6"]} />
      }
    >
      {/* Patient Info Card */}
      <View style={styles.patientCard}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
            ) : (
              <Text style={styles.avatarText}>
                {fullname ? fullname.charAt(0) : 'U'}
                {fullname ? fullname.split(' ')[1]?.charAt(0) : ''}
              </Text>
            )}
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
          <View key={appointment._id} style={styles.appointmentCardModern}>
            <View style={styles.appointmentHeaderModern}>
              <View style={styles.appointmentHeaderLeft}>
                <View style={styles.doctorAvatarModern}>
                  {(() => {
                    const doctor = doctors.find(d => d._id === appointment.doctor_id);
                    return (
                      <Image
                        source={{ uri: doctor?.email ? `https://api.dicebear.com/7.x/avataaars/png?seed=${doctor.email}` : 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }}
                        style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#28B6F6', backgroundColor: '#fff' }}
                      />
                    );
                  })()}
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.doctorNameModern}>{`Dr. ${getDoctorName(appointment.doctor_id)}`}</Text>
                  <Text style={styles.clinicNameModern}>{getClinicName(appointment.clinic_id)}</Text>
                </View>
              </View>
            </View>
            <View style={styles.statusBadgeModernContainer}>
              <View style={[styles.statusBadgeModern, { backgroundColor: getStatusColor(appointment.status) }]}> 
                <Text style={styles.statusTextModern}>{appointment.status}</Text>
              </View>
            </View>
            <View style={styles.appointmentInfoModern}>
              <Ionicons name="calendar-outline" size={18} color="#28B6F6" style={{ marginRight: 6 }} />
              <Text style={styles.appointmentDateModern}>{formatDateTime(appointment.appointment_date_time)}</Text>
            </View>
            {appointment.description ? (
              <View style={styles.appointmentDescModern}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#718096" style={{ marginRight: 6 }} />
                <Text style={styles.appointmentDescText}>{appointment.description}</Text>
              </View>
            ) : null}
            <View style={styles.appointmentFooterModern}>
              <Text style={styles.appointmentIdModern}>ID: {appointment.appointment_id}</Text>
            </View>
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
  appointmentCardModern: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appointmentHeaderModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  appointmentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatarModern: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#28B6F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorNameModern: {
    fontSize: 16,
    fontWeight: '700',
    color: '#22577A',
  },
  clinicNameModern: {
    fontSize: 14,
    color: '#4A5568',
    marginTop: 2,
  },
  statusBadgeModernContainer: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statusBadgeModern: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextModern: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  appointmentInfoModern: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDateModern: {
    fontSize: 15,
    color: '#2D3748',
    fontWeight: '500',
  },
  appointmentDescModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  appointmentDescText: {
    fontSize: 14,
    color: '#718096',
  },
  appointmentFooterModern: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  appointmentIdModern: {
    fontSize: 13,
    color: '#A0AEC0',
  },
  appointmentActionsModern: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonModern: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 90,
    justifyContent: 'center',
  },
  editButtonModern: {
    backgroundColor: '#28B6F6',
  },
  actionButtonTextModern: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});

