import React, { useEffect, useState } from "react";
import { Text,StyleSheet, View, ActivityIndicator } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/app/context/userContext";
import { SERVER_URL} from "@/app/config";

interface HeatmapPoint extends LatLng {
    weight: number;
  }

  export default function MapScreen() {

    const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
    const { currentUser } = useUser();
  
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
          
          // Log status of the response and response body
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
      
          // Parse data
          const formattedData = data.map((point: any) => ({
            latitude: parseFloat(point.latitude),
            longitude: parseFloat(point.longitude),
            weight: parseFloat(point.weight), // Ensure weight is a float, not string
          }));
  
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
            //I've only plotted first 50 points cause user has 1600 entries which the map can't render
            <Heatmap points={heatmapData.slice(0, 50)} /> 
          ) : (
            <Text>No heatmap data available</Text>
          )}
        </MapView>
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
  });
  