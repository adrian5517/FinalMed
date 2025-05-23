import { Stack, useRouter, useSegments } from "expo-router";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Image,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import COLORS from "../constant/colors";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    fetchProfilePicture();
  }, []);

  const fetchProfilePicture = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const email = await AsyncStorage.getItem("userEmail");
      
      console.log("Debug - Token:", token ? "exists" : "missing");
      console.log("Debug - Email:", email);
      
      if (token) {
        console.log("Debug - Fetching profile from API...");
        const response = await fetch("https://nagamedserver.onrender.com/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log("Debug - API Response:", data);
        
        // Handle profile picture with fallback to DiceBear
        let profilePicture = data.profilePicture;
        console.log("Debug - Profile Picture from API:", profilePicture);
        
        if (!profilePicture && email) {
          profilePicture = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}`;
          console.log("Debug - Using DiceBear fallback:", profilePicture);
        }
        
        // Convert SVG to PNG for React Native compatibility
        if (profilePicture && profilePicture.includes('api.dicebear.com') && profilePicture.includes('/svg?')) {
          profilePicture = profilePicture.replace('/svg?', '/png?');
          console.log("Debug - Converted to PNG:", profilePicture);
        }
        
        console.log("Debug - Final Profile Picture:", profilePicture);
        setProfilePicture(profilePicture);
      } else {
        console.log("Debug - No token found, using DiceBear fallback");
        if (email) {
          const fallbackPicture = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}`;
          console.log("Debug - Error fallback to DiceBear:", fallbackPicture);
          setProfilePicture(fallbackPicture);
        }
      }
    } catch (error) {
      console.error("Error fetching profile picture:", error);
      // Fallback to DiceBear if there's an error
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        const fallbackPicture = `https://api.dicebear.com/7.x/avataaars/png?seed=${email}`;
        console.log("Debug - Error fallback to DiceBear:", fallbackPicture);
        setProfilePicture(fallbackPicture);
      }
    }
  };

  // Add useEffect to monitor profilePicture state changes
  useEffect(() => {
    console.log("Debug - Profile Picture State Updated:", profilePicture);
  }, [profilePicture]);

  const hideNavBar =
    segments.length === 0 ||
    segments[0] === "Signin" ||
    segments[0] === "CreateAccount" ||
    segments[0] === "ForgotPassword" || 
    segments[0] === "ChatList" || 
    segments[0] === "ChatConversation" ||
    segments[0] === "CreateAppointment";

  const isHome = segments.length === 0 || segments[0] === "Home";

  return (
    <SafeAreaView style={styles.container}>
      {!hideNavBar && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.back()}
          >
            {!isHome && (
              <Ionicons
                name="arrow-back"
                size={30}
                color="black"
              />
            )}
          </TouchableOpacity>
          
          <Text style={styles.headerText}>
            Naga <Text style={styles.med}>Med</Text>
          </Text>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => console.log("Open Notifications")}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color="#1170b3"
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.profileButton}
              onPress={() => router.push("/Profile")}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={styles.profilePicture}
                  onError={(e) => console.log("Debug - Image loading error:", e.nativeEvent.error)}
                />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <FontAwesome5 name="user" size={20} color="#1170b3" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={hideNavBar ? 0 : 80}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="Signin" />
          <Stack.Screen name="Home" />
          <Stack.Screen name="Profile" />
          <Stack.Screen name="Appointment" />
          <Stack.Screen name="Doctors" />
          <Stack.Screen name="Status" />
        </Stack>
      </KeyboardAvoidingView>

      {!hideNavBar && (
        <View style={styles.navBar}>
          {["Home", "Appointment", "Doctors", "Status", "Profile"].map((item, index) => {
            const isActive = segments[0] === item;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.navButton, isActive && styles.activeNavButton]} 
                onPress={() => router.push(`/${item}`)}
              >
                {isActive ? (
                  <View style={styles.activeButtonContainer}>
                    <FontAwesome5 name={getIconName(item)} size={20} color="#fff" />
                    <Text style={styles.activeNavText}>{item}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveButtonContainer}>
                    <FontAwesome5 name={getIconName(item)} size={20} color="#333" />
                    <Text style={styles.navText}>{item}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

function getIconName(name) {
  switch (name) {
    case "Home":
      return "home";
    case "Appointment":
      return "calendar-alt";
    case "Doctors":
      return "user-md";
    case "Status":
      return "chart-line";
    case "Profile":
      return "user";
    default:
      return "question-circle";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 70,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1170b3",
  },
  med: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.primaryGreen,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  notificationButton: {
    padding: 8,
  },
  profileButton: {
    padding: 4,
  },
  profilePicture: {
    width: 35,
    height: 35,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#1170b3",
  },
  profilePlaceholder: {
    width: 35,
    height: 35,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1170b3",
  },
  iconButton: {
    padding: 10,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 85,
    backgroundColor: "#fff",
    paddingBottom: 20,
    position: "absolute",
    bottom: 0,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  activeNavButton: {
    transform: [{ translateY: -15 }],
  },
  navText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 4,
  },
  activeButtonContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0288D0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  inactiveButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  activeNavText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
    marginTop: 4,
  },
});
