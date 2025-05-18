import React, { useState, useEffect } from "react";
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  FlatList,
  SafeAreaView,
} from "react-native";
import DoctorCard from "../components/DoctorCard";
import SearchBar from "../components/SearchBar";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "https://nagamedserver.onrender.com/api/doctor"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Received non-JSON response: ${text}`);
        }

        const data = await response.json();

        let doctorsArray = [];

        if (Array.isArray(data)) {
          doctorsArray = data;
        } else if (typeof data === "object" && data !== null) {
          if (Array.isArray(data.doctors)) {
            doctorsArray = data.doctors;
          } else if (Array.isArray(data.data)) {
            doctorsArray = data.data;
          } else {
            doctorsArray = Object.values(data).filter(
              (item) => item && typeof item === "object" && !Array.isArray(item)
            );
          }
        }

        setDoctors(doctorsArray);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    if (!doctor || typeof doctor !== "object") return false;
    return (
      (doctor.doctor_name?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      ) ||
      (doctor.specialization?.toLowerCase() || "").includes(
        searchQuery.toLowerCase()
      )
    );
  });

  const formatAvailability = (availability) => {
    if (Array.isArray(availability) && availability[0] && Array.isArray(availability[0])) {
      return availability[0].join("");
    }
    return "Not available";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22577A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading doctors: {error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Find your doctor</Text>

      {/* Search Bar */}
      <SearchBar
        placeholder="Search Doctor, Health issues"
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
      />

      {/* Horizontally scrollable list of doctors */}
      <Text style={styles.subtitle}>Available Doctors</Text>
      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item._id || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalDoctorsList}
        renderItem={({ item }) => (
          <DoctorCard
            name={item?.doctor_name || "Unknown Doctor"}
            specialization={item?.specialization || "General Practitioner"}
            contact={item?.contact_info || "Not available"}
            location={item?.clinic_id || "Naga City"}
            availability={formatAvailability(item?.availability)}
            image={item?.image || require("../assets/images/adaptive-icon.png")}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#E63946",
    textAlign: "center",
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
    paddingBottom: 240,
  },
});
