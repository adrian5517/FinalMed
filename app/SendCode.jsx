import React, { useState, useRef } from "react";
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

export default function VerifyCode() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(20);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Handle OTP Input
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if filled
    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Resend Code Countdown
  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // API Call for OTP Verification
  const handleVerify = async () => {
    const enteredOtp = otp.join(""); // Convert array to string
    console.log("Entered OTP:", enteredOtp);

    try {
      const response = await fetch("https://your-api.com/verify-otp", { // 🔹 Replace with actual API
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ otp: enteredOtp, email: "naga-med@ui.app" }), // 🔹 Send OTP & email
      });

      const data = await response.json();

      if (response.ok) {
        console.log("OTP Verified:", data);
        setErrorMessage(""); // Clear error message
        router.push("/Home"); // 🔹 Navigate to home after successful verification
      } else {
        setErrorMessage(data.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
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
            Please check your <Text style={styles.blueText}>email</Text>
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            We’ve sent a code to <Text style={styles.emailText}>naga-med@ui.app</Text>
          </Text>

          {/* OTP Input Fields */}
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={styles.otpBox}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(value) => handleChange(index, value)}
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Verify Button */}
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
            <Text style={styles.buttonText}>Verify</Text>
          </TouchableOpacity>

          {/* Resend Code Timer */}
          <Text style={styles.resendText}>
            Send code again {timer > 0 ? `00:${timer < 10 ? `0${timer}` : timer}` : ""}
          </Text>
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
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "400",
    color: "#1E1E1E",
    textAlign: "center",
  },
  blueText: {
    color: "#007bff",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#6C6C6C",
    textAlign: "center",
    marginVertical: 10,
  },
  emailText: {
    fontWeight: "bold",
    color: "#1E1E1E",
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginVertical: 20,
  },
  otpBox: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    backgroundColor: "#F5F5F5",
  },
  verifyButton: {
    backgroundColor: "#28B6F6",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  resendText: {
    marginTop: 15,
    fontSize: 14,
    color: "#6C6C6C",
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
});

