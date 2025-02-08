import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, useLayoutEffect } from "react";
import { Text, StyleSheet, View, ActivityIndicator, TouchableOpacity } from "react-native";
import MapView, { Heatmap, LatLng } from "react-native-maps";
import { useUser } from "@/app/context/userContext";
import { SERVER_URL } from "@/app/config";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import DateTimePicker from "@react-native-community/datetimepicker";

interface HeatmapPoint extends LatLng {
    weight: number;
    timestamp?: Date;
  }

interface mapContextType {
    mapData: HeatmapPoint[] | null;
}

