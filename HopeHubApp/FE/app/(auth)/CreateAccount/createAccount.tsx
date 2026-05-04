import { accountCreateStyles } from "./createAccountStyles";
import { Text, View, TextInput,TouchableOpacity, Alert,Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'


export default function CreateAccount() {


    const [first,setFirst] = useState('')
    const [last,setLast] = useState('')
    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confpassword,setconfPassword] = useState('')
    const [mobile,setMobile] = useState('')
    const [showpassword,setshowpassword] = useState(false)
    const [showconfpassword,setconfShowpassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [logrole,setLogrole] = useState< 'user' | 'counselor' >('user');

    const handleCreateAccount = async () => {
    console.log('Create acc Triggered')
    if (loading) return

    if (!first || !last || !email || !password || !confpassword) {
        Alert.alert('Error', 'Please fill all fields')
        return
    }

    if (password !== confpassword) {
        Alert.alert('Error', 'Passwords do not match')
        return
    }

    if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters')
        return
    }

    if (logrole === "counselor" && !mobile) {
        Alert.alert("Error", "Mobile number is required for counselors")
        return
    }

    try {
        setLoading(true)

        const response = await fetch("https://connector-removed-stoneware.ngrok-free.dev/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: first,
                lastName: last,
                email: email,
                password: password,
                role: logrole,
                mobile: logrole === 'counselor' ? mobile : null
            })
        })

        const data = await response.json()

        if (!response.ok) {
            Alert.alert("Error", data.message || "Something went wrong")
            return
        }

        console.log("Account created:", data)

        // Navigate based on role
        if (logrole === 'counselor') {
            router.replace('/(counselor)/counselor')
        } else {
            router.replace('/(tabs)/Home/home')
        }

    } catch (error) {
        console.log(error)
        Alert.alert("Error", "Network error")
    } finally {
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
            <Text style= {accountCreateStyles.title}>{logrole === 'counselor' ? 'Create account for counselor ' : 'Create account for user'}</Text>
           
           
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
           {logrole === 'counselor' && (
                <View style={accountCreateStyles.inputWrapper}>
                    <Ionicons name="call-outline" size={20} color="gray" style={accountCreateStyles.icon} />
                    <TextInput placeholder="Enter mobile number" value={mobile} onChangeText={setMobile} style={[accountCreateStyles.input as any]}></TextInput>
                </View>
           )

           }
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

            <TouchableOpacity
                onPress={() => setLogrole(logrole === 'user' ? 'counselor' : 'user')}
                style={{ marginVertical: 10, alignItems: 'center' }}
                >
                <Text style={{ color: '#007AFF', fontWeight: '600' }}>
                    {logrole === 'user'
                    ? "Create Counselor Account?"
                    : "Create User Account?"}
                </Text>
                </TouchableOpacity>
           </View>
    )
}
