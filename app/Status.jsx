import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Status() {
  const router = useRouter();

  return (
    <View style={styles.container}>
     
      <Text style={styles.info}>Check the status of your appointments.</Text>

      <View style={styles.card}>
        <Text style={styles.cardText}>Dr. John Doe - Cardiologist</Text>
        <Text style={styles.cardSubText}>Status: Confirmed</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>Dr. Jane Smith - Neurologist</Text>
        <Text style={styles.cardSubText}>Status: Pending</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9f9f9" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  info: { fontSize: 16, color: "#666", marginBottom: 20 },
  card: { backgroundColor: "#fff", padding: 15, marginVertical: 10, borderRadius: 8, width: "90%", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  cardText: { fontSize: 18, fontWeight: "bold" },
  cardSubText: { fontSize: 14, color: "#666" },
  NavBar: { flexDirection: "row", justifyContent: "space-around", position: "absolute", bottom: 0, width: "100%", backgroundColor: "#fff", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#ccc" },
  navButton: { paddingVertical: 10, paddingHorizontal: 15 },
  navText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  naga: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007bff',
  },
  med: {
    fontSize: 28,
    fontWeight: '700',
    color: '#28a745',
  },
});
