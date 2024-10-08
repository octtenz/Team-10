/**
 * Analysis screen component to display analysis data.
 * @module AnalysisScreen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FIREBASE_DB } from './firebase-config';

/**
 * Analysis screen component.
 * @param {Object} props - The props object containing route information.
 * @param {Object} props.route - React Navigation route object containing email.
 * @returns {JSX.Element} The analysis screen JSX element.
 */
const AnalysisScreen = ({ route }) => {
  const [currentPeriodDayData, setCurrentPeriodDayData] = useState([]);
  const [currentPeriodMonthData, setCurrentPeriodMonthData] = useState([]);
  const [currentPeriodYearData, setCurrentPeriodYearData] = useState([]);
  const [mostProductiveHour, setMostProductiveHour] = useState(null);
  const [mostProductiveDay, setMostProductiveDay] = useState(null);
  const [mostProductiveMonth, setMostProductiveMonth] = useState(null);
  const [taskCategories, setTaskCategories] = useState([]);

  /**
   * Fetches analysis data from Firebase.
   * @async
   * @function fetchData
   * @returns {void}
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching current period data for the current day
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        const activityRef = FIREBASE_DB.collection("Activity (" + route.params.email + ")");
        const currentDaySnapshot = await activityRef
          .where("Action", "==", "COMPLETE")
          .where("Time", ">=", new Date(currentYear, currentMonth - 1, currentDay))
          .where("Time", "<", new Date(currentYear, currentMonth - 1, currentDay + 1))
          .get();
        const currentDayData = currentDaySnapshot.docs.map(doc => doc.data());
        setCurrentPeriodDayData(currentDayData);
        
        // Fetching current period data for the current month
        const currentMonthSnapshot = await activityRef
          .where("Action", "==", "COMPLETE")
          .where("Time", ">=", new Date(currentYear, currentMonth - 1, 1))
          .where("Time", "<", new Date(currentYear, currentMonth, 1))
          .get();
        const currentMonthData = currentMonthSnapshot.docs.map(doc => doc.data());
        setCurrentPeriodMonthData(currentMonthData);

        // Fetching current period data for the current year
        const currentYearSnapshot = await activityRef
          .where("Action", "==", "COMPLETE")
          .where("Time", ">=", new Date(currentYear, 0, 1))
          .where("Time", "<", new Date(currentYear + 1, 0, 1))
          .get();
        const currentYearData = currentYearSnapshot.docs.map(doc => doc.data());
        setCurrentPeriodYearData(currentYearData);

        // Calculate most productive time
        const hoursCountMap = {};
        const daysCountMap = {};
        const monthsCountMap = {};
        currentYearData.forEach(task => {
          const taskHour = new Date(task.Time.seconds * 1000).getHours();
          const taskDate = new Date(task.Time.seconds * 1000).getDate();
          const taskMonth = new Date(task.Time.seconds * 1000).getMonth() + 1;
          if (taskDate === currentDay) {
            hoursCountMap[taskHour] = (hoursCountMap[taskHour] || 0) + 1;
          }
          if (taskMonth === currentMonth) {
            daysCountMap[taskDate] = (daysCountMap[taskDate] || 0) + 1;
          }
          monthsCountMap[taskMonth] = (monthsCountMap[taskMonth] || 0) + 1;
        });

        // Calculate most productive hour
        const mostProductiveHour = Object.keys(hoursCountMap).reduce((a, b) => {
          return hoursCountMap[a] > hoursCountMap[b] ? a : b;
        }, null);
        setMostProductiveHour(`${mostProductiveHour}:00`);

        // Calculate most productive day
        if (Object.keys(daysCountMap).length > 0) {
          const mostProductiveDay = Object.keys(daysCountMap).reduce((a, b) => {
            return daysCountMap[a] > daysCountMap[b] ? a : b;
          }, null);
          setMostProductiveDay(`${currentMonth}/${mostProductiveDay}/${currentYear}`);
        } else {
          setMostProductiveDay("No data available");
        }

        // Calculate most productive month
        const mostProductiveMonth = Object.keys(monthsCountMap).reduce((a, b) => {
          return monthsCountMap[a] > monthsCountMap[b] ? a : b;
        }, null);
        setMostProductiveMonth(convertMonthToString(mostProductiveMonth));

        // Fetch all tasks from the Task collection
        const tasksSnapshot = await FIREBASE_DB.collection("Task (" + route.params.email + ")").get();
        const tasksData = tasksSnapshot.docs.map(doc => doc.data());

        // Fetch all activities
        const allActivitiesSnapshot = await activityRef.get();
        const allActivitiesData = allActivitiesSnapshot.docs.map(doc => doc.data());

        // Filter out deleted tasks from activity list
        const validActivities = allActivitiesData.filter(activity => activity.Action !== "DELETE");

        // Group tasks by tag
        const taskTags = {};
        tasksData.forEach(task => {
          if (task.selectedTags && Array.isArray(task.selectedTags)) {
            task.selectedTags.forEach(tag => {
              if (tag.selected) {
                if (!taskTags[tag.text]) {
                  taskTags[tag.text] = [];
                }
                taskTags[tag.text].push(task);
              }
            });
          }
        });

        // Count completed and incomplete tasks for each tag
        const categories = [];
        for (const tag in taskTags) {
          let completedCount = 0;
          let incompleteCount = 0;
          taskTags[tag].forEach(task => {
            const completed = validActivities.some(activity => activity.TaskID === task.TaskID && activity.Action === "COMPLETE");
            if (completed) {
              completedCount++;
            } else {
              incompleteCount++;
            }
          });
          categories.push({ tag, completedCount, incompleteCount });
        }
        setTaskCategories(categories);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [route.params.email]);

  /**
   * Converts month number to string.
   * @function convertMonthToString
   * @param {number} month - Month number (1-12).
   * @returns {string} The month name.
   */
  const convertMonthToString = (month) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1]; // Adjusting month index to start from 0
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis</Text>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Completed Tasks</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.center]}>Daily</Text>
            <Text style={[styles.tableHeader, styles.center]}>Monthly</Text>
            <Text style={[styles.tableHeader, styles.center]}>Yearly</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.center]}>{currentPeriodDayData.length}</Text>
            <Text style={[styles.tableCell, styles.center]}>{currentPeriodMonthData.length}</Text>
            <Text style={[styles.tableCell, styles.center]}>{currentPeriodYearData.length}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Most Productive Time</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.center]}>In Current Day</Text>
            <Text style={[styles.tableHeader, styles.center]}>In Current Month</Text>
            <Text style={[styles.tableHeader, styles.center]}>In Current Year</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.center]}>{mostProductiveHour}</Text>
            <Text style={[styles.tableCell, styles.center]}>{mostProductiveDay}</Text>
            <Text style={[styles.tableCell, styles.center]}>{mostProductiveMonth}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>Task Categories</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, styles.center]}>Tag</Text>
            <Text style={[styles.tableHeader, styles.center]}>Completed</Text>
            <Text style={[styles.tableHeader, styles.center]}>Incomplete</Text>
          </View>
          {taskCategories.map((category, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={[styles.tableCell, styles.center]}>{category.tag}</Text>
              <Text style={[styles.tableCell, styles.center]}>{category.completedCount}</Text>
              <Text style={[styles.tableCell, styles.center]}>{category.incompleteCount}</Text>
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
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    padding: 10,
    width: '100%',
    textAlign: 'center',
    color: '#1e90ff',
  },
  tableContainer: {
    marginBottom: 20,
    width: '100%',
  },
  tableTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center', // Center the title text
    color: 'black',
  },
  table: {
    borderWidth: 1,
    borderColor: 'black',
    width: '100%',
    marginBottom: 30,
    backgroundColor: '#e0f0ff'
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'black',
  },
  tableHeader: {
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AnalysisScreen;
