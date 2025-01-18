import { Platform, View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';


export default function AboutScreen() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src="/assets/london_heatmap.html"
          style={styles.iframe}
          title="Heatmap"
        />
      </View>
    );
  }

  return (
    <WebView
      originWhitelist={['*']}
      source={{ uri: 'file:///android_asset/london_heatmap.html' }}
      style={styles.webView}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iframe: {
    width: '100%',
    height: '100%',
  },
  webView: {
    flex: 1,
  },
});