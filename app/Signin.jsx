import React, { useState, useEffect } from "react";
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
import COLORS from "../constant/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, Stack } from "expo-router";
import { FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import { checkAuth } from './auth';

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [_id, setUserId] = useState("");
  const router = useRouter();
  
  const [passwordVisible, setPasswordVisible] = useState(false);

  const fetchUserId = async () => {
    const id = await AsyncStorage.getItem("userId");
    if (id) {
      console.log("User ID:", id);
    } else {
      console.warn("User ID not found.");
    }
  };

  useEffect(() => {
    const checkExistingAuth = async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        router.push("/Home");
      }
    };
    
    checkExistingAuth();
  }, []);

  const handleSignIn = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    setLoading(true);
    setErrorMessage("");
  
    try {
      console.log("Attempting login with:", { email: email.trim().toLowerCase() });
      
      const response = await axios.post(
        "https://nagamedserver.onrender.com/api/auth/signin",
        {
          email: email.trim().toLowerCase(),
          password: password.trim()
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
  
      console.log("Login response:", response.data);
      const data = response.data;
  
      if (response.status === 200 && data.user) {
        console.log("Login Successful:", data);
  
        try {
          // Store all user data at once
          await AsyncStorage.multiSet([
            ["userId", data.user._id],
            ["fullName", data.user.fullname],
            ["userEmail", data.user.email],
            ["profilePicture", data.user.profilePicture || ""]
          ]);
          
          // Get token from cookie
          const cookies = response.headers['set-cookie'];
          if (cookies) {
            const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
            if (tokenCookie) {
              const token = tokenCookie.split(';')[0].split('=')[1];
              await AsyncStorage.setItem("token", token);
              console.log("Token stored from cookie");
            }
          }
  
          // Clear form fields
          setEmail("");
          setPassword("");
          
          // Navigate to Home
          router.push("/Home");
        } catch (storageError) {
          console.error("Error storing auth data:", storageError);
          setErrorMessage("Error saving login information. Please try again.");
        }
      } else {
        console.log("Login failed - Invalid response:", data);
        setErrorMessage("Invalid email or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        
        if (error.response.status === 401) {
          setErrorMessage("Invalid email or password");
        } else if (error.response.status === 400) {
          setErrorMessage(error.response.data.message || "Please check your credentials");
        } else if (error.response.status === 500) {
          setErrorMessage("Server error. Please try again later.");
        } else {
          setErrorMessage(error.response.data.message || "An error occurred during sign in");
        }
      } else if (error.request) {
        console.log("No response received:", error.request);
        setErrorMessage("No response from server. Please check your internet connection.");
      } else {
        console.log("Error setting up request:", error.message);
        setErrorMessage("An unexpected error occurred. Please try again.");
      }
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

          <View style={styles.welcomeMessage}>
            <Text style={styles.sign}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Please sign in to continue</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                placeholderTextColor="#A0A0A0"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  autoCapitalize="none"
                  placeholderTextColor="#A0A0A0"
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <FontAwesome
                    name={passwordVisible ? "eye" : "eye-slash"}
                    size={17}
                    color="#777"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/ForgotPassword")}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.signInButton} 
            onPress={handleSignIn} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/CreateAccount")}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.socialIcons}>
            <Text style={styles.socialText}>Other sign in options</Text>
            <View style={styles.socialList}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={28} color="#1877F3" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="google" size={28} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome5 name="apple" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 20,
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position:'relative',
    top:'-10%',
  },
  welcomeMessage:{
    position:'relative',
    top:'-40'
  },
  naga: {
    fontSize: 48,
    fontWeight: 800,
    color: COLORS.primaryBlue,
  },
  med: {
    fontSize: 48,
    fontWeight: 800,
    color: COLORS.primaryGreen,
  },
  sign: {
    fontSize: 28,
    fontWeight: "bold",
    top:-10,
    color: "#1170B3",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: -12,
  },
  inputContainer: {
    gap: 20,
    marginTop: 12,
    position:'relative',
    top:'-50'
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#333",
  },
  signInButton: {
    backgroundColor: "#28B6F6",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#28B6F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    position:'relative',
    top:'-45'
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    color: "#28B6F6",
    fontSize: 14,
    fontWeight: "500",
    position:'relative',
    top:'-50'
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    gap: 8,
    position:'relative',
    top:'-60'
  },
  signupText: {
    fontSize: 14,
    color: "#666",
  },
  signupLink: {
    fontSize: 14,
    color: "#28B6F6",
    fontWeight: "600",
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  inputWithIcon: {
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 40,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
    color: "#333",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 1,
  },
  socialList: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    marginTop: 10,
  },
  socialButton: {
    backgroundColor: COLORS.primaryWhite,
    borderRadius: 50,
    borderWidth:0.5,
    borderColor:'#D8DADC',
    width:50,
    padding: 12,
    marginHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  socialText: {
    textAlign: "center",
    color: "#888",
    fontSize: 14,
    marginBottom: 4,
  },
});