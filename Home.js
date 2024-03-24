import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const HomeScreen = ({ navigation, route }) => {
  const goToCreation = () => {
    navigation.navigate('Creation', route.params);
  };

    const goToSettings = () => {
    navigation.navigate('Settings', route.params);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      {/* Your home screen content here */}
      <TouchableOpacity onPress={goToSettings} style={[styles.settingButton, styles.button]}>
        <FontAwesome name="cog" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCreation} style={[styles.creationButton, styles.button]}>
        <Text style={styles.buttonText}>Create Task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    position: 'absolute',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButton: {
    top: 20,
    right: 20,
    backgroundColor: '#ddd',
  },
  creationButton: {
    bottom: 20,
    right: 20,
    backgroundColor: '#007BFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HomeScreen;
