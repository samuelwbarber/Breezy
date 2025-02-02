import React, { useEffect, useState } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/app/context/userContext";
import { SERVER_URL} from "@/app/config";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import DateTimePicker from '@react-native-community/datetimepicker';

interface HeatmapPoint extends LatLng {
    weight: number;
  }

  export default function MapScreen() {

    const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
    const { currentUser } = useUser();
    const [range, setRange] = useState([0, 24]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    
    useEffect(() => {
      const fetchHeatmapData = async () => {
        if (!currentUser) {
          console.warn("No current user found.");
          setHeatmapData([{ latitude: 51.5074, longitude: -0.1278, weight: 20 }]);
          return;
        }
      
        console.log(`Fetching Map for ${currentUser.name} at ${SERVER_URL}`);
      
        try {
          const response = await fetch(`${SERVER_URL}/user-data/${currentUser.id}`);
          
          console.log("API Response Status:", response.status);
          const data = await response.json();
          if (!response.ok) {
            console.error("Error fetching heatmap data:", data.error);
            return;
          }
      
          if (Array.isArray(data) && data.length === 0) {
            console.warn("No points found for the user.");
            setHeatmapData([{ latitude: 51.5074, longitude: -0.1278, weight: 20 }]);
            return;
          }
      
          let formattedData = data.map((point: any) => ({
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            weight: parseFloat(point.weight),
          }));
  
          if (true) {
            if (formattedData.length > 100) {
              const step = formattedData.length / 99; 
              let interpolatedData = [];
            
              for (let i = 0; i < 100; i++) {
                const idx = i * step;
                const lowerIdx = Math.floor(idx);
                const upperIdx = Math.ceil(idx);
            
                if (upperIdx >= formattedData.length) {
                  interpolatedData.push(formattedData[lowerIdx]);
                } else {
                  const ratio = idx - lowerIdx;
                  interpolatedData.push({
                    latitude: formattedData[lowerIdx].latitude * (1 - ratio) + formattedData[upperIdx].latitude * ratio,
                    longitude: formattedData[lowerIdx].longitude * (1 - ratio) + formattedData[upperIdx].longitude * ratio,
                    weight: formattedData[lowerIdx].weight * (1 - ratio) + formattedData[upperIdx].weight * ratio,
                  });
                }
              }
              formattedData = interpolatedData;
            }
          }
  
          console.log("Formatted Heatmap Data");
          setHeatmapData(formattedData); 
          console.log("Set Heatmap Data")
          console.log(heatmapData.length);
      
        } catch (error) {
          console.error("Error fetching heatmap data:", error);
        }
      };
    
      fetchHeatmapData();
    }, [currentUser]);

    useEffect(() => {
        console.log("Updated heatmap data:", heatmapData.length);
      }, [heatmapData]);
    
    if (heatmapData.length === 0) {
        return (
          <View style={styles.container}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>No heatmap data available</Text>
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
            <Heatmap points={heatmapData.slice(0, 50)} /> 
          ) : (
            <Text>No heatmap data available</Text>
          )}
        </MapView>

        {/* Date Picker and Multi-range slider for time selection */}
        <View style={styles.sliderContainer}>
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>Select Date: <Text style={{ color: 'blue', textDecorationLine: 'underline' }}>{selectedDate.toDateString()}</Text></Text>
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
          <Text>Selected Time Range: {range[0]}:00 - {range[1]}:00</Text>
          <MultiSlider
            values={range}
            min={0}
            max={24}
            step={1}
            onValuesChange={setRange}
            selectedStyle={{ backgroundColor: "#0000ff" }}
            unselectedStyle={{ backgroundColor: "#cccccc" }}
            markerStyle={{ backgroundColor: "#0000ff" }}
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
      bottom: 50,
      left: 20,
      right: 20,
      backgroundColor: "white",
      padding: 10,
      borderRadius: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
    },
  });
