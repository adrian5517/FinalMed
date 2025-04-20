import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function Status() {
  return (
    <ScrollView style={styles.container}>

      {/* Patient Info Card */}
      <View style={styles.patientCard}>
        <View style={styles.patientInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AB</Text>
          </View>
          <View>
            <Text style={styles.patientName}>Adrian Boncodin</Text>
            <Text style={styles.patientId}>Patient ID: 345234</Text>
            <Text style={styles.headerLogo}>
                          <Text style={styles.nagaText}>Naga</Text>
                          <Text style={styles.medText}> Med</Text>
                        </Text>
          </View>
        </View>
        <View style={styles.conditionWrapper}>
          <Text style={styles.conditionText}>
            experiencing a heart-related condition and is advised to rest for 3 days
          </Text>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Time Slot Info */}
      <View style={styles.timeSlotCard}>
        <Text style={styles.timeSlotText}>
          Time slot available for future, you can extend the reservation time
        </Text>
        <TouchableOpacity style={styles.extendButton}>
          <Text style={styles.extendButtonText}>Extend time</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Details */}
      <View style={styles.appointmentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="water" size={24} color="#007bff" />
          <Text style={styles.detailText}>Treatment: Blood Testing</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={24} color="#007bff" />
          <Text style={styles.detailText}>Fri, Feb 16 02:00PM - 05:00PM</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="person" size={24} color="#007bff" />
          <Text style={styles.detailText}>Doctor: Dr. Jeff Pilapil</Text>
        </View>
      </View>

      {/* Pharmacy Store */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Pharmacy Store</Text>
        <Text style={styles.viewMore}>View More</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pharmacyList}>
        {[
          { name: "Mercury Drug", status: "Open", image: require("../assets/images/adaptive-icon.png") },
          { name: "Southstar Drugs", status: "Closed", image: require("../assets/images/adaptive-icon.png") },
          { name: "Generics Pharmacy", status: "Closed", image: require("../assets/images/adaptive-icon.png") },
        ].map((pharmacy, index) => (
          <View key={index} style={styles.pharmacyCard}>
            <Image source={pharmacy.image} style={styles.pharmacyImage} />
            <Text style={styles.pharmacyName}>{pharmacy.name}</Text>
            <Text style={styles.pharmacyStatus}>{pharmacy.status}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Available Clinics */}
      <Text style={styles.sectionTitle}>Available Clinics</Text>
      {[
        {
          name: "St. Camillus Medical Clinic",
          rating: "5.0",
          address: "Liboton, Naga City",
          phone: "09123456789",
        },
        {
          name: "Bicolcare Medical Clinic and Laboratory",
          rating: "4.5",
          address: "Concepcion Grande, Naga City",
          phone: "09123456789",
        },
      ].map((clinic, index) => (
        <View key={index} style={styles.clinicCard}>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>{clinic.name}</Text>
            <Text style={styles.clinicDetails}>
              {clinic.rating} ★ | {clinic.address} | {clinic.phone}
            </Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="arrow-forward" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
  },
  med: {
    color: "#28a745",
  },
  nagaText: {
    color: "#0072CE", // Blue color for "Naga"
  },
  medText: {
    color: "#4CAF50", // Green color for "Med"
  },
  headerLogo: {
    position: "absolute", // Position it absolutely
    top: -5, // Distance from the top of the card
    right: -140, // Distance from the right of the card
    fontSize: 16,
    fontWeight: "bold",
  },
  
  patientCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  patientInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007bff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  patientName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  patientId: {
    fontSize: 14,
    color: "#666",
  },
  conditionWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conditionText: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  editButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    color: "#007bff",
  },
  timeSlotCard: {
    backgroundColor: "#B3E5FCAD",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  timeSlotText: {
    fontSize: 14,
    color: "#000000",
    marginBottom: 8,
  },
  extendButton: {
    position: "absolute",
    right: 16,
    bottom: 12,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  extendButtonText: {
    color: "#1170B3",
    fontSize: 16,
    fontWeight: "bold",
  },
  appointmentDetails: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
    color: "#666",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewMore: {
    fontSize: 14,
    color: "#007bff",
  },
  pharmacyList: {
    marginBottom: 16,
  },
  pharmacyCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    width: 150,
    alignItems: "center",
  },
  pharmacyImage: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  pharmacyStatus: {
    fontSize: 12,
    color: "#666",
  },
  clinicCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  clinicInfo: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  clinicDetails: {
    fontSize: 12,
    color: "#666",
  },
});
