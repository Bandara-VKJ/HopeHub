import { accountCreateStyles } from "./createAccountStyles";
import { Text, View, TextInput,TouchableOpacity, Alert,ImageBackground,Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/FirebaceConfig/firebaseConfig'
import { Ionicons } from '@expo/vector-icons'

export default function CreateAccount() {


    const [first,setFirst] = useState('')
    const [last,setLast] = useState('')
    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confpassword,setconfPassword] = useState('')
    const [showpassword,setshowpassword] = useState(false)
    const [showconfpassword,setconfShowpassword] = useState(false)

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
        <View style= {accountCreateStyles.container}>
            <View style={{ flexDirection: 'row',alignItems: 'center',justifyContent: 'center' }}>
                <View style={{ marginLeft: 10 }}>
                    <Text style={accountCreateStyles.headingOne}>let’s build your</Text>
                    <Text style={accountCreateStyles.highlight}>
                    Hope Hub <Text style={accountCreateStyles.headingTwo}>account</Text>
                    </Text>
                </View>
                <Image 
                    source={require('../../../assets/images/logo.png')} 
                    style={accountCreateStyles.logo}
                />
            </View>

           <View style={accountCreateStyles.inputWrapper}>
               <Ionicons name="person-outline"  size={20}  color="gray" style={accountCreateStyles.icon}/>
               <TextInput placeholder="Enter first name" value={first} onChangeText={setFirst} style={[accountCreateStyles.input as any]} />
           </View>
           <View style={accountCreateStyles.inputWrapper}>
               <Ionicons name="person-outline"  size={20}  color="gray" style={accountCreateStyles.icon}/>
               <TextInput placeholder="Enter last name" value={last} onChangeText={setLast} style={[accountCreateStyles.input as any]} />
           </View>
           <View style={accountCreateStyles.inputWrapper}>
               <Ionicons name="mail-outline"  size={20}  color="gray" style={accountCreateStyles.icon}/>
               <TextInput placeholder="Enter Email" value={email} onChangeText={setEmail} style={[accountCreateStyles.input as any]} />
           </View>
          <View style={accountCreateStyles.inputWrapper}>
                      <Ionicons name='lock-closed-outline' size={20} color='gray' style={accountCreateStyles.icon}/>
                      <TextInput secureTextEntry={ !showpassword } placeholder='Enter Password' value={password} onChangeText={setPassword} style= {accountCreateStyles.input as any}/>
                      <TouchableOpacity onPress={() => setshowpassword(!showpassword)}><Ionicons  name={showpassword ? "eye-off-outline" : "eye-outline" } size={20} color="gray"/></TouchableOpacity>
                  </View>
           <View style={accountCreateStyles.inputWrapper}>
                       <Ionicons name='lock-closed-outline' size={20} color='gray' style={accountCreateStyles.icon}/>
                       <TextInput secureTextEntry={ !showconfpassword } placeholder='Enter Password' value={confpassword} onChangeText={setconfPassword} style= {accountCreateStyles.input as any}/>
                       <TouchableOpacity onPress={() => setconfShowpassword(!showconfpassword)}><Ionicons  name={showconfpassword ? "eye-off-outline" : "eye-outline" } size={20} color="gray"/></TouchableOpacity>
                   </View>
            <TouchableOpacity onPress={handleLogin} style= {accountCreateStyles.button}><Text style= {accountCreateStyles.buttonText}>Create an account</Text></TouchableOpacity>
            <Text  style={accountCreateStyles.last}>Already have an account ?<Text style={accountCreateStyles.login} onPress={() => router.push('/(auth)/Login/login')}>Login</Text></Text>
           </View>
    )
}