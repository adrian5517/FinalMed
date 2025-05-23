import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, Modal, Platform } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from '@react-navigation/native';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Home() {
  const route = useRoute();
  const router = useRouter();

  const { doctorId: paramDoctorId, clinicId: paramClinicId } = route.params || {};

  const [fullname, setFullname] = useState("User");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [selectedClinicDetails, setSelectedClinicDetails] = useState(null);
  const [clinicModalVisible, setClinicModalVisible] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedAppointmentForEdit, setSelectedAppointmentForEdit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    async function fetchUserData() {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const res = await fetch(`https://nagamedserver.onrender.com/api/user/${userId}`);
        const data = await res.json();
        setFullname(data.fullname || "User");
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    }
    fetchUserData();
  }, []);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const res = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`);
        const data = await res.json();
        setAppointments(data);
      } catch (e) {
        console.error("Error fetching appointments:", e);
      }
    }
    fetchAppointments();
  }, []);

  useEffect(() => {
    async function fetchDoctors() {
      try {
        let url = "https://nagamedserver.onrender.com/api/doctor";
        const clinicToUse = paramClinicId || selectedClinic;

        if (clinicToUse) {
          url += `?clinicId=${clinicToUse}`;
        }

        const res = await fetch(url);
        const data = await res.json();
        const normalized = data.map(d => ({ ...d, id: d._id }));
        setDoctors(normalized);

        if (paramClinicId && paramClinicId !== selectedClinic) {
          setSelectedClinic(paramClinicId);
        }

        if (paramDoctorId) {
          const foundDoctor = normalized.find(d => d.id === paramDoctorId);
          if (foundDoctor) {
            setSelectedDoctor(foundDoctor);
          } else {
            setSelectedDoctor(null);
          }
        } else if (normalized.length > 0) {
          setSelectedDoctor(normalized[0]);
        }
      } catch (e) {
        console.error("Error fetching doctors:", e);
      }
    }

    fetchDoctors();
  }, [paramClinicId, paramDoctorId]);

  useEffect(() => {
    async function fetchClinics() {
      try {
        const res = await fetch("https://nagamedserver.onrender.com/api/clinic");
        const data = await res.json();
        setClinics(data);
      } catch (e) {
        console.error("Error fetching clinics:", e);
      }
    }

    fetchClinics();
  }, []);

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor ? doctor.fullname : 'Loading...';
  };

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c._id === clinicId);
    return clinic ? clinic.clinic_name : 'Unknown Clinic';
  };

  const handleCreateNew = () => {
    router.push("/CreateAppointment");
  };

  const handleReschedule = (appointment) => {
    setSelectedAppointmentForEdit(appointment);
    setSelectedDate(new Date(appointment.appointment_date_time));
    setSelectedTime(new Date(appointment.appointment_date_time));
    setEditModalVisible(true);
  };

  const handleUpdateAppointment = async () => {
    try {
      if (!selectedAppointmentForEdit) return;

      const updatedDateTime = new Date(selectedDate);
      updatedDateTime.setHours(selectedTime.getHours());
      updatedDateTime.setMinutes(selectedTime.getMinutes());

      const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/${selectedAppointmentForEdit._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointment_date_time: updatedDateTime.toISOString(),
        }),
      });

      if (response.ok) {
        // Refresh appointments
        const userId = await AsyncStorage.getItem("userId");
        const res = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`);
        const data = await res.json();
        setAppointments(data);
        
        setEditModalVisible(false);
        Alert.alert("Success", "Appointment rescheduled successfully");
      } else {
        Alert.alert("Error", "Failed to reschedule appointment");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      Alert.alert("Error", "Failed to reschedule appointment");
    }
  };

  const handleCancel = async () => {
    if (!selectedDoctor) return;
    try {
      await fetch(`https://nagamedserver.onrender.com/api/appointment/${selectedDoctor._id}`, {
        method: 'DELETE',
      });
      Alert.alert("Cancelled", "Appointment cancelled");
      setSelectedDoctor(null);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel appointment");
    }
  };

  const ClinicModal = ({ clinic, visible, onClose }) => {
    if (!clinic) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Clinic Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.clinicModalImageContainer}>
                <Image 
                  source={{ uri: clinic.images || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }} 
                  style={styles.clinicModalImage}
                  resizeMode="cover"
                />
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.ratingText}>{clinic.ratings || '0.0'}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="business-outline" size={20} color="#22577A" />
                  <Text style={styles.modalLabel}>Clinic Name</Text>
                </View>
                <Text style={styles.modalValue}>{clinic.clinic_name}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="call-outline" size={20} color="#22577A" />
                  <Text style={styles.modalLabel}>Contact Information</Text>
                </View>
                <Text style={styles.modalValue}>{clinic.contact_info}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="location-outline" size={20} color="#22577A" />
                  <Text style={styles.modalLabel}>Location</Text>
                </View>
                <Text style={styles.modalValue}>{clinic.location?.address || 'No address available'}</Text>
                {clinic.location?.latitude && clinic.location?.longitude && (
                  <TouchableOpacity 
                    style={styles.mapButton}
                    onPress={() => {
                      // You can add map navigation here
                      console.log('Navigate to:', clinic.location.latitude, clinic.location.longitude);
                    }}
                  >
                    <Ionicons name="map-outline" size={16} color="#22577A" />
                    <Text style={styles.mapButtonText}>View on Map</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="star-outline" size={20} color="#22577A" />
                  <Text style={styles.modalLabel}>Rating & Reviews</Text>
                </View>
                <View style={styles.ratingSection}>
                  <View style={styles.ratingDisplay}>
                    <Ionicons name="star" size={24} color="#FFD700" />
                    <Text style={styles.ratingNumber}>{clinic.ratings || '0.0'}</Text>
                  </View>
                  <Text style={styles.reviewCount}>
                    {clinic.feedback_id?.length || 0} reviews
                  </Text>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={() => {
                  onClose();
                  setSelectedClinic(clinic._id);
                }}
              >
                <Text style={styles.bookAppointmentButtonText}>Book Appointment Here</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderClinicCard = (clinic) => (
    <TouchableOpacity 
      key={clinic._id} 
      style={styles.clinicCard}
    >
      <View style={styles.clinicImageContainer}>
        <Image 
          source={{ uri: clinic.images || 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }} 
          style={styles.clinicImage}
          resizeMode="cover"
        />
        <View style={styles.clinicGradient} />
        <View style={styles.clinicRating}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.clinicRatingText}>{clinic.ratings || '0.0'}</Text>
        </View>
      </View>
      <View style={styles.clinicContent}>
        <Text style={styles.clinicName}>{clinic.clinic_name}</Text>
        <View style={styles.clinicInfo}>
          <Ionicons name="location-outline" size={16} color="#22577A" />
          <Text style={styles.clinicAddress}>{clinic.location?.address || 'No address available'}</Text>
        </View>
        <View style={styles.clinicInfo}>
          <Ionicons name="call-outline" size={16} color="#22577A" />
          <Text style={styles.clinicContact}>{clinic.contact_info}</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewClinicButton}
          onPress={() => {
            setSelectedClinicDetails(clinic);
            setClinicModalVisible(true);
          }}
        >
          <Text style={styles.viewClinicText}>View Details</Text>
          <Ionicons name="chevron-forward" size={16} color="#22577A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const AppointmentModal = ({ appointment, visible, onClose }) => {
    if (!appointment) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.statusContainer, { backgroundColor: appointment.status === 'Approved' ? '#E6F4EA' : '#FFF4E5' }]}>
                <View style={[styles.statusDot, { backgroundColor: appointment.status === 'Approved' ? '#A7EC80' : '#FFB74D' }]} />
                <Text style={[styles.statusText, { color: appointment.status === 'Approved' ? '#2E7D32' : '#E65100' }]}>
                  {appointment.status}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Date & Time</Text>
                </View>
                <Text style={styles.modalValue}>{formatDateTime(appointment.appointment_date_time)}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="person-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Doctor</Text>
                </View>
                <Text style={styles.modalValue}>{getDoctorName(appointment.doctor_id)}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="business-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Clinic</Text>
                </View>
                <Text style={styles.modalValue}>{getClinicName(appointment.clinic_id)}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Appointment ID</Text>
                </View>
                <Text style={styles.modalValue}>{appointment.appointment_id}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="person-add-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Filled By</Text>
                </View>
                <Text style={styles.modalValue}>{appointment.filled_by}</Text>
              </View>

              {appointment.description && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="chatbubble-outline" size={20} color="#28B6F6" />
                    <Text style={styles.modalLabel}>Description</Text>
                  </View>
                  <Text style={styles.modalValue}>{appointment.description}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const EditAppointmentModal = ({ visible, onClose }) => {
    if (!selectedAppointmentForEdit) return null;

    // Use local state for pickers
    const [editDate, setEditDate] = useState(new Date(selectedAppointmentForEdit.appointment_date_time));
    const [editTime, setEditTime] = useState(new Date(selectedAppointmentForEdit.appointment_date_time));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
      if (selectedAppointmentForEdit) {
        setEditDate(new Date(selectedAppointmentForEdit.appointment_date_time));
        setEditTime(new Date(selectedAppointmentForEdit.appointment_date_time));
      }
    }, [selectedAppointmentForEdit]);

    // Fallback for doctor name
    const doctorName = getDoctorName(selectedAppointmentForEdit.doctor_id);
    const displayDoctor = doctorName && doctorName !== 'Loading...' ? doctorName : 'Unknown Doctor';

    // Date Picker Modal
    const renderDatePickerModal = () => (
      <Modal
        transparent
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 0, paddingTop: 24, paddingHorizontal: 0 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#22577A', textAlign: 'center', marginBottom: 16 }}>Select Date</Text>
            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 16 }} />
            <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
              <DateTimePicker
                value={editDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'default' : 'default'}
                onChange={(event, selected) => {
                  if (selected) {
                    const newDate = new Date(selected);
                    newDate.setHours(editTime.getHours());
                    newDate.setMinutes(editTime.getMinutes());
                    setEditDate(newDate);
                    setEditTime(newDate);
                  }
                }}
                minimumDate={new Date()}
                style={{ width: '100%' }}
              />
            </View>
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 24, marginBottom: 32, backgroundColor: '#28B6F6', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 }} onPress={() => setShowDatePicker(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Done</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </View>
        </View>
      </Modal>
    );

    // Time Picker Modal
    const renderTimePickerModal = () => (
      <Modal
        transparent
        animationType="slide"
        visible={showTimePicker}
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.2)' }}>
          <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 0, paddingTop: 24, paddingHorizontal: 0 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: '#22577A', textAlign: 'center', marginBottom: 16 }}>Select Time</Text>
            <View style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 16 }} />
            <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
              <DateTimePicker
                value={editTime}
                mode="time"
                display={Platform.OS === 'ios' ? 'default' : 'default'}
                onChange={(event, selected) => {
                  if (selected) {
                    const newTime = new Date(selected);
                    newTime.setFullYear(editDate.getFullYear());
                    newTime.setMonth(editDate.getMonth());
                    newTime.setDate(editDate.getDate());
                    setEditTime(newTime);
                    setEditDate(newTime);
                  }
                }}
                style={{ width: '100%' }}
              />
            </View>
            <TouchableOpacity style={{ alignSelf: 'center', marginTop: 24, marginBottom: 32, backgroundColor: '#28B6F6', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 }} onPress={() => setShowTimePicker(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Done</Text>
            </TouchableOpacity>
            <View style={{ height: 24 }} />
          </View>
        </View>
      </Modal>
    );

    const handleUpdate = async () => {
      try {
        const updatedDateTime = new Date(editDate);
        updatedDateTime.setHours(editTime.getHours());
        updatedDateTime.setMinutes(editTime.getMinutes());
        updatedDateTime.setSeconds(0);
        updatedDateTime.setMilliseconds(0);

        const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/${selectedAppointmentForEdit._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ appointment_date_time: updatedDateTime.toISOString() }),
        });
        if (response.ok) {
          onClose();
          Alert.alert('Success', 'Appointment updated!');
        } else {
          Alert.alert('Error', 'Failed to update appointment');
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to update appointment');
      }
    };

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentFixedButton}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reschedule Appointment</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ padding: 24 }} contentContainerStyle={{ paddingBottom: 90 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 16, color: '#2D3748' }}>Doctor: <Text style={{ fontWeight: '400' }}>{displayDoctor}</Text></Text>
              <Text style={{ fontSize: 16, fontWeight: '600', marginBottom: 24, color: '#2D3748' }}>Clinic: <Text style={{ fontWeight: '400' }}>{getClinicName(selectedAppointmentForEdit.clinic_id)}</Text></Text>

              <TouchableOpacity style={styles.simplePickerButton} onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={20} color="#22577A" style={{ marginRight: 8 }} />
                <Text style={styles.simplePickerButtonText}>
                  {editDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.simplePickerButton} onPress={() => setShowTimePicker(true)}>
                <Ionicons name="time-outline" size={20} color="#22577A" style={{ marginRight: 8 }} />
                <Text style={styles.simplePickerButtonText}>
                  {editTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateButtonText}>Update Appointment</Text>
              </TouchableOpacity>
            </View>
          </View>
          {showDatePicker && renderDatePickerModal()}
          {showTimePicker && renderTimePickerModal()}
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.profileSection}>
        <View>
          <Text style={styles.greetingText}>Hello, <Text style={styles.fullname}>{fullname}</Text></Text>
        </View>
      </View>

      {/* Upcoming Appointments Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        </View>
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <TouchableOpacity 
              key={appointment._id} 
              style={styles.appointmentCard}
              onPress={() => {
                setSelectedAppointment(appointment);
                setModalVisible(true);
              }}
            >
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentStatus}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: appointment.status === 'Approved' ? '#A7EC80' : '#FFB74D' }
                  ]} />
                  <Text style={[
                    styles.statusText,
                    { color: appointment.status === 'Approved' ? '#2E7D32' : '#E65100' }
                  ]}>
                    {appointment.status}
                  </Text>
                </View>
                <View style={styles.appointmentDateTime}>
                  <View style={styles.dateTimeItem}>
                    <Ionicons name="calendar-outline" size={16} color="#28B6F6" />
                    <Text style={styles.dateTimeText}>
                      {formatDateTime(appointment.appointment_date_time).split(',')[0]}
                    </Text>
                  </View>
                  <View style={styles.dateTimeItem}>
                    <Ionicons name="time-outline" size={16} color="#28B6F6" />
                    <Text style={styles.dateTimeText}>
                      {formatDateTime(appointment.appointment_date_time).split(',')[1]}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.appointmentInfo}>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="person-outline" size={16} color="#22577A" />
                    <Text style={styles.infoLabel}>Doctor:</Text>
                    <Text style={styles.infoValue}>{getDoctorName(appointment.doctor_id)}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="business-outline" size={16} color="#22577A" />
                    <Text style={styles.infoLabel}>Clinic:</Text>
                    <Text style={styles.infoValue}>{getClinicName(appointment.clinic_id)}</Text>
                  </View>
                </View>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Ionicons name="person-add-outline" size={16} color="#22577A" />
                    <Text style={styles.infoLabel}>Filled by:</Text>
                    <Text style={styles.infoValue}>{appointment.filled_by}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.appointmentActions}>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.rescheduleButton]}
                  onPress={() => handleReschedule(appointment)}
                >
                  <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => handleCancel(appointment)}
                >
                  <Ionicons name="close-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyAppointments}>
            <Ionicons name="calendar-outline" size={48} color="#CBD5E0" />
            <Text style={styles.emptyText}>No upcoming appointments</Text>
            <TouchableOpacity 
              style={styles.createNewButton}
              onPress={handleCreateNew}
            >
              <Text style={styles.createNewButtonText}>Create New Appointment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Clinics Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Clinics</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.clinicsScroll}
        >
          {clinics.length > 0 ? (
            clinics.map((clinic) => renderClinicCard(clinic))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No clinics available at the moment.</Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add the ClinicModal component */}
      <ClinicModal
        clinic={selectedClinicDetails}
        visible={clinicModalVisible}
        onClose={() => setClinicModalVisible(false)}
      />

      {/* Add the AppointmentModal component */}
      <AppointmentModal
        appointment={selectedAppointment}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      {/* Add the EditAppointmentModal */}
      <EditAppointmentModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
      />
    </ScrollView>
  );
}

