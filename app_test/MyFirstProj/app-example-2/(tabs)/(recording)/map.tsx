import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import WidgetBar from "@/components/WidgetBar";
//import {MapView} from "react-native-maps";
import { WebView } from 'react-native-webview';
import Button from "@/components/Button";

    export default function Mapscreen(){
        return(
            <View style={styles.container}>
                {/*<Text style={styles.text}>Journey screen</Text>
                <Link href="/about" style={styles.button}> Go to About screen</Link>
                <Button label ="Start"/>*/}
                {Platform.OS == 'web' ? (
                    <iframe
                        src="/assets/london_heatmap.html"
                        style={styles.iframe}
                        title="Heatmap"
                    />
                ) :
                (
                    <WebView
                        originWhitelist={['*']}
                        source={{ uri: 'file:///android_asset/london_heatmap.html' }}
                        style={styles.webView}
                    />
                )}
                <Button label ="Start" theme = 'primary' shape='round' style={styles.button} />
            </View>
            
            
        );
    }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      //justifyContent: 'center',
      alignItems: 'center',
    },
    footerContainer: {
        flex: 1/3,
        alignItems: 'center',
        color: '7ff'

    },
    text: {color: '070'},
    iframe: {
      width: '100%',
      height: '100%',
    },
    webView: {
      flex: 1/2,
    },
    button: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        fontSize: 20,
        textDecorationLine: 'underline',
        color: '#000',
    },
  });
