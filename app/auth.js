import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const checkAuth = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    
    if (!token || !userId) {
      console.log('No token or userId found');
      return false;
    }

    // Verify token by fetching user data
    const response = await axios.get(
      `https://nagamedserver.onrender.com/api/user/${userId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200 && response.data) {
      console.log('Auth check successful');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Auth check failed:', error.message);
    // Only clear auth data if it's an authentication error
    if (error.response?.status === 401 || error.response?.status === 403) {
      await AsyncStorage.multiRemove(['token', 'userId', 'fullName', 'userEmail', 'profilePicture']);
    }
    return false;
  }
};

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'token',
      'userId',
      'fullName',
      'userEmail',
      'profilePicture'
    ]);
  } catch (error) {
    console.error('Error during logout:', error);
  }
}; 