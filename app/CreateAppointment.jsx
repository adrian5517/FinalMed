import React, { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Text,
  TouchableOpacity,
  View,
  Platform,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const API_URL = 'https://nagamedserver.onrender.com/api';

const CreateAppointment = () => {
  const [name, setName] = useState('');
  const [clinicOpen, setClinicOpen] = useState(false);
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [reason, setReason] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clinic`);
      if (!response.ok) throw new Error('Failed to fetch clinics');
      const data = await response.json();
      setClinics(data.map(clinic => ({ label: clinic.clinic_name, value: clinic._id })));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async (clinicId) => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/clinic/${clinicId}/doctor`);
      if (!response.ok) throw new Error('Failed to fetch doctors');
      const data = await response.json();
      setDoctors(data.map(doctor => ({ label: doctor.doctor_name, value: doctor._id })));
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!name || !selectedClinic || !selectedDoctor || !reason) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    const appointmentData = {
      name,
      clinic_id: selectedClinic,
      doctor_id: selectedDoctor,
      reason,
      appointment_date_time: appointmentDateTime,
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/appointment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const responseData = await response.json();

      if (!response.ok) throw new Error(responseData.message || 'Failed to book appointment');

      Alert.alert('Success', 'Appointment confirmed!');
      setName('');
      setSelectedClinic(null);
      setSelectedDoctor(null);
      setReason('');
      setAppointmentDateTime(new Date());
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <Text style={styles.title}>Book an Appointment</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your Name</Text>
        <TextInput style={styles.input} placeholder="Enter your name" value={name} onChangeText={setName} />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Appointment Date and Time</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}>
          <Text style={styles.input}>{appointmentDateTime.toLocaleString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={appointmentDateTime}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setAppointmentDateTime(date);
            }}
          />
        )}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select a Clinic</Text>
        <DropDownPicker
          open={clinicOpen}
          value={selectedClinic}
          items={clinics}
          setOpen={setClinicOpen}
          setValue={setSelectedClinic}
          onChangeValue={fetchDoctors}
          placeholder="Choose a Clinic"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select a Doctor</Text>
        <DropDownPicker
          open={doctorOpen}
          value={selectedDoctor}
          items={doctors}
          setOpen={setDoctorOpen}
          setValue={setSelectedDoctor}
          placeholder="Choose a Doctor"
          disabled={!selectedClinic}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reason for Consultation</Text>
        <TextInput style={styles.input} placeholder="Enter reason" value={reason} onChangeText={setReason} multiline />
      </View>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <TouchableOpacity style={styles.submitButton} onPress={handleBookAppointment}>
          <Text style={styles.buttonText}>Confirm Appointment</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

export default CreateAppointment;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: { marginBottom: 25 },
  label: { fontSize: 16, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  errorText: { color: 'red', marginBottom: 10 },
  submitButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16 },
});