import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mongoose from 'mongoose';

const generateObjectId = () => new mongoose.Types.ObjectId().toString();

const CreateAppointment = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { doctorId, clinicId } = route.params || {};

  const [name, setName] = useState('');
  const [clinicOpen, setClinicOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentTime, setAppointmentTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

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

  // Fetch clinics and preselect if param exists
  const fetchClinics = async () => {
    try {
      const response = await axios.get('https://nagamedserver.onrender.com/api/clinic');
      const clinicsData = response.data.map(clinic => ({
        label: clinic.clinic_name,
        value: clinic._id,
      }));
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

  // Fetch doctors for selected clinic and preselect if param exists
  const fetchDoctors = async (clinicId) => {
    try {
      const response = await axios.get(`https://nagamedserver.onrender.com/api/clinic/${clinicId}/doctor`);
      const doctorsData = response.data.map(doctor => ({
        label: doctor.fullname,
        value: doctor._id,
        specialization: doctor.specialization,
        email: doctor.email,
        contact: doctor.contact,
        availability: doctor.availability
      }));
      setDoctors(doctorsData);

      if (doctorsData.length > 0) {
        if (doctorId && doctorsData.some(d => d.value === doctorId)) {
          setSelectedDoctor(doctorId);
        } else {
          setSelectedDoctor(doctorsData[0].value);
        }
      } else {
        setSelectedDoctor(null);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error.message);
      setErrorMessage('Failed to load doctors. Please try again.');
    }
  };

  // Date picker handler
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  // Time picker handler
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setAppointmentTime(selectedTime);
    }
  };

  // Book appointment
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

      const patientInfo = await AsyncStorage.getItem('userInfo');
      const patientId = patientInfo ? JSON.parse(patientInfo).id : generateObjectId();

      // Combine date & time properly
      const combinedDateTime = new Date(appointmentDate);
      combinedDateTime.setHours(appointmentTime.getHours());
      combinedDateTime.setMinutes(appointmentTime.getMinutes());
      combinedDateTime.setSeconds(0);
      combinedDateTime.setMilliseconds(0);

      const appointmentData = {
        doctor_id: selectedDoctor,
        clinic_id: selectedClinic,
        patient_id: patientId,
        patient_name: name.trim(),
        appointment_date_time: combinedDateTime.toISOString(),
        status: 'Pending',
      };

      console.log('Sending appointment data:', appointmentData);

      const response = await axios.post('https://nagamedserver.onrender.com/api/appointment', appointmentData);

      setLoading(false);
      Alert.alert('Success', 'Appointment booked successfully!');
      resetForm();
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      console.error('Error booking appointment:', error.response?.data || error.message);
      Alert.alert('Booking Failed', error.response?.data?.message || 'Error booking appointment.');
    }
  };

  // Reset form inputs
  const resetForm = () => {
    setName('');
    setSelectedClinic(null);
    setSelectedDoctor(null);
    setAppointmentDate(new Date());
    setAppointmentTime(new Date());
    setErrorMessage('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Book an Appointment</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Appointment Date</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowDatePicker(true)}>
              <Text>{appointmentDate.toDateString()}</Text>
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

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Appointment Time</Text>
            <TouchableOpacity style={styles.dateInput} onPress={() => setShowTimePicker(true)}>
              <Text>{appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
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

          <View style={{ zIndex: 2000, marginBottom: clinicOpen ? 300 : 20 }}>
            <Text style={styles.label}>Select a Clinic</Text>
            <DropDownPicker
              open={clinicOpen}
              value={selectedClinic}
              items={clinics}
              setOpen={setClinicOpen}
              setValue={setSelectedClinic}
              setItems={setClinics}
              placeholder="Select clinic"
              listMode="SCROLLVIEW"
              dropDownDirection="DOWN"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              onOpen={() => setDoctorOpen(false)}
            />
          </View>

          <View style={{ zIndex: 1000, marginBottom: doctorOpen ? 300 : 20 }}>
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
              listMode="SCROLLVIEW"
              dropDownDirection="DOWN"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              onOpen={() => setClinicOpen(false)}
              labelStyle={styles.dropdownLabel}
              listItemLabelStyle={styles.dropdownItemLabel}
              customItemContainerStyle={styles.dropdownItemContainer}
              customItemLabelStyle={styles.dropdownItemLabel}
              renderItem={item => (
                <View style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemName}>{item.label}</Text>
                  <Text style={styles.dropdownItemSpecialty}>{item.specialization}</Text>
                </View>
              )}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
              <Text style={styles.submitButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { padding: 20, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 6,
    justifyContent: 'center',
  },
  dropdown: {
    borderColor: '#ccc',
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemContainer: {
    paddingVertical: 8,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdownItemSpecialty: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dropdownItemLabel: {
    fontSize: 16,
  },
});

export default CreateAppointment;
