import React, {useCallback, useEffect, useState} from "react";
import {FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View} from "react-native";
import {FIREBASE_DB as db} from "./firebase-config";

const ActivityHistoryScreen = ({navigation, route}) => {

    let [activities, setActivities] = useState([]);

    let [, setTaskNames] = useState([]);

    let [taskTitleMap, setTaskTitleMap] = useState({});

    const [refreshing, setRefreshing] = React.useState(false);

    const fetchActivity = useCallback(async () => {
        console.log("Fetching activities...");

        const retrieveData = db.collection("Activity (" + route.params.email + ")");
        const querySnapshot = await retrieveData.get();
        let activities = querySnapshot.docs.map((doc) => {
            return {id: doc.id, ...doc.data()};
        });
        setActivities(activities);
        const taskTitleQuery = db.collection("Task (" + route.params.email + ")");
        taskTitleQuery.get().then((querySnapshot) => {
            let taskNames = querySnapshot.docs.map((doc) => {
                return {id: doc.id, title: doc.data().title}
            });
            setTaskNames(taskNames);
            let taskTitleMap = {};
            taskNames.forEach(doc => {
                taskTitleMap[doc.id] = doc.title;
            });
            setTaskTitleMap(taskTitleMap);
        });
        setRefreshing(false);
    }, [route.params.email, setRefreshing]);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchActivity();
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    }, [setRefreshing, fetchActivity]);

    useEffect(() => {
        return navigation.addListener('focus', () => {
            fetchActivity();
        });
    }, [navigation, fetchActivity]);

    const renderDate = (date) => {
        if (date == null) {
            return "";
        } else {
            let formatted = new Date(date.seconds * 1000 + date.nanoseconds / 1000000)
            return " - " + formatted.toDateString() + " " + formatted.toLocaleTimeString();
        }
    };

    const renderItem = ({item}) => (
        <View>
            <Text style={styles.item}>{item.Action + " " + taskTitleMap[item.TaskID] + renderDate(item.Time)}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView>
                <Text style={styles.title}>Activity History</Text>
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
        backgroundColor: 'white',
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