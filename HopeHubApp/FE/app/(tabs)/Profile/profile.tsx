import { Text, View, TouchableOpacity, TextInput, Image, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'
import { profileStyles } from './profileStyles'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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
      setUserId(id);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const loadProfile = async () => {
      try {
        const res = await ngrokFetch(`${BASE_URL}/api/profile/${userId}`);
        const text = await res.text();
        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          return;
        }

        if (res.ok && data.profile) {
          setFirst(data.profile.firstName || '');
          setLast(data.profile.lastName || '');
          setPicture(data.profile.profilePic || null);
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

      const formData = new FormData();
      formData.append("userId", userId!);
      formData.append("firstName", first);
      formData.append("lastName", last);

      if (picture && picture.startsWith("file://")) {
        formData.append("profilePic", {
          uri: picture,
          name: "profile.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await ngrokFetch(`${BASE_URL}/api/profile/save`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Save failed");
        return;
      }

      if (data.profile?.profilePic) {
        setPicture(data.profile.profilePic);
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
      <View style={profileStyles.loadingContainer}>
        <ActivityIndicator size="large" color="#2CA6A4" />
        <Text style={profileStyles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#F4FAF9' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={profileStyles.scrollContent}>

        <Text style={profileStyles.title}>My Profile</Text>
        <Text style={profileStyles.subtitle}></Text>

        <TouchableOpacity onPress={pickImage} style={profileStyles.avatarWrapper} activeOpacity={0.85}>
          {picture ? (
            <Image
              source={{
                uri: picture?.startsWith("file://")
                  ? picture
                  : `${BASE_URL}${picture}`,
              }}
              style={profileStyles.profilePic}
            />
          ) : (
            <View style={profileStyles.placeholder}>
              <Ionicons name="person" size={44} color="#9BB8B6" />
            </View>
          )}
          <View style={profileStyles.editBadge}>
            <Ionicons name="camera" size={16} color="#fff" />
          </View>
        </TouchableOpacity>

        <View style={profileStyles.card}>
          <Text style={profileStyles.label}>First Name</Text>
          <View style={profileStyles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#2CA6A4" style={profileStyles.inputIcon} />
            <TextInput
              placeholder="Enter first name"
              placeholderTextColor="#A0AFAE"
              value={first}
              onChangeText={setFirst}
              style={profileStyles.input}
            />
          </View>

          <Text style={profileStyles.label}>Last Name</Text>
          <View style={profileStyles.inputWrapper}>
            <Ionicons name="person-outline" size={18} color="#2CA6A4" style={profileStyles.inputIcon} />
            <TextInput
              placeholder="Enter last name"
              placeholderTextColor="#A0AFAE"
              value={last}
              onChangeText={setLast}
              style={profileStyles.input}
            />
          </View>

          <TouchableOpacity
            style={[profileStyles.save, saving && profileStyles.saveDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text style={profileStyles.saveText}>Save Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={profileStyles.logout}
          onPress={async () => {
            await AsyncStorage.clear();
            router.replace('/(auth)/Login/login');
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#2CA6A4" style={{ marginRight: 6 }} />
          <Text style={profileStyles.logoutText}>Log out</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}