import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { COLORS } from '../constant/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CreateAppointment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId, clinicId, doctorName, clinicName } = route.params || {};

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [filledBy, setFilledBy] = useState('self');
  const [clinicOpen, setClinicOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [filledByOpen, setFilledByOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(clinicId || null);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorId || null);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const filledByOptions = [
    { label: 'Self', value: 'self' },
    { label: 'Relative', value: 'relative' }
  ];

  // Fetch clinics on mount
  useEffect(() => {
    fetchClinics();
  }, []);

  // Fetch doctors when selectedClinic changes
  useEffect(() => {
    if (selectedClinic) {
      fetchDoctors(selectedClinic);
    } else {
      setDoctors([]);
      setSelectedDoctor(null);
    }
  }, [selectedClinic]);

  useEffect(() => {
    if (clinicId) {
      setSelectedClinic(clinicId);
    }
  }, [clinicId]);

  useEffect(() => {
    if (doctorId) {
      setSelectedDoctor(doctorId);
    }
  }, [doctorId]);

  const fetchClinics = async () => {
    try {
      console.log('Fetching clinics...');
      const response = await axios.get('https://nagamedserver.onrender.com/api/clinic');
      const clinicsData = response.data.map(clinic => ({
        label: clinic.clinic_name,
        value: clinic._id,
      }));
      console.log('Fetched clinics:', clinicsData);
      setClinics(clinicsData);

      if (clinicsData.length > 0) {
        if (clinicId && clinicsData.some(c => c.value === clinicId)) {
          setSelectedClinic(clinicId);
        } else {
          setSelectedClinic(clinicsData[0].value);
        }
      }
    } catch (error) {
      console.error('Error fetching clinics:', error.message);
      setErrorMessage('Failed to load clinics. Please try again.');
    }
  };

  const fetchDoctors = async (clinicId) => {
    try {
      console.log('Fetching doctors for clinic:', clinicId);
      const response = await axios.get(`https://nagamedserver.onrender.com/api/doctorauth/`);
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const doctorsData = response.data.data
          .filter(doctor => doctor.clinic_id === clinicId)
          .map(doctor => ({
            label: doctor.fullname,
            value: doctor._id,
            specialization: doctor.specialization,
          }));
        
        console.log('Fetched doctors:', doctorsData);
        setDoctors(doctorsData);

        if (doctorsData.length > 0) {
          if (doctorId && doctorsData.some(d => d.value === doctorId)) {
            setSelectedDoctor(doctorId);
          } else {
            setSelectedDoctor(doctorsData[0].value);
          }
        }
      } else {
        console.log('No doctors data found');
        setDoctors([]);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error.message);
      setErrorMessage('Failed to load doctors. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setAppointmentTime(selectedTime);
    }
  };

  const handleBookAppointment = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }
    if (!selectedClinic || !selectedDoctor) {
      Alert.alert('Missing Fields', 'Please select both a clinic and a doctor.');
      return;
    }

    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found');
      }

      const combinedDateTime = new Date(appointmentDate);
      combinedDateTime.setHours(appointmentTime.getHours());
      combinedDateTime.setMinutes(appointmentTime.getMinutes());
      combinedDateTime.setSeconds(0);
      combinedDateTime.setMilliseconds(0);

      const appointmentData = {
        doctor_id: selectedDoctor,
        clinic_id: selectedClinic,
        patient_id: userId,
        patient_name: name.trim(),
        appointment_date_time: combinedDateTime.toISOString(),
        status: 'Pending',
        filled_by: filledBy,
        description: description.trim()
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await axios.post('https://nagamedserver.onrender.com/api/appointment', appointmentData);
      console.log('Appointment created:', response.data);

      Alert.alert(
        'Success',
        'Appointment booked successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Status')
          }
        ]
      );
    } catch (error) {
      console.error('Error creating appointment:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAwareScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#22577A" />
            </TouchableOpacity>
            <Text style={styles.title}>Book</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Appointment Date</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#22577A" />
                <Text style={styles.dateTimeText}>
                  {appointmentDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={appointmentDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Appointment Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#22577A" />
                <Text style={styles.dateTimeText}>
                  {appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={appointmentTime}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
            </View>

            <View style={[styles.formGroup, { zIndex: 2000, marginBottom: clinicOpen ? 300 : 20 }]}>
              <Text style={styles.label}>Select a Clinic</Text>
              <View style={[styles.input, { justifyContent: 'center', backgroundColor: '#F0F0F0' }]}> 
                <Text style={{ color: '#2D3748' }}>
                  {clinics.find(c => c.value === (clinicId || selectedClinic))?.label || clinicName || 'Selected Clinic'}
                </Text>
              </View>
            </View>

            <View style={[styles.formGroup, { zIndex: 1000, marginBottom: 20 }]}>
              <Text style={styles.label}>Select a Doctor</Text>
              {doctorId ? (
                <View style={[styles.input, { justifyContent: 'center', backgroundColor: '#F0F0F0' }]}>
                  <Text style={{ color: '#2D3748' }}>
                    {doctors.find(d => d.value === doctorId)?.label || doctorName || 'Selected Doctor'}
                  </Text>
                </View>
              ) : (
                <DropDownPicker
                  open={doctorOpen}
                  value={selectedDoctor}
                  items={doctors}
                  setOpen={setDoctorOpen}
                  setValue={setSelectedDoctor}
                  setItems={setDoctors}
                  placeholder="Select doctor"
                  disabled={!selectedClinic}
                  style={[styles.dropdown, { width: '100%' }]}
                  dropDownContainerStyle={[styles.dropdownContainer, { width: '100%', maxHeight: 200, zIndex: 1000 }]}
                  listItemLabelStyle={styles.dropdownItemLabel}
                  placeholderStyle={styles.dropdownPlaceholder}
                  onOpen={() => {
                    setClinicOpen(false);
                    setFilledByOpen(false);
                  }}
                  listMode="MODAL"
                />
              )}
            </View>

            <View style={[styles.formGroup, { zIndex: 500, marginBottom: 20 }]}>
              <Text style={styles.label}>Filled By</Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                  onPress={() => setFilledBy('self')}
                >
                  <View style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#22577A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                    backgroundColor: filledBy === 'self' ? '#22577A' : '#FFF',
                  }}>
                    {filledBy === 'self' && (
                      <View style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: '#FFF',
                      }} />
                    )}
                  </View>
                  <Text style={{ color: '#2D3748', fontSize: 16 }}>Self</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={() => setFilledBy('relative')}
                >
                  <View style={{
                    height: 20,
                    width: 20,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#22577A',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                    backgroundColor: filledBy === 'relative' ? '#22577A' : '#FFF',
                  }}>
                    {filledBy === 'relative' && (
                      <View style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: '#FFF',
                      }} />
                    )}
                  </View>
                  <Text style={{ color: '#2D3748', fontSize: 16 }}>Relative</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter appointment description"
                placeholderTextColor="#666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleBookAppointment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Book Appointment</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: "#0288D0",
  },
  form: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2D3748',
  },
  textArea: {
    height: 100,
  },
  dropdown: {
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  dropdownContainer: {
    borderColor: '#E2E8F0',
    borderRadius: 8,
  },
  dropdownItemLabel: {
    color: '#2D3748',
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
  },
  dateTimeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#2D3748',
  },
  submitButton: {
    backgroundColor: '#82C45C',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#82C45C',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    marginTop: 8,
  },
});

export default CreateAppointment;
