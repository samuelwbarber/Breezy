import { StyleSheet, View, Pressable, Text, ViewStyle } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';

type Props = {
  label: string;
  theme?: 'primary';
  shape?: 'round'; 
  style?: ViewStyle; 
};

export default function Button({ label, theme, shape, style }: Props) {
  const isRound = shape === 'round'; 

  if (theme === 'primary') {
    return (
      <View
        style={[
          styles.buttonContainer,
          style,
          isRound && styles.roundButtonContainer, 
          { borderWidth: 4, borderColor: '#ffd33d' },
        ]}
      >
        <Pressable
          style={[
            styles.button,
            isRound ? styles.roundButton : { backgroundColor: '#fff' },
          ]}
          onPress={() => alert('You pressed a button.')}
        >
          {isRound ? (
            <FontAwesome name="bicycle" size={24} color="#25292e" /> 
          ) : (
            <>
              <FontAwesome name="picture-o" size={18} color="#25292e" style={styles.buttonIcon} />
              <Text style={[styles.buttonLabel, { color: '#25292e' }]}>{label}</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.buttonContainer, style, isRound && styles.roundButtonContainer]}>
      <Pressable
        style={[styles.button, isRound && styles.roundButton]}
        onPress={() => alert('You pressed a button.')}
      >
        {isRound ? (
          <FontAwesome name="bicycle" size={24} color="#fff" />
        ) : (
          <Text style={styles.buttonLabel}>{label}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  roundButtonContainer: {
    width: 68, // Make the container size equal for a circle
    height: 68,
    borderRadius: 34, // Half the width/height for a perfect circle
  },
  button: {
    borderRadius: 10,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  roundButton: {
    borderRadius: 34, // Half the size for a perfect circle
    width: 68,
    height: 68,
    backgroundColor: '#ffd33d', // Default background colour for round buttons
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    color: '#f00',
    fontSize: 16,
  },
});
