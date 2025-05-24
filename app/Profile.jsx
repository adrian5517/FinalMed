import React, { useEffect, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput,
  Modal, ScrollView, Alert, Image, Dimensions
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useAuthStore } from "../store/authStore";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

export default function Profile() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const router = useRouter();
  const { logout, user } = useAuthStore();

  useEffect(() => {
    fetchUserData();
    fetchProfilePicture();
    fetchAppointments();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const token = await AsyncStorage.getItem("authToken");
      if (!userId) {
        console.error("User ID not found.");
        setFullName("N/A");
        return;
      }

      const response = await fetch(`https://nagamedserver.onrender.com/api/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      if (!response.ok) throw new Error("Failed to fetch user data.");

      const data = await response.json();
      setFullName(data.fullname || "N/A");
      setEmail(data.email || "");
      // Don't set profilePicture here, handled by fetchProfilePicture

      const storedPhone = await AsyncStorage.getItem("phone");
      const storedAddress = await AsyncStorage.getItem("address");
      setPhone(storedPhone || "");
      setAddress(storedAddress || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
      setFullName("Error loading name");
    }
  };

  // Use the same logic as Status.jsx for fetching profilePicture
  const fetchProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const email = await AsyncStorage.getItem("userEmail");

      if (token) {
        const response = await fetch("https://nagamedserver.onrender.com/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        let profilePicture = data.profilePicture;

        if (!profilePicture && email) {
          profilePicture = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}`;
        }

        // Convert SVG to PNG for React Native compatibility
        if (profilePicture && profilePicture.includes('api.dicebear.com') && profilePicture.includes('/svg?')) {
          profilePicture = profilePicture.replace('/svg?', '/png?');
        }

        setProfilePicture(profilePicture);
      } else if (email) {
        setProfilePicture(`https://api.dicebear.com/7.x/avataaars/png?seed=${email}`);
      }
    } catch (error) {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        setProfilePicture(`https://api.dicebear.com/7.x/avataaars/png?seed=${email}`);
      }
    }
  };

  // Fetch appointments and set total
  const fetchAppointments = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setAppointments([]);
        return;
      }
      const token = await AsyncStorage.getItem("authToken");
      let headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        headers["Content-Type"] = "application/json";
      }
      const res = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`, {
        method: 'GET',
        headers,
      });
      const data = await res.json();
      // Check if data is an array, if not, set empty array
      if (Array.isArray(data)) {
        setAppointments(data);
      } else {
        setAppointments([]);
      }
    } catch (e) {
      setAppointments([]);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
            router.replace("/");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Logout Error", error.message || "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const handleEditProfile = async () => {
    setLoading(true);
    try {
      await AsyncStorage.setItem("phone", phone);
      await AsyncStorage.setItem("address", address);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile locally:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {profilePicture ? (
            <Image source={{ uri: profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImageText}>{fullName?.[0]?.toUpperCase() || "U"}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editImageButton}>
            <Ionicons name="camera" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{fullName}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Appointments</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Doctors</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      {/* Profile Sections */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="person-outline" size={20} color="#28B6F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{fullName}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail-outline" size={20} color="#28B6F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call-outline" size={20} color="#28B6F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{phone || "Not set"}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location-outline" size={20} color="#28B6F6" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{address || "Not set"}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#28B6F6" />
            </View>
            <Text style={styles.actionText}>My Appointments</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="medical-outline" size={24} color="#28B6F6" />
            </View>
            <Text style={styles.actionText}>Medical Records</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Ionicons name="settings-outline" size={24} color="#28B6F6" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* Add extra padding at the bottom */}
      <View style={styles.bottomPadding} />

      {/* Edit Profile Modal */}
      <Modal visible={isEditing} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Full Name" 
              value={fullName} 
              onChangeText={setFullName}
              placeholderTextColor="#94A3B8"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Email" 
              value={email} 
              onChangeText={setEmail}
              placeholderTextColor="#94A3B8"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Phone Number" 
              value={phone} 
              onChangeText={setPhone}
              placeholderTextColor="#94A3B8"
            />
            <TextInput 
              style={styles.input} 
              placeholder="Address" 
              value={address} 
              onChangeText={setAddress}
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleEditProfile} 
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  profileHeader: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#28B6F6",
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#28B6F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileImageText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#fff",
  },
  editImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#28B6F6",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#64748B",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 20,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
  },
  sectionContainer: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "500",
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: width - 32,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#1E293B",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 4,
  },
  saveButton: {
    backgroundColor: "#28B6F6",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  bottomPadding: {
    height: 20,
  },
});
