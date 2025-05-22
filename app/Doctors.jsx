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
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import SearchBar from "../components/SearchBar";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const getProfilePicture = (email) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("https://nagamedserver.onrender.com/api/doctorauth/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Doctors data:", data); // Log the full response

      if (data.success && Array.isArray(data.data)) {
        setDoctors(data.data);
        console.log("Number of doctors:", data.data.length);
        setError(null);
      } else {
        console.error("Invalid data format received:", data);
        setDoctors([]);
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      setDoctors([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDoctors();
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const name = doctor?.fullname?.toLowerCase() || "";
    const specialization = doctor?.specialization?.toLowerCase() || "";
    const email = doctor?.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    
    return (
      name.includes(query) ||
      specialization.includes(query) ||
      email.includes(query)
    );
  });

  const handleSelectDoctor = (doctor) => {
    router.push({
      pathname: "/CreateAppointment",
      params: {
        doctorId: doctor._id,
        doctorName: doctor.fullname,
        specialization: doctor.specialization,
      },
    });
  };

  const renderDoctorCard = ({ item }) => (
    <View style={styles.doctorCard}>
      <View style={styles.doctorHeader}>
        <Image
          source={{ uri: getProfilePicture(item.email) }}
          style={styles.doctorImage}
        />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{item.fullname}</Text>
          <Text style={styles.doctorSpecialty}>{item.specialization}</Text>
          <Text style={styles.doctorEmail}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.doctorStats}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5+</Text>
          <Text style={styles.statLabel}>Years</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>100+</Text>
          <Text style={styles.statLabel}>Patients</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => handleSelectDoctor(item)}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#28B6F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDoctors}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find your doctor</Text>
        <Text style={styles.subtitle}>Book an appointment with our specialists</Text>
      </View>

      <SearchBar
        placeholder="Search by name, specialization or email"
        onChangeText={setSearchQuery}
        value={searchQuery}
      />

      <FlatList
        data={filteredDoctors}
        keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
        renderItem={renderDoctorCard}
        contentContainerStyle={styles.doctorsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#28B6F6"]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "No doctors found matching your search"
                : "No doctors available at the moment"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#E53E3E",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#28B6F6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  doctorsList: {
    padding: 16,
  },
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#28B6F6",
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3748",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: "#4A5568",
    marginBottom: 4,
  },
  doctorEmail: {
    fontSize: 14,
    color: "#718096",
  },
  doctorStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3748",
  },
  statLabel: {
    fontSize: 12,
    color: "#718096",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#E2E8F0",
  },
  bookButton: {
    backgroundColor: "#28B6F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
});
