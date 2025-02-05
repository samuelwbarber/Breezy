import React, { useEffect, useState } from 'react';
import { View, Text as RNText, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { useUser } from '../context/userContext';
import { useRouter } from 'expo-router';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';

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

  // Dummy data for the Measurements Table and charts
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

  // Sample data for the Bar Chart (Total Pollution for the Week)
  const barData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: [120, 140, 110, 160, 150, 130, 170],
      },
    ],
  };

  // Dummy AQI value for real-time air quality summary (1 = best, 100 = worst)
  const [aqiValue] = useState(72);
  const aqiPercentage = aqiValue; // Using the AQI value directly as the percentage

  // Compute a status string based on the AQI value
  const aqiStatus =
    aqiValue <= 33 ? "Good" :
    aqiValue <= 66 ? "Moderate" : "Poor";

  // Function to compute a background color based on the AQI value.
  // It maps 1 (green) to 100 (red) using a hue from 120 (green) to 0 (red).
  const getAQIColor = (rating) => {
    const hue = Math.round(120 - ((rating - 1) / 99) * 120);
    return `hsl(${hue}, 70%, 50%)`;
  };

  useEffect(() => {
    if (currentUser) {
      console.log("User logged in:", currentUser);
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
    router.replace("/signInScreen")
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
            {/* Left: AQI Circle */}
            <AQICircle percentage={aqiPercentage} value={aqiValue} size={100} strokeWidth={10} />
            {/* Right: Recommendation */}
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

        {/* Window 2: Pollution Intake Graph */}
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
            data={barData}
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
              <RNText style={[styles.tableCell, styles.tableHeaderCell]}>Time</RNText>
              <RNText style={[styles.tableCell, styles.tableHeaderCell]}>Pollution Intake</RNText>
            </View>
            <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled={true}>
              {recentRecordings.map((record, index) => (
                <View key={index} style={styles.tableRow}>
                  <RNText style={styles.tableCell}>{record[0]}</RNText>
                  <RNText style={styles.tableCell}>{record[1]}</RNText>
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

