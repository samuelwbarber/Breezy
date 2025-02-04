import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useUser } from '../../context/userContext';
import { useRouter } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons'; // Importing vector icons

export default function HomeScreen() {
  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  // Sample recordings array: each element is [time, pollution intake]
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

  // Extract labels and data points for the chart
  const labels = recentRecordings.map(record => record[0]);
  const dataPoints = recentRecordings.map(record => parseFloat(record[1]));

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
        <Text>Please log in.</Text>
      </View>
    );
  }

  // Handlers for the menu options
  const handleAccount = () => {
    // Placeholder for account functionality
    console.log("Account tapped");
    setMenuVisible(false);
  };

  const handlePairDevice = () => {
    // Placeholder for pair device functionality
    console.log("Pair Device tapped");
    setMenuVisible(false);
  };

  const handleLogOut = () => {
    setCurrentUser(null);
    setMenuVisible(false);
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Gear Icon */}
      <View style={styles.topBar}>
        <Text style={styles.header}>Welcome, {currentUser.name}!!</Text>
        <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.iconButton}>
          <Ionicons name="ios-settings" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.windowsContainer}>
        {/* Window 1: Recordings Table */}
        <View style={styles.window}>
          <Text style={styles.windowHeader}>Recordings</Text>
          <View style={styles.table}>
            {/* Table header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>Time</Text>
              <Text style={[styles.tableCell, styles.tableHeaderCell]}>Pollution Intake</Text>
            </View>
            {/* Table body */}
            <ScrollView style={{ maxHeight: 150 }}>
              {recentRecordings.map((record, index) => (
                <View key={index} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{record[0]}</Text>
                  <Text style={styles.tableCell}>{record[1]}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Window 2: Pollution Intake Graph */}
        <View style={styles.window}>
          <Text style={styles.windowHeader}>Pollution Intake Graph</Text>
          <ScrollView horizontal>
            <LineChart
              data={{
                labels: labels,
                datasets: [{ data: dataPoints }],
              }}
              width={300} // Adjust the width as needed
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
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </ScrollView>
        </View>
      </View>

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
              <Text style={styles.menuText}>Account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handlePairDevice}>
              <Text style={styles.menuText}>Pair Device</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={handleLogOut}>
              <Text style={[styles.menuText, { color: "red" }]}>Log Out</Text>
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
    paddingTop: 40, // Leave space for the top bar
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
  windowsContainer: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  window: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Android shadow
    elevation: 3,
  },
  windowHeader: {
    fontSize: 18,
    marginBottom: 8,
    fontWeight: 'bold',
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
    // Shadow for iOS
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    // Elevation for Android
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
