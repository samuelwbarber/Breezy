import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Heatmap, LatLng, PROVIDER_GOOGLE } from "react-native-maps";
import { useUser } from "@/app/context/userContext";
import { SERVER_URL } from "@/app/config";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";

interface HeatmapPoint extends LatLng {
  weight: number;
  timestamp?: Date;
}

const DEFAULT_POINT = {latitude: 51.5074, longitude: -0.1278, weight: 10 };

export default function MapScreen() {
  const [rawData, setRawData] = useState<HeatmapPoint[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([DEFAULT_POINT]);
  const { currentUser } = useUser();
  const [range, setRange] = useState([0, 24]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch raw data from API
  useEffect(() => {
    console.log("Fetching heatmap data...");
    const fetchHeatmapData = async () => {
      if (!currentUser) {
        setError("No current user found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`${SERVER_URL}/map-data/${currentUser.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          console.log("No data found for user:", currentUser.email, "with id", currentUser.id);
          setRawData([]);
          setHeatmapData([DEFAULT_POINT]);
          setLoading(false);
          return;
        }
        
        const formattedData = data.map((point: any) => ({
          latitude: parseFloat(point.latitude),
          longitude: parseFloat(point.longitude),
          weight: parseFloat(point.weight),
          timestamp: new Date(point.timestamp),
        }));

        setRawData(formattedData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
        setHeatmapData([DEFAULT_POINT]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [currentUser, refreshKey]);

  useEffect(() => {
    if (rawData.length === 0) return;
  
    const startDateTime = new Date(selectedDate);
    startDateTime.setHours(range[0], 0, 0, 0);
    
    const endDateTime = new Date(selectedDate);
    endDateTime.setHours(range[1], 59, 59, 999);
  
    const filteredData = rawData.filter((point) => {
      const pointDate = new Date(point.timestamp);
      const inTimeRange = pointDate >= startDateTime && pointDate <= endDateTime;
      
      // Validate coordinates
      const hasCoordinates =
        typeof point.latitude === "number" &&
        !isNaN(point.latitude) &&
        typeof point.longitude === "number" &&
        !isNaN(point.longitude);
      
      // Validate measurements and ensure weight is not more than 20
      const hasMeasurements =
        typeof point.weight === "number" &&
        !isNaN(point.weight) &&
        point.weight <= 20;
  
      return inTimeRange && hasCoordinates && hasMeasurements;
    });
    console.log("Filtered data:", filteredData.length);
    setHeatmapData(filteredData.length > 0 ? filteredData : [DEFAULT_POINT]);
  }, [rawData, selectedDate, range]);

  const formatDate = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  };

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

      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => setRefreshKey((prev) => prev + 1)} // 👈 Triggers useEffect
        >
          <Ionicons name="refresh" style={styles.refreshIcon} />
        </TouchableOpacity>
      </View>

      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: 51.5074,
          longitude: -0.1278,
          latitudeDelta: 0.09,
          longitudeDelta: 0.04,
        }}
      >
         <Heatmap
            points={heatmapData}
            radius={10}         // Each point's influence radius (in pixels)
            opacity={0.7}       // Overall transparency of the heatmap
            gradient={{
              colors: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'], // Colors for the gradient
              startPoints: [0.01, 0.25, 0.5, 0.75, 1],           // Relative positions for the colors (0-1)
              colorMapSize: 256,                                  // Number of steps in the gradient
            }}
          />
        </MapView>

      <View style={styles.sliderContainer}>
        {error && <Text style={styles.errorText}>{error}</Text>}
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
  // headerContainer: {
  //   flexDirection: 'row',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   width: '100%',
  //   marginBottom: 10,
  // },
  headerContainer: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshIcon: {
    fontSize: 24,
    color: '#6C757D',
  },
  dateButton: {
    backgroundColor: "#6C757D",
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
  errorText: {
    color: 'red',
    marginBottom: 10,
    flex: 1,
  }
});