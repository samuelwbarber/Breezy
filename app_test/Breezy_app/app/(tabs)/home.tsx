import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text as RNText, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  RefreshControl,
  ActivityIndicator
} from 'react-native';
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
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ddd"
          strokeWidth={strokeWidth}
          fill="none"
        />
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
      <SvgText
        x={size / 2}
        y={size / 2 + 8}
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
  const [refreshing, setRefreshing] = useState(false);

  // Get measurements from the user data
  const measurements = currentUser?.messageLog || [];
  const validMeasurements = measurements.filter(
    (m) => m.date && m.eco2 != null && m.tvoc != null
  );

  // -------------------------
  // Prepare data for the Pollution Intake Graph (Line Chart) for current day
  // -------------------------
  const today = new Date();
  const todayMeasurements = validMeasurements.filter((m) => {
    const d = new Date(m.date);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  });

  // Create data points for each hour from 0 up to the current hour.
  // Instead of averaging, use only the first (earliest) measurement for that hour.
  const currentHour = today.getHours();
  const lineLabels = [];
  const lineDataPoints = [];
  for (let h = 0; h <= currentHour; h++) {
    lineLabels.push(`${h}`);
    const measurementsInHour = todayMeasurements.filter(
      (m) => new Date(m.date).getHours() === h
    );
    if (measurementsInHour.length > 0) {
      // Sort by time and take the earliest measurement
      measurementsInHour.sort((a, b) => new Date(a.date) - new Date(b.date));
      const firstMeasurement = measurementsInHour[0];
      lineDataPoints.push(firstMeasurement.eco2);
    } else {
      lineDataPoints.push(0);
    }
  }

  // -------------------------
  // Prepare data for the Bar Chart (Total Pollution for the Week)
  // -------------------------
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  console.log("Current week - Monday:", monday, "Sunday:", sunday);

  const currentWeekMeasurements = validMeasurements.filter((m) => {
    const mDate = new Date(m.date);
    return mDate >= monday && mDate <= sunday;
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const pollutionByDay: { [day: string]: { sum: number; count: number } } = {
    Mon: { sum: 0, count: 0 },
    Tue: { sum: 0, count: 0 },
    Wed: { sum: 0, count: 0 },
    Thu: { sum: 0, count: 0 },
    Fri: { sum: 0, count: 0 },
    Sat: { sum: 0, count: 0 },
    Sun: { sum: 0, count: 0 },
  };

  currentWeekMeasurements.forEach((m) => {
    const d = new Date(m.date);
    const dayIndex = (d.getDay() + 6) % 7;
    const dayName = weekDays[dayIndex];
    pollutionByDay[dayName].sum += m.eco2;
    pollutionByDay[dayName].count += 1;
  });
  console.log("Pollution by day:", pollutionByDay);

  const weeklyPollutionData = weekDays.map((day) => {
    const { sum, count } = pollutionByDay[day];
    return count > 0 ? sum / count : 0;
  });
  console.log("Weekly pollution data:", weeklyPollutionData);

  const updatedBarData = {
    labels: weekDays,
    datasets: [
      {
        data: weeklyPollutionData,
      },
    ],
  };
  console.log("Updated bar chart data:", updatedBarData);

  // -------------------------
  // Prepare data for the Measurements Table (most recent at top)
  // -------------------------
  const recentValidMeasurements = validMeasurements.slice(-100).reverse();

  // -------------------------
  // Compute Current Air Quality Indicator from Last 10 Measurements
  // -------------------------
  const last10Measurements = validMeasurements.slice(-10);
  let averageEco2 = 400; // default baseline if no measurements
  if (last10Measurements.length > 0) {
    averageEco2 = last10Measurements.reduce((sum, m) => sum + m.eco2, 0) / last10Measurements.length;
  }
  console.log("Last 10 average eco2:", averageEco2);

  const baseline = 400;
  const factor = 5;
  let computedScore = 100;
  if (last10Measurements.length > 0) {
    computedScore = 100 - ((averageEco2 - baseline) / factor);
    if (computedScore > 100) computedScore = 100;
    if (computedScore < 0) computedScore = 0;
  }
  console.log("Computed air quality score:", computedScore);

  let airQualityState = "";
  if (computedScore >= 90) {
    airQualityState = "Excellent";
  } else if (computedScore >= 75) {
    airQualityState = "Good";
  } else if (computedScore >= 50) {
    airQualityState = "Fair";
  } else {
    airQualityState = "Poor";
  }
  console.log("Air quality state:", airQualityState);

  const getAQIColor = (score: number) => {
    const hue = Math.round((score / 100) * 120);
    return `hsl(${hue}, 70%, 50%)`;
  };

  // -------------------------
  // Periodically refetch user data every 10 seconds.
  // -------------------------
  useEffect(() => {
    let interval: number | undefined;
    if (currentUser) {
      // Immediately fetch once.
      fetchUserDataForUser(currentUser).then((updatedUser) => {
        if (updatedUser) {
          setCurrentUser(updatedUser);
        }
      });
      interval = setInterval(() => {
        fetchUserDataForUser(currentUser).then((updatedUser) => {
          if (updatedUser) {
            setCurrentUser(updatedUser);
          }
        });
      }, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentUser]);

  // -------------------------
  // Implement pull-to-refresh (Instagram-like behavior)
  // -------------------------
  const onRefresh = async () => {
    if (currentUser) {
      setRefreshing(true);
      const updatedUser = await fetchUserDataForUser(currentUser);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      setRefreshing(false);
    }
  };

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
    stopLocationUpdates();
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

      {/* Scrollable Content with Pull-to-Refresh */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Window 1: Real-Time Air Quality Summary (Updated) */}
        <View style={[styles.window, { backgroundColor: getAQIColor(computedScore) }]}>
          <RNText style={[styles.windowHeader, { color: "#fff" }]}>Current Air Quality</RNText>
          <View style={styles.aqiContainer}>
            <AQICircle percentage={computedScore} value={Math.round(computedScore)} size={100} strokeWidth={10} />
            <View style={styles.aqiTextContainer}>
              <RNText style={[styles.aqiStatusText, { color: "#fff" }]}>{airQualityState}</RNText>
              <RNText style={[styles.aqiRecommendation, { color: "#fff" }]}>
                {airQualityState === "Excellent"
                  ? "Air quality is optimal."
                  : airQualityState === "Good"
                  ? "Air quality is good."
                  : airQualityState === "Fair"
                  ? "Air quality is moderate."
                  : "Air quality is poor. Take precautions."}
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
