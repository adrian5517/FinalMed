import { Text, View, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const windowWidth = Dimensions.get('window').width;

export default function Index() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/Signin");
  };

  const handleSignUp = () => {
    router.push("/CreateAccount");
  };

  return (
    <View style={styles.background}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          Naga
          <Text style={styles.logoAccent}>Med</Text>
        </Text>
        <Text style={styles.tagline}>Your Health, Our Priority</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Ionicons name="log-in-outline" size={22} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.signUpButton]} onPress={handleSignUp}>
          <Ionicons name="person-add-outline" size={22} color="#28B6F6" style={styles.buttonIcon} />
          <Text style={styles.signUpText}>Create Account</Text>
        </TouchableOpacity>
      </View>

      {/* Optional: Add a guest button or footer */}
      {/* <TouchableOpacity style={styles.guestButton}><Text style={styles.guestText}>Continue as Guest</Text></TouchableOpacity> */}
      <Text style={styles.footer}>© 2025 NagaMed</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#1170B3",
    letterSpacing: 1,
  },
  logoAccent: {
    color: "#82C45C",
  },
  tagline: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 8,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 32,
  },
  signInButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28B6F6",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    width: "100%",
    marginBottom: 18,
    shadowColor: "#28B6F6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E6F4EA",
    height: 54,
    borderRadius: 12,
    justifyContent: "center",
    width: "100%",
    borderWidth: 2,
    borderColor: "#28B6F6",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  signUpText: {
    color: "#28B6F6",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  footer: {
    marginTop: 24,
    color: "#A0AEC0",
    fontSize: 13,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  // Optional guest button
  guestButton: {
    marginTop: 18,
    padding: 10,
  },
  guestText: {
    color: "#1170B3",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
