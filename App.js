import { db } from './firebase-config.js';
import {
    ref,
    onValue,
    push,
    update,
    remove
  } from 'firebase/database';
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from "react-native";

import { Dropdown } from 'react-native-element-dropdown';

const sortMethod = [
  { label: 'Due Date', value: '1' },
  { label: 'Tag', value: '2' },
  { label: 'Start Date', value: '3' },
];

const App = () => {
    const [goal, setGoal] = useState("");
    const [goals, setGoals] = useState([]);
    const [editIndex, setEditIndex] = useState(-1);
    const [subtask, setSubtask] = useState("");
    const [subtasks, setSubtasks] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [value, setValue] = useState(null);

    const handleAddGoal = () => {
        if (goal) {
            if (editIndex !== -1) {
                // Edit existing goal
                const updatedGoals = [...goals];
                updatedGoals[editIndex] = goal;
                setGoals(updatedGoals);
                setEditIndex(-1);
            } else {
                // Add new goal
                setGoals([...goals, goal]);
                
                push(ref(db, '/Goal List'), {
                    title: goal,
                  });
          
            }
            setGoal("");
            setSubtask("");
            setSubtasks([]);
        }
    };

    const handleEditGoal = (index) => {
        const goalToEdit = goals[index];
        setGoal(goalToEdit);
        setEditIndex(index);
    };

    const handleDeleteGoal = (index) => {
        const updatedGoals = [...goals];
        updatedGoals.splice(index, 1);
        setGoals(updatedGoals);
        const updatedSubtasks = [...subtasks];
        updatedSubtasks.splice(index, 1);
        setSubtasks(updatedSubtasks);
    };
    
    const handleAddSubtask = () => {
        if (subtask && selectedIndex !== -1) {
            const updatedSubtasks = [...subtasks];
            updatedSubtasks[selectedIndex] = [...(subtasks[selectedIndex] || []), subtask];
            setSubtasks(updatedSubtasks);
            setSubtask("");
        }
    };
    
    const renderItem = ({ item, index }) => (
        <View style={styles.goal}>
            <Text
                style={styles.itemList}>{item}</Text>
            <View
                style={styles.goalButtons}>
                <TouchableOpacity
                    onPress={() => setSelectedIndex(selectedIndex === index ? -1 : index)}>
                    <Text
                        style={styles.subtaskButton}>Subtask</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleEditGoal(index)}>
                    <Text
                        style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteGoal(index)}>
                    <Text
                        style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
            </View>
            {selectedIndex === index && (
                <View style={styles.subtaskContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter subtask"
                        value={subtask}
                        onChangeText={(text) => setSubtask(text)}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddSubtask}>
                        <Text style={styles.addButtonText}>Add Subtask</Text>
                    </TouchableOpacity>
                    <FlatList
                        data={subtasks[index] || []}
                        renderItem={({ item }) => <Text style={styles.subtask}>{item}</Text>}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Team 10</Text>
            <Text style={styles.title}>Goal Tracking and Nodification App</Text>
            <View style={styles.row}>
                          <Dropdown
                            style={styles. dropdown}
                            placeholderStyle={styles.placeholderStyle}
                            selectedTextStyle={styles.selectedTextStyle}
                            data={sortMethod}
                            maxHeight={300}
                            labelField="label"
                            valueField="value"
                            placeholder="Sort By:"
                            value={value}
                            onChange={item => {
                              setValue(item.value);
                            }}
                          />
                          <TouchableOpacity
                              style={styles.addButton}
                              onPress={handleAddGoal}>
                              <Text style={styles.addButtonText}>
                                  {editIndex !== -1 ? "Update Goal" : "Add Goal"}
                              </Text>
                          </TouchableOpacity>
                        </View>
            <TextInput
                style={styles.input}
                placeholder="Enter your goal"
                value={goal}
                onChangeText={(text) => setGoal(text)}
            />
            <FlatList
                data={goals}
                renderItem={renderItem}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 40,
        marginTop: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    heading: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 7,
        color: "black",
    },
    input: {
        borderWidth: 3,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 10,
        borderRadius: 10,
        fontSize: 18,
    },
    addButton: {
        backgroundColor: "black",
        padding: 10,
        borderRadius: 100,
        marginBottom: 10,
    },
    addButtonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center",
        fontSize: 18,
    },
    goal: {
        //flexDirection: "row",
        //justifyContent: "space-between",
        //alignItems: "center",
        marginBottom: 20,
        //fontSize: 18,
    },
    itemList: {
        fontSize: 19,
    },
    goalButtons: {
        flexDirection: "row",
    },
    editButton: {
        marginRight: 10,
        color: "black",
        fontWeight: "bold",
        fontSize: 18,
    },
    deleteButton: {
        color: "red",
        fontWeight: "bold",
        fontSize: 18,
    },
    subtaskButton: {
        marginRight: 15,
        color: "grey",
        fontWeight: "bold",
        fontSize: 18,
    },
    subtask: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dropdown: {
      height: 50,
      width: 200,
      borderColor: 'Green',
      borderWidth: 2,
      borderRadius: 8,
      paddingHorizontal: 8,
    },
});

export default App;
