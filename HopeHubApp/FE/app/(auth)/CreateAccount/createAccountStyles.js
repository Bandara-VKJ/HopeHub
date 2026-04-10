import { StyleSheet } from 'react-native'

export const accountCreateStyles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: '#fff', 
        justifyContent: 'flex-start',
        alignItems: 'center', 
        paddingTop: 60,
    },
        headingOne:{
        fontFamily: 'Koulen',
        fontSize:20,
        color:'#000000',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    headingTwo:{
        fontFamily:'Koulen',
        fontSize:20,
        color:'#000000',
        fontWeight: 'bold',
        alignSelf:'center',
    },
    highlight:{
        fontFamily: 'Koulen',
        fontSize:25,
        color:'#2CA6A4',
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    innerContainer:{
        width: '90%',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#ffffff00', 
        borderRadius: 15,
    },
    logo:{
        width: 150,
        height: 150,
        alignSelf: 'flex-end'
    },
    last:{
    marginTop:5,
    textAlign:'center'
  },
    login:{
    color:'#4514e6',
    cursor:'pointer'
  },input: {
    flex: 1,   
    paddingVertical: 10,
    paddingLeft: 45,
    padding: 15,
    outlineStyle: 'none',
    borderWidth: 0
},
inputWrapper: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 10,
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
   icon: {
    position: 'absolute',
    left: 15,
    top: '50%',
    transform: [{ translateY: -10 }],
    zIndex: 1,
},
})