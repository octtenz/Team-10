import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import {FIREBASE_DB} from "./firebase-config";

const AnalysisScreen = () => {
  const [data, setData] = useState({
    currentPeriod: [],
    lastPeriod: [],
    mostProductiveTime: '',
    categories: { remainingTasks: {}, completedTasks: {} }
  });

// Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch current period data
        const currentPeriodSnapshot = await db.collection('currentPeriod').get();
        const currentPeriodData = currentPeriodSnapshot.docs.map(doc => doc.data());

        // Fetch last period data
        const lastPeriodSnapshot = await db.collection('lastPeriod').get();
        const lastPeriodData = lastPeriodSnapshot.docs.map(doc => doc.data());

        // Fetch most productive time data
        const mostProductiveTimeSnapshot = await db.collection('mostProductiveTime').get();
        let mostProductiveTimeData = {};
        mostProductiveTimeSnapshot.forEach(doc => {
          mostProductiveTimeData = doc.data();
        });

        // Fetch categories data
        const categoriesSnapshot = await db.collection('categories').get();
        let remainingTasks = {};
        let completedTasks = {};
        categoriesSnapshot.forEach(doc => {
          const { tag, status } = doc.data();
          if (status === 'remaining') {
            remainingTasks[tag] = (remainingTasks[tag] || 0) + 1;
          } else if (status === 'completed') {
            completedTasks[tag] = (completedTasks[tag] || 0) + 1;
          }
        });

        // Update state with fetched data
        setData({
          currentPeriod: currentPeriodData,
          lastPeriod: lastPeriodData,
          mostProductiveTime: mostProductiveTimeData,
          categories: { remainingTasks, completedTasks }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
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
              <View style={[styles.tableCell, styles.left]}>
                {key === 'Math' || key === 'Science' ? (
                  <View style={styles.circle}>
                    <Text style={[styles.center, { color: 'white' }]}>{key}</Text>
                  </View>
                ) : (
                  <Text style={styles.center}>{key}</Text>
                )}
              </View>
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
              <View style={[styles.tableCell, styles.left]}>
                {key === 'Math' || key === 'Science' ? (
                  <View style={styles.circle}>
                    <Text style={[styles.center, { color: 'white' }]}>{key}</Text>
                  </View>
                ) : (
                  <Text style={styles.center}>{key}</Text>
                )}
              </View>
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
  },
  circle: {
    width: 'auto',
    backgroundColor: '#66ccff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100
  }
});

export default AnalysisScreen;
