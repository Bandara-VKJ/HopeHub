import { StyleSheet } from 'react-native';


export const loginStyles = StyleSheet.create({
  name:{
    fontFamily:'Kavoon',
    fontSize:64,
    color:'#2CA6A4',
    fontWeight: 'bold',
    alignSelf:'center',
    marginBottom: 10,
    marginTop:5

  },
  container:{
   flex: 1,
   backgroundColor: '#fff', 
   justifyContent: 'center'
  },
  logo: {
  width: 250,
  height: 250,
  alignSelf: 'center',
  marginBottom: 20,
},
  innerContainer: {
  width: '90%',
  alignSelf: 'center',
  justifyContent: 'center',
  padding: 20,
  backgroundColor: '#ffffff00', 
  borderRadius: 15,
},
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2CA6A4',
    textAlign: 'center',
    marginBottom: 30,
  },inputWrapper: {
  position: 'relative',
  marginBottom: 15,
},

icon: {
  position: 'absolute',
  left: 15,
  top: '50%',
  transform: [{ translateY: -10 }],
  zIndex: 1,
},

input: {
  backgroundColor: '#fff',
  padding: 15,
  paddingLeft: 45,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: '#ddd',
},
  button: {
    backgroundColor: '#2CA6A4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  last:{
    marginTop:5,
    textAlign:'center'
  },
  createAccount:{
    color:'#4514e6',
    cursor:'pointer'
  }
});