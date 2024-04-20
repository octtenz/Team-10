import React, { useState, useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const SetReminderScreen = ({title}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [notificationPermission, setNotificationPermission] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    const settings = await Notifications.getPermissionsAsync();
    const status = settings.granted;
    setNotificationPermission(status);
  };

  const requestNotificationPermission = async () => {
    const { granted } = await Notifications.requestPermissionsAsync();
    setNotificationPermission(granted);
  };

  const addReminder = async () => {
    try {
      if (!title) {
        Alert.alert('Title field is required');
        return;
      }
      if (!notificationPermission) {
        await requestNotificationPermission();
        if (!notificationPermission) {
          Alert.alert('Notification Permission Required', 'Please grant permission to set reminders.');
          return;
        }
      }
  
      if (day && month && year && hour && minute) {
        const notificationDate = new Date(year, month - 1, day, hour, minute);
        if (notificationDate > Date.now()) {
          console.log('Notification added:', day, month, year, hour, minute);
          await scheduleNotification(notificationDate);
          setModalVisible(false);
        } else {
          Alert.alert('Invalid Date/Time', 'Please select a future date and time.');
        }
      } else {
        Alert.alert('Incomplete Date/Time', 'Please fill in all fields to set reminders.');
      }
    } catch (error) {
      console.error('Error setting reminder:', error.message);
      Alert.alert('Error', 'Failed to set reminder. Please try again later.');
    }
  };  

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
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
        <FontAwesome name="bell" size={24} color="white" />
      </TouchableOpacity>
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
            <Text style={styles.modalTitle}>Set Reminder</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date (DD/MM/YYYY):</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="DD"
                  value={day}
                  onChangeText={setDay}
                  keyboardType="numeric"
                  maxLength={2}
                />
                <TextInput
                  style={styles.input}
                  placeholder="MM"
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="numeric"
                  maxLength={2}
                />
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
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Time (HH/MM):</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  placeholder="HH"
                  value={hour}
                  onChangeText={setHour}
                  keyboardType="numeric"
                  maxLength={2}
                />
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
            <TouchableOpacity onPress={addReminder}>
              <FontAwesome name="bell" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    width: 60, 
  },
  closeButton: {
    marginTop: 20,
    color: 'blue',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    width: 50,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});

export default SetReminderScreen;
