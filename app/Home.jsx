import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import * as Linking from "expo-linking";

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
  const links = [
    {
      title: "5 Tips for a Healthy Lifestyle",
      url: "https://healthmatters.nyp.org/habits-for-a-healthy-new-year/",
      image: require("../assets/images/adaptive-icon.png"),
    },
    {
      title: "The Importance of Regular Checkups",
      url: "https://mypvhc.com/importance-regular-check-ups/",
      image: require("../assets/images/adaptive-icon.png"),
    },
    {
      title: "How to Manage Stress Effectively",
      url: "https://example.com/manage-stress",
      image: require("../assets/images/adaptive-icon.png"),
    },
  ];

  return (
    <ScrollView style={styles.container}>
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} pagingEnabled contentContainerStyle={styles.scrollViewContent}>
        {links.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => Linking.openURL(item.url)} style={styles.linkbox}>
            <Image source={item.image} style={styles.linkboxImage} />
            <View style={styles.linkboxTextWrapper}>
              <Text style={styles.linkboxTitle}>{item.title}</Text>
              <Text style={styles.linkboxSource}>Read More →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 15,
    paddingBottom: "50%",
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
    paddingRight: 25,
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
  scrollViewContent: { paddingHorizontal: 5, gap: 15, paddingBottom: 150, paddingTop: 20 },
  linkbox: {
    paddingBottom: 10,
    width: 220,
    backgroundColor: "#FFF",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  linkboxImage: { width: "100%", height: 120, resizeMode: "cover" },
  linkboxTextWrapper: { padding: 10 },
  linkboxTitle: { fontSize: 16, fontWeight: "700", color: "#2C3E50" },
  linkboxSource: { fontSize: 14, color: "#007BFF", marginTop: 5 },
});
