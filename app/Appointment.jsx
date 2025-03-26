import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const NagaMed = () => {

  const navigation = useNavigation();

  const shadowStyle = {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#F9FAFB', padding: 20 }}>

      {/* Profile Section */}
      <View style={{ alignItems: 'center', marginVertical: 5 }}>
        <Image source={require('../assets/images/bookappointments.png')} 
          style={{ width: 80, height: 80, borderRadius: 40 }} />
        <Text style={{ fontSize: 18, marginTop: 10 }}>
          Hello, <Text style={{ color: '#22577A', fontWeight: 'bold' }}>Aling Puring</Text>
        </Text>
        <Text style={{ color: '#777' }}>📍 San Felipe, Naga City</Text>
      </View>

      {/* Search Bar */}
      <View style={{ flexDirection: 'row', backgroundColor: '#fff', borderRadius: 30, borderColor:'#000000' ,borderWidth: 0.5,padding: 10, alignItems: 'center' }}>
        <Ionicons name="search" size={20} color="#777" style={{ marginRight: 10 }} />
        <TextInput 
          placeholder="Search Doctor, Health issues"
          style={{ flex: 1 }}
          accessibilityLabel="Search input field"
        />
      </View>

      {/* Options */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 }}>
        
        {/* Online Consultation */}
        <View style={{ backgroundColor: '#D6EEF9', padding: 20, borderRadius: 15, flex: 1, marginRight: 10, ...shadowStyle }}>
          <Text style={{ fontWeight: 'bold' }}>Online Consultation</Text>
          <TouchableOpacity style={{ marginTop: 10, backgroundColor: '#fff', padding: 10, borderRadius: 20 }}>
            <Text style={{flexDirection:'row' , alignItems:'center' , textAlign:'center'}}>Find doctor</Text>
          </TouchableOpacity>
        </View>

        {/* Nearby Clinics */}
        <View style={{ backgroundColor: '#C0F6A1', padding: 20, borderRadius: 15, flex: 1, ...shadowStyle }}>
          <Text style={{ fontWeight: 'bold' }}>Nearby Clinics in Naga City</Text>
          <TouchableOpacity style={{ marginTop: 10, backgroundColor: '#fff', padding: 10, borderRadius: 20 }}>
            <Text style={{flexDirection:'row' , alignItems:'center' , textAlign:'center'}}>Find Clinics</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointments */}
      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Upcoming Appointment</Text>
      <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 20, marginTop: 10, ...shadowStyle }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image source={require('../assets/images/bookappointments.png')} 
            style={{ width: 60, height: 60, borderRadius: 30, marginRight: 15 }} />
          <View>
            <Text style={{ fontWeight: 'bold' }}>Dr. Mario Aquino</Text>
            <Text>Heart Specialist</Text>
          </View>
        </View>
        <Text style={{ marginVertical: 10, color: '#57CC99', textAlign:'right', fontWeight:'bold' }}>Confirmed</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>📅 Monday, Jan 4, 2025</Text>
          <Text>⏰ 09:00 AM</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 }}>
          <TouchableOpacity style={{ backgroundColor: '#57CC99', padding: 10, borderRadius: 20 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Reschedule</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ backgroundColor: '#E63946', padding: 10, borderRadius: 20 }}>
            <Text style={{ color: '#fff', textAlign: 'center' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Create New */}
      <TouchableOpacity onPress={()=> navigation.navigate('CreateAppointment')} style={{ backgroundColor: '#82C45C', padding: 20, borderRadius: 13, marginTop: 20, alignItems: 'center', ...shadowStyle }}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }} >Create New  +</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default NagaMed;
