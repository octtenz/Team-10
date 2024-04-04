import React, {useEffect, useState} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, RefreshControl} from 'react-native';
import {FontAwesome} from '@expo/vector-icons';
import {FIREBASE_DB as db} from "./firebase-config";
import Checkbox from 'expo-checkbox';
import SortField from "./dropDownSort";

//TODO add checkbox, add edit task, add delete button
const HomeScreen = ({ navigation, route }) => {
  const goToCreation = () => {
    route.params.tasks = tasks;
    route.params.currentTaskID = null;
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

  let [tasks,setTasks] = useState([]);

  const DropdownComponent = () => {
    const [value, setValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const renderLabel = () => {
      if (value || isFocus) {
        return (
            <Text style={[styles.label, isFocus && {color: 'blue'}]}>
              Sort tasks
            </Text>
        );
      }
      return null;
    };
  }

  useEffect(() => {
    fetchTasks();
  }, []);

      const fetchTasks = async () => {
        const retrieveData = db.collection("Task (" + route.params.email + ")");
        retrieveData.get().then((querySnapshot) => {
          tasks = querySnapshot.docs.map((doc) => {
          return {id: doc.id,...doc.data()}
        });
        setTasks(tasks);
        setRefreshing(false);
      })
      }
      const renderItem = ({item}) => (
          <Text style={styles.item}>{item.title}</Text>
      );

  return (

    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      <TouchableOpacity onPress={goToSettings} style={[styles.settingButton, styles.button]}>
        <FontAwesome name="cog" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={goToCreation} style={[styles.creationButton, styles.button]}>
        <Text style={styles.buttonText}>Create Task</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={goToActivity} style={[styles.ActivityButton, styles.button]}>
        <Text style={styles.buttonText}>Activity History</Text>
      </TouchableOpacity>
      <SafeAreaView>
        <SortField/>
        <FlatList
            data={tasks}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  },
  button: {
    position: 'absolute',
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingButton: {
    top: 20,
    right: 20,
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
    padding: 15,
    fontSize: 20,
    marginTop: 5,
    fontWeight: 'bold',
    backgroundColor: '#BDDBF1',
    width: 300,
    borderColor: '#000',
    borderWidth: 2,

  }
});

export default HomeScreen;
