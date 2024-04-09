import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, ResetPasswordScreen } from './LoginAndResetPassword';
import HomeScreen from './Home';
import CreationScreen from './Creation';
import SettingScreen from './Setting';
import ActivityHistoryScreen from './ActivityHistory';
import AnalysisScreen from './Analysis';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Reset Password" component={ResetPasswordScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Creation" component={CreationScreen} />
        <Stack.Screen name="Settings" component={SettingScreen} />
        <Stack.Screen name="Activity History" component={ActivityHistoryScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}