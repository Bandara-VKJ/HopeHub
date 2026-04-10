import { accountCreateStyles } from "./createAccountStyles";
import { Text, View, TextInput,TouchableOpacity, Alert,ImageBackground,Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/FirebaceConfig/firebaseConfig'
import { Ionicons } from '@expo/vector-icons'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/app/FirebaceConfig/firebaseConfig'

export default function CreateAccount() {


    const [first,setFirst] = useState('')
    const [last,setLast] = useState('')
    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confpassword,setconfPassword] = useState('')
    const [showpassword,setshowpassword] = useState(false)
    const [showconfpassword,setconfShowpassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleCreateAccount = async () => {

        console.log('Create acc Triggered')
        if(loading) return

        if(!first || !last || !email || !password || !confpassword)
        {
            console.log('Please fill all fields')
            Alert.alert('Error', 'Please fill all fields')
            return
        }
        if(password !== confpassword)
        {
            console.log('Passwords do not match')
            Alert.alert('Error', 'Passwords do not match')
            return
        }
        if(password.length < 6)
        {
            console.log('Password must be at least 6 characters')
            Alert.alert('Error', 'Password must be at least 6 characters')
            return
        }
        try {
            setLoading(true)
         const userCredentials = await createUserWithEmailAndPassword(
            auth,
            email,
            password
         )
         await setDoc(doc(db, "users", userCredentials.user.uid), {
            firstName: first,
            lastName: last,
            email: email,
            createdAt: new Date() 
            })
         console.log('Account created success..!');
         //redirect to home after success full acc creation
         router.replace('/(tabs)/Home/home')
        } catch (error:any) {
            console.log(error)

            //Handle firebase errors
            if (error.code === 'auth/email-already-in-use') {
            Alert.alert('Error', 'Email already in use')
            console.log('Error', 'Email already in use')
            } else if (error.code === 'auth/invalid-email') {
            Alert.alert('Error', 'Invalid email')
            console.log('Error', 'Invalid email')
            } else {
            Alert.alert('Error', 'Something went wrong')
            console.log('Error', 'Something went wrong')
            }
        }finally {
            setLoading(false)
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
                       <TextInput secureTextEntry={ !showconfpassword } placeholder='Confirm Password' value={confpassword} onChangeText={setconfPassword} style= {accountCreateStyles.input as any}/>
                       <TouchableOpacity disabled={loading} onPress={() => setconfShowpassword(!showconfpassword)}><Ionicons  name={showconfpassword ? "eye-off-outline" : "eye-outline" } size={20} color="gray"/></TouchableOpacity>
                   </View>
            <TouchableOpacity  onPress={handleCreateAccount} style= {accountCreateStyles.button}><Text style= {accountCreateStyles.buttonText} >{loading ? 'Creating...' : 'Create an account'}</Text></TouchableOpacity>
            <Text  style={accountCreateStyles.last}>Already have an account ?<Text style={accountCreateStyles.login} onPress={() => router.push('/(auth)/Login/login')}>Login</Text></Text>
           </View>
    )
}
