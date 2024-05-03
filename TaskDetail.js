import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard, ScrollView, StyleSheet, Alert } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { FontAwesome } from '@expo/vector-icons';
import { FIREBASE_DB } from './firebase-config.js';
import { serverTimestamp, addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import AddTagsModal from './addTagPopup.js';
import SetReminderScreen from './setReminderPopup.js';
import * as Notifications from 'expo-notifications';

/**
 * Task Detail screen handles the creation and editing of the goals and tasks
 * @param {*} param0 Object containing navigation and route properties
 * @returns React element representing the Task Detail screen
 */
const TaskDetailScreen = ({ navigation, route }) => {
  // State variables for task details
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
  const [unit, setUnit] = useState(''); 
  const [notificationScheduled, setNotificationScheduled] = useState(false);
  const tasks = route.params.tasks;
  const [existingTasks, setExistingTasks] = useState([]);

  // Update existing tasks when the tasks prop changes
  useEffect(() => {
    if (tasks) {
      setExistingTasks(tasks.map(task => task.id));
    }
  }, [tasks]);

  // Load data when the tasks prop changes
  useEffect(() => {
    loadData();
  }, [tasks]);

  // Load data for editing the current task
  const loadData = () => {
    if(route.params.currentTaskID != null){
      const currentTask = tasks.find(obj => obj.id === route.params.currentTaskID);
      setTitle(currentTask.title)
      setNote(currentTask.note)
      const parentTaskId = currentTask.parentTask;
      const parentTask = parentTaskId ? tasks.find(task => task.id === parentTaskId)?.title || '' : '';
      setParentTask(parentTask)
      setSelectedTags(currentTask.selectedTags)
      setStartDateDay(currentTask.startDateDay)
      setStartDateMonth(currentTask.startDateMonth)
      setStartDateYear(currentTask.startDateYear)
      setDueDateDay(currentTask.dueDateDay)
      setDueDateMonth(currentTask.dueDateMonth)
      setDueDateYear(currentTask.dueDateYear)
      setExpectedTime(currentTask.expectedTime)
      setUnit(currentTask.unit)
      setExistingTasks(tasks.map(task => task.id).filter((item) => item !== route.params.currentTaskID));
    }
  }

  /**
   * Handles the selection of a parent task
   * @param {*} index The index of the selected task in the existing tasks array
   */
  const handleParentTask = (index) => {
    const selectedTaskId = existingTasks[index]; 
    const selectedTask = tasks.find(task => task.id === selectedTaskId); 
    const selectedTaskTitle = selectedTask ? selectedTask.title : ''; 
    setParentTask(selectedTaskTitle);
  };

  /**
   * Removes a tag from the existing tags array
   * @param {*} index The index of the tag to be removed in the existing tags array
   */
  const removeTag = (index) => {
    const updatedTags = [...selectedTags];
    updatedTags.splice(index, 1);
    setSelectedTags(updatedTags);
  };

  /**
   * Handles the selection of a tag
   * @param {*} tag The tag to be selected
   */
  const handleTagSelect = (tag) => {
    setSelectedTags([...selectedTags, { text: tag, selected: false }]);
  };

  /**
   * Toggles the selection state of a tag
   * @param {*} index The index of the tag to toggle in the existing tags array
   */
  const toggleTagSelection = (index) => {
    const updatedTags = [...selectedTags];
    updatedTags[index].selected = !updatedTags[index].selected;
    setSelectedTags(updatedTags);
  };

  // Cancels the scheduled notification
  const cancelNotification = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      setNotificationScheduled(false);
      console.log('Notification cancelled');
    } catch (error) {
      console.error('Error cancelling notification:', error.message);
      Alert.alert('Error', 'Failed to cancel notification');
    }
  };

  // Handles the cancellation of the task creation or editing process
  const handleCancel = () => {
    console.log('Cancelled');
    cancelNotification();
    navigation.navigate('Home', route.params);
  };

  // Handles the saving of the task creation or editing process
  const handleSave = async () => {
    // Check if the title field is empty
    if (!title.trim()) {
      Alert.alert('Title field is required');
      return;
    }

    // Validate day and month inputs
    if (parseInt(startDateDay) < 1 || parseInt(startDateDay) > 31 || 
        parseInt(dueDateDay) < 1 || parseInt(dueDateDay) > 31 ) {
      Alert.alert('Invalid day input');
      return;
    }
    if (parseInt(startDateMonth) < 1 || parseInt(startDateMonth) > 12 ||
        parseInt(dueDateMonth) < 1 || parseInt(dueDateMonth) > 12) {
      Alert.alert('Invalid month input');
      return;
    }

    // Construct start date, due date, and expected time strings
    const startDate =
      startDateDay && startDateMonth && startDateYear
        ? startDateDay + startDateMonth + startDateYear
        : null;
    const dueDate =
      dueDateDay && dueDateMonth && dueDateYear
        ? dueDateDay + dueDateMonth + dueDateYear
        : null;
    const expectedTimeString = `${expectedTime} ${unit}`;

    console.log('Saved:', {title, note, parentTask, selectedTags, startDateDay, startDateMonth, startDateYear, dueDateDay, dueDateMonth, dueDateYear, expectedTime, unit});

    // If a new task is being created
    if (route.params.currentTaskID == null){
      // Add a new task document to the Firebase collection with its details
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

      // Update the current task ID with the newly created document ID
      route.params.currentTaskID = docRef.id;

      // If there is a parent task, update its subtasks array with the newly created task ID
      if (parentTask) {
        const parentTaskObj = tasks.find(task => task.title === parentTask);
        if (parentTaskObj) {
          const parentTaskId = parentTaskObj.id;
          await updateDoc(doc(FIREBASE_DB, "Task (" + route.params.email + ")", parentTaskId), {
            subtasks: [...parentTaskObj.subtasks, docRef.id], 
          });
        }
      }
      
      // Log the activity of adding a new task
      const docRef2 = await addDoc(collection(FIREBASE_DB, "Activity (" + route.params.email + ")"), {
        Action: "ADD",
        TaskID: docRef.id,
        Time: serverTimestamp()
      }); 

    // If an existing task is being edited
    }else{
      // Update an existing task document in the Firebase collection with its revised details
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

      // Log the activity of editing an existing task
      const docRef2 = await addDoc(collection(FIREBASE_DB, "Activity (" + route.params.email + ")"), {
        Action: "EDIT",
        TaskID: route.params.currentTaskID,
        Time: serverTimestamp()
      });  
    }

    // Set the notification to be scheduled
    setNotificationScheduled(true);

    // Navigate back to the Home screen
    navigation.navigate('Home', route.params);
  };

  return (
    // Dismiss keyboard when tapping outside of input field
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {/* Container for the details of the task */}
      <View style={styles.container}>
        {/* Render the appropriate title based on whether it's the creation or editing of the task */}
        <Text style={styles.title}>{route.params.currentTaskID == null ? "Create New Task" : "Edit Existing Task"}</Text>
        {/* Hint for the title field */}
        <Text style={styles.hintText}>Hint: Title field is required</Text>
        
        {/* Input field for the title of the task */}
        <TextInput
          style={[styles.input,{fontSize: 20}]}
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        
        {/* Multiline input field for the note of the task */}
        <TextInput
          style={[styles.input, styles.multiline,{fontSize: 16}]}
          placeholder="Note"
          multiline
          value={note}
          onChangeText={setNote}
        />

        {/* Container for selecting the parent task */}
        <View style={styles.parentTaskContainer}>
          {/* Dropdown menu for selecting the parent task */}
          <ModalDropdown
            options={existingTasks.map(existingTasks => "id(" + existingTasks + "): " + tasks.find(obj => obj.id === existingTasks).title)}
            onSelect={handleParentTask}
            textStyle={styles.dropdownText}
            dropdownTextStyle={styles.dropdownItemText}
            dropdownStyle={styles.dropdown}
            defaultIndex={0}
            defaultValue="Select Parent Task"
          />
        </View>

        {/* Container for the tags of the task */}
        <View style={styles.tagContainer}>
          <View style={[{flexDirection: "col", width:"15%"}]}>
            <Text style={styles.label}>Tag:</Text>
            {/* Modal for adding tags */}
            <AddTagsModal 
              onTagSelect={handleTagSelect} 
              tags={route.params && route.params.tags ? route.params.tags : []} 
            />
          </View>
          <View style={styles.tagInputs}>
            {/* Render the selected tags */}
            <ScrollView contentContainerStyle={[{flexDirection: 'row', flexWrap: 'wrap'}]}>
              {selectedTags.map((tag, index) => (
                // Touchable area to toggle the selection state of a tag 
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleTagSelection(index)}
                  style={[styles.tag, {backgroundColor: tag.selected ? '#add8e6' : '#e6e6e6'}]}
                  multiline
                >
                  <Text style={styles.tagText}>{tag.text}</Text>
                  {/* Button to remove selected tags */}
                  <TouchableOpacity onPress={() => removeTag(index)}>
                    <FontAwesome name="times" size={15} color="red" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Container for the start date of the task */}
        <View style={styles.dateInputContainer}>
          <Text style={styles.label}>Start Date:</Text>
          {/* Input fields for start date of the task */}
          <View style={styles.dateInputs}>
            <TextInput
              style={[styles.dateInput, styles.dayInput]}
              placeholder="DD"
              keyboardType="numeric"
              maxLength={2}
              value={startDateDay}
              onChangeText={setStartDateDay}
            />
            <Text style={[{fontSize:20}]}> /</Text>
            <TextInput
              style={[styles.dateInput, styles.monthInput]}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
              value={startDateMonth}
              onChangeText={setStartDateMonth}
            />
            <Text style={[{fontSize:20}]}> /</Text>
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

        {/* Container for due date of the task */}
        <View style={styles.dateInputContainer}>
          <Text style={styles.label}>Due Date:</Text>
          {/* Input fields for due date of the task */}
          <View style={styles.dateInputs}>
            <TextInput
              style={[styles.dateInput, styles.dayInput]}
              placeholder="DD"
              keyboardType="numeric"
              maxLength={2}
              value={dueDateDay}
              onChangeText={setDueDateDay}
            />
            <Text style={[{fontSize:20}]}> /</Text>
            <TextInput
              style={[styles.dateInput, styles.monthInput]}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
              value={dueDateMonth}
              onChangeText={setDueDateMonth}
            />
            <Text style={[{fontSize:20}]}> /</Text>
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

        {/* Container for expected completion time and notification of the task */}
        <View style={styles.reminderContainer}>
          {/* Input field for expected completion time of the task */}
          <TextInput
            style={styles.expectedTime}
            placeholder="Expected Time to Complete"
            keyboardType="numeric"
            value={expectedTime}
            onChangeText={text => setExpectedTime(text.replace(/[^0-9]/g, ''))}
          />
          {/* Dropdown menu for selecting the unit of expected completion time */}
          <ModalDropdown
            style={styles.units}
            options={['seconds', 'minutes', 'hours', 'days', 'months', 'years']}
            onSelect={(index, value) => setUnit(value)}
            defaultIndex={0}
            defaultValue= {unit}
          />
          {/* Component for setting the task notification */}
          <SetReminderScreen
            title={title}
          />
        </View>

        {/* Container for buttons */}
        <View style={styles.buttonContainer}>
          {/* Button to cancel task creation or editing */}
          <TouchableOpacity style={styles.button} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          {/* Button to save task creation or editing */}
          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

// Styles for the task detail screen
const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    backgroundColor: 'white',
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    color: '#379EE8',
    fontSize: 24,
    fontWeight: 'bold',
    left: 90,
    marginBottom: 50,
  },
  hintText: {
    color: '#888',
    fontSize: 12,
  },  
  input: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    width: '100%',
  },
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    width: '100%',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#007BFF', 
    borderRadius: 5,
    marginTop: 10,
    padding: 15,
    width: '40%',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  parentTaskContainer: {
    borderColor: '#ccc',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  dropdownText: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    color: '#333',
    fontSize: 16,
    padding: 10,
    width: '100%',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdown: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    width: '90%',
  },
  tagContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    marginRight: 10,
    textAlign: 'left',
  },
  tagInputs: {
    alignItems: 'left',
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    height: 90,
    marginLeft: "5%",
    padding: 10,
    width: "80%",
  },
  tag: {
    alignItems: 'center',
    backgroundColor: '#e6e6e6',
    borderColor: '#ccc',
    borderRadius: 5,
    flexDirection: 'row',
    marginBottom: 10,
    marginRight: 10,
    padding: 5,
  },
  dateInputContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10, 
    width: '100%',
  },
  dateInputs: {
    alignItems: 'center',
    flexDirection: 'row',  
  },
  dateInput: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    height: 30,
    marginLeft: 10,
    paddingHorizontal: 10,
    width: 60, 
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
    alignItems: 'center',
    flexDirection: 'row',
  },
  expectedTime: {
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
    width: 210,
  },
  units: {
    borderRadius: 5,
    borderWidth: 1,
    height: 40,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    width: 80,
  },
});

export default TaskDetailScreen;