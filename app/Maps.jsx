import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Platform, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWRyaWFuNTUxNyIsImEiOiJjbWIweTc2M28wdnNtMmpwN201eXgzcWhjIn0.6LUIpjg8cwe6gYGLYJ31wA';
const MAPBOX_STYLE = 'light-v11';
const CLINICS_API = 'https://nagamedserver.onrender.com/api/clinic/';

const NAGA_CITY = {
  latitude: 13.6218,
  longitude: 123.1947,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const Maps = () => {
  const [location, setLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mapRef = useRef(null);

  const fetchClinics = async () => {
    setLoadingClinics(true);
    try {
      const response = await fetch(CLINICS_API);
      const data = await response.json();
      console.log('Clinics fetched:', data);
      if (Array.isArray(data)) {
        setClinics(data);
      } else {
        console.log('Invalid data format:', data);
        setClinics([]);
      }
    } catch (error) {
      console.log('Error fetching clinics:', error);
      setClinics([]);
    }
    setLoadingClinics(false);
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchClinics();
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      setIsLocationPermissionGranted(status === 'granted');
      if (status !== 'granted') {
        setShowPermissionModal(true);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    })();
  }, []);

  useEffect(() => {
    // Fetch directions from user to selected clinic
    const fetchDirections = async () => {
      if (selectedClinic && location && selectedClinic.location && typeof selectedClinic.location.latitude === 'number' && typeof selectedClinic.location.longitude === 'number') {
        setLoadingRoute(true);
        try {
          const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${location.longitude},${location.latitude};${selectedClinic.location.longitude},${selectedClinic.location.latitude}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
          const response = await fetch(url);
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(([lon, lat]) => ({ latitude: lat, longitude: lon }));
            setRouteCoords(coords);
            setDistance(route.distance / 1000); // meters to km
            setDuration(route.duration / 60); // seconds to minutes
            mapRef.current?.fitToCoordinates(coords, { edgePadding: { top: 100, right: 50, bottom: 100, left: 50 }, animated: true });
          }
        } catch (err) {
          setRouteCoords([]);
          setDistance(null);
          setDuration(null);
        }
        setLoadingRoute(false);
      } else {
        setRouteCoords([]);
        setDistance(null);
        setDuration(null);
      }
    };
    fetchDirections();
  }, [selectedClinic, location]);

  const handlePermissionRequest = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    setIsLocationPermissionGranted(status === 'granted');
    setShowPermissionModal(false);
    if (status === 'granted') {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={NAGA_CITY}
        showsUserLocation={true}
        showsMyLocationButton={true}
        provider={PROVIDER_DEFAULT}
      >
        <UrlTile
          urlTemplate={`https://api.mapbox.com/styles/v1/mapbox/${MAPBOX_STYLE}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`}
          maximumZ={18}
          minimumZ={5}
          flipY={false}
          tileSize={512}
        />
        {location && (
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="#28B6F6"
          />
        )}
        {clinics && clinics.length > 0 && clinics.map((clinic, idx) => (
          clinic?.location?.latitude && clinic?.location?.longitude && (
            <Marker
              key={clinic._id || idx}
              coordinate={{
                latitude: clinic.location.latitude,
                longitude: clinic.location.longitude
              }}
              title={clinic.clinic_name}
              description={clinic.location.address}
              pinColor="#82C45C"
              onPress={() => setSelectedClinic(clinic)}
            />
          )
        ))}
        {routeCoords.length > 0 && (
          <Polyline coordinates={routeCoords} strokeWidth={4} strokeColor="#28B6F6" />
        )}
      </MapView>

      {/* Refresh Button */}
      <TouchableOpacity 
        style={styles.refreshButton} 
        onPress={handleRefresh}
        disabled={isRefreshing}
      >
        <Ionicons 
          name="refresh" 
          size={24} 
          color="#fff" 
          style={[styles.refreshIcon, isRefreshing && styles.rotating]} 
        />
      </TouchableOpacity>

      {(loadingClinics || isRefreshing) && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#28B6F6" />
        </View>
      )}
      
      {loadingRoute && (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#28B6F6" />
        </View>
      )}

      {distance && duration && selectedClinic && (
        <BlurView intensity={50} tint="light" style={styles.infoBox}>
          <Text style={styles.infoText}>
            Distance to {selectedClinic.clinic_name}: {distance.toFixed(2)} km | ETA: {duration.toFixed(1)} mins
          </Text>
          <Text style={styles.infoTextSmall}>{selectedClinic.location.address}</Text>
        </BlurView>
      )}

      <Modal
        visible={showPermissionModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="location-outline" size={48} color="#28B6F6" />
            <Text style={styles.modalTitle}>Location Permission Required</Text>
            <Text style={styles.modalText}>
              We need your location to show you nearby clinics and provide better service.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePermissionRequest}
            >
              <Text style={styles.modalButtonText}>Grant Permission</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  infoBox: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    width: '92%',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  infoText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  infoTextSmall: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    textAlign: 'center',
  },
  loadingBox: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '85%',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#22577A',
    marginTop: 18,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#28B6F6',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 16,
    elevation: 3,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#28B6F6',
    borderRadius: 30,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshIcon: {
    opacity: 0.9,
  },
  rotating: {
    opacity: 0.7,
  },
});

export default Maps; 