import { StyleSheet } from 'react-native';

export const profileStyles = StyleSheet.create({
    logout:{
    backgroundColor: '#2CA6A4',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    },
    container:{
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
    },
    imagecontaine:{
        marginBottom:30
    },
    profilePic:{
    width: 120,
    height: 120,
    borderRadius: 60
    },
    placeholder:{
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderStyle: 'dashed'
    },
    input:{
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15
    },
    save:{
    backgroundColor: '#19c441',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    }
})