import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  const fullname = "User"; // Replace this with actual user data

  const menuItems = [
    { text: "Book Appointment", image: require("../assets/images/bookappointments.png"), path: "/CreateAppointment" },
    { text: "Health Records", image: require("../assets/images/healthrecords.png"), path: "/Status" },
    { text: "Consult Doctor", image: require("../assets/images/consultdoctor.png"), path: "/Doctors" }
  ];

  const appointments = [
    {
      doctor: "Dr. Marlo Aquino",
      status: "Appointment confirmed on January 4 at 09:00 AM."
    },
    {
      doctor: "Dr. Marlo Aquino",
      status: "Appointment request pending for approval."
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.hr} />
      <Text style={styles.pt1}>Good day, {fullname}!</Text>
      <View style={styles.pt2}>
        {menuItems.map((item, index) => (
          <Link key={index} href={item.path} asChild>
            <TouchableOpacity style={styles.boxWrapper} activeOpacity={0.7}>
              <View style={styles.box}>
                <Image source={item.image} style={styles.boxImage} />
              </View>
              <Text style={styles.boxText}>{item.text}</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
      <View style={styles.header2}>
        <Text style={styles.header2txt}>Upcoming Appointment</Text>
        <Text style={styles.header2subtxt}>View all</Text>
      </View>
      <View style={styles.hr} />
      <View style={styles.horizontalBoxWrapper}>
        {appointments.map((appt, index) => (
          <View key={index} style={styles.horizontalBox}>
            <Text style={styles.maintext}>{appt.doctor}</Text>
            <Text style={styles.subtext}>{appt.status}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.header3txt}>Health Tips & News</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },
  hr: {
    borderBottomColor: "#00000080",
    borderBottomWidth: 1,
    marginVertical: 10,
  },
  pt1: {
    fontSize: 20,
    fontWeight: "700",
  },
  pt2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
  box: {
    width: 120,
    height: 110,
    backgroundColor: "#A7EC80",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  boxWrapper: {
    alignItems: "center",
    width: 130,
  },
  boxText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  boxImage: {
    width: 90,
    height: 80,
    resizeMode: "contain",
  },
  header2: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  header2txt: {
    fontSize: 20,
    fontWeight: "500",
  },
  header2subtxt: {
    fontSize: 12,
    color: "#0288D0",
    fontWeight: "500",
  },
  horizontalBoxWrapper: {
    gap: 10,
  },
  horizontalBox: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#00000020",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  maintext: {
    fontSize: 16,
    fontWeight: "500",
  },
  subtext: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },
  header3txt: {
    fontSize: 20,
    fontWeight: "500",
    marginTop: 15,
  },
});
