import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";
import axios from "axios";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [_id,setUserId] = useState("");
  const router = useRouter();


  const fetchUserId = async () => {
  const id = await AsyncStorage.getItem("userId");
  if (id) {
    console.log("User ID:", id);
  } else {
    console.warn("User ID not found.");
  }
};
  const handleSignIn = async () => {
    console.log("Signing in with:", email, password);
    setLoading(true);
  
    try {
      const response = await axios.post("https://nagamedserver.onrender.com/api/auth/signin", {
        email,
        password
      });
  
      const data = response.data;
  
      if (response.status === 200) {
        console.log("Login Successful:", data);
        setErrorMessage(""); // Clear any previous error messages
  
        // Store the token and user full name in AsyncStorage
        if (data.token) {
          await AsyncStorage.setItem("authToken", data.token);
        }
        if (data.user?.fullname) {
          await AsyncStorage.setItem("fullName", data.user.fullname);
        }
        if (data.user?._id) {  // Adjust based on your backend field name
          await AsyncStorage.setItem("userId", data.user._id);
          console.log("User ID saved:", data.user._id);
        } else {
          console.warn("User ID missing in response");
        }

  
        // Navigate to the Home screen (adjust navigation for React Navigation or Next.js)
        router.push("/Home");  // For Next.js (if you're using it), this works fine
        
        // For React Native (with React Navigation), replace the above line with:
        // navigation.navigate('Home');
      } else {
        setErrorMessage(data.message || "Invalid email or password.");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.naga}>Naga</Text>
            <Text style={styles.med}>Med</Text>
          </View>

          <Text style={styles.sign}>Sign In</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInButton} onPress={handleSignIn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    gap: 16,
    marginTop: -30,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  naga: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#1170B3",
  },
  med: {
    fontSize: 50,
    fontWeight: "bold",
    color: "#82C45C",
  },
  sign: {
    fontSize: 24,
    fontWeight: "bold",
    paddingLeft: 5,
    color: "#1170B3",
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#F5F5F5",
  },
  signInButton: {
    backgroundColor: "#28B6F6",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#28B6F6",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
