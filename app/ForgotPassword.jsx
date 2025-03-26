import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, Stack } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // API Call for Password Reset
  const handlePasswordReset = async () => {
    setErrorMessage(""); // Clear previous errors
    setSuccessMessage(""); // Clear previous success messages
    console.log("Sending password reset code to:", email);

    try {
      const response = await fetch("https://your-api.com/forgot-password", { // 🔹 Replace with actual API endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }), // 🔹 Send email to backend
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Password reset email sent:", data);
        setSuccessMessage("A reset code has been sent to your email.");
        
        // Wait briefly before navigating
        setTimeout(() => {
          router.push("/SendCode"); // 🔹 Navigate to OTP verification screen
        }, 1500);
      } else {
        setErrorMessage(data.message || "Failed to send reset code.");
      }
    } catch (error) {
      console.error("Error sending password reset request:", error);
      setErrorMessage("Network error. Please try again.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.innerContainer}>
          {/* Title */}
          <Text style={styles.title}>
            <Text style={styles.blueText}>Forgot password?</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Don’t worry! It happens. Please enter the email associated with your account.
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Error Message */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Success Message */}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          {/* Send Code Button */}
          <TouchableOpacity style={styles.sendCodeButton} onPress={handlePasswordReset}>
            <Text style={styles.buttonText}>Send code</Text>
          </TouchableOpacity>

          {/* Remember Password / Log in */}
          <TouchableOpacity onPress={() => router.push("/Signin")} style={styles.loginRedirect}>
            <Text style={styles.rememberText}>
              Remember password? <Text style={styles.loginText}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  innerContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  blueText: {
    color: "#007bff",
  },
  subtitle: {
    fontSize: 14,
    color: "#6C6C6C",
    marginVertical: 10,
  },
  inputContainer: {
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E1E1E",
    marginBottom: 5,
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
  sendCodeButton: {
    backgroundColor: "#28B6F6",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginRedirect: {
    marginTop: 20,
    alignSelf: "center",
  },
  rememberText: {
    fontSize: 14,
    color: "#6C6C6C",
  },
  loginText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
  successText: {
    color: "green",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },
});
