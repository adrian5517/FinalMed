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
  StatusBar
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
      <StatusBar barStyle={Platform.OS === "android" ? "dark-content" : "default"} backgroundColor="#F8FAFC" />
      {!hideNavBar && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {!isHome && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color="#2D3748"
                />
              </TouchableOpacity>
            )}
            <Text style={styles.headerText}>
              Naga<Text style={styles.med}>Med</Text>
            </Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => router.push("/Maps")}
            >
              <Ionicons
                name="map-outline"
                size={24}
                color="#2D3748"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => console.log("Open Notifications")}
            >
              <View style={styles.notificationBadge}>
                <Ionicons
                  name="notifications-outline"
                  size={24}
                  color="#2D3748"
                />
                <View style={styles.badge} />
              </View>
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
                  <FontAwesome5 name="user" size={20} color="#2D3748" />
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
          {[
            { name: "Home", route: "Home" },
            { name: "Book", route: "Appointment" },
            { name: "Doctors", route: "Doctors" },
            { name: "Status", route: "Status" },
            { name: "Profile", route: "Profile" }
          ].map((item, index) => {
            const isActive = segments[0] === item.route;
            return (
              <TouchableOpacity 
                key={index} 
                style={[styles.navButton, isActive && styles.activeNavButton]} 
                onPress={() => router.push(`/${item.route}`)}
              >
                {isActive ? (
                  <View style={styles.activeButtonContainer}>
                    <Ionicons name={getIconName(item.route)} size={24} color="#fff" />
                    <Text style={styles.activeNavText}>{item.name}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveButtonContainer}>
                    <Ionicons name={getIconName(item.route)} size={22} color="#64748B" />
                    <Text style={styles.navText}>{item.name}</Text>
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
      return "calendar";
    case "Doctors":
      return "medical";
    case "Status":
      return "stats-chart";
    case "Profile":
      return "person";
    default:
      return "help-circle";
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: Platform.select({ ios: 65, android: 52 }),
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(226, 232, 240, 0.8)",
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    backdropFilter: "blur(10px)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerText: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.primaryBlue,
    marginLeft: 8,
    letterSpacing: -0.5,
  },
  med: {
    color: COLORS.primaryGreen,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  notificationButton: {
    padding: 8,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: 12,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileButton: {
    padding: 4,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#28B6F6",
  },
  profilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#28B6F6",
  },
  iconButton: {
    padding: 8,
    backgroundColor: "rgba(241, 245, 249, 0.8)",
    borderRadius: 12,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    height: 80,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === "ios" ? 15 : 0,
    position: "absolute",
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    height: "100%",
  },
  activeNavButton: {
    transform: [{ translateY: -20 }],
  },
  navText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 8,
  },
  activeButtonContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#28B6F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: "#28B6F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  inactiveButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  activeNavText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
    marginTop: 8,
  },
});
