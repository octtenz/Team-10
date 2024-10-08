import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, ResetPasswordScreen, SettingScreen } from './Account';
import HomeScreen from './Home';
import TaskDetailScreen from './TaskDetail';
import ActivityHistoryScreen from './ActivityHistory';
import AnalysisScreen from './Analysis';

// Create a stack navigator for managing navigation between screens
const Stack = createStackNavigator();

// Main component for the application
export default function App() {
  return (
    // Render navigation container with stack navigator
    <NavigationContainer>
      {/* Define the initial route for the stack navigator */}
      <Stack.Navigator initialRouteName="Login">
        {/* Define screens with their respective components */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Reset Password" component={ResetPasswordScreen} />
        <Stack.Screen name="Settings" component={SettingScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Task Detail" component={TaskDetailScreen} />
        <Stack.Screen name="Activity History" component={ActivityHistoryScreen} />
        <Stack.Screen name="Analysis" component={AnalysisScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}