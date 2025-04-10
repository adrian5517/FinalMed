import React, { useState } from "react";
import { ScrollView, Text, StyleSheet } from "react-native";
import DoctorCard from "../components/DoctorCard";
import SearchBar from "../components/SearchBar";

export default function DoctorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const doctors = [
    {
      name: "Dr. Jeff Pilapil",
      specialization: "Neurologist",
      contact: "09209272232",
      location: "Brgy. Dinaga, Naga City",
      availability: "Available now",
      image: require("../assets/images/adaptive-icon.png"),
    },
    {
      name: "Dr. Mario Aquino",
      specialization: "Heart Specialist",
      contact: "09209272232",
      location: "Brgy. Dinaga, Naga City",
      availability: "Available now",
      image: require("../assets/images/adaptive-icon.png"),
    },
  ];

  const filteredDoctors = doctors.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Doctor List</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalDoctorsList}
      >
        {filteredDoctors.map((doc, idx) => (
          <DoctorCard
            key={idx}
            name={doc.name}
            specialization={doc.specialization}
            contact={doc.contact}
            location={doc.location}
            availability={doc.availability}
            image={doc.image}
          />
        ))}
      </ScrollView>
      <Text style={styles.title}>Find your doctor</Text>
      <SearchBar
        placeholder="Search Doctor, Health issues"
        onChangeText={(text) => setSearchQuery(text)}
        value={searchQuery}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 1,
    paddingTop: 16,
    paddingBottom: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  horizontalDoctorsList: {
    paddingVertical: 16,
  },
});
