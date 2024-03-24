import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const SetReminderScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const addReminder = () => {
    if (day && month && year) {
      setReminders([...reminders, { day, month, year }]);
      setDay('');
      setMonth('');
      setYear('');
    }
  };

  const deleteReminder = (index) => {
    const newReminders = [...reminders];
    newReminders.splice(index, 1);
    setReminders(newReminders);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text>Set Reminders</Text>
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
            <Text style={styles.modalText}>Set Reminder</Text>
            <TextInput
              style={styles.input}
              placeholder="Day"
              value={day}
              onChangeText={setDay}
            />
            <TextInput
              style={styles.input}
              placeholder="Month"
              value={month}
              onChangeText={setMonth}
            />
            <TextInput
              style={styles.input}
              placeholder="Year"
              value={year}
              onChangeText={setYear}
            />
            <TouchableOpacity onPress={addReminder}>
              <Text>Add Reminder</Text>
            </TouchableOpacity>
            {reminders.map((reminder, index) => (
              <View key={index} style={styles.reminder}>
                <View style={styles.dateBox}>
                  <Text>{`${reminder.day}/${reminder.month}/${reminder.year}`}</Text>
                </View>
                {index === 0 ? (
                  <TouchableOpacity onPress={() => deleteReminder(index)}>
                    <View style={styles.deleteButton}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => deleteReminder(index)}>
                    <View style={styles.deleteButton}>
                      <Text style={styles.deleteText}>Delete</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            ))}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // light beige box
  },
  modalView: {
    backgroundColor: 'beige', // light beige box
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 5,
    marginBottom: 10,
    width: 200,
  },
  reminder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  dateBox: {
    backgroundColor: '#f0f0f0',
    padding: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
});

export default SetReminderScreen;
