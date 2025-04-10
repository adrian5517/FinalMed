import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function Profile() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userToken");
      router.replace("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AB</Text>
          </View>
          <View>
            <Text style={styles.emailtxt}>Email</Text>
            <Text style={styles.email}>Juelboncodin@gmail.com</Text>
            <Text style={styles.userId}>User ID: 234234</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* General Info */}
      <View style={styles.generalInfoCard}>
        <Text style={styles.sectionTitle}>General Info</Text>
        <View style={styles.hr} />
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Fullname</Text>
            <Text style={styles.infoValue}>Adrian Boncodin</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>09634509064</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Birthday</Text>
            <Text style={styles.infoValue}>June 14, 1999</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>juelboncodin@gmail.com</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={styles.infoValue}>Male</Text>
          </View>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>
              Block 12 Lot 21 Mahogany St. Villa Karangahan, San Felipe Naga City.
            </Text>
          </View>
        </View>
        <View style={styles.hr} />
        <TouchableOpacity style={styles.editInfoButton}>
          <Text style={styles.editInfoButtonText}>Edit Information</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  hr: {
    borderBottomColor: "#00000080",
    borderBottomWidth: 1,
    marginVertical: 5,

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
  emailtxt: {
    fontSize: 9, 
    color: "#757575",
    fontWeight: "400",
  },
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  profileInfo: {
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
  email: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userId: {
    fontSize: 14,
    color: "#666",
  },
  editButton: {
    backgroundColor: "#e0e0e0",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-end",
  },
  editButtonText: {
    fontSize: 12,
    color: "#007bff",
  },
  generalInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row", // Align items in a row
    justifyContent: "space-between", // Space between columns
    marginBottom: 8,
  },
  infoColumn: {
    flex: 1, // Each column takes equal space
    paddingHorizontal: 8, // Add padding between columns
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  editInfoButton: {
    backgroundColor: "#82C45C",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 23,
    alignSelf: "center",
    marginTop: 16,
  },
  editInfoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 23,
    alignSelf: "center",
    marginTop: 136,
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
