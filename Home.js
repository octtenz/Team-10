import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, RefreshControl} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import {FIREBASE_DB as db} from "./firebase-config";
// import Checkbox from 'expo-checkbox';
import AntDesign from '@expo/vector-icons/AntDesign';
import {addDoc, collection} from "firebase/firestore";
import {Dropdown} from "react-native-element-dropdown";

//TODO add checkbox, fix empty list bugging out buttons

const HomeScreen = ({navigation, route}) => {

    const goToCreation = () => {
        route.params.currentTaskID = null ;
        navigation.navigate('Creation', route.params);
    };

    const goToSettings = () => {
        navigation.navigate('Settings', route.params);
    };

    const goToActivity = () => {
        navigation.navigate('Activity History', route.params);
    }

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchTasks();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    let [tasks, setTasks] = useState([]);

    let [deleteList, setDeleteList] = useState([]);

    const [additionalTags, setAdditionalTags] = React.useState([]);

    const [tags, setTags] = useState([
        { label: 'Work', value: '1' },
        { label: 'School', value: '2' },
        { label: 'High Priority', value: '3' },
        { label: 'Low Priority', value: '4' },
        { label: 'Personal', value: '5' }
    ]);

    const [selectedTag, setSelectedTag] = useState(null);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const fetchTasks = useCallback(async () => {

        console.log("Fetching... (using a read)");

        const retrieveData = db.collection("Task (" + route.params.email + ")");
        retrieveData.get().then((querySnapshot) => {
            tasks = querySnapshot.docs.map((doc) => {
                return {id: doc.id, ...doc.data()}
            });

            const checkDelete = db.collection("Activity (" + route.params.email + ")")
                .where("Action", "in", ["DELETE", "COMPLETE"]);

            checkDelete.get().then((querySnapshot) => {
                deleteList = querySnapshot.docs.map((doc) => {
                    return doc.data().TaskID;
                });
            });

            tasks = tasks.filter(tasks => !deleteList.includes(tasks.id));

            setTasks(tasks);

            tasks.map(tasks => tasks.selectedTags).forEach(item => item.forEach(item =>
                additionalTags.includes(item.text) ? {} : additionalTags.push(item.text)
            ));

            setAdditionalTags(additionalTags);
            addAdditionalTagsToTags();

            setRefreshing(false);
        });
    }, []);

    const addAdditionalTagsToTags = () => {

        let updatedTags = [...tags];

        additionalTags.forEach(tag => {
            const tagExists = updatedTags.some(existingTag => existingTag.label === tag);

            if (!tagExists) {

                const newValue = updatedTags.length + 1;
                const newTag = { label: tag, value: newValue.toString() };
                updatedTags.push(newTag);
            }
        });
        setTags(updatedTags);
    };

    const renderItem = ({item}) => (
        <View>
            <Text style={styles.item}>{item.title}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteButton}>
                <AntDesign
                    name="delete"
                    size={20}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => editTask(item.id)} style={styles.editButton}>
                <AntDesign
                    name="edit"
                    size={20}
                />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => completeTask(item.id)} style={styles.completeButton}>
                <AntDesign
                    name="check"
                    size={20}
                />
            </TouchableOpacity>
        </View>
    );

    const deleteTask = async (id) => {
        await addDoc(collection(db, "Activity (" + route.params.email + ")"), {
            Action: "DELETE",
            TaskID: id,
        });
        onRefresh();
    }

    const editTask = (id) => {
        route.params.tasks = tasks ;
        route.params.currentTaskID = id ;
        let tags = [];
        tasks.map(tasks => tasks.selectedTags).forEach(item => item.forEach(item =>
            tags.includes(item.text) ? {} : tags.push(item.text)
        ));
        route.params.tags = tags;
        console.log("Tags? " + tags);
        navigation.navigate('Creation', route.params);
    }

    const completeTask = async (id) => {
        await addDoc(collection(db, "Activity (" + route.params.email + ")"), {
            Action: "COMPLETE",
            TaskID: id,
        });
        onRefresh();
    }

    const sortTasksByTag = (selectedTag) => {
        const sortedTasks = [...tasks];

        sortedTasks.sort((a, b) => {
            const aHasTag = a.selectedTags.some(tag => tag.text === selectedTag);
            const bHasTag = b.selectedTags.some(tag => tag.text === selectedTag);

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
        
        setTasks(sortedTasks);
    };

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

        console.log('Current selected value:', value);

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
                            setValue(item.value);
                            setIsFocus(false);
                            setSelectedTag(item.label);
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
                <TouchableOpacity onPress={goToCreation} style={[styles.creationButton, styles.button]}>
                    <Text style={styles.buttonText}>Create Task</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={goToActivity} style={[styles.ActivityButton, styles.button]}>
                    <Text style={styles.buttonText}>Activity History</Text>
                </TouchableOpacity>
                <SortField/>
                <FlatList style={styles.listContainer}
                          data={tasks}
                          renderItem={renderItem}
                          keyExtractor={(item) => item.id}
                          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                />
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
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#379EE8',
        left: 90,
    },
    button: {
        position: 'absolute',
        borderRadius: 5,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingButton: {
        right: 1,
        backgroundColor: '#ddd',
    },
    creationButton: {
        bottom: 30,
        backgroundColor: '#007BFF',
        left: 30,
    },
    ActivityButton: {
        bottom: 30,
        right: 30,
        backgroundColor: '#007BFF',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    item: {
        padding: 12,
        fontSize: 20,
        marginTop: 5,
        fontWeight: 'bold',
        backgroundColor: '#BDDBF1',
        width: 350,
        borderColor: '#000',
        borderWidth: 2,
        paddingRight: 80,
    },
    deleteButton: {
        backgroundColor: '#DF0000',
        borderRadius: 10,
        padding: 6,
        position: 'absolute',
        top: 15,
        right: 15,
    },
    editButton: {
        backgroundColor: '#007BFF',
        borderRadius: 10,
        padding: 6,
        position: 'absolute',
        top: 15,
        right: 50,
    },
    completeButton: {
        backgroundColor: '#0F9D58',
        borderRadius: 10,
        padding: 6,
        position: 'absolute',
        top: 15,
        right: 85,
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
