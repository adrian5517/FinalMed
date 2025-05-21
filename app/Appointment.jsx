import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from '@react-navigation/native';
import { useRouter } from "expo-router";

export default function Home() {
  const route = useRoute();
  const router = useRouter();

  const { doctorId: paramDoctorId, clinicId: paramClinicId } = route.params || {};

  const [fullname, setFullname] = useState("User");
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredDoctors = doctors.filter((doc) =>
    doc.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDoc = selectedDoctor;

  const handleCreateNew = () => {
    router.push("/CreateAppointment");
  };

 const handleReschedule = () => {
  if (!selectedDoc) return;

  router.push({
    pathname: "/CreateAppointment",
    params: {
      appointmentId: selectedDoc._id,
      doctorId: selectedDoc.id,
      doctorName: selectedDoc.doctor_name,
      clinicId: selectedDoc.clinic_id,
      mode: 'reschedule'
    }
  });
};


  const handleCancel = async () => {
    if (!selectedDoc) return;
    try {
      await fetch(`https://nagamedserver.onrender.com/api/appointment/${selectedDoc._id}`, {
        method: 'DELETE',
      });
      Alert.alert("Cancelled", "Appointment cancelled");
      setSelectedDoctor(null);
    } catch (error) {
      Alert.alert("Error", "Failed to cancel appointment");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.profileSection}>
        <Image source={require('../assets/images/bookappointments.png')} style={styles.profileImage} />
        <View>
          <Text style={styles.greetingText}>Hello, <Text style={styles.fullname}>{fullname}</Text></Text>
          <Text style={styles.locationText}>📍 San Felipe, Naga City</Text>
        </View>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder="Search Doctor, Health issues"
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      {/* Upcoming Appointment */}
      <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
      <View style={styles.appointmentCard}>
        {selectedDoc ? (
          <>
            <View style={styles.appointmentHeader}>
              <Image source={require('../assets/images/bookappointments.png')} style={styles.doctorImage} />
              <View>
                <Text style={styles.doctorName}>{selectedDoc.doctor_name}</Text>
                <Text style={styles.doctorSpecialty}>{selectedDoc.specialization}</Text>
              </View>
              <Text style={styles.appointmentStatus}>Confirmed</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text>📅 Monday, Jan 4, 2025</Text>
              <Text>⏰ 09:00 AM</Text>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>
                <Text style={styles.buttonText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={{ textAlign: 'center', padding: 20, color: '#777' }}>No upcoming appointments</Text>
        )}
      </View>

      {/* Available Doctors */}
      {searchQuery.trim() !== "" && filteredDoctors.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                doctor={doctor}
                isSelected={selectedDoctor?.id === doctor.id}
                onSelect={() => setSelectedDoctor(doctor)}
              />
            ))}
          </ScrollView>
        </>
      )}

      <TouchableOpacity style={styles.createButton} onPress={handleCreateNew}>
        <Text style={styles.createButtonText}>Create New +</Text>
      </TouchableOpacity>
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
      <Image source={require('../assets/images/bookappointments.png')} style={styles.doctorImage} />
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
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
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
  appointmentCard: { backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 20, elevation: 2 },
  appointmentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  doctorImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  doctorName: { fontWeight: 'bold', fontFamily: 'Poppins' },
  doctorSpecialty: { color: '#777', fontFamily: 'Poppins' },
  appointmentStatus: { marginLeft: 'auto', color: '#57CC99', fontWeight: 'bold', fontFamily: 'Poppins' },
  appointmentDetails: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  appointmentActions: { flexDirection: 'row', justifyContent: 'space-between' },
  rescheduleButton: { backgroundColor: '#57CC99', padding: 10, borderRadius: 10, flex: 1, marginRight: 10 },
  cancelButton: { backgroundColor: '#E63946', padding: 10, borderRadius: 10, flex: 1 },
  buttonText: { color: '#fff', textAlign: 'center', fontFamily: 'Poppins' },
  doctorsScroll: { marginBottom: 20 },
  doctorCard: { width: 140, backgroundColor: '#fff', borderRadius: 15, padding: 15, marginRight: 15, alignItems: 'center' },
  bookButton: { marginTop: 10, backgroundColor: '#22577A', borderRadius: 15, paddingVertical: 7, paddingHorizontal: 20 },
  createButton: { backgroundColor: '#57CC99', borderRadius: 15, padding: 15, marginTop: 10, alignItems: 'center' },
  createButtonText: { color: '#fff', fontWeight: 'bold', fontFamily: 'Poppins' },
});
