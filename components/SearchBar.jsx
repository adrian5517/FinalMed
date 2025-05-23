import React from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({ placeholder, onChangeText, value }) => {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={26} color="#28B6F6" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#A0AEC0"
        style={styles.input}
        onChangeText={onChangeText}
        value={value}
        accessibilityLabel="Search input field"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 24,
    borderColor: "#81D5FA",
    borderWidth: 2,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignItems: "center",
    marginBottom: 20,
    marginHorizontal: 16,
    shadowColor: '#81D5FA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 8,
    fontWeight: '500',
  },
  icon: {
    marginRight: 6,
  },
});

export default SearchBar;