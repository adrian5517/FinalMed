import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";

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
        setDoctors(data); // Now showing all doctors
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
    <View style={styles.mainContainer}>
      <StatusBar style="auto" />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hr} />
        <Text style={styles.pt1}>Good day, {fullname}!</Text>

        {/* Horizontal Scroll for Menu Icons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.pt2}
          contentContainerStyle={styles.menuContainer}
        >
          {menuItems.map((item, index) => (
            <Link key={index} href={item.path} asChild>
              <TouchableOpacity style={styles.boxWrapper} activeOpacity={0.7}>
                <View style={styles.box}>
                  <Image source={item.image} style={styles.boxImage} />
                </View>
                <Text style={styles.boxText}>{item.text}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </ScrollView>

        <Text style={styles.header3txt}>Available Doctors</Text>

        {/* Scrollable Doctor List - Shows all doctors */}
        <View style={styles.doctorListContainer}>
          <ScrollView 
            style={styles.doctorScrollView}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
          >
            {doctors.length > 0 ? (
              doctors.map((doctor, index) => (
                <View key={index} style={styles.verticalBox}>
                  <Text style={styles.maintext}>{doctor.doctor_name || "Doctor Name"}</Text>
                  <Text style={styles.subtext}>{doctor.specialization || "Specialization"}</Text>
                </View>
              ))
            ) : (
              <View style={styles.verticalBox}>
                <Text style={styles.noDoctorsText}>No doctors available at the moment.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    paddingTop: 40, // Padding to avoid navigation bar
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
  },
  contentContainer: {
    paddingBottom: 30, // Extra padding at bottom
  },
  menuContainer: {
    paddingBottom: 10,
  },
  hr: {
    borderBottomColor: "#00000080",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  pt1: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  pt2: {
    marginVertical: 15,
  },
  box: {
    width: 120,
    height: 110,
    backgroundColor: "#A7EC80",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  boxWrapper: {
    alignItems: "center",
    width: 130,
    marginRight: 20,
  },
  boxText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  boxImage: {
    width: 90,
    height: 80,
    resizeMode: "contain",
  },
  header3txt: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 15,
    marginBottom: 10,
  },
  doctorListContainer: {
    flex: 1,
    minHeight: 200, // Minimum height to ensure scrollability
    maxHeight: 400, // Maximum height before scrolling
  },
  doctorScrollView: {
    flex: 1,
  },
  verticalBox: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00000020",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 10,
  },
  maintext: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtext: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
    color: "#666",
  },
  noDoctorsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#888",
    textAlign: "center",
    marginTop: 10,
  },
});