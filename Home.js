import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import {FIREBASE_DB as db} from "./firebase-config";
import AntDesign from '@expo/vector-icons/AntDesign';
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {Dropdown} from "react-native-element-dropdown";

/**
 * Our Home screen for our app.
 * @param navigation
 * @param route allows us to carry information across screens.
 * @returns {JSX.Element}
 * @constructor
 */
const HomeScreen = ({navigation, route}) => {

    /**
     * Goes to create task screen. Note: functionality is shared with the edit task screen as well.
     */
    const goToTaskDetail = () => {
        route.params.currentTaskID = null;
        navigation.navigate('Task Detail', route.params);
    };
    /**
     * Goes to settings screen
     */
    const goToSettings = () => {
        navigation.navigate('Settings', route.params);
    };
    /**
     * Goes to activity screen
     */
    const goToActivity = () => {
        navigation.navigate('Activity History', route.params);
    }
    /**
     * if refreshing is true, that means the page is currently refreshing.
     * @type {boolean} refresh state
     */
    const [refreshing, setRefreshing] = React.useState(false);
    /**
     * The list of tasks pulled from the firebase server.
     * @type {tasks} our task list
     */
    let [tasks, setTasks] = useState([]);
    /**
     * The list of custom tags the user made, pulled from the firebase server.
     * @type {Array<String>} our custom tags
     */
    const [additionalTags, setAdditionalTags] = React.useState([]);
    /**
     * The original tags provided with the app, potentially with a users custom-made tags.
     * Value is only used for the
     * sort by function.
     * @type {{label: String, value: String}[]} our additional tags
     */
    const [tags, setTags] = useState([
        // Our default list of tags we provide to sort by
        {label: 'Work', value: '1'},
        {label: 'School', value: '2'},
        {label: 'High Priority', value: '3'},
        {label: 'Low Priority', value: '4'},
        {label: 'Personal', value: '5'},
        {label: 'Due Date', value: '6'},

    ]);
    /**
     * Fetches tasks from the database on refresh, on edit task, delete task, or add task.
     * Also fetches the deleted/
     * completed tasks, and cross compares to them as to not be displayed, and the additional tags.
     * @type {(function(): Promise<void>)|*}
     */
    const fetchTasks = useCallback(async () => {

        console.log("Fetching... (using a read)");
        // Finds all tasks under a person's email, and its subtasks
        const retrieveData = db.collection("Task (" + route.params.email + ")");
        const querySnapshot = await retrieveData.get();

        let tasks = querySnapshot.docs.map((doc) => {
            return {id: doc.id, ...doc.data(), subtasks: []};
        });
        //Ensures subtasks are with its correct parent task
        await Promise.all(tasks.map(async task => {
            const subtaskSnapshot = await db.collection("Subtask (" + route.params.email + ")")
                .where("parentTaskID", "==", task.id)
                .get();

            task.subtasks = subtaskSnapshot.docs.map((doc) => {
                return {id: doc.id, ...doc.data()};
            });
        }));
        // Retrieves all completed and deleted tasks to be not displayed on the task list
        const checkDelete = db.collection("Activity (" + route.params.email + ")")
            .where("Action", "in", ["DELETE", "COMPLETE"]);

        const deleteQuerySnapshot = await checkDelete.get();

        const deleteList = deleteQuerySnapshot.docs.map((doc) => {
            return doc.data().TaskID;
        });
        // Deletes completed and deleted tasks
        tasks = tasks.filter(tasks => !deleteList.includes(tasks.id));

        setTasks(tasks);
        // Finds any custom tags made by the user on the firebase, and adds it to the tag list here
        tasks.map(tasks => tasks.selectedTags).forEach(item => item.forEach(item =>
            additionalTags.includes(item.text) ? {} : additionalTags.push(item.text)
        ));

        setAdditionalTags(additionalTags);
        // helper function to actually add the additional tags to our tags since they are typed differently
        addAdditionalTagsToTags();


        setRefreshing(false); // Refreshing is considered done once the above 3 tasks are completed
    }, [route.params.email, additionalTags, setAdditionalTags, setRefreshing]);

    /**
     * Enables refreshing function on the task list. Runs the fetchTasks sequence again if desired by the user.
     * @type {(function(): void)|*}
     */
    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchTasks();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, [setRefreshing, fetchTasks]);

    useEffect(() => {
        return navigation.addListener('focus', () => {
            fetchTasks();
        });
    }, [navigation, fetchTasks]);
    /**
     * Adds the additional tags to the tags list.
     * Additional tags are just a string, and tags are a label and value, so
     * this function helps turn it in to a tag list that can be used to sort our tasks.
     */
    const addAdditionalTagsToTags = () => {

        let updatedTags = [...tags]; // Sets aside tags in a separate list as a safety measure
        // Checks each additional tag
        additionalTags.forEach(tag => {
            const tagExists = updatedTags.some(existingTag => existingTag.label === tag);
            // Makes sure it doesn't already exist in the tag list
            if (!tagExists) {
                // Adds tag with the value being the next number of the list. The number is arbitrary for displaying.
                const newValue = updatedTags.length + 1;
                const newTag = {label: tag, value: newValue.toString()};
                updatedTags.push(newTag);
            }
        });
        setTags(updatedTags); // Updates the tag with our changes
    };
    /**
     * Using a FlatList, we display each task and its subtask
     * @param item each item is a task from the list of tasks to be displayed.
     * @returns {JSX.Element|task} a list element of the FlatList representing each task.
     */
    const renderItem = ({item}) => {
        // Makes sure we don't display "orphan" tasks
        if (item.parentTask !== '') {
            return null;
        }
        // Looks for any subtasks in our task list.
        const subtasks = tasks.filter((task) => task.parentTask === item.title);

        return (
            <View style={styles.itemContainer}>
                <View style={styles.taskContainer}>
                    <Text style={styles.item}>{item.title}</Text>
                    <View style={styles.actionButtonsContainer}>
                        {/*Delete button for a task*/}
                        <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                            <AntDesign name="delete" size={20}/>
                        </TouchableOpacity>
                        {/*Edit button for a task*/}
                        <TouchableOpacity onPress={() => editTask(item.id)} style={styles.editButton}>
                            <AntDesign name="edit" size={20}/>
                        </TouchableOpacity>
                        {/*Complete button for a task*/}
                        <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.completeButton}>
                            <AntDesign name="check" size={20}/>
                        </TouchableOpacity>
                    </View>
                </View>
                {/*We display our subtasks here*/}
                {subtasks.map((subtask) => (
                    <View key={subtask.id} style={styles.subtaskContainer}>
                        <Text style={styles.subtaskItem}>{subtask.title}</Text>
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity onPress={() => deleteTask(subtask.id)} style={styles.deleteButton}>
                                <AntDesign name="delete" size={18}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => editTask(subtask.id)} style={styles.editButton}>
                                <AntDesign name="edit" size={18}/>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => completeTask(subtask.id)} style={styles.completeButton}>
                                <AntDesign name="check" size={18}/>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    /**
     * Deletes a task off our task list.
     * In reality, it is kept for tracking so that the user can see it in their
     * analysis report.
     * @param id unique ID of our task in the database.
     * @returns {Promise<void>}
     */
    const deleteTask = async (id) => {
        await addDoc(collection(db, "Activity (" + route.params.email + ")"), {
            Action: "DELETE",
            TaskID: id,
            Time: serverTimestamp()
        });
        onRefresh(); // refreshes so that the deleted task doesn't display
    }
    /**
     * Sends user to edit screen to edit their task.
     * The changes are then saved to the firebase once they are done.
     * @param id unique ID of our task in the database.
     */
    const editTask = (id) => {
        // Allows route to know what task it is to be displayed on the edit screen
        route.params.tasks = tasks;
        route.params.currentTaskID = id;
        let tags = [];
        // Allows user to see their custom tags.
        tasks.map(tasks => tasks.selectedTags).forEach(item => item.forEach(item =>
            tags.includes(item.text) ? {} : tags.push(item.text)
        ));
        route.params.tags = tags;
        console.log("Tags? " + tags);
        // Navigates to edit screen once all the details needed are gotten.
        navigation.navigate('Task Detail', route.params);

    }
    /**
     * Marks a task as complete, so it is not displayed.
     * Updates the firebase.
     * @param id unique ID of our task in the database.
     * @returns {Promise<void>}
     */
    const completeTask = async (id) => {
        await addDoc(collection(db, "Activity (" + route.params.email + ")"), {
            Action: "COMPLETE",
            TaskID: id,
            Time: serverTimestamp()
        });
        onRefresh(); // refreshes so the completed task doesn't display
    }
    /**
     * Sorting function that sorts our tasks by the tag of our choice.
     * For convenience, the due date is included as a
     * "tag" so the user can sort by as well.
     * @param selectedTag the tag the user is sorting by.
     */
    const sortTasksByTag = (selectedTag) => {
        const sortedTasks = [...tasks]; // Copies tasks to a separate variable as a safety measure

        if (selectedTag === 'Due Date') { // Checks if due date is selected, as it is a different algorithm
            console.log("due date selected");
            sortedTasks.sort((task1, task2) => {
                // Parses the dates
                // stored on the database in a way
                // so that they can be compared for the comparator function
                const parseDate = (year, month, day) => {
                    if (year && month && day) {
                        const parsedYear = parseInt(year, 10);
                        const parsedMonth = parseInt(month, 10);
                        const parsedDay = parseInt(day, 10);
                        if (!isNaN(parsedYear) && !isNaN(parsedMonth) && !isNaN(parsedDay)) {
                            return new Date(parsedYear, parsedMonth - 1, parsedDay);
                        }
                    }
                    return null; // Return null if any part of the date is missing or invalid
                };

                // Parse dates for task1
                const date1 = parseDate(task1.dueDateYear, task1.dueDateMonth, task1.dueDateDay);
                // Parse dates for task2
                const date2 = parseDate(task2.dueDateYear, task2.dueDateMonth, task2.dueDateDay);

                // Handle cases where either date is null
                if (date1 === null && date2 === null) {
                    return 0; // If both dates are null, consider them equal
                } else if (date1 === null) {
                    return 1; // Null date (task1) should be considered greater than non-null date (task2)
                } else if (date2 === null) {
                    return -1; // Non-null date (task2) should be considered greater than null date (task1)
                } else {
                    // Compare valid dates
                    if (date1 < date2) {
                        return -1;
                    } else if (date1 > date2) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            });

        } else {
            // Sorts the tags the "normal" way:
            // If the task has the tag, it is placed on the top of the list indiscriminately.
            sortedTasks.sort((a, b) => {
                // Grabs tags out of some two tags for our comparator function.
                const aHasTag = a.selectedTags.some(tag => tag.text === selectedTag);
                const bHasTag = b.selectedTags.some(tag => tag.text === selectedTag);
                // If they both have this tag, no change is done.
                // If one of them has it but not the other, they come first.
                if ((aHasTag && bHasTag) || (!aHasTag && !bHasTag)) {
                    return 0;
                }

                if (aHasTag) {
                    return -1;
                }

                if (bHasTag) {
                    return 1;
                }

                return 0;
            });
        }
        sortedTasks.forEach(task => {
            console.log(`Year: ${task.dueDateYear}, Month: ${task.dueDateMonth}, Day: ${task.dueDateDay}`);
        });
        setTasks(sortedTasks); // Sets our sortedTask list to the actual task list to be displayed.
    };
    /**
     * Our display module for sorting the tags by task.
     * Courtesy of GitHub user hoaphantn7604.
     * When selected, the tasks
     * will sort by that tag.
     * @returns {JSX.Element}
     * @constructor
     */
    const SortField = () => {
        const [value, setValue] = useState(null);
        const [isFocus, setIsFocus] = useState(false);

        const renderLabel = () => {
            if (value || isFocus) {
                return (
                    <Text style={[styles.label, isFocus && {color: 'blue'}]}>
                        Sort by...
                    </Text>
                );
            }
            return null;
        };


        return (
            <View style={styles.sortContainer}>
                <SafeAreaView>
                    {renderLabel()}
                    <Dropdown
                        style={[styles.dropdown, isFocus && {borderColor: 'blue'}]}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        data={tags}
                        search
                        maxHeight={300}
                        labelField="label"
                        valueField="value"
                        placeholder={!isFocus ? 'Sort by...' : '...'}
                        searchPlaceholder="Search..."
                        value={value}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={item => {
                            {/* When onChange is toggled (the tag is pressed), we call the function to sort the list.*/
                            }
                            setValue(item.value);
                            setIsFocus(false);
                            sortTasksByTag(item.label);
                        }}
                        renderLeftIcon={() => (
                            <AntDesign
                                style={styles.icon}
                                color={isFocus ? 'blue' : 'black'}
                                name="Safety"
                                size={20}
                            />
                        )}
                    />
                </SafeAreaView>
            </View>

        );
    };

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <Text style={styles.title}>Home Screen</Text>
                <TouchableOpacity onPress={goToSettings} style={[styles.settingButton, styles.button]}>
                    <FontAwesome name="cog" size={24} color="black"/>
                </TouchableOpacity>
                <SortField/>
                <FlatList style={styles.listContainer}
                          data={tasks}
                          renderItem={renderItem}
                          keyExtractor={(item) => item.id}
                          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                />
                <View style={styles.bottomButtonsContainer}>
                    <TouchableOpacity onPress={goToTaskDetail} style={styles.creationButton}>
                        <Text style={styles.buttonText}>Create Task</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={goToActivity} style={styles.activityButton}>
                        <Text style={styles.buttonText}>Activity History</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#379EE8',
        left: 90,
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    button: {
        position: 'absolute',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    creationButton: {
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007BFF',
        marginRight: 80,
    },
    activityButton: {
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#007BFF',
    },
    settingButton: {
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        right: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    itemContainer: {
        marginBottom: 10,
    },
    taskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
    },
    item: {
        padding: 12,
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: '#BDDBF1',
        width: '100%',
        borderColor: '#000',
        borderWidth: 2,
        paddingRight: 10,
    },
    subtaskContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 20,
    },
    subtaskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtaskItem: {
        padding: 12,
        backgroundColor: '#BDDBF1',
        width: '92%',
        borderWidth: 1,
        marginTop: 2,
        marginLeft: 25,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        position: 'absolute',
        top: 10,
        right: 10,
    },
    deleteButton: {
        backgroundColor: '#DF0000',
        borderRadius: 10,
        padding: 6,
        marginRight: 5,
    },
    editButton: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        padding: 6,
        marginRight: 5,
    },
    completeButton: {
        backgroundColor: '#0F9D58',
        borderRadius: 10,
        padding: 6,
    },
    listContainer: {
        marginBottom: 45,
        marginTop: 5,
    },
    dropdown: {
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    sortContainer: {
        padding: 16,
    },
});

export default HomeScreen;