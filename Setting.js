import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const SettingScreen = ({ navigation, route}) => {
  const handleChangePassword = () => {
    navigation.navigate('Reset Password', route.params);
  };

  const handleReviewAnalysisReport = () => {
    console.log('Navigating to review analysis report screen');
  };

  const email = route.params.email;
  const password = route.params.password;

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
