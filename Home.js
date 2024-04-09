import React, {useCallback, useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, RefreshControl} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import {FIREBASE_DB as db} from "./firebase-config";
import Checkbox from 'expo-checkbox';
import SortField from "./dropDownSort";
import AntDesign from '@expo/vector-icons/AntDesign';
import {addDoc, collection} from "firebase/firestore";

//TODO add checkbox
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

    let [complete, setComplete] = React.useState([]);

    let [tasks, setTasks] = useState([]);

    let [deleteList, setDeleteList] = useState([]);

    useEffect(() => {
        fetchTasks();
    }, [tasks]);

    const fetchTasks = useCallback(async () => {

        const retrieveData = db.collection("Task (" + route.params.email + ")");
        retrieveData.get().then((querySnapshot) => {
            tasks = querySnapshot.docs.map((doc) => {
                return {id: doc.id, ...doc.data()}
            });

            const checkDelete = db.collection("Activity (" + route.params.email + ")").where("Action", "==", "DELETE");
            checkDelete.get().then((querySnapshot) => {
                deleteList = querySnapshot.docs.map((doc) => {
                    return doc.data().TaskID;
                });
            });
            tasks = tasks.filter(tasks => !deleteList.includes(tasks.id));
            setTasks(tasks);
            setRefreshing(false);
        });
    }, []);

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
        </View>
    );

    const deleteTask = async (id) => {
        const deleteActivity = await addDoc(collection(db, "Activity (" + route.params.email + ")"), {
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
        right: 20,
        backgroundColor: '#007BFF',
    },
    ActivityButton: {
        bottom: 30,
        left: 20,
        backgroundColor: '#009BFF',
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
    listContainer: {
        marginBottom: 45,
        marginTop: 5,
    }
});

export default HomeScreen;
