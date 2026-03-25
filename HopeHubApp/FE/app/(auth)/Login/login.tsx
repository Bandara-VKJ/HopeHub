import { Text, View, TextInput,TouchableOpacity, Alert  } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/FirebaceConfig/firebaseConfig'

export default function Login(){

    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')

    const handleLogin = async () => {
        try {
            const userCrediatials = await signInWithEmailAndPassword(auth, email, password)
            console.log('Login success..!')
            router.replace('/Home/home')
        } catch (error) {
            console.log('Login failed..!')
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