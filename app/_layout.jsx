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
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;

export default function Layout() {
  const router = useRouter();
  const segments = useSegments();

  const hideNavBar =
    segments.length === 0 ||
    segments[0] === "Signin" ||
    segments[0] === "CreateAccount" ||
    segments[0] === "ForgotPassword" || segments[0] === "ChatList" || segments[0] === "ChatConversation";

  const isHome = segments.length === 0 || segments[0] === "Home";

  return (
    <SafeAreaView style={styles.container}>
      {!hideNavBar && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => (isHome ? console.log("Open Notifications") : router.back())}
          >
            <Ionicons
              name={isHome ? "notifications-outline" : "arrow-back"}
              size={30}
              color={isHome ? "blue" : "black"}
            />
          </TouchableOpacity>
          <Text style={styles.headerText}>
            Naga <Text style={styles.med}>Med</Text>
          </Text>
          <View style={styles.iconPlaceholder} />
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={hideNavBar ? 0 : 80} // adjust this if needed
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
              <TouchableOpacity key={index} style={styles.navButton} onPress={() => router.push(`/${item}`)}>
                {isActive ? (
                  <View style={styles.activeButtonContainer}>
                    <FontAwesome5 name={getIconName(item)} size={20} color="#fff" />
                    <Text style={styles.activeNavText}>{item}</Text>
                  </View>
                ) : (
                  <>
                    <FontAwesome5 name={getIconName(item)} size={20} color="#333" />
                    <Text style={styles.navText}>{item}</Text>
                  </>
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
    paddingHorizontal: 25,
  },
  headerText: {
    fontSize: 30,
    fontWeight: "800",
    color: "#007bff",
  },
  med: {
    fontSize: 30,
    fontWeight: "800",
    color: "#82C45C",
  },
  iconButton: {
    padding: 10,
  },
  iconPlaceholder: {
    width: 40,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    width: "100%",
    height: 80,
    backgroundColor: "#82C45C",
    paddingBottom: 23,
    position: "absolute",
    bottom: 0,
  },
  navButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  activeButtonContainer: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#0288D0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
    borderWidth: 5,
    borderColor: "#f5f5f5",
  },
  activeNavText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
});
