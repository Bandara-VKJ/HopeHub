import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function Welcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to HopeHub</Text>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/Login/login')}
      >
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 26,
    marginBottom: 20
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8
  },
  buttonText: {
    color: '#fff'
  }
});