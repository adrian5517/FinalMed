import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("https://nagamedserver.onrender.com/api/doctor");

        if (!response.ok) throw new Error(`Failed to fetch. Status: ${response.status}`);

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text}`);
        }

        const data = await response.json();
        const extractedDoctors = extractDoctors(data);
        setDoctors(extractedDoctors);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const extractDoctors = (data) => {
    if (Array.isArray(data)) return data;
    if (typeof data === "object" && data !== null) {
      if (Array.isArray(data.doctors)) return data.doctors;
      if (Array.isArray(data.data)) return data.data;
      return Object.values(data).filter((item) => item && typeof item === "object");
    }
    return [];
  };

  const formatAvailability = (availability) => {
    if (Array.isArray(availability) && Array.isArray(availability[0])) {
      return availability[0].join(", ");
    }
    return "Not available";
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor?.doctor_name?.toLowerCase() || "";
    const specialization = doctor?.specialization?.toLowerCase() || "";
    return (
      name.includes(searchQuery.toLowerCase()) ||
      specialization.includes(searchQuery.toLowerCase())
    );
  });

  const handleSelectDoctor = (doctor) => {
    router.push({
      pathname: "/CreateAppointment",
      params: {
        doctorId: doctor._id,
        doctorName: doctor.doctor_name,
        clinicId: doctor.clinic_id,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#22577A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Find your doctor</Text>

      <SearchBar
        placeholder="Search Doctor, Health issues"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />

      <Text style={styles.subtitle}>Available Doctors</Text>
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalDoctorsList}
        renderItem={({ item }) => (
          <View style={[styles.doctorCard, { borderColor: '#22577A', borderWidth: 2 } : null]}>
            <Image
              source={
                item.image
                  ? { uri: item.image }
                  : require("../assets/images/bookappointments.png")
              }
              style={styles.doctorImage}
            />
            <Text style={styles.doctorName}>{item.doctor_name || "Unknown Doctor"}</Text>
            <Text style={styles.doctorSpecialty}>
              {item.specialization || "General Practitioner"}
            </Text>
            <Text style={styles.doctorAvailability}>
              {formatAvailability(item.availability)}
            </Text>
            <TouchableOpacity style = {styles.button}  onPress={() => handleSelectDoctor(item)}>
              <Text style={styles.buttonText}>Book</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#E63946",
    textAlign: "center",
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#22577A",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
    color: "#22577A",
  },
  horizontalDoctorsList: {
    paddingBottom: 100,
  },
   doctorCard: { width: 140,height:250, backgroundColor: '#fff', borderRadius: 15, padding: 15, marginRight: 15, alignItems: 'center'},
   doctorImage: { width: 50, height: 50, borderRadius: 25, marginRight: 15,boarderWidth:5, borderColor:'#22577A' },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  doctorName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#22577A",
    textAlign: "center",
  },
  doctorSpecialty: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  doctorAvailability: {
    marginTop: 5,
    fontSize: 12,
    color: "#57CC99",
    textAlign: "center",
  },
  button: {
  marginTop: 10,
  paddingVertical: 6,
  paddingHorizontal: 12,
  backgroundColor: "#38A3A5",
  borderRadius: 8,
},
buttonText: {
  color: "#fff",
  fontWeight: "bold",
  textAlign: "center",
},});
