import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Text, View, ActivityIndicator } from 'react-native';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import SalonDetailScreen from './src/screens/SalonDetailScreen';
import BookingScreen from './src/screens/BookingScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#7C3AED',
  secondary: '#EC4899',
  dark: '#111827',
  text: '#1F2937',
  muted: '#6B7280',
  bg: '#F8F7FC',
  white: '#FFFFFF',
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const TabIcon = ({ name, focused, color }) => {
  const icons = {
    Home: '🏠',
    Search: '🔍',
    Bookings: '📅',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || 'x'}
    </Text>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.muted,
      tabBarStyle: {
        backgroundColor: COLORS.white,
        borderTopColor: '#E5E7EB',
        paddingBottom: 8,
        paddingTop: 8,
        height: 65,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Bookings" component={BookingsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MainTabs} />
    <Stack.Screen name="SalonDetail" component={SalonDetailScreen} />
    <Stack.Screen name="Booking" component={BookingScreen} />
    <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
  </Stack.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return user ? <MainStack /> : <AuthStack />;
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
