import { Text, View, StyleSheet } from "react-native";
import {Link} from 'expo-router';

/*export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Hello I'm Lorenza!</Text>
    </View>
  ); */

  export default function Index() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Home screen</Text>
        <Link href="/about" style={styles.button}>
        Go to About screen</Link>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffa08a', //rgb hex
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: '#fff',
    },
    button: {
      fontSize: 20,
      textDecorationLine: 'underline',
      color: '#fff',
    },
  });  

  

