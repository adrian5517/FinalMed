import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [fullname, setFullname] = useState("User");
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.error("User ID not found.");
          return;
        }

        const response = await fetch(`https://nagamedserver.onrender.com/api/user/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const data = await response.json();
        setFullname(data.fullname || "User");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchDoctors = async () => {
      try {
        const response = await fetch("https://nagamedserver.onrender.com/api/doctor");
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server responded with:", errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Received non-JSON response: ${text.substring(0, 100)}...`);
        }

        const data = await response.json();
        setDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    };

    fetchUserData();
    fetchDoctors();
  }, []);

  const menuItems = [
    { text: "Book Appointment", image: require("../assets/images/bookappointments.png"), path: "/CreateAppointment" },
    { text: "Health Records", image: require("../assets/images/healthrecords.png"), path: "/Status" },
    { text: "Consult Doctor", image: require("../assets/images/consultdoctor.png"), path: "/Doctors" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require('../assets/images/bookappointments.png')}
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.greetingText}>Hello, <Text style={styles.fullname}>{fullname}</Text></Text>
          <Text style={styles.locationText}>📍 San Felipe, Naga City</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#777" style={styles.searchIcon} />
        <TextInput
          placeholder="Search Doctor, Health issues"
          style={styles.searchInput}
        />
      </View>

      {/* Menu Icons */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.menuScroll}>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.path} asChild>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Image source={item.image} style={styles.menuImage} />
              </View>
              <Text style={styles.menuText}>{item.text}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </ScrollView>

      {/* Upcoming Appointment */}
      <Text style={styles.sectionTitle}>Upcoming Appointment</Text>
      <View style={styles.appointmentCard}>
        {doctors.length > 0 ? (
          <>
            <View style={styles.appointmentHeader}>
              <Image
                source={require('../assets/images/bookappointments.png')}
                style={styles.doctorImage}
              />
              <View>
                <Text style={styles.doctorName}>{doctors[0].doctor_name}</Text>
                <Text style={styles.doctorSpecialty}>{doctors[0].specialization}</Text>
              </View>
              <Text style={styles.appointmentStatus}>Confirmed</Text>
            </View>
            <View style={styles.appointmentDetails}>
              <Text style={styles.detailText}>📅 Monday, Jan 4, 2025</Text>
              <Text style={styles.detailText}>⏰ 09:00 AM</Text>
            </View>
            <View style={styles.appointmentActions}>
              <TouchableOpacity style={styles.rescheduleButton}>
                <Text style={styles.buttonText}>Reschedule</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.noAppointmentText}>No upcoming appointments</Text>
        )}
      </View>

      {/* Available Doctors */}
      <Text style={styles.sectionTitle}>Available Doctors</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorsScroll}>
        {doctors.map((doctor, index) => (
          <View key={index} style={styles.doctorCard}>
            <Image
              source={require('../assets/images/bookappointments.png')}
              style={styles.doctorImage}
            />
            <Text style={styles.doctorName}>{doctor.doctor_name}</Text>
            <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
            <TouchableOpacity style={styles.bookButton}>
              <Text style={styles.buttonText}>Book</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Create New Button */}
      <TouchableOpacity style={styles.createButton}>
        <Text style={styles.createButtonText}>Create New +</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 15,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  greetingText: {
    fontSize: 18,
    fontFamily: 'Poppins',
  },
  fullname: {
    fontWeight: 'bold',
    color: '#22577A',
  },
  locationText: {
    color: '#777',
    fontFamily: 'Poppins',
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 15,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Poppins',
  },
  menuScroll: {
    marginBottom: 20,
  },
  menuItem: {
    width: 120,
    marginRight: 15,
    alignItems: 'center',
  },
  menuIcon: {
    width: 70,
    height: 70,
    backgroundColor: '#A7EC80',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuImage: {
    width: 40,
    height: 40,
  },
  menuText: {
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    fontFamily: 'Poppins',
  },
  appointmentCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  doctorImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  doctorName: {
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  doctorSpecialty: {
    color: '#777',
    fontFamily: 'Poppins',
  },
  appointmentStatus: {
    marginLeft: 'auto',
    color: '#57CC99',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailText: {
    fontFamily: 'Poppins',
  },
  appointmentActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rescheduleButton: {
    backgroundColor: '#57CC99',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    backgroundColor: '#E63946',
    padding: 10,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  noAppointmentText: {
    textAlign: 'center',
    fontFamily: 'Poppins',
    color: '#777',
    padding: 20,
  },
  doctorsScroll: {
    marginBottom: 20,
  },
  doctorCard: {
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    elevation: 2,
  },
  bookButton: {
    backgroundColor: '#22577A',
    padding: 8,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
  },
  createButton: {
    backgroundColor: '#82C45C',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});