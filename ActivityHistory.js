import React, {useEffect, useState} from "react";
import {View, StyleSheet, Text, SafeAreaView, FlatList, RefreshControl} from "react-native";
import {FIREBASE_DB as db} from "./firebase-config";

const ActivityHistoryScreen = ({navigation,route}) => {
    // TODO Match activity history to actual task, and not just task ID.
    // TODO add delete button to history.

    let [activities, setActivities] = useState([]);

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
    }, []);

    const fetchActivity = async () => {
        const retrieveData = db.collection("Activity (" + route.params.email + ")");
        retrieveData.get().then((querySnapshot) => {
            activities = querySnapshot.docs.map((doc) => {
                return {id: doc.id,...doc.data()}
            });
            setActivities(activities);
            setRefreshing(false);
        })
    }

    const renderItem = ({item}) => (
        <Text style={styles.item}>{item.Action + " " + item.TaskID}</Text>
    );

    return(
        <View style={styles.container}>
            <SafeAreaView>
                <Text style={styles.title}> Activity History</Text>
                <FlatList
                    data={activities}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />
            </SafeAreaView>

        </View>
    )
}

const styles= StyleSheet.create({
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
    },
    item: {
        padding: 15,
        fontSize: 20,
        marginTop: 5,
        fontWeight: 'bold',
        backgroundColor: '#BDDBF1',
        width: 300,
        borderColor: '#000',
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',

    },
});

export default ActivityHistoryScreen;