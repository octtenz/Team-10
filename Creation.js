import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { FontAwesome } from '@expo/vector-icons';

import { FIREBASE_DB } from './firebase-config.js';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import AddTagsModal from './addTagPopup.js';
import SetReminderScreen from './setReminderPopup.js';
import * as Notifications from 'expo-notifications';

const CreationScreen = ({ navigation, route }) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [parentTask, setParentTask] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [startDateDay, setStartDateDay] = useState('');
  const [startDateMonth, setStartDateMonth] = useState('');
  const [startDateYear, setStartDateYear] = useState('');
  const [dueDateDay, setDueDateDay] = useState('');
  const [dueDateMonth, setDueDateMonth] = useState('');
  const [dueDateYear, setDueDateYear] = useState('');
  const [expectedTime, setExpectedTime] = useState('');
  const [unit, setUnit] = useState('seconds'); 
  const [notificationScheduled, setNotificationScheduled] = useState(false);

  const tasks = route.params.tasks;
  const [existingTasks, setExistingTasks] = useState([]);

  useEffect(() => {
    if (tasks) {
      setExistingTasks(tasks.map(task => task.id));
    }
  }, [tasks]);

  useEffect(() => {
    loadData();
  }, []);
  const loadData = () => {
    if(route.params.currentTaskID != null){
      const currentTask = tasks.find(obj => obj.id === route.params.currentTaskID);
      setTitle(currentTask.title)
      setNote(currentTask.note)
      setParentTask(currentTask.parentTask)
      setSelectedTags(currentTask.selectedTags)
      setStartDateDay(currentTask.startDateDay)
      setStartDateMonth(currentTask.startDateMonth)
      setStartDateYear(currentTask.startDateYear)
      setDueDateDay(currentTask.dueDateDay)
      setDueDateMonth(currentTask.dueDateMonth)
      setDueDateYear(currentTask.dueDateYear)
      setExpectedTime(currentTask.expectedTime)
      setExistingTasks(existingTasks.filter((item) => item !== route.params.currentTaskID))
    }
  }

  const handleParentTask = (index, value) => {
    setParentTask(value);
  };

  const removeTag = (index) => {
    const updatedTags = [...selectedTags];
    updatedTags.splice(index, 1);
    setSelectedTags(updatedTags);
  };

  const handleTagSelect = (tag) => {
    setSelectedTags([...selectedTags, { text: tag, selected: false }]);
  };

  const toggleTagSelection = (index) => {
    const updatedTags = [...selectedTags];
    updatedTags[index].selected = !updatedTags[index].selected;
    setSelectedTags(updatedTags);
  };

  const cancelNotification = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotificationScheduled(false);
      console.log('Notification cancelled');
    } catch (error) {
      console.error('Error cancelling notification:', error.message);
      Alert.alert('Error', 'Failed to cancel notification. Please try again later.');
    }
  };

  const handleCancel = () => {
    console.log('Cancelled');
    cancelNotification();
    navigation.navigate('Home', route.params);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Title field is required');
      return;
    }

    const startDate =
      startDateDay && startDateMonth && startDateYear
        ? startDateDay + startDateMonth + startDateYear
        : null;

    const dueDate =
      dueDateDay && dueDateMonth && dueDateYear
        ? dueDateDay + dueDateMonth + dueDateYear
        : null;

    const expectedTimeString = `${expectedTime} ${unit}`;

    console.log('Saved:', {
      title,
      note,
      parentTask,
      selectedTags,
      startDateDay,
      startDateMonth,
      startDateYear,
      dueDateDay,
      dueDateMonth,
      dueDateYear,
      expectedTime,
      unit,
    });

    if (route.params.currentTaskID == null){
      const docRef = await addDoc(collection(FIREBASE_DB, "Task (" + route.params.email + ")"), {
        title,
        note,
        parentTask,
        selectedTags,
        startDateDay,
        startDateMonth,
        startDateYear,
        dueDateDay,
        dueDateMonth,
        dueDateYear,
        dueDate,
        expectedTime,
        unit,
      })
      route.params.currentTaskID = docRef.id;
      
      const docRef2 = await addDoc(collection(FIREBASE_DB, "Activity (" + route.params.email + ")"), {
        Action: "ADD",
        TaskID: docRef.id
      });  
    }else{
      const docRef = await updateDoc(doc(FIREBASE_DB, "Task (" + route.params.email + ")", route.params.currentTaskID), {
        title,
        note,
        parentTask,
        selectedTags,
        startDateDay,
        startDateMonth,
        startDateYear,
        dueDateDay,
        dueDateMonth,
        dueDateYear,
        expectedTime,
        unit, 
      })
    }

    setNotificationScheduled(true);

    navigation.navigate('Home', route.params);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.currentTaskID == null ? "Create New Task" : "Edit Existing Task"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Note"
        multiline
        value={note}
        onChangeText={setNote}
      />
      <View style={styles.parentTaskContainer}>
        <ModalDropdown
          options={existingTasks.map(existingTasks => "id(" + existingTasks + "): " + tasks.find(obj => obj.id === existingTasks).title)}
          onSelect={handleParentTask}
          textStyle={styles.dropdownText}
          dropdownTextStyle={styles.dropdownItemText}
          dropdownStyle={styles.dropdown}
          defaultIndex={-1}
          defaultValue="Select Parent Task"
        />
      </View>
      <View style={styles.tagContainer}>
        <Text style={styles.label}>Tag:</Text>
        <View style={styles.tagInputs}>
          {selectedTags.map((tag, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleTagSelection(index)}
              style={[
                styles.tag,
                {
                  backgroundColor: tag.selected ? '#add8e6' : '#e6e6e6',
                },
              ]}
            >
              <Text style={styles.tagText}>{tag.text}</Text>
              <TouchableOpacity onPress={() => removeTag(index)}>
                <FontAwesome name="times" size={15} color="red" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
        <AddTagsModal 
          onTagSelect={handleTagSelect} 
          tags={route.params && route.params.tags ? route.params.tags : []} 
        />
        </View>
      <View style={styles.dateInputContainer}>
        <Text style={styles.label}>Start Date:</Text>
        <View style={styles.dateInputs}>
          <TextInput
            style={[styles.dateInput, styles.dayInput]}
            placeholder="DD"
            keyboardType="numeric"
            maxLength={2}
            value={startDateDay}
            onChangeText={setStartDateDay}
          />
          <TextInput
            style={[styles.dateInput, styles.monthInput]}
            placeholder="MM"
            keyboardType="numeric"
            maxLength={2}
            value={startDateMonth}
            onChangeText={setStartDateMonth}
          />
          <TextInput
            style={[styles.dateInput, styles.yearInput]}
            placeholder="YYYY"
            keyboardType="numeric"
            maxLength={4}
            value={startDateYear}
            onChangeText={setStartDateYear}
          />
        </View>
      </View>
      <View style={styles.dateInputContainer}>
        <Text style={styles.label}>Due Date:</Text>
        <View style={styles.dateInputs}>
          <TextInput
            style={[styles.dateInput, styles.dayInput]}
            placeholder="DD"
            keyboardType="numeric"
            maxLength={2}
            value={dueDateDay}
            onChangeText={setDueDateDay}
          />
          <TextInput
            style={[styles.dateInput, styles.monthInput]}
            placeholder="MM"
            keyboardType="numeric"
            maxLength={2}
            value={dueDateMonth}
            onChangeText={setDueDateMonth}
          />
          <TextInput
            style={[styles.dateInput, styles.yearInput]}
            placeholder="YYYY"
            keyboardType="numeric"
            maxLength={4}
            value={dueDateYear}
            onChangeText={setDueDateYear}
          />
        </View>
      </View>
      <View style={styles.reminderContainer}>
        <TextInput
          style={styles.expectedTime}
          placeholder="Expected Time to Complete"
          keyboardType="numeric"
          value={expectedTime}
          onChangeText={text => setExpectedTime(text.replace(/[^0-9]/g, ''))}
        />
        <ModalDropdown
          style={styles.units}
          options={['seconds', 'minutes', 'hours', 'days', 'months', 'years']}
          onSelect={(index, value) => setUnit(value)}
          defaultIndex={-1}
          defaultValue="Units"
        />
        <SetReminderScreen
          title={title}
        />
      </View>
      <Text style={styles.hintText}>Hint: Title field is required</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleCancel}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    alignItems: 'flex-start',
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  multiline: {
    height: 40,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    width: '40%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  parentTaskContainer: {
    borderColor: '#ccc',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  dropdownText: {
    fontSize: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    color: '#333',
    width: '100%',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdown: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tagInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    padding: 5,
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#e6e6e6',
  },
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'flex-start',
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginRight: 10,
    textAlign: 'left',
  },
  dateInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 60,
    height: 20,
  },
  dayInput: {
    marginRight: '2%',
  },
  monthInput: {
    marginRight: '2%',
  },
  yearInput: {
    marginRight: 0,
  },
  reminderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expectedTime: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: 210,
  },
  units: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginLeft: 10,
    marginRight: 10,
  },
  hintText: {
    fontSize: 12,
    color: '#888',
  },
});

export default CreationScreen;