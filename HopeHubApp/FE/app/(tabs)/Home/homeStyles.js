import { StyleSheet } from 'react-native';

export const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  top:{
    height:'30%',
    width: 'auto',
    backgroundColor:'#2CA6A4',
    paddingTop: 50,
    paddingLeft:40
  },
  streakBar:{
    paddingTop: 20,
    paddingLeft: 10,
    height: '50%',
    width: '80%',
    backgroundColor: '#ffffff28',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ffffff28',

  },
  textOne:{
    color: '#fff',
    marginBottom:10,
  },
  textTwo:{
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold'
  },
  icon: {
  position: 'absolute',
  left: 15,
  top: '50%',
  transform: [{ translateY: -10 }],
  zIndex: 1,
},
achiveIcon: {
  height: 50,
  width: 50,
  backgroundColor: '#ffffff7d',
  borderRadius: 10,
  borderWidth: 2,
  borderColor: '#2CA6A4',
  justifyContent: 'center',
  alignItems: 'center',
},
streakTitle:{
  color: '#fff'
},
streakContent: {
  flexDirection: 'row',
  alignItems: 'center',
},

textContainer: {
  marginLeft: 10,
},
riskContainer:{
  width: '90%',
  height: '20%',
  marginTop: 15,
  alignSelf: 'center',
  borderRadius: 15,
  backgroundColor: '#eaeac160',
  padding: 20,
  borderWidth: 2,
  borderColor: '#ffdd0060',
  
   // iOS shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,

  // Android shadow
  elevation: 1,
},
riskInnerContainer:{
  flexDirection: 'row',
  alignItems: 'center',
},
iconContainer:{
  height: 50,
  width: 50,
  backgroundColor: '#e7e79860',
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
riskTextContainer:{
  marginLeft: 10,
},
statement:{
 fontSize:8
},
riskTitle:{
  fontSize:20
},
riskPrediction:{
  fontSize:25,
  fontWeight: 'bold',
  color:'#e26d36'
},
taskContainer:{
  width: '90%',
  height: '30%',
  marginTop: 15,
  alignSelf: 'center',
  borderRadius: 15,
  backgroundColor: '#fff',
  padding: 20,
  
   // iOS shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,

  // Android shadow
  elevation: 1,
},
quickActions:{
  width: '90%',
  height: '30%',
  marginTop: 15,
  alignSelf: 'center',
  borderRadius: 15,
  backgroundColor: '#fff',
  padding: 20,
  
   // iOS shadow
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.2,
  shadowRadius: 6,

  // Android shadow
  elevation: 1,
}
});