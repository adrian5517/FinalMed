import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { checkAuth, getAuthHeaders } from './auth';
import { Ionicons } from '@expo/vector-icons';

export default function Home() {
  const [fullname, setFullname] = useState("User");
  const [doctors, setDoctors] = useState([]);
  const [news, setNews] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorModalVisible, setDoctorModalVisible] = useState(false);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      try {
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          console.log('Not authenticated, redirecting to login');
          router.replace('/Signin');
          return;
        }

        await fetchUserData();
        await fetchAppointments();
        await fetchDoctors();
        await fetchClinics();
        await fetchHealthNews();
      } catch (error) {
        console.error('Error in checkAuthAndFetchData:', error);
        router.replace('/Signin');
      }
    };

    checkAuthAndFetchData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found.");
        return;
      }

      const headers = await getAuthHeaders();
      const response = await fetch(`https://nagamedserver.onrender.com/api/user/${userId}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data.");
      }

      const data = await response.json();
      setFullname(data.fullname || "User");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const headers = await getAuthHeaders();
      console.log("Fetching appointments for user:", userId);

      const response = await fetch(`https://nagamedserver.onrender.com/api/appointment/user/${userId}`, {
        method: 'GET',
        headers
      });
      
      console.log("Appointment response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("Appointment fetch error:", {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(`Failed to fetch appointments: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Appointments fetched successfully:", data);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error.message);
      setAppointments([]);
    }
  };

  const menuItems = [
    { 
      text: "Book Appointment", 
      icon: "calendar-outline",
      color: "#28B6F6",
      path: "/CreateAppointment" 
    },
    { 
      text: "Health Records", 
      icon: "document-text-outline",
      color: "#A7EC80",
      path: "/Status" 
    },
    { 
      text: "Consult Doctor", 
      icon: "medical-outline",
      color: "#FFB74D",
      path: "/Doctors" 
    },
  ];

  const getProfilePicture = (email) => {
    if (!email) return 'https://api.dicebear.com/7.x/avataaars/png?seed=default';
    return `https://api.dicebear.com/7.x/avataaars/png?seed=${email}`;
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("https://nagamedserver.onrender.com/api/doctorauth/");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.data)) {
        setDoctors(data.data);
      } else {
        setDoctors([]);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setDoctors([]);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await fetch("https://nagamedserver.onrender.com/api/clinic");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClinics(data);
    } catch (error) {
      console.error("Error fetching clinics:", error);
      setClinics([]);
    }
  };

  const NEWS_API_KEY = '9ddce8dc6ab6468b9af4576177c0fc64';

  const fetchHealthNews = async () => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=health&language=en&apiKey=${NEWS_API_KEY}`
      );
      const data = await response.json();
      if (data.articles) {
        setNews(data.articles.slice(0, 5)); // Get top 5 news
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    console.log('Finding doctor:', { doctorId, doctors, foundDoctor: doctor });
    return doctor ? doctor.fullname : 'Unknown Doctor';
  };

  const getClinicName = (clinicId) => {
    const clinic = clinics.find(c => c._id === clinicId);
    console.log('Finding clinic:', { clinicId, clinics, foundClinic: clinic });
    return clinic ? clinic.clinic_name : 'Unknown Clinic';
  };

  const formatAvailability = (availability) => {
    if (!availability || !Array.isArray(availability)) return 'Not available';
    return availability.map(avail => `${avail.day}: ${avail.time}`).join('\n');
  };

  const AppointmentModal = ({ appointment, visible, onClose }) => {
    if (!appointment) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Appointment Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.statusContainer, { backgroundColor: appointment.status === 'Approved' ? '#E6F4EA' : '#FFF4E5' }]}>
                <View style={[styles.statusDot, { backgroundColor: appointment.status === 'Approved' ? '#A7EC80' : '#FFB74D' }]} />
                <Text style={[styles.statusText, { color: appointment.status === 'Approved' ? '#2E7D32' : '#E65100' }]}>
                  {appointment.status}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Date & Time</Text>
                </View>
                <Text style={styles.modalValue}>{formatDateTime(appointment.appointment_date_time)}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="person-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Doctor</Text>
                </View>
                <Text style={styles.modalValue}>{getDoctorName(appointment.doctor_id)}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="business-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Clinic</Text>
                </View>
                <Text style={styles.modalValue}>{getClinicName(appointment.clinic_id)}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="document-text-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Appointment ID</Text>
                </View>
                <Text style={styles.modalValue}>{appointment.appointment_id}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="person-add-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Filled By</Text>
                </View>
                <Text style={styles.modalValue}>{appointment.filled_by}</Text>
              </View>

              {appointment.description && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="chatbubble-outline" size={20} color="#28B6F6" />
                    <Text style={styles.modalLabel}>Description</Text>
                  </View>
                  <Text style={styles.modalValue}>{appointment.description}</Text>
                </View>
              )}

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="time-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Created At</Text>
                </View>
                <Text style={styles.modalValue}>{new Date(appointment.createdAt).toLocaleString()}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const DoctorModal = ({ doctor, visible, onClose }) => {
    if (!doctor) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Doctor Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.doctorModalImageContainer}>
                <Image 
                  source={{ uri: getProfilePicture(doctor.email) }} 
                  style={styles.doctorModalImage}
                  onError={(e) => {
                    console.log("Debug - Doctor image loading error:", e.nativeEvent.error);
                    e.target.setNativeProps({
                      source: { uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }
                    });
                  }}
                />
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="person-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Name</Text>
                </View>
                <Text style={styles.modalValue}>{doctor.fullname}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="medical-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Specialization</Text>
                </View>
                <Text style={styles.modalValue}>{doctor.specialization}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="call-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Contact</Text>
                </View>
                <Text style={styles.modalValue}>{doctor.contact}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="location-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Address</Text>
                </View>
                <Text style={styles.modalValue}>{doctor.address}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="mail-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Email</Text>
                </View>
                <Text style={styles.modalValue}>{doctor.email}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="calendar-outline" size={20} color="#28B6F6" />
                  <Text style={styles.modalLabel}>Availability</Text>
                </View>
                <View style={styles.availabilityContainer}>
                  {doctor.availability && doctor.availability.map((avail, index) => (
                    <View key={avail._id} style={styles.availabilityItem}>
                      <Text style={styles.availabilityDay}>{avail.day}</Text>
                      <Text style={styles.availabilityTime}>{avail.time}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.bookAppointmentButton}
                onPress={() => {
                  onClose();
                  router.push({
                    pathname: "/CreateAppointment",
                    params: {
                      doctorId: doctor._id,
                      doctorName: doctor.fullname,
                      specialization: doctor.specialization,
                    },
                  });
                }}
              >
                <Text style={styles.bookAppointmentButtonText}>Book Appointment</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const handleDoctorScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const selectedIndex = Math.floor(contentOffset / viewSize);
    setCurrentDoctorIndex(selectedIndex);
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar style="auto" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hr} />
        <Text style={styles.pt1}>Good day, {fullname}!</Text>

        {/* Menu Icons Section */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.path} asChild>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.menuText}>{item.text}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>

        {/* Appointments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
            <TouchableOpacity onPress={() => router.push('/Status')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <TouchableOpacity 
                key={appointment._id} 
                style={styles.appointmentCard}
                onPress={() => {
                  setSelectedAppointment(appointment);
                  setModalVisible(true);
                }}
              >
                <View style={styles.appointmentHeader}>
                  <View style={styles.appointmentStatus}>
                    <View style={[
                      styles.statusDot,
                      { backgroundColor: appointment.status === 'Approved' ? '#A7EC80' : '#FFB74D' }
                    ]} />
                    <Text style={styles.statusText}>{appointment.status}</Text>
                  </View>
                  <Text style={styles.appointmentDate}>
                    {formatDateTime(appointment.appointment_date_time)}
                  </Text>
                </View>
                <View style={styles.appointmentDetails}>
                  <Text style={styles.appointmentDoctor}>
                    Doctor: {getDoctorName(appointment.doctor_id)}
                  </Text>
                  <Text style={styles.appointmentClinic}>
                    Clinic: {getClinicName(appointment.clinic_id)}
                  </Text>
                  <Text style={styles.appointmentFilledBy}>
                    Filled by: {appointment.filled_by}
                  </Text>
                </View>
                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#28B6F6" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyAppointments}>
              <Text style={styles.emptyText}>No upcoming appointments</Text>
            </View>
          )}
        </View>

        {/* Doctors Section with Slider */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Doctors</Text>
            <TouchableOpacity onPress={() => router.push('/Doctors')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.doctorsSliderContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.doctorsSlider}
              pagingEnabled
              onScroll={handleDoctorScroll}
              scrollEventThrottle={16}
            >
              {doctors.length > 0 ? (
                doctors.map((doctor) => (
                  <View key={doctor._id} style={styles.doctorCard}>
                    <View style={styles.logoContainer}>
                      <Text style={styles.logoText}>
                        Naga<Text style={styles.logoMed}>Med</Text>
                      </Text>
                    </View>
                    <View style={styles.doctorInfoContainer}>
                      <View style={styles.doctorImageContainer}>
                        <Image 
                          source={{ uri: getProfilePicture(doctor.email) }} 
                          style={styles.doctorImage}
                          onError={(e) => {
                            console.log("Debug - Doctor image loading error:", e.nativeEvent.error);
                            e.target.setNativeProps({
                              source: { uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=default' }
                            });
                          }}
                        />
                      </View>
                      <View style={styles.doctorDetails}>
                        <Text style={styles.doctorName}>{doctor.fullname}</Text>
                        <Text style={styles.doctorSpecialty}>{doctor.specialization}</Text>
                      </View>
                    </View>
                    <View style={styles.doctorInfoSection}>
                      <View style={styles.infoItem}>
                        <Ionicons name="call-outline" size={16} color="#28B6F6" />
                        <Text style={styles.infoText}>{doctor.contact}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="mail-outline" size={16} color="#28B6F6" />
                        <Text style={styles.infoText}>{doctor.email}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color="#28B6F6" />
                        <Text style={styles.infoText}>
                          {doctor.availability && doctor.availability.length > 0 
                            ? `${doctor.availability.length} days available`
                            : 'Not available'}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity 
                      style={styles.viewDetailsButton}
                      onPress={() => {
                        setSelectedDoctor(doctor);
                        setDoctorModalVisible(true);
                      }}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#28B6F6" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.noDoctorsContainer}>
                  <Text style={styles.noDoctorsText}>No doctors available at the moment.</Text>
                </View>
              )}
            </ScrollView>
            {doctors.length > 0 && (
              <View style={styles.paginationContainer}>
                {doctors.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.paginationDot,
                      index === currentDoctorIndex && styles.paginationDotActive
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Clinics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Clinics</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clinicsContainer}
          >
            {clinics.length > 0 ? (
              clinics.map((clinic) => (
                <TouchableOpacity key={clinic._id} style={styles.clinicCard}>
                  <View style={styles.clinicImageContainer}>
                    <Image 
                      source={{ uri: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80' }} 
                      style={styles.clinicImage}
                      resizeMode="cover"
                    />
                    <View style={styles.clinicGradient} />
                  </View>
                  <View style={styles.clinicContent}>
                    <Text style={styles.clinicName}>{clinic.clinic_name}</Text>
                    <View style={styles.clinicInfo}>
                      <Ionicons name="location-outline" size={16} color="#28B6F6" />
                      <Text style={styles.clinicAddress}>{clinic.address}</Text>
                    </View>
                    <View style={styles.clinicInfo}>
                      <Ionicons name="call-outline" size={16} color="#28B6F6" />
                      <Text style={styles.clinicContact}>{clinic.contact}</Text>
                    </View>
                    <TouchableOpacity style={styles.viewClinicButton}>
                      <Text style={styles.viewClinicText}>View Details</Text>
                      <Ionicons name="chevron-forward" size={16} color="#28B6F6" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No clinics available at the moment.</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Health News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health News</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.newsContainer}
          >
            {news.length > 0 ? (
              news.map((item, index) => (
                <TouchableOpacity key={index} style={styles.newsCard} activeOpacity={0.9}>
                  <View style={styles.newsImageContainer}>
                    <Image 
                      source={{ uri: item.urlToImage || 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=No+Image' }} 
                      style={styles.newsImage}
                      resizeMode="cover"
                    />
                    <View style={styles.newsGradient} />
                  </View>
                  <View style={styles.newsContent}>
                    <Text style={styles.newsSource}>
                      {item.source?.name || 'Unknown Source'}
                    </Text>
                    <Text style={styles.newsTitle} numberOfLines={3}>
                      {item.title}
                    </Text>
                    {item.description && (
                      <Text style={styles.newsDescription} numberOfLines={3}>
                        {item.description}
                      </Text>
                    )}
                    <View style={styles.newsFooter}>
                      <Text style={styles.newsDate}>
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : ''}
                      </Text>
                      <TouchableOpacity style={styles.readMoreButton}>
                        <Text style={styles.readMoreText}>Read More</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>Couldn't load health news. Please try again later.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>

      <AppointmentModal
        appointment={selectedAppointment}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <DoctorModal
        doctor={selectedDoctor}
        visible={doctorModalVisible}
        onClose={() => setDoctorModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  hr: {
    borderBottomColor: "#00000020",
    borderBottomWidth: 1,
    marginVertical: 15,
    marginHorizontal: 15,
  },
  pt1: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 15,
    marginHorizontal: 15,
    color: "#2D3748",
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 15,
    marginVertical: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },
  box: {
    width: 120,
    height: 110,
    backgroundColor: "#A7EC80",
    borderRadius: 20,
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
    width: 120,
    marginRight: 20,
  },
  boxText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    color: "#2D3748",
  },
  boxImage: {
    width: 90,
    height: 80,
    resizeMode: "contain",
  },
  header3txt: {
    fontSize: 22,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 15,
    color: "#2D3748",
  },
  cardBox: {
    flexDirection: "row",
    marginVertical: 20,
  },
  doctorListContainer: {
    paddingHorizontal: 15,
  },
  doctorCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  doctorInfoContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#28B6F6',
  },
  doctorImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 4,
  },
  doctorInfoSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4A5568',
    marginLeft: 8,
    flex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#28B6F6',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  bookButton: {
    backgroundColor: '#A7EC80',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#2D3748',
    fontSize: 16,
    fontWeight: '600',
  },
  noDoctorsContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  noDoctorsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  section: {
    padding: 18,
    marginTop: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 15,
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#2D3748',
  },
  seeAll: {
    color: '#4A90E2',
    fontWeight: '600',
    fontSize: 15,
  },
  newsContainer: {
    paddingBottom: 10,
  },
  newsCard: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  newsImageContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  newsContent: {
    padding: 18,
  },
  newsSource: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 10,
    lineHeight: 24,
  },
  newsDescription: {
    fontSize: 14,
    color: '#718096',
    marginBottom: 15,
    lineHeight: 20,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
  newsDate: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  readMoreButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  readMoreText: {
    color: '#4A90E2',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    padding: 25,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  emptyText: {
    color: '#718096',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  appointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  appointmentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3748',
  },
  appointmentDate: {
    fontSize: 14,
    color: '#718096',
  },
  appointmentDetails: {
    marginTop: 8,
  },
  appointmentDoctor: {
    fontSize: 13,
    color: '#718096',
    marginBottom: 4,
  },
  appointmentClinic: {
    fontSize: 13,
    color: '#718096',
  },
  appointmentFilledBy: {
    fontSize: 13,
    color: '#718096',
    marginTop: 4,
  },
  emptyAppointments: {
    padding: 20,
    backgroundColor: '#F8FAFF',
    borderRadius: 16,
    alignItems: 'center',
  },
  doctorsSliderContainer: {
    position: 'relative',
  },
  doctorsSlider: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 16,
    color: '#4A5568',
    marginLeft: 8,
    fontWeight: '600',
  },
  modalValue: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 28,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  doctorModalImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#28B6F6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  doctorModalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  availabilityContainer: {
    marginTop: 8,
  },
  availabilityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  availabilityDay: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  availabilityTime: {
    fontSize: 16,
    color: '#4A5568',
  },
  bookAppointmentButton: {
    backgroundColor: '#28B6F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bookAppointmentButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  viewDetailsText: {
    color: '#28B6F6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  logoContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0288D0',
  },
  logoMed: {
    color: '#82C45C',
  },
  clinicsContainer: {
    paddingBottom: 10,
  },
  clinicCard: {
    width: 300,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  clinicImageContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  clinicImage: {
    width: '100%',
    height: '100%',
  },
  clinicGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'transparent',
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
  },
  clinicContent: {
    padding: 16,
  },
  clinicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 8,
  },
  clinicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  clinicAddress: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 8,
    flex: 1,
  },
  clinicContact: {
    fontSize: 14,
    color: '#718096',
    marginLeft: 8,
  },
  viewClinicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  viewClinicText: {
    color: '#28B6F6',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});
