//rnfes
import { Text, View, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { profileStyles } from './profileStyles'
import { signOut } from 'firebase/auth'
import { router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'
import { storage, db, auth } from '@/app/FirebaceConfig/firebaseConfig';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged, User } from 'firebase/auth';



export default function Profile()  {
  const [picture, setPicture] = useState<string | null>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth,async (user:User | null) => {
      if (!user){
        setLoading(false);
        return;
      } 

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setFirst(data.firstName || '');
          setLast(data.lastName || '');
          setPicture(data.profilePic || null);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe
  },[]);

    const handleLogout = async () =>{
        try {
            await signOut(auth)
            console.log("Log out success..!")
            router.replace('/(auth)/Login/login')
        } catch (error) {
            console.log("Log out failed..!",error)
        }
    }

    const pickImage = async () => {
      let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission denied!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        
        setPicture(result.assets[0].uri);
      }
  };
  const handleSaveProfile = async () => {
    if (!auth.currentUser) return alert("No user logged in!");

    try {
      let imageUrl = picture; // Default to current URI

      // Upload Image to Firebase Storage if it's a new local URI
      if (picture && (picture.startsWith('file://') || picture.startsWith('blob:'))) {
        const response = await fetch(picture);
        const blob = await response.blob();

        const storageRef = ref(storage, `profiles/${auth.currentUser.uid}`);

        await uploadBytes(storageRef, blob);
        const imageUrl = await getDownloadURL(storageRef);

        setPicture(imageUrl);
        console.log("Uploaded URL:", imageUrl);

        // Save correct URL
        await setDoc(doc(db, "users", auth.currentUser.uid), {
          firstName: first,
          lastName: last,
          profilePic: imageUrl,
          updatedAt: new Date()
        }, { merge: true });

        alert("Profile saved successfully!");
        return;
      }

      // Save Name and Image URL to Firestore
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        firstName: first,
        lastName: last,
        profilePic: imageUrl,
        updatedAt: new Date()
      },{ merge: true });

      alert("Profile saved successfully!");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Failed to save profile.");
    }
};
if (loading) {
    return (
      <View style={[profileStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }
  return (
    <View style={profileStyles.container}>
      <TouchableOpacity onPress={pickImage} style={ profileStyles.imagecontaine }>
        {picture ? (
          <Image 
        source={{ uri: picture || 'https://via.placeholder.com/150' }} 
        style={profileStyles.profilePic}
        onError={() => {
          console.log("Invalid image, resetting...");
          setPicture(null);
        }}
      />
        ) : (
          <View style={{ 
            width: 120, 
            height: 120, 
            borderRadius: 60, 
            backgroundColor: '#e1e1e1', 
            justifyContent: 'center', 
            alignItems: 'center' 
          }}>
            <Text>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>
       <TextInput placeholder = 'Enter first name'  value={first} onChangeText={setFirst} style={profileStyles.input} />
        <TextInput placeholder = 'Enter last name' value={last} onChangeText={setLast} style={profileStyles.input} />
        <TouchableOpacity style={profileStyles.save} onPress={handleSaveProfile}>
          <Text style={{ color: 'black', textAlign: 'center', fontWeight: 'bold' }}>Save Profile</Text>
      </TouchableOpacity>
        <TouchableOpacity style={profileStyles.logout} onPress={handleLogout}><Text>Log out</Text></TouchableOpacity>
    </View>
  );
}

