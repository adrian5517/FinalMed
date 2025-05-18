import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useRouter, Stack } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";

export default function CreateAccount() {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSignUp = async () => {
    console.log("Fullname:", fullname);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Confirm Password:", confirmPassword);

    if (!fullname.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMessage("All fields are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Invalid email format.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setErrorMessage("");
    setLoading(true);

    try {
      const response = await fetch("https://nagamedserver.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname: fullname.trim(), email: email.trim(), password, type_id: 4 }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Account created successfully:", data);
        router.push("/Signin");
      } else {
        setErrorMessage(data.message || "Failed to create account. Please try again.");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      setErrorMessage("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
        <View style={styles.formContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.naga}>Naga</Text>
            <Text style={styles.med}> Med</Text>
          </View>

          <Text style={styles.sign}>Sign up</Text>

          {[
            { label: 'Full Name', value: fullname, setValue: setFullName, placeholder: 'Enter your full name', isPassword: false },
            { label: 'Email', value: email, setValue: setEmail, placeholder: 'Enter your email', isPassword: false },
            { label: 'Create a password', value: password, setValue: setPassword, placeholder: '**********', isPassword: true },
            { label: 'Confirm password', value: confirmPassword, setValue: setConfirmPassword, placeholder: '**********', isPassword: true }
          ].map((field, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.label}>{field.label}</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  value={field.value}
                  onChangeText={field.setValue}
                  autoCapitalize={field.isPassword ? "none" : "words"}
                  keyboardType={field.label === "Email" ? "email-address" : "default"}
                  secureTextEntry={field.isPassword && (field.label === 'Create a password' ? !passwordVisible : !confirmPasswordVisible)}
                />
                {field.isPassword && (
                  <TouchableOpacity
                    onPress={() => field.label === 'Create a password' ? setPasswordVisible(!passwordVisible) : setConfirmPasswordVisible(!confirmPasswordVisible)}
                  >
                    <FontAwesome
                      name={(field.label === 'Create a password' ? passwordVisible : confirmPasswordVisible) ? "eye-slash" : "eye"}
                      size={20}
                      color="#777"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.signInRedirect} onPress={() => router.push("/Signin")}>
            <Text>
              Already have an account? <Text style={styles.loginText}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  naga: {
    fontSize: 28,
    fontWeight: "700",
    color: "#007bff",
  },
  med: {
    fontSize: 28,
    fontWeight: "700",
    color: "#28a745",
  },
  sign: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1170B3",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
    fontWeight: "bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#000",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  signUpButton: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInRedirect: {
    marginTop: 12,
    alignItems: "center",
  },
  loginText: {
    color: "#007bff",
    fontWeight: "bold",
  },
});