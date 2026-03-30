//rnfes
import { Text, View, TouchableOpacity, TextInput, Image } from 'react-native'
import React from 'react'
import { profileStyles } from './profileStyles'
import { signOut } from 'firebase/auth'
import { storage, db, auth } from '@/app/FirebaceConfig/firebaseConfig'
import { router } from 'expo-router'
import { useState } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc,doc } from 'firebase/firestore'


export default function Profile () {

  const [picture,setPicture] = useState<string | null>(null);
  const [first,setFirst] = useState('');
  const [last,setLast] = useState('');

    const handleLogout = async () =>{
        try {
            await signOut(auth)
            console.log("Log out success..!")
            router.replace('/(auth)/Login/login')
        } catch (error) {
            console.log("Log out failed..!",error)
        }
    }

    const pickImage = async  () => {
      // Request permission
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if(status != 'granted')
      {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing:true,
        aspect:[1,1],
        quality: 1,
      });

      if(!result.canceled)
      {
        setPicture(result.assets[0].uri);
      }
    };
    const handleSaveProfile = async () =>{
    if (!auth.currentUser) return alert('No user Logged in !');

    try {
      //default to current image
      let imageUrl = picture

      if(picture && picture.startsWith('file://'))
      {
        const responce = await fetch(picture)
        const blob = await responce.blob()
        const storageRef = ref (storage, `profiles/${auth.currentUser.uid}`)

        await uploadBytes (storageRef , blob)
        imageUrl = await getDownloadURL (storageRef);
        console.log('Image uploaded')
      }

      await setDoc(doc(db,"users",auth.currentUser.uid),{
        FirstName:first,
        LastName:last,
        profilePic:imageUrl,
        updateAt:new Date()
      });

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save profile.");
    }
    };
    return (
    <View style = {profileStyles.container}>
      <TouchableOpacity onPress={pickImage} style={profileStyles.imagecontaine}>
        {picture ? (
          <Image source={{ uri: picture }} style={profileStyles.profilePic}/>
        ) : (
          <View style={profileStyles.placeholder}>
            <Text>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
      <TextInput placeholder = 'Enter first name'  value={first} onChangeText={setFirst} style={profileStyles.input} />
      <TextInput placeholder = 'Enter last name' value={last} onChangeText={setLast} style={profileStyles.input} />
      <TouchableOpacity style={profileStyles.save} onPress={handleSaveProfile}><Text>Save</Text></TouchableOpacity>
      <TouchableOpacity style={profileStyles.logout} onPress={handleLogout}><Text>Log out</Text></TouchableOpacity>
    </View>
  )
    
}
  
