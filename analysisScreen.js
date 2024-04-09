import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import {FIREBASE_DB as db} from "./firebase-config";

const AnalysisScreen = () => {
  const [data, setData] = useState({
    currentPeriod: [],
    lastPeriod: [],
    mostProductiveTime: '',
    categories: { remainingTasks: {}, completedTasks: {} }
  });

  useEffect(() => {
    // example data just to see format
    const currentPeriodData = [{ day: 1, month: 'January', year: 2024 }];
    const lastPeriodData = [{ day: 1, month: 'December', year: 2023 }];

    const mostProductiveTimeData = { day: 'Your most productive time is on Monday', timePeriod: 'between 10:30 and 11:30 am !' };

    const categoriesData = {
      remainingTasks: { Math: 5, Science: 3 },
      completedTasks: { Math: 10, Science: 7 }
    };

    setData({
      currentPeriod: currentPeriodData,
      lastPeriod: lastPeriodData,
      mostProductiveTime: mostProductiveTimeData,
      categories: categoriesData
    });
  }, []);

  //fetching data from firebase
  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const categoriesRef = FIREBASE_DB.collection('categories');
        const snapshot = await categoriesRef.get();

        if (!snapshot.empty) {
          let remainingTasks = {};
          let completedTasks = {};

          snapshot.forEach((doc) => {
            const { tag, status } = doc.data();
            if (status === 'remaining') {
              remainingTasks[tag] = (remainingTasks[tag] || 0) + 1;
            } else if (status === 'completed') {
              completedTasks[tag] = (completedTasks[tag] || 0) + 1;
            }
          });

          setData((prevData) => ({
            ...prevData,
            categories: { remainingTasks, completedTasks }
          }));
        }
      } catch (error) {
        console.error('Error fetching categories data:', error);
      }
    };

    fetchCategoriesData();
  }, []);

  const [showAddTagsModal, setShowAddTagsModal] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    setShowAddTagsModal(false);
  };

  //fetching data from firebase for you completed section
  useEffect(() => {
    const fetchCompletedTasksData = async () => {
      try {
        const currentPeriodSnapshot = await FIREBASE_DB.collection('completedTasks')
          .where('period', '==', 'current')
          .get();

        const lastPeriodSnapshot = await FIREBASE_DB.collection('completedTasks')
          .where('period', '==', 'last')
          .get();

        const currentPeriodData = currentPeriodSnapshot.docs.map((doc) => doc.data());
        const lastPeriodData = lastPeriodSnapshot.docs.map((doc) => doc.data());

        setData((prevData) => ({
          ...prevData,
          currentPeriod: currentPeriodData,
          lastPeriod: lastPeriodData
        }));
      } catch (error) {
        console.error('Error fetching completed tasks data:', error);
      }
    };

    fetchCompletedTasksData();
  }, []);

  //fetching data for the most productive time section
  useEffect(() => {
    const fetchMostProductiveTimeData = async () => {
      try {
        const mostProductiveTimeRef = FIREBASE_DB.collection('mostProductiveTime');
        const snapshot = await mostProductiveTimeRef.get();

        if (!snapshot.empty) {
          let mostProductiveTimeData = {};

          snapshot.forEach((doc) => {
            const { day, timePeriod } = doc.data();
            mostProductiveTimeData = { day, timePeriod };
          });

          setData((prevData) => ({
            ...prevData,
            mostProductiveTime: mostProductiveTimeData
          }));
        }
      } catch (error) {
        console.error('Error fetching most productive time data:', error);
      }
    };

    fetchMostProductiveTimeData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: '#1e90ff' }]}>Analysis</Text>

      <Text style={[styles.heading, { color: 'black' }]}>You Completed:</Text>
      <View style={[styles.section, styles.lightBlueBackground]}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.center]}> </Text>
            <Text style={[styles.tableHeader, styles.center]}>Day</Text>
            <Text style={[styles.tableHeader, styles.center]}>Month</Text>
            <Text style={[styles.tableHeader, styles.center]}>Year</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.center]}>This Period</Text>
            {data.currentPeriod.map((item, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={styles.center}>{item.day}</Text>
              </View>
            ))}
            {data.currentPeriod.map((item, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={styles.center}>{item.month}</Text>
              </View>
            ))}
            {data.currentPeriod.map((item, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={styles.center}>{item.year}</Text>
              </View>
            ))}
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.center]}>Last Period</Text>
            {data.lastPeriod.map((item, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={styles.center}>{item.day}</Text>
              </View>
            ))}
            {data.lastPeriod.map((item, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={styles.center}>{item.month}</Text>
              </View>
            ))}
            {data.lastPeriod.map((item, index) => (
              <View key={index} style={styles.tableCell}>
                <Text style={styles.center}>{item.year}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <Text style={[styles.heading, { color: 'black' }]}>Most Productive Time:</Text>
      <View style={[styles.section, styles.lightBlueBackground]}>
        <Text style={styles.center}>{data.mostProductiveTime.day} - {data.mostProductiveTime.timePeriod}</Text>
      </View>

      <Text style={[styles.heading, { color: 'black' }]}>Categories:</Text>
      <View style={[styles.section, styles.lightBlueBackground]}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.left]}>Tags</Text>
            <Text style={[styles.tableHeader, styles.left]}>Number Left</Text>
          </View>
          {Object.keys(data.categories.remainingTasks).map((key) => (
            <View style={styles.tableRow} key={key}>
              <Text style={[styles.tableCell, styles.left]}>Remaining Tasks</Text>
              <Text style={[styles.tableCell, styles.left]}>{key}</Text>
              <Text style={[styles.tableCell, styles.left]}>{data.categories.remainingTasks[key]}</Text>
            </View>
          ))}
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.left]}>Tags</Text>
            <Text style={[styles.tableHeader, styles.left]}>Number Done</Text>
          </View>
          {Object.keys(data.categories.completedTasks).map((key) => (
            <View style={styles.tableRow} key={key}>
              <Text style={[styles.tableCell, styles.left]}>Completed Tasks</Text>
              <Text style={[styles.tableCell, styles.left]}>{key}</Text>
              <Text style={[styles.tableCell, styles.left]}>{data.categories.completedTasks[key]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    padding: 10,
    width: '100%',
    textAlign: 'center'
  },
  section: {
    borderWidth: 1,
    borderColor: 'black',
    marginBottom: 20,
    width: '100%'
  },
  lightBlueBackground: {
    backgroundColor: '#e0f0ff'
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10
  },
  table: {
    flexDirection: 'column',
    marginBottom: 20,
    width: '100%'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'black'
  },
  tableHeader: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold'
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    borderEndWidth: 1,
    borderRightColor: 'black'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  left: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
  }
});

export default AnalysisScreen;
