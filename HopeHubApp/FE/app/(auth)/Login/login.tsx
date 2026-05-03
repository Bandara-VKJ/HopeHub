import { Text, View, TextInput,TouchableOpacity,Image } from 'react-native'
import { useState } from 'react'
import { router } from 'expo-router'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/app/FirebaceConfig/firebaseConfig'
import { loginStyles } from './loginStyles'
import { Ionicons } from '@expo/vector-icons'
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/FirebaceConfig/firebaseConfig";
import * as Linking from 'expo-linking';

export default function Login(){

    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showpassword,setshowpassword] = useState(false)
    const [logrole,setLogrole] = useState< 'user' | 'counselor' >('user');
    const [isCounselorLogin, setIsCounselorLogin] = useState(false);

    const handleLogin = async () => {
        try {
            const userCrediatials = await signInWithEmailAndPassword(auth, email, password)
            const user = userCrediatials.user;

            console.log("Login role selected:", logrole);
            let role = 'user'

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if(docSnap.exists())
            {
                 role = docSnap.data().role
            }

            if(logrole === 'counselor' && role !== 'counselor')
            {
                alert("This account is not a counselor account");
                return;
            }
            if(logrole === 'user' && role === 'counselor')
            {
                alert("Please use counselor login option");
                return;
            }
            if(role === 'counselor')
            {
               setIsCounselorLogin(true);
               Linking.openURL("https://connector-removed-stoneware.ngrok-free.dev");
                return;
            }
             const res = await fetch(
            `http://192.168.43.251:5000/api/questionnaire/status/${user.uid}`
            );

            const data = await res.json();
            if(data.completed)
            {
                router.replace('/(tabs)/Home/home')
            }
            else{
                router.replace('/(questionnaire)/questionnaire')
            }

            console.log('Login success..!')
        } catch (error) {
            console.log('Login failed..!')
        }
    }

  return (
    <View style= {loginStyles.container}>
        <Text style={loginStyles.name}>HopeHub</Text>
        <View style= {loginStyles.innerContainer}>
        <Image source={require('../../../assets/images/logo.png')} style={loginStyles.logo} resizeMode="contain"/>
         <Text style= {loginStyles.title}>{logrole === 'counselor' ? 'Counselor Login' : 'User Login'}</Text>
        <View style={loginStyles.inputWrapper}>
            <Ionicons name="mail-outline"  size={20}  color="gray" style={loginStyles.icon}/>
            <TextInput placeholder="Enter Email" value={email} onChangeText={setEmail} style={[loginStyles.input as any]} />
        </View>
        <View style={loginStyles.inputWrapper}>
            <Ionicons name='lock-closed-outline' size={20} color='gray' style={loginStyles.icon}/>
            <TextInput secureTextEntry={ !showpassword } placeholder='Enter Password' value={password} onChangeText={setPassword} style= {loginStyles.input as any}/>
            <TouchableOpacity onPress={() => setshowpassword(!showpassword)}><Ionicons  name={showpassword ? "eye-off-outline" : "eye-outline" } size={20} color="gray"/></TouchableOpacity>
        </View>
         <TouchableOpacity onPress={handleLogin} style= {loginStyles.button}><Text style= {loginStyles.buttonText}>Login</Text></TouchableOpacity>
         <Text  style={loginStyles.last}>Don’t have an account ?<Text style={loginStyles.createAccount} onPress={()=> router.push('/(auth)/CreateAccount/createAccount')}>Create now</Text></Text>
        </View>
        <TouchableOpacity onPress={() => setLogrole(logrole === 'user' ? 'counselor' : 'user')}>
            <Text style={{ color: '#007AFF', marginBottom: 10 }}>
                {logrole === 'user'
                ? "Login as Counselor?"
                : "Login as User?"}
            </Text>
            </TouchableOpacity>
    </View>
    
  )
}