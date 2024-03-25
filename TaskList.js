import {Text, View, Button, FlatList} from 'react-native';
import {FIREBASE_DB} from "./firebase-config";
import {useEffect, useState} from "react";

const TaskList = () => {
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const loadTasks = async () => {
            const querySnapshot = await FIREBASE_DB.collection("Activity (" + route.params.email + ")").get();
            setTasks(querySnapshot);
        }
        loadTasks();
    }, [setTasks]);

    return (
        <FlatList data={locations}
                  renderItem={({ tasks }) => (
                      ...
                      )}
        />
    )
}

export default TaskList;