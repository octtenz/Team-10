import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SettingScreen = () => {
  const handleChangePassword = () => {
    // Handle navigation to change password screen
    console.log('Navigating to change password screen');
  };

  const handleReviewAnalysisReport = () => {
    // Handle navigation to review analysis report screen
    console.log('Navigating to review analysis report screen');
  };

  // Mock email and password values (replace with actual values from Firebase)
  const email = 'example@example.com';
  const password = '**********'; // You may want to obscure the password for security reasons

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email: {email}</Text>
      <Text style={styles.label}>Password: {password}</Text>
      <TouchableOpacity
        style={styles.settingOption}
        onPress={handleChangePassword}>
        <Text style={styles.optionText}>Change Password</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.settingOption}
        onPress={handleReviewAnalysisReport}>
        <Text style={styles.optionText}>Review Analysis Report</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'left',
    justifyContent: 'center',
    marginLeft: 75,
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
    alignItems: 'left',
  },
  settingOption: {
    backgroundColor: '#e6e6e6',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
  },
});

export default SettingScreen;