function DoctorCard({ doctor, isSelected, onSelect }) {
  const router = useRouter();

  const handlePress = () => {
    if (onSelect) onSelect();
    router.push({
      pathname: "/CreateAppointment",
      params: {
        doctorId: doctor.id,
        doctorName: doctor.doctor_name,
        clinicId: doctor.clinic_id,
      }
    });
  };

  return (
    <View style={[styles.doctorCard, isSelected && { borderColor: '#22577A', borderWidth: 2 }]}>
      <Text style={styles.doctorName}>{doctor.doctor_name}</Text>
      <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
      <TouchableOpacity onPress={handlePress} style={styles.bookButton}>
        <Text style={styles.buttonText}>Book</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB', padding: 15 },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  greetingText: { fontSize: 18, fontFamily: 'Poppins' },
  fullname: { fontWeight: 'bold', color: '#22577A' },
  locationText: { color: '#777', fontFamily: 'Poppins' },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, fontFamily: 'Poppins' },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorName: { fontWeight: 'bold', fontFamily: 'Poppins' },
  doctorSpecialty: { color: '#777', fontFamily: 'Poppins' },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  appointmentDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  dateTimeText: {
    fontSize: 13,
    color: '#4A5568',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  appointmentInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#4A5568',
    marginLeft: 8,
    marginRight: 4,
    fontFamily: 'Poppins',
  },
  infoValue: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  rescheduleButton: {
    backgroundColor: '#28B6F6',
  },
  cancelButton: {
    backgroundColor: '#E53E3E',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  emptyAppointments: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 12,
    marginBottom: 16,
    fontFamily: 'Poppins',
  },
  createNewButton: {
    backgroundColor: '#28B6F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createNewButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    fontFamily: 'Poppins',
  },
  doctorsScroll: { marginBottom: 20 },
  doctorCard: { width: 140, backgroundColor: '#fff', borderRadius: 15, padding: 15, marginRight: 15, alignItems: 'center' },
  bookButton: { marginTop: 10, backgroundColor: '#22577A', borderRadius: 15, paddingVertical: 7, paddingHorizontal: 20 },
  createButton: { backgroundColor: '#57CC99', borderRadius: 15, padding: 15, marginTop: 10, alignItems: 'center' },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontFamily: 'Poppins' },
  clinicsScroll: {
    marginBottom: 20,
  },
  clinicCard: {
    width: 300,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  clinicImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  clinicImage: {
    width: '100%',
    height: '100%',
  },
  clinicGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  clinicContent: {
    padding: 15,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'Poppins',
  },
  clinicContact: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  viewClinicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  viewClinicText: {
    color: '#22577A',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
    fontFamily: 'Poppins',
  },
  emptyState: {
    padding: 20,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    fontFamily: 'Poppins',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  clinicModalImageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  clinicModalImage: {
    width: '100%',
    height: '100%',
  },
  modalSection: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  modalValue: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 28,
    fontFamily: 'Poppins',
  },
  bookAppointmentButton: {
    backgroundColor: '#22577A',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  bookAppointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Poppins',
  },
  ratingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 14,
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    marginLeft: 8,
  },
  reviewCount: {
    fontSize: 14,
    color: '#718096',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mapButtonText: {
    color: '#22577A',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  clinicRating: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clinicRatingText: {
    color: '#FFFFFF',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 12,
  },
  rescheduleInfo: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rescheduleInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rescheduleInfoText: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
    fontFamily: 'Poppins',
  },
  dateTimeContainer: {
    gap: 20,
  },
  dateTimeSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  dateTimePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimePickerText: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Poppins',
  },
  dateTimePicker: {
    height: 200,
    marginTop: 8,
  },
  updateButton: {
    backgroundColor: '#28B6F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    shadowColor: '#28B6F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    width: '100%',
    opacity: 1,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins',
    letterSpacing: 0.5,
  },
  simplePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  simplePickerButtonText: {
    fontSize: 16,
    color: '#2D3748',
    fontFamily: 'Poppins',
  },
  modalContentFixedButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    position: 'relative',
  },
  fixedButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
});
