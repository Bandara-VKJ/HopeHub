import { Text, View, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { profileStyles } from './profileStyles'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "ngrok-skip-browser-warning": "true",
    },
  });

export default function Profile() {

  const [userId, setUserId] = useState<string | null>(null);
  const [picture, setPicture] = useState<string | null>(null);
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
    const getUser = async () => {
      const id = await AsyncStorage.getItem("userId");
      console.log("Loaded userId:", id);
      setUserId(id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        console.log("Loading profile for:", userId);

        const res = await ngrokFetch(`${BASE_URL}/api/profile/${userId}`);
        console.log("Status:", res.status);

        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.log("Non-JSON response:", text);
          return;
        }

        if (res.ok && data.profile) {
          setFirst(data.profile.firstName || '');
          setLast(data.profile.lastName || '');
          setPicture(data.profile.profilePic || null);
        } else {
          console.log("Profile not found or error:", data);
        }

      } catch (error) {
        console.log("Load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission denied!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setPicture(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      let imageData = picture;

      // Convert local image to base64
      if (picture && picture.startsWith('file://')) {
        const response = await fetch(picture);
        const blob = await response.blob();
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await ngrokFetch(`${BASE_URL}/api/profile/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          firstName: first,
          lastName: last,
          profilePic: imageData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Save failed");
        return;
      }

      alert("Profile saved!");

    } catch (error) {
      console.log("Save error:", error);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[profileStyles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#2CA6A4" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View style={profileStyles.container}>

      <TouchableOpacity onPress={pickImage} style={profileStyles.imagecontaine}>
        {picture ? (
          <Image
            source={{ uri: picture }}
            style={profileStyles.profilePic}
          />
        ) : (
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: '#e1e1e1',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Text>Add Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <TextInput
        placeholder='Enter first name'
        value={first}
        onChangeText={setFirst}
        style={profileStyles.input}
      />

      <TextInput
        placeholder='Enter last name'
        value={last}
        onChangeText={setLast}
        style={profileStyles.input}
      />

      <TouchableOpacity
        style={profileStyles.save}
        onPress={handleSaveProfile}
        disabled={saving}
      >
        <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>
          {saving ? "Saving..." : "Save Profile"}
        </Text>
      </TouchableOpacity>

     <TouchableOpacity
        style={profileStyles.logout}
        onPress={async () => {
          await AsyncStorage.removeItem("userId");
          await AsyncStorage.removeItem("role");
          router.replace('/(auth)/Login/login');
        }}
      >
        <Text>Log out</Text>
      </TouchableOpacity>

    </View>
  );
}