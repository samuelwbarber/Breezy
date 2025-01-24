import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Statistics() {
  
  // States for sensor data and cumulative data

  const [sensorData, setSensorData] = useState({
    CO: { name: "CO", value: 0 },
    SO2: { name: "SO₂", value: 0},
    NO2: { name: "NO₂", value: 0},
  });

  const [cumulativeExposure, setCumulativeExposure] = useState({
    CO: 0,
    SO2: 0,
    NO2: 0,
  });



  // fake dummy data to populate our table. usEffect does this kinda stuff apparently
  // the empty dependency array at the end makes sure the code only runs once (when the component mounts)
  // we clear up the Interval when we leave
  
  useEffect(() => {
    const interval = setInterval(() => { //setInterval runs a function every 2sec (2000ms)
      setSensorData((prevData) => {
        const newData = {
          CO: { ...prevData.CO, value: (Math.random() * 50).toFixed(2) },
          SO2: { ...prevData.SO2, value: (Math.random() * 100).toFixed(2) },
          NO2: { ...prevData.NO2, value: (Math.random() * 30).toFixed(2) },
        };

        setCumulativeExposure((prevExposure) => ({
          CO: prevExposure.CO + parseFloat(newData.CO.value) * 0.001, // scaling based on how much we think someone has inhaled
          SO2: prevExposure.SO2 + parseFloat(newData.SO2.value) * 0.001,
          NO2: prevExposure.NO2 + parseFloat(newData.NO2.value) * 0.001,
        }));

        return newData;
      });
    }, 2000); 

    //return () => clearInterval(interval); 
    //this stops us from calculating the cumulative exposure when we move away from that screen
    //we could get rid of it, but then it still only runs when the app is open
    //its prob not that deep
  }, []);

  

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Real-Time Sensor Data</Text>

      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={[styles.cell, styles.headerCell]}>Sensor</Text>
          <Text style={[styles.cell, styles.headerCell]}>Value [ppm]</Text>
        </View>
        {Object.values(sensorData).map((sensor) => (
          <View style={styles.row} key={sensor.name}>
            <Text style={styles.cell}>{sensor.name}</Text>
            <Text style={styles.cell}>{sensor.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.cumulativeContainer}>
        <Text style={styles.subHeader}>Pollutants Inhaled Today</Text>
        {Object.entries(cumulativeExposure).map(([key, value]) => (
          <Text style={styles.cumulativeText} key={key}>
            {key}: {value.toFixed(2)} mg
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#25292e",
    padding: 20,
    alignItems: "center",
  },
  header: {
    color: "#ffd33d",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    fontSize: 18,
    textDecorationLine: "underline",
    color: "#f00",
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  cell: {
    flex: 1,
    color: "#fff",
    textAlign: "center",
    fontSize:20
  },
  headerCell: {
    fontWeight: "bold",
    color: "#ffd33d",
    fontSize:20
  },
  cumulativeContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  subHeader: {
    color: "#ffd33d",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cumulativeText: {
    color: "#fff",
    fontSize: 20,
    marginVertical: 5,
  },
});
