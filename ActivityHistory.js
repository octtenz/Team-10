import React, {useCallback, useEffect, useState} from "react";
import {FlatList, RefreshControl, SafeAreaView, StyleSheet, Text, View} from "react-native";
import {FIREBASE_DB as db} from "./firebase-config";

/**
 * The activity history screen of our app.
 * @param navigation
 * @param route allows us to carry information across screens.
 * @returns {JSX.Element}
 * @constructor
 */
const ActivityHistoryScreen = ({navigation, route}) => {
    /**
     * The list of activities the user has done on their account.
     * @type {activities} our activities list
     */
    let [activities, setActivities] = useState([]);
    /**
     * The names of the task associated with the activity.
     * @type {String[]} the names of tasks associated with an activity
     */
    let [, setTaskNames] = useState([]);
    /**
     * Our helper variables for setting the task names to the activities.
     */
    let [taskTitleMap, setTaskTitleMap] = useState({});
    /**
     * if refreshing is true, that means the page is currently refreshing.
     * @type {boolean} refresh state
     */
    const [refreshing, setRefreshing] = React.useState(false);
    /**
     * Fetches the activities of a user's account.
     * Since it is notated with a unique ID, we must grab the actual
     * title of the task from the task list as well and map it to be displayed as a list.
     * Also used to refresh the page.
     * @type {(function(): Promise<void>)|*}
     */
    const fetchActivity = useCallback(async () => {
        console.log("Fetching activities...");
        // Fetch activities
        const retrieveData = db.collection("Activity (" + route.params.email + ")");
        const querySnapshot = await retrieveData.get();
        let activities = querySnapshot.docs.map((doc) => {
            return {id: doc.id, ...doc.data()};
        });
        setActivities(activities);
        // Query for the titles of the tasks
        const taskTitleQuery = db.collection("Task (" + route.params.email + ")");
        taskTitleQuery.get().then((querySnapshot) => {
            let taskNames = querySnapshot.docs.map((doc) => {
                return {id: doc.id, title: doc.data().title}
            });
            setTaskNames(taskNames);
            // Grabs only the titles from the list of tasks
            let taskTitleMap = {};
            taskNames.forEach(doc => {
                taskTitleMap[doc.id] = doc.title;
            });
            setTaskTitleMap(taskTitleMap);
        });
        setRefreshing(false);
    }, [route.params.email, setRefreshing]);
    /**
     * Enables refreshing function of the activities list.
     * Runs the fetchActivity sequence again if desired by the user.
     * @type {(function(): void)|*}
     */
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
    /**
     * Helper function that renders the date of activities correctly from the server timestamp.
     * @param date a Date
     * @returns {string} a printable date string
     */
    const renderDate = (date) => {
        if (date == null) {
            return "";
        } else {
            let formatted = new Date(date.seconds * 1000 + date.nanoseconds / 1000000)
            return " - " + formatted.toDateString() + " " + formatted.toLocaleTimeString();
        }
    };
    /**
     * Renders the element of each activity from the list to be displayed in the FlatList.
     * @param item an activity
     * @returns {JSX.Element} list element of the FlatList representing each activity.
     */
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