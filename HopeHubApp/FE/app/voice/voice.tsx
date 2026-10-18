import { useCallRating } from "@/hooks/useCallRating";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  BackHandler,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  AudioSession,
} from "@livekit/react-native";

import {
  ConnectionState,
  Room,
  RoomEvent,
} from "livekit-client";

import {
  Ionicons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL;

export default function VoiceCallScreen() {
  const params = useLocalSearchParams<{
    bookingId?: string;
    role?: string;
  }>();

  const bookingId = Array.isArray(params.bookingId)
    ? params.bookingId[0]
    : params.bookingId;

  const passedRole = Array.isArray(params.role)
    ? params.role[0]
    : params.role;

  const roomRef = useRef<Room | null>(null);

  const mountedRef = useRef(true);

  const [connecting, setConnecting] =
    useState(true);

  const [connected, setConnected] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [remoteJoined, setRemoteJoined] =
    useState(false);

  const [ending, setEnding] =
    useState(false);

  const [callSeconds, setCallSeconds] =
    useState(0);

  // ==========================================
  // CALL TIMER
  // ==========================================

  useEffect(() => {
    if (!connected) {
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds((value) => value + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [connected]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(
      seconds / 3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds =
      seconds % 60;

    const mm = String(minutes).padStart(
      2,
      "0"
    );

    const ss = String(
      remainingSeconds
    ).padStart(2, "0");

    if (hours > 0) {
      return `${String(hours).padStart(
        2,
        "0"
      )}:${mm}:${ss}`;
    }

    return `${mm}:${ss}`;
  };

  // ==========================================
  // DISCONNECT
  // ==========================================

  const disconnectRoom =
    useCallback(async () => {
      const room = roomRef.current;

      roomRef.current = null;

      try {
        if (room) {
          await room.disconnect();
        }
      } catch (error) {
        console.log(
          "Room disconnect error:",
          error
        );
      }

      try {
        await AudioSession.stopAudioSession();
      } catch (error) {
        console.log(
          "Audio session stop error:",
          error
        );
      }
    }, []);

  // ==========================================
  // CONNECT TO LIVEKIT
  // ==========================================

  const callRating = useCallRating({ bookingId, disconnectRoom, onEnding: setEnding });

  useEffect(() => {
    mountedRef.current = true;

    const connectToVoiceCall =
      async () => {
        try {
          if (!bookingId) {
            throw new Error(
              "Booking ID is missing."
            );
          }

         

          const storedRole =
  await AsyncStorage.getItem(
    "role"
  );

const role =
  passedRole || storedRole;

const userId =
  role === "counselor"
    ? await AsyncStorage.getItem(
        "counselorId"
      )
    : await AsyncStorage.getItem(
        "userId"
      );

const token =
  await AsyncStorage.getItem(
    "token"
  );

if (!userId) {
  throw new Error(
    role === "counselor"
      ? "Counselor information was not found."
      : "User information was not found."
  );
}

          if (
            role !== "user" &&
            role !== "counselor"
          ) {
            throw new Error(
              "Invalid voice call role."
            );
          }

          if (!token) {
            throw new Error(
              "Authentication token was not found. Please log in again."
            );
          }

          if (!BASE_URL) {
            throw new Error(
              "Backend URL is not configured."
            );
          }

          // ----------------------------------
          // Ask backend for LiveKit token
          // ----------------------------------

          const response = await fetch(
            `${BASE_URL}/api/calls/voice/token`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,

                "ngrok-skip-browser-warning":
                  "true",
              },

              body: JSON.stringify({
  bookingId,
}),
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to start voice call."
            );
          }

          if (
            !data?.serverUrl ||
            !data?.token
          ) {
            throw new Error(
              "Invalid LiveKit connection information."
            );
          }

          // ----------------------------------
          // Start native audio session
          // ----------------------------------

          await AudioSession.startAudioSession();

          // ----------------------------------
          // Create room
          // ----------------------------------

          const room = new Room({
            adaptiveStream: true,
            dynacast: true,
          });

          roomRef.current = room;
          callRating.attachRoom(room, data.role);

          // ----------------------------------
          // LiveKit events
          // ----------------------------------

          room.on(
            RoomEvent.ParticipantConnected,
            () => {
              if (mountedRef.current) {
                setRemoteJoined(true);
              }
            }
          );

          room.on(
            RoomEvent.ParticipantDisconnected,
            () => {
              if (mountedRef.current) {
                setRemoteJoined(false);
              }
            }
          );

          room.on(
            RoomEvent.ConnectionStateChanged,
            (state) => {
              if (!mountedRef.current) {
                return;
              }

              setConnected(
                state ===
                  ConnectionState.Connected
              );
            }
          );

          room.on(
            RoomEvent.Disconnected,
            () => {
              if (mountedRef.current) {
                setConnected(false);
                setRemoteJoined(false);
              }
            }
          );

          // ----------------------------------
          // Connect
          // ----------------------------------

          await room.connect(
            data.serverUrl,
            data.token
          );

          // ----------------------------------
          // Enable microphone
          // ----------------------------------

          await room.localParticipant
            .setMicrophoneEnabled(true);

          if (!mountedRef.current) {
            await room.disconnect();
            return;
          }

          setConnected(true);
          void callRating.connected();

          setRemoteJoined(
            room.remoteParticipants.size > 0
          );

          setConnecting(false);
        } catch (error: any) {
          console.error(
            "VOICE CALL ERROR:",
            error
          );

          if (!mountedRef.current) {
            return;
          }

          setConnecting(false);
          setConnected(false);

          Alert.alert(
            "Voice Call",
            error?.message ||
              "Unable to connect to the voice session.",
            [
              {
                text: "OK",

                onPress: async () => {
                  await disconnectRoom();

                  if (router.canGoBack()) {
                    router.back();
                  }
                },
              },
            ]
          );
        }
      };

    connectToVoiceCall();

    return () => {
      mountedRef.current = false;

      void disconnectRoom();
    };
  }, [
    bookingId,
    passedRole,
    disconnectRoom,
    callRating.attachRoom,
    callRating.connected,
  ]);

  // ==========================================
  // MUTE / UNMUTE
  // ==========================================

  const toggleMute = async () => {
    try {
      const room = roomRef.current;

      if (!room || !connected) {
        return;
      }

      const nextMuted = !muted;

      await room.localParticipant
        .setMicrophoneEnabled(
          !nextMuted
        );

      setMuted(nextMuted);
    } catch (error) {
      console.error(
        "MICROPHONE ERROR:",
        error
      );

      Alert.alert(
        "Microphone",
        "Unable to change the microphone."
      );
    }
  };

  // ==========================================
  // END CALL
  // ==========================================

  const endCall = callRating.endCall;

  // ==========================================
  // ANDROID BACK BUTTON
  // ==========================================

  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          Alert.alert(
            "End Voice Call?",
            "Do you want to leave this voice session?",
            [
              {
                text: "Stay",
                style: "cancel",
              },
              {
                text: "End Call",
                style: "destructive",
                onPress: () => {
                  void endCall();
                },
              },
            ]
          );

          return true;
        }
      );

    return () => {
      subscription.remove();
    };
  }, [endCall]);

  // ==========================================
  // CONNECTING SCREEN
  // ==========================================

  if (connecting) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
        />

        <View
          style={styles.centerContainer}
        >
          <View style={styles.avatar}>
            <Ionicons
              name="call"
              size={42}
              color="#ffffff"
            />
          </View>

          <Text style={styles.title}>
            Voice Session
          </Text>

          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />

          <Text style={styles.statusText}>
            Connecting securely...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // CALL SCREEN
  // ==========================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="light-content"
      />

      <View style={styles.header}>
        <View style={styles.secureBadge}>
          <Ionicons
            name="shield-checkmark"
            size={16}
            color="#D8FFF8"
          />

          <Text style={styles.secureText}>
            HopeHub Counseling
          </Text>
        </View>
      </View>

      <View style={styles.callContent}>
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={56}
              color="#ffffff"
            />
          </View>
        </View>

        <Text style={styles.title}>
          Voice Session
        </Text>

        <Text style={styles.callStatus}>
          {!connected
            ? "Disconnected"
            : remoteJoined
            ? "Connected"
            : "Waiting for the other participant..."}
        </Text>

        {connected && (
          <Text style={styles.timer}>
            {formatDuration(
              callSeconds
            )}
          </Text>
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlItem}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              muted &&
                styles.controlButtonActive,
            ]}
            onPress={toggleMute}
            disabled={!connected}
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                muted
                  ? "mic-off"
                  : "mic"
              }
              size={30}
              color="#ffffff"
            />
          </TouchableOpacity>

          <Text style={styles.controlLabel}>
            {muted
              ? "Unmute"
              : "Mute"}
          </Text>
        </View>

        <View style={styles.controlItem}>
          <TouchableOpacity
            style={styles.endButton}
            onPress={() => {
              Alert.alert(
                "End Voice Call?",
                "Are you sure you want to end this session?",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "End Call",
                    style:
                      "destructive",
                    onPress: () => {
                      void endCall();
                    },
                  },
                ]
              );
            }}
            disabled={ending}
            activeOpacity={0.8}
          >
            {ending ? (
              <ActivityIndicator
                color="#ffffff"
              />
            ) : (
              <Ionicons
                name="call"
                size={30}
                color="#ffffff"
                style={{
                  transform: [
                    {
                      rotate:
                        "135deg",
                    },
                  ],
                }}
              />
            )}
          </TouchableOpacity>

          <Text style={styles.controlLabel}>
            End
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#123D3A",
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  secureBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.10)",
  },

  secureText: {
    color: "#D8FFF8",
    fontSize: 13,
    fontWeight: "600",
  },

  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  callContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  avatarOuter: {
    width: 138,
    height: 138,
    borderRadius: 69,
    backgroundColor:
      "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },

  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "#2CA6A4",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    marginTop: 22,
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "700",
  },

  loader: {
    marginTop: 28,
  },

  statusText: {
    marginTop: 16,
    color: "#C7E4E1",
    fontSize: 15,
  },

  callStatus: {
    marginTop: 12,
    color: "#C7E4E1",
    fontSize: 15,
    textAlign: "center",
  },

  timer: {
    marginTop: 12,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },

  controls: {
    flexDirection: "row",
    justifyContent:
      "space-evenly",
    alignItems: "center",
    paddingHorizontal: 30,
    paddingBottom: 55,
  },

  controlItem: {
    alignItems: "center",
    minWidth: 90,
  },

  controlButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor:
      "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
  },

  controlButtonActive: {
    backgroundColor: "#566A68",
  },

  endButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#E05D5D",
    justifyContent: "center",
    alignItems: "center",
  },

  controlLabel: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
  },
});