import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window"); // Get the window width

const DoctorCard = ({ name, specialization, contact, location, availability, image }) => {
  const navigation = useNavigation(); // Move useNavigation inside the component

  return (
    <View style={styles.doctorCard}>
      <View style={styles.cardHeader}>
        <Image source={image} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{name}</Text>
          <Text style={styles.doctorSpecialization}>{specialization}</Text>
          <Text style={styles.doctorDetails}>
            Contact no: {contact}{"\n"}Location: {location}
          </Text>
        </View>
      </View>
      <Text style={styles.headerLogo}>
        <Text style={styles.nagaText}>Naga</Text>
        <Text style={styles.medText}> Med</Text>
      </Text>
      <View style={styles.availabilityWrapper}>
        <Text style={styles.availabilityText}>Availability status:</Text>
        <Text style={styles.availability}>{availability}</Text>
      </View>
      <Pressable
        style={styles.bookNowButton}
        onPress={() => navigation.navigate("CreateAppointment")} // Navigate to CreateAppointment
      >
        <Text style={styles.bookNowText}>Book now</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  doctorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 8,
    position: "relative",
    marginRight: 16,
    marginLeft: 16,
    paddingBottom: 16,
    overflow: "hidden", // Ensures the rounded corners apply to child elements
    width: width * 0.8, // Adjust width to 90% of the window size
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    padding: 15, // Add padding to the header
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E0E0E0",
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  doctorSpecialization: {
    fontSize: 14,
    color: "#757575",
    marginBottom: 8,
    fontFamily: "Poppins",
  },
  doctorDetails: {
    fontSize: 12,
    color: "#9E9E9E",
    fontFamily: "Poppins",
  },
  headerLogo: {
    position: "absolute",
    top: 3,
    right: 6,
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  nagaText: {
    color: "#0072CE",
  },
  medText: {
    color: "#4CAF50",
  },
  availabilityWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#28B6F6",
    padding: 8,
    width: "100%", // Make it span the full width of the card
  },
  availabilityText: {
    fontSize: 12,
    fontFamily: "Poppins",
    color: "#FFFFFF",
  },
  availability: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  bookNowButton: {
    backgroundColor: "#82C45C",
    paddingVertical: 4,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    alignSelf: "center",
    marginTop: 8,
  },
  bookNowText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
});

export default DoctorCard;