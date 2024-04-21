import React, {useCallback, useEffect, useState} from "react";
import {View, StyleSheet, Text, SafeAreaView, FlatList, RefreshControl, TouchableOpacity} from "react-native";
import {FIREBASE_DB as db} from "./firebase-config";
import AntDesign from '@expo/vector-icons/AntDesign';

const ActivityHistoryScreen = ({navigation, route}) => {
    // TODO add delete button to history.

    let [activities, setActivities] = useState([]);

    let [taskNames, setTaskNames] = useState([]);

    let [taskTitleMap, setTaskTitleMap] = useState({});

    const deleteActivity = ({id}) => {
        navigation.navigate('Home', route.params);
    }

    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchActivity();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, []);

    useEffect(() => {
        fetchActivity();
    }, [fetchActivity]);

    const fetchActivity = useCallback( async () => {
        console.log("Fetching activities...");

        const retrieveData = db.collection("Activity (" + route.params.email + ")");
        retrieveData.get().then((querySnapshot) => {
            activities = querySnapshot.docs.map((doc) => {
                return {id: doc.id, ...doc.data()}
            });

            setActivities(activities);

            const taskTitleQuery = db.collection("Task (" + route.params.email + ")");
            taskTitleQuery.get().then((querySnapshot) => {
                taskNames = querySnapshot.docs.map((doc) => {
                    return {id: doc.id, title: doc.data().title}
                });
            });

            setTaskNames(taskNames);

            taskNames.forEach(doc => {
                taskTitleMap[doc.id] = doc.title;
            });

            setTaskTitleMap(taskTitleMap);

            setRefreshing(false);
        });
    }, []);

    const renderItem = ({item}) => (
        <View>
            <Text style={styles.item}>{item.Action + " " + taskTitleMap[item.TaskID]}</Text>
            <TouchableOpacity onPress={deleteActivity} style={styles.deleteButton}>
                <AntDesign
                    name="delete"
                    size={20}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <Text style={styles.title}>Activity History</Text>
                <Text>Note: Please refresh to see the task title</Text>
                <FlatList
                    data={activities}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>}
                />
            </SafeAreaView>

        </View>
    )
}

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
        alignItems: 'center',
        justifyContent: 'center',
        left: 80,
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingRight: 50,
    },
    deleteButton: {
        backgroundColor: '#DF0000',
        borderRadius: 10,
        padding: 6,
        position: 'absolute',
        top: 15,
        right: 15,
    },
});

export default ActivityHistoryScreen;
