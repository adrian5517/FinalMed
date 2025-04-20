import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ChatList from './app/screens/ChatList';
import ChatConversation from './app/screens/ChatConversation';
import Appointment from './app/Appointment';
import CreateAppointment from './app/CreateAppointment';
import AppointmentSuccess from './app/AppointmentSuccess';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Appointment" 
          component={Appointment}
          options={{ headerShown: true }}
        />
        <Stack.Screen 
          name="CreateAppointment" 
          component={CreateAppointment}
          options={{ headerShown: true }}
        />
        <Stack.Screen 
          name="AppointmentSuccess" 
          component={AppointmentSuccess}
          options={{ headerShown: true }}
        />
        <Stack.Screen 
          name="ChatList" 
          component={ChatList}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ChatConversation" 
          component={ChatConversation}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 