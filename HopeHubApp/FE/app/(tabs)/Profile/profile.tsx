//rnfes
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { logoutStyles } from './profileStyles'
import { signOut } from 'firebase/auth'
import { auth } from '@/app/FirebaceConfig/firebaseConfig'
import { router } from 'expo-router'

const profile = () => {

    const handleLogout = async () =>{
        try {
            await signOut(auth)
            console.log("Log out success..!")
            router.replace('/(auth)/Login/login')
        } catch (error) {
            console.log("Log out failed..!",error)
        }
    }
  return (
    <View>
      <TouchableOpacity style={logoutStyles.logout} onPress={handleLogout}><Text>Log out</Text></TouchableOpacity>
    </View>
  )
}

export default profile

const styles = StyleSheet.create({})