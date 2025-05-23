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
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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
      setLoading(false);
      Alert.alert('Success', 'Appointment booked successfully!');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.error('Error booking appointment:', error.response?.data || error.message);
      Alert.alert('Booking Failed', error.response?.data?.message || 'Error booking appointment.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2D3748" />
          </TouchableOpacity>
          <Text style={styles.title}>Book Appointment</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#A0AEC0"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Booking For</Text>
            <DropDownPicker
              open={filledByOpen}
              value={filledBy}
              items={filledByOptions}
              setOpen={setFilledByOpen}
              setValue={setFilledBy}
              placeholder="Select who is booking"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listItemLabelStyle={styles.dropdownItemLabel}
              placeholderStyle={styles.dropdownPlaceholder}
              zIndex={3000}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="document-text-outline" size={20} color="#718096" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter appointment description"
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>

          <View style={[styles.formGroup, { zIndex: 2000, marginBottom: clinicOpen ? 300 : 20 }]}>
            <Text style={styles.label}>Select a Clinic</Text>
            <DropDownPicker
              open={clinicOpen}
              value={selectedClinic}
              items={clinics}
              setOpen={setClinicOpen}
              setValue={setSelectedClinic}
              setItems={setClinics}
              placeholder="Select clinic"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listItemLabelStyle={styles.dropdownItemLabel}
              placeholderStyle={styles.dropdownPlaceholder}
              onOpen={() => {
                setDoctorOpen(false);
                setFilledByOpen(false);
              }}
            />
          </View>

          <View style={[styles.formGroup, { zIndex: 1000, marginBottom: doctorOpen ? 300 : 20 }]}>
            <Text style={styles.label}>Select a Doctor</Text>
            <DropDownPicker
              open={doctorOpen}
              value={selectedDoctor}
              items={doctors}
              setOpen={setDoctorOpen}
              setValue={setSelectedDoctor}
              setItems={setDoctors}
              placeholder="Select doctor"
              disabled={!selectedClinic}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              listItemLabelStyle={styles.dropdownItemLabel}
              placeholderStyle={styles.dropdownPlaceholder}
              onOpen={() => {
                setClinicOpen(false);
                setFilledByOpen(false);
              }}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Appointment Date</Text>
            <TouchableOpacity 
              style={styles.dateTimeInput}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#718096" style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {appointmentDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
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
              style={styles.dateTimeInput}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color="#718096" style={styles.inputIcon} />
              <Text style={styles.dateTimeText}>
                {appointmentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                })}
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
        </ScrollView>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#E53E3E" />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleBookAppointment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Book Appointment</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerRight: {
    width: 40,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 12,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 12,
    minHeight: 48,
  },
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 12,
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  dropdownItemLabel: {
    color: '#2D3748',
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    color: '#E53E3E',
    marginLeft: 8,
    fontSize: 14,
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4299E1',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#A0AEC0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default CreateAppointment;
