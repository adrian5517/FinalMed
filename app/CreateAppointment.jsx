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
import { useNavigation } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mongoose from 'mongoose';

const generateObjectId = () => new mongoose.Types.ObjectId().toString();

const CreateAppointment = () => {
  const navigation = useNavigation();
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

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinic) {
      fetchDoctors(selectedClinic);
    } else {
      setDoctors([]);
    }
  }, [selectedClinic]);

  const fetchClinics = async () => {
    try {
      const response = await axios.get('https://nagamedserver.onrender.com/api/clinic');
      setClinics(response.data.map((clinic) => ({
        label: clinic.clinic_name,
        value: clinic._id,
      })));
    } catch (error) {
      console.error('Error fetching clinics:', error.message);
      setErrorMessage('Failed to load clinics. Please try again.');
    }
  };

  const fetchDoctors = async (clinicId) => {
    try {
      const response = await axios.get(`https://nagamedserver.onrender.com/api/clinic/${clinicId}/doctor`);
      setDoctors(response.data.map((doctor) => ({
        label: doctor.doctor_name,
        value: doctor._id,
      })));
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

  const generateObjectId = () => new mongoose.Types.ObjectId().toString();

  const handleBookAppointment = async () => {
    try {
      if (!selectedClinic || !selectedDoctor) {
        Alert.alert('Missing Fields', 'Please select both a clinic and a doctor.');
        return;
      }
  
      // If patient info is required and no info found, generate a unique patient ID
      const patientInfo = await AsyncStorage.getItem('userInfo');
      const patientId = patientInfo ? JSON.parse(patientInfo).id : generateObjectId(); // Generate new ObjectId if no userInfo
  
      // Combine date & time into one ISO string
      const combinedDateTime = new Date(appointmentDate);
      combinedDateTime.setHours(appointmentTime.getHours());
      combinedDateTime.setMinutes(appointmentTime.getMinutes());
  
      const appointmentData = {
        doctor_id: selectedDoctor,
        clinic_id: selectedClinic,
        patient_id: patientId, // Use valid ObjectId or fallback value
        appointment_date_time: combinedDateTime.toISOString(),
        status: 'Pending',
      };
  
      console.log('Sending appointment data:', appointmentData);
  
      const response = await axios.post(
        'https://nagamedserver.onrender.com/api/appointment',
        appointmentData
      );
  
      console.log('Appointment booked:', response.data);
      Alert.alert('Success', 'Appointment booked successfully!');
      resetForm();
    } catch (error) {
      console.error('Error booking appointment:', error.response?.data || error.message);
      Alert.alert('Booking Failed', error.response?.data?.message || 'Error booking appointment.');
    }
  };

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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Book an Appointment</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
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
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
              <Text style={styles.buttonText}>Confirm Appointment</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
  },
  dateInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    paddingLeft: 10,
    fontSize: 16,
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateAppointment;
