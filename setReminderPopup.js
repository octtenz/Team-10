import React, { useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

/**
 * Set Reminder Screen handles setting notification for the task
 * @param {*} param0 Object containing parameters
 * @returns React element representing the modal window for setting notification
 */
const SetReminderScreen = ({title}) => {
  // State variables
  const [modalVisible, setModalVisible] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(false);

  // Check notification permissions when the component mounts
  useEffect(() => {
    checkNotificationPermission();
  }, []);

  // Check and set notification permissions
  const checkNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    const status = settings.granted;
    setNotificationPermission(status);
  };

  // Request and set notification permissions
  const requestNotificationPermission = async () => {
    const { granted } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(granted);
  };

  // Add notification for the task
  const addReminder = async () => {
    try {
      // Check if the title is provided
      if (!title) {
        Alert.alert('Title field is required');
        return;
      }

      // Request notification permission if not granted
      if (!notificationPermission) {
        await requestNotificationPermission();
        if (!notificationPermission) {
          Alert.alert('Notification Permission Required');
          return;
        }
      }
  
      // Check if all input fields are filled
      if (day && month && year && hour && minute) {
        const notificationDate = new Date(year, month - 1, day, hour, minute);
        // Set notification if the notification date is in the future
        if (notificationDate > Date.now()) {
          console.log('Notification added:', day, month, year, hour, minute);
          await scheduleNotification(notificationDate);
          setModalVisible(false);
        } else {
          Alert.alert('Invalid Date/Time', 'Please select a future date and time.');
        }
      } else {
        Alert.alert('Incomplete Date/Time', 'Please fill in all fields to set notification.');
      }
    } catch (error) {
      console.error('Error setting notification:', error.message);
      Alert.alert('Error', 'Failed to set notification. Please try again later.');
    }
  };  

  /**
   * Schedule notification for the task
   * @param {*} notificationDate The date and time for the notification
   */
  const scheduleNotification = async (notificationDate) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Notification',
        body: `Do not forget about your task: ${title}!`,
      },
      trigger: { date: notificationDate },
    });
  };

  return (
    // Container for the button to add notifications
    <View style={styles.container}>
       {/* Button to add notifications */}
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <FontAwesome name="bell" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal for setting notifications */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Set Notification</Text>
            {/* Container for the date of the notification */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date (DD/MM/YYYY):</Text>
              <View style={styles.inputRow}>
                {/* Input field for the day of the notification date */}
                <TextInput
                  style={styles.input}
                  placeholder="DD"
                  value={day}
                  onChangeText={setDay}
                  keyboardType="numeric"
                  maxLength={2}
                />
                {/* Input field for the month of the notification date */}
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="numeric"
                  maxLength={2}
                />
                {/* Input field for the year of the notification date */}
                <TextInput
                  style={styles.input}
                  placeholder="YYYY"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
              </View>
            </View>

            {/* Container for the time of the notification */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Time (HH/MM):</Text>
              <View style={styles.inputRow}>
                {/* Input field for the hour of the notification time */}
                <TextInput
                  style={styles.input}
                  placeholder="HH"
                  value={hour}
                  onChangeText={setHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
                {/* Input field for the minute of the notification time */}
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  value={minute}
                  onChangeText={setMinute}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            {/* Button to set the notification */}
            <TouchableOpacity onPress={addReminder}>
              <FontAwesome name="bell" size={24} color="black" />
            </TouchableOpacity>

            {/* Button to close the modal */}
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles for the set reminder screen
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  button: {    
    alignItems: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
    width: 50,
  },
  centeredView: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  input: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    marginRight: 10,
    padding: 10,
    width: 60, 
  },
  closeButton: {
    color: 'blue',
    marginTop: 20,
  },
});

export default SetReminderScreen;