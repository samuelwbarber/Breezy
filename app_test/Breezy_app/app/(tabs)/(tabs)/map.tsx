import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/app/context/userContext";
import { SERVER_URL } from "@/app/config";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DateTimePicker from "@react-native-community/datetimepicker";

interface HeatmapPoint extends LatLng {
  weight: number;
}

export default function MapScreen() {
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const { currentUser } = useUser();
  const [range, setRange] = useState([0, 24]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true); // Start with loading

  useEffect(() => {
    const fetchHeatmapData = async () => {
      if (!currentUser) {
        console.warn("No current user found.");
        setHeatmapData([{ latitude: 51.5074, longitude: -0.1278, weight: 20 }]);
        setLoading(false);
        return;
      }

      console.log(`Fetching Map for ${currentUser.name} at ${SERVER_URL}`);
      setLoading(true); // Set loading true when fetching starts

      try {
        const response = await fetch(`${SERVER_URL}/user-data/${currentUser.id}`);
        console.log("API Response Status:", response.status);
        if (!response.ok) {
          console.error("Error fetching heatmap data:", response.statusText);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data) && data.length === 0) {
          console.warn("No points found for the user.");
          setHeatmapData([{ latitude: 51.5074, longitude: -0.1278, weight: 20 }]);
          setLoading(false);
          return;
        }

        let formattedData = data.map((point: any) => ({
          latitude: parseFloat(point.latitude),
          longitude: parseFloat(point.longitude),
          weight: parseFloat(point.weight),
        }));

        // Limit data to 100 points
        if (formattedData.length > 100) {
          formattedData = formattedData.slice(0, 100);
        }

        console.log("Formatted Heatmap Data");
        setHeatmapData(formattedData);
        setLoading(false);

      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [currentUser]);

  // Debug: Log heatmap data when updated
  useEffect(() => {
    console.log("Updated heatmap data:", heatmapData.length);
  }, [heatmapData]);

  // Format date as DD/MM/YY
  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Heatmap Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
        {heatmapData.length > 1 ? (
          <Heatmap points={heatmapData} />
        ) : (
          <Text>No heatmap data available</Text>
        )}
      </MapView>

      {/* Updated Slider Container */}
      <View style={styles.sliderContainer}>
        {/* Date Selector Button */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>
            {formatDate(selectedDate)}
          </Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
          />
        )}
        <Text style={styles.sliderLabel}>
          Selected Time Range: {range[0]}:00 - {range[1]}:00
        </Text>
        <MultiSlider
          values={range}
          min={0}
          max={24}
          step={1}
          onValuesChange={setRange}
          selectedStyle={{ backgroundColor: "#6C757D" }}  
          unselectedStyle={{ backgroundColor: "#cccccc" }}
          markerStyle={{ backgroundColor: "#6C757D", height: 20, width: 20 }}
          sliderLength={300}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  sliderContainer: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  dateButton: {
    backgroundColor: "#6C757D", // Cooler gray color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  dateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sliderLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
