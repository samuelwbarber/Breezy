import { Text, View, StyleSheet, FlatList} from "react-native";
import React, { useState, useEffect } from "react";
import {Link} from 'expo-router';
import Button from "@/components/Button";



  export default function Statistics() {

    return (
      <View style={styles.container}>
        <Text style={styles.header}>Real-Time Sensor Data</Text>
        <Link href="/map" style={styles.button}>
        Go to Your Map</Link>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#25292e'
    },
    footerContainer: {
        flex: 1/3,
        alignItems: 'center',
        color: '#7ff'

    },
    text: {color: '070'},
    header: {
      color: '#ffd33d', 
      fontSize: 20,
      fontWeight: 'bold',
      position: 'absolute',
      top:20

    },
    iframe: {
      width: '100%',
      height: '100%',
    },
    webView: {
      flex: 1/2,
    },
    button: {
        //position: 'absolute',
        //bottom: 30,
        alignSelf: 'center',
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#f00',
    },
  });

  
