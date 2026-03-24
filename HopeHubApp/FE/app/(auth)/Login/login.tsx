import { Text, View, TextInput,TouchableOpacity, Alert  } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'

export default function Login(){

    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = () => {
        if (email === "vimu@gmail.com" && password  === "123")
        {
            router.replace('/Home/home')
        }
        else{
            Alert.alert("Error" ,'Check credinatials again')
        }
    }

  return (
    <View>
        <Text>Login</Text>
         <TextInput placeholder='Enter Email' value={email} onChangeText={setEmail} />
         <TextInput placeholder='Enter Password' value={password} onChangeText={setPassword} />
         <TouchableOpacity onPress={handleLogin}><Text>Login</Text></TouchableOpacity>
         
    </View>
  )
}