import React, { useEffect, useState } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useUser } from '../context/userContext';
import { useRouter } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { startLocationUpdates, stopLocationUpdates } from '../api/locationTask';
import { fetchUserDataForUser } from '../api/auth';

// A custom component for the AQI circular progress indicator with the AQI number inside
const AQICircle = ({ percentage, value, size = 100, strokeWidth = 10 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - percentage / 100);

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ddd"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#fff"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </G>
      {/* AQI Number in the Center */}
      <SvgText
        x={size / 2}
        y={size / 2 + 8} // Adjust vertical centering as needed
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill="#fff">
        {value}
      </SvgText>
    </Svg>
  );
};

export default function HomeScreen() {
  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  // Dummy data for the Pollution Intake Graph (Window 2) remains unchanged.
  const recordings = [
    ["10:00 AM", "50"],
    ["10:05 AM", "55"],
    ["10:10 AM", "53"],
    ["10:15 AM", "52"],
    ["10:20 AM", "60"],
    ["10:25 AM", "59"],
  ];
  const n = 5; // Number of recent recordings to display
  const recentRecordings = recordings.slice(-n);
  const lineLabels = recentRecordings.map(record => record[0]);
  const lineDataPoints = recentRecordings.map(record => parseFloat(record[1]));

  // -------------------------
  // Prepare data for the Bar Chart (Window 3)
  // -------------------------
  // We use currentUser.messageLog as our measurement data.
  // Each measurement should have at least: { date, eco2, tvoc, ... }
  const measurements = currentUser?.messageLog || [];
  // Filter valid measurements (must have a date, and eco2 and tvoc not null)
  const validMeasurements = measurements.filter(
    (m) => m.date && m.eco2 != null && m.tvoc != null
  );

  // Determine the current week (assuming week starts on Monday and ends on Sunday)
  const now = new Date();
  // Calculate Monday: if getDay() returns 0 for Sunday, adjust accordingly.
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  // Filter measurements that are within the current week.
  const currentWeekMeasurements = validMeasurements.filter((m) => {
    const mDate = new Date(m.date);
    return mDate >= monday && mDate <= sunday;
  });

  // Group measurements by day (using eco2 for pollution measurement)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pollutionByDay: { [day: string]: { sum: number; count: number } } = {
    "Mon": { sum: 0, count: 0 },
    "Tue": { sum: 0, count: 0 },
    "Wed": { sum: 0, count: 0 },
    "Thu": { sum: 0, count: 0 },
    "Fri": { sum: 0, count: 0 },
    "Sat": { sum: 0, count: 0 },
    "Sun": { sum: 0, count: 0 },
  };

  currentWeekMeasurements.forEach((m) => {
    const d = new Date(m.date);
    // Adjust getDay() so that Monday is index 0, Tuesday is 1, ..., Sunday is 6.
    const dayIndex = (d.getDay() + 6) % 7;
    const dayName = weekDays[dayIndex];
    pollutionByDay[dayName].sum += m.eco2;
    pollutionByDay[dayName].count += 1;
  });

  // Calculate average eco2 for each day (or 0 if no measurements)
  const weeklyPollutionData = weekDays.map((day) => {
    const { sum, count } = pollutionByDay[day];
    return count > 0 ? sum / count : 0;
  });

  const updatedBarData = {
    labels: weekDays,
    datasets: [
      {
        data: weeklyPollutionData,
      },
    ],
  };

  // -------------------------
  // Prepare data for the Measurements Table (Window 4)
  // -------------------------
  // Take at most the last 100 valid entries.
  const recentValidMeasurements = validMeasurements.slice(-100);

  // Dummy AQI value for real-time air quality summary (Window 1)
  const [aqiValue] = useState(72);
  const aqiPercentage = aqiValue;
  const aqiStatus =
    aqiValue <= 33 ? "Good" :
    aqiValue <= 66 ? "Moderate" : "Poor";

  // Function to compute background color based on AQI value.
  const getAQIColor = (rating) => {
    const hue = Math.round(120 - ((rating - 1) / 99) * 120);
    return `hsl(${hue}, 70%, 50%)`;
  };

  useEffect(() => {
    if (currentUser) {
      // Fetch updated user data asynchronously and update state.
      fetchUserDataForUser(currentUser).then((updatedUser) => {
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      });
      startLocationUpdates(currentUser.email);
    } else {
      console.log("User logged out");
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <RNText>Please log in.</RNText>
      </View>
    );
  }

  // Handlers for the menu options
  const handleAccount = () => {
    console.log("Account tapped");
    setMenuVisible(false);
  };

  const handlePairDevice = () => {
    setMenuVisible(false);
    router.push('/pair_device');
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setMenuVisible(false);
    router.replace("/signInScreen");
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Gear Icon */}
      <View style={styles.topBar}>
        <RNText style={styles.header}>Welcome, {currentUser.name}!!</RNText>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconButton}>
          <Ionicons name="settings-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Window 1: Real-Time AQI Summary with Circular Progress */}
        <View style={[styles.window, { backgroundColor: getAQIColor(aqiValue) }]}>
          <RNText style={[styles.windowHeader, { color: "#fff" }]}>Current Air Quality</RNText>
          <View style={styles.aqiContainer}>
            <AQICircle percentage={aqiPercentage} value={aqiValue} size={100} strokeWidth={10} />
            <View style={styles.aqiTextContainer}>
              <RNText style={[styles.aqiStatusText, { color: "#fff" }]}>{aqiStatus}</RNText>
              <RNText style={[styles.aqiRecommendation, { color: "#fff" }]}>
                {aqiValue <= 33
                  ? "Great air quality! Enjoy your day outdoors."
                  : aqiValue <= 66
                  ? "Moderate air quality. Consider taking breaks if needed."
                  : "Poor air quality. Limit outdoor activities if possible."}
              </RNText>
            </View>
          </View>
        </View>

        {/* Window 2: Pollution Intake Graph (Line Chart) */}
        <View style={styles.window}>
          <RNText style={styles.windowHeader}>Pollution Intake Graph</RNText>
          <ScrollView horizontal>
            <LineChart
              data={{
                labels: lineLabels,
                datasets: [{ data: lineDataPoints }],
              }}
              width={300}
              height={220}
              yAxisSuffix=""
              yAxisInterval={1}
              chartConfig={{
                backgroundColor: "#e26a00",
                backgroundGradientFrom: "#fb8c00",
                backgroundGradientTo: "#ffa726",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </ScrollView>
        </View>

        {/* Window 3: Total Pollution for the Week (Bar Chart) */}
        <View style={styles.window}>
          <RNText style={styles.windowHeader}>Total Pollution for the Week</RNText>
          <BarChart
            data={updatedBarData}
            width={300}
            height={220}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </View>

        {/* Window 4: Measurements Table */}
        <View style={styles.window}>
          <RNText style={styles.windowHeader}>Measurements</RNText>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <RNText style={[styles.tableCell, styles.tableHeaderCell]}>Date</RNText>
              <RNText style={[styles.tableCell, styles.tableHeaderCell]}>eCO2</RNText>
              <RNText style={[styles.tableCell, styles.tableHeaderCell]}>TVOC</RNText>
            </View>
            <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
              {recentValidMeasurements.map((measurement, index) => (
                <View key={index} style={styles.tableRow}>
                  <RNText style={styles.tableCell}>
                    {new Date(measurement.date).toLocaleString()}
                  </RNText>
                  <RNText style={styles.tableCell}>
                    {measurement.eco2}
                  </RNText>
                  <RNText style={styles.tableCell}>
                    {measurement.tvoc}
                  </RNText>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Menu Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleAccount}>
              <RNText style={styles.menuText}>Account</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handlePairDevice}>
              <RNText style={styles.menuText}>Pair Device</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogOut}>
              <RNText style={[styles.menuText, { color: "red" }]}>Log Out</RNText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    paddingTop: 40,
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    fontSize: 20,
  },
  iconButton: {
    padding: 8,
  },
  window: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  windowHeader: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  aqiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aqiTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  aqiStatusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  aqiRecommendation: {
    fontSize: 14,
    marginTop: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
  },
  tableHeaderCell: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 60,
    marginRight: 16,
    paddingVertical: 8,
    minWidth: 150,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  menuText: {
    fontSize: 16,
  },
});
