import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ placeholder, onChangeText, value }) => {
  return (
    <View style={styles.searchBar}>
      
      <TextInput
        placeholder={placeholder}
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        accessibilityLabel="Search input field"
      />
      <Ionicons name="search" size={20} color="#777" style={styles.icon} />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderColor: "#000000",
    borderWidth: 0.5,
    padding: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  input: {
    flex: 1,
  },
  icon: {
    marginRight: 10,
  },
});

export default SearchBar;