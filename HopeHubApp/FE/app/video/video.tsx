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
  VideoView,
} from "@livekit/react-native";

import {
  ConnectionState,
  LocalVideoTrack,
  RemoteVideoTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  router,
  useLocalSearchParams,
} from "expo-router";

const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL;

export default function VideoCallScreen() {
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

  const [remoteJoined, setRemoteJoined] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [cameraOff, setCameraOff] =
    useState(false);

  const [ending, setEnding] =
    useState(false);

  const [callSeconds, setCallSeconds] =
    useState(0);

  const [
    localVideoTrack,
    setLocalVideoTrack,
  ] = useState<LocalVideoTrack | null>(null);

  const [
    remoteVideoTrack,
    setRemoteVideoTrack,
  ] = useState<RemoteVideoTrack | null>(null);

  // ==========================================
  // CALL TIMER
  // ==========================================

  useEffect(() => {
    if (!connected) {
      return;
    }

    const timer = setInterval(() => {
      setCallSeconds(
        (value) => value + 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [connected]);

  const formatDuration = (
    seconds: number
  ) => {
    const hours = Math.floor(
      seconds / 3600
    );

    const minutes = Math.floor(
      (seconds % 3600) / 60
    );

    const remainingSeconds =
      seconds % 60;

    const mm = String(
      minutes
    ).padStart(2, "0");

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
  // FIND LOCAL CAMERA TRACK
  // ==========================================

  const updateLocalVideoTrack = (
    room: Room
  ) => {
    const publication =
      room.localParticipant.getTrackPublication(
        Track.Source.Camera
      );

    const track =
      publication?.track;

    if (
      track instanceof LocalVideoTrack
    ) {
      setLocalVideoTrack(track);
    } else {
      setLocalVideoTrack(null);
    }
  };

  // ==========================================
  // FIND REMOTE CAMERA TRACK
  // ==========================================

  const updateRemoteVideoTrack = (
    room: Room
  ) => {
    let foundTrack:
      | RemoteVideoTrack
      | null = null;

    room.remoteParticipants.forEach(
      (participant) => {
        const publication =
          participant.getTrackPublication(
            Track.Source.Camera
          );

        const track =
          publication?.track;

        if (
          track instanceof
          RemoteVideoTrack
        ) {
          foundTrack = track;
        }
      }
    );

    setRemoteVideoTrack(foundTrack);
  };

  // ==========================================
  // DISCONNECT
  // ==========================================

  const disconnectRoom =
    useCallback(async () => {
      const room =
        roomRef.current;

      roomRef.current = null;

      try {
        if (room) {
          try {
            await room.localParticipant
              .setCameraEnabled(false);
          } catch {}

          try {
            await room.localParticipant
              .setMicrophoneEnabled(false);
          } catch {}

          await room.disconnect();
        }
      } catch (error) {
        console.log(
          "Video room disconnect error:",
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

      if (mountedRef.current) {
        setLocalVideoTrack(null);
        setRemoteVideoTrack(null);
      }
    }, []);

  // ==========================================
  // CONNECT TO LIVEKIT
  // ==========================================

  useEffect(() => {
    mountedRef.current = true;

    const connectToVideoCall =
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
            passedRole ||
            storedRole;

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
              "Invalid video call role."
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

          // ==================================
          // GET LIVEKIT TOKEN
          // ==================================

          const response =
            await fetch(
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

                body:
                  JSON.stringify({
                    bookingId,
                  }),
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Unable to start video call."
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

          // ==================================
          // AUDIO SESSION
          // ==================================

          await AudioSession.startAudioSession();

          // ==================================
          // CREATE ROOM
          // ==================================

          const room =
            new Room({
              adaptiveStream: true,
              dynacast: true,
            });

          roomRef.current =
            room;

          // ==================================
          // PARTICIPANT EVENTS
          // ==================================

          room.on(
            RoomEvent.ParticipantConnected,
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              setRemoteJoined(true);

              updateRemoteVideoTrack(
                room
              );
            }
          );

          room.on(
            RoomEvent.ParticipantDisconnected,
            () => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              setRemoteJoined(
                room
                  .remoteParticipants
                  .size > 0
              );

              updateRemoteVideoTrack(
                room
              );
            }
          );

          // ==================================
          // TRACK EVENTS
          // ==================================

          room.on(
            RoomEvent.TrackSubscribed,
            (
              track
            ) => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              if (
                track instanceof
                RemoteVideoTrack
              ) {
                setRemoteVideoTrack(
                  track
                );
              }
            }
          );

          room.on(
            RoomEvent.TrackUnsubscribed,
            (
              track
            ) => {
              if (
                !mountedRef.current
              ) {
                return;
              }

              if (
                track instanceof
                RemoteVideoTrack
              ) {
                setRemoteVideoTrack(
                  null
                );

                updateRemoteVideoTrack(
                  room
                );
              }
            }
          );

          room.on(
            RoomEvent.TrackPublished,
            () => {
              if (
                mountedRef.current
              ) {
                updateRemoteVideoTrack(
                  room
                );
              }
            }
          );

          room.on(
            RoomEvent.TrackUnpublished,
            () => {
              if (
                mountedRef.current
              ) {
                updateRemoteVideoTrack(
                  room
                );
              }
            }
          );

          // ==================================
          // CONNECTION EVENTS
          // ==================================

          room.on(
            RoomEvent.ConnectionStateChanged,
            (state) => {
              if (
                !mountedRef.current
              ) {
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
              if (
                !mountedRef.current
              ) {
                return;
              }

              setConnected(false);
              setRemoteJoined(false);
              setRemoteVideoTrack(
                null
              );
            }
          );

          // ==================================
          // CONNECT
          // ==================================

          await room.connect(
            data.serverUrl,
            data.token
          );

          // ==================================
          // ENABLE MICROPHONE
          // ==================================

          await room.localParticipant
            .setMicrophoneEnabled(
              true
            );

          // ==================================
          // ENABLE CAMERA
          // ==================================

          await room.localParticipant
            .setCameraEnabled(
              true
            );

          updateLocalVideoTrack(
            room
          );

          updateRemoteVideoTrack(
            room
          );

          if (
            !mountedRef.current
          ) {
            await room.disconnect();
            return;
          }

          setConnected(true);

          setRemoteJoined(
            room.remoteParticipants
              .size > 0
          );

          setConnecting(false);
        } catch (error: any) {
          console.error(
            "VIDEO CALL ERROR:",
            error
          );

          if (
            !mountedRef.current
          ) {
            return;
          }

          setConnecting(false);
          setConnected(false);

          Alert.alert(
            "Video Call",
            error?.message ||
              "Unable to connect to the video session.",
            [
              {
                text: "OK",

                onPress:
                  async () => {
                    await disconnectRoom();

                    if (
                      router.canGoBack()
                    ) {
                      router.back();
                    }
                  },
              },
            ]
          );
        }
      };

    connectToVideoCall();

    return () => {
      mountedRef.current =
        false;

      void disconnectRoom();
    };
  }, [
    bookingId,
    passedRole,
    disconnectRoom,
  ]);

  // ==========================================
  // MUTE
  // ==========================================

  const toggleMute =
    async () => {
      try {
        const room =
          roomRef.current;

        if (
          !room ||
          !connected
        ) {
          return;
        }

        const nextMuted =
          !muted;

        await room.localParticipant
          .setMicrophoneEnabled(
            !nextMuted
          );

        setMuted(
          nextMuted
        );
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
  // CAMERA ON / OFF
  // ==========================================

  const toggleCamera =
    async () => {
      try {
        const room =
          roomRef.current;

        if (
          !room ||
          !connected
        ) {
          return;
        }

        const nextCameraOff =
          !cameraOff;

        await room.localParticipant
          .setCameraEnabled(
            !nextCameraOff
          );

        setCameraOff(
          nextCameraOff
        );

        updateLocalVideoTrack(
          room
        );
      } catch (error) {
        console.error(
          "CAMERA ERROR:",
          error
        );

        Alert.alert(
          "Camera",
          "Unable to change the camera."
        );
      }
    };

  // ==========================================
  // END CALL
  // ==========================================

  const endCall =
    useCallback(
      async () => {
        if (ending) {
          return;
        }

        setEnding(true);

        await disconnectRoom();

        if (
          router.canGoBack()
        ) {
          router.back();
        } else {
          router.replace(
            passedRole ===
              "counselor"
              ? "/(counselor)/counselor"
              : "/(tabs)/Support/support"
          );
        }
      },
      [
        disconnectRoom,
        ending,
        passedRole,
      ]
    );

  // ==========================================
  // ANDROID BACK BUTTON
  // ==========================================

  useEffect(() => {
    const subscription =
      BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          Alert.alert(
            "End Video Call?",
            "Do you want to leave this video session?",
            [
              {
                text: "Stay",
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

          return true;
        }
      );

    return () => {
      subscription.remove();
    };
  }, [endCall]);

  // ==========================================
  // CONNECTING
  // ==========================================

  if (connecting) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <StatusBar
          barStyle="light-content"
        />

        <View
          style={
            styles.centerContainer
          }
        >
          <Ionicons
            name="videocam"
            size={55}
            color="#ffffff"
          />

          <Text
            style={styles.title}
          >
            Video Session
          </Text>

          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={styles.loader}
          />

          <Text
            style={
              styles.statusText
            }
          >
            Connecting securely...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // VIDEO SCREEN
  // ==========================================

  return (
    <SafeAreaView
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
      />

      {/* REMOTE VIDEO */}

      <View
        style={
          styles.remoteVideoContainer
        }
      >
        {remoteVideoTrack ? (
          <VideoView
            videoTrack={
              remoteVideoTrack
            }
            style={
              styles.remoteVideo
            }
            objectFit="cover"
          />
        ) : (
          <View
            style={
              styles.waitingContainer
            }
          >
            <Ionicons
              name="person-circle-outline"
              size={100}
              color="#A9CFCA"
            />

            <Text
              style={
                styles.waitingTitle
              }
            >
              {remoteJoined
                ? "Camera is off"
                : "Waiting for the other participant..."}
            </Text>
          </View>
        )}

        {/* HEADER */}

        <View
          style={styles.header}
        >
          <View
            style={
              styles.secureBadge
            }
          >
            <Ionicons
              name="shield-checkmark"
              size={15}
              color="#D8FFF8"
            />

            <Text
              style={
                styles.secureText
              }
            >
              HopeHub Counseling
            </Text>
          </View>

          <Text
            style={
              styles.timer
            }
          >
            {formatDuration(
              callSeconds
            )}
          </Text>
        </View>

        {/* LOCAL VIDEO */}

        <View
          style={
            styles.localVideoContainer
          }
        >
          {localVideoTrack &&
          !cameraOff ? (
            <VideoView
              videoTrack={
                localVideoTrack
              }
              style={
                styles.localVideo
              }
              objectFit="cover"
              mirror={true}
              zOrder={2}
            />
          ) : (
            <View
              style={
                styles.localCameraOff
              }
            >
              <Ionicons
                name="videocam-off"
                size={30}
                color="#ffffff"
              />
            </View>
          )}
        </View>

        {/* CONTROLS */}

        <View
          style={
            styles.controls
          }
        >
          <View
            style={
              styles.controlItem
            }
          >
            <TouchableOpacity
              style={[
                styles.controlButton,
                muted &&
                  styles.controlButtonActive,
              ]}
              onPress={
                toggleMute
              }
              disabled={
                !connected
              }
            >
              <Ionicons
                name={
                  muted
                    ? "mic-off"
                    : "mic"
                }
                size={27}
                color="#ffffff"
              />
            </TouchableOpacity>

            <Text
              style={
                styles.controlLabel
              }
            >
              {muted
                ? "Unmute"
                : "Mute"}
            </Text>
          </View>

          <View
            style={
              styles.controlItem
            }
          >
            <TouchableOpacity
              style={[
                styles.controlButton,
                cameraOff &&
                  styles.controlButtonActive,
              ]}
              onPress={
                toggleCamera
              }
              disabled={
                !connected
              }
            >
              <Ionicons
                name={
                  cameraOff
                    ? "videocam-off"
                    : "videocam"
                }
                size={27}
                color="#ffffff"
              />
            </TouchableOpacity>

            <Text
              style={
                styles.controlLabel
              }
            >
              {cameraOff
                ? "Camera On"
                : "Camera Off"}
            </Text>
          </View>

          <View
            style={
              styles.controlItem
            }
          >
            <TouchableOpacity
              style={
                styles.endButton
              }
              disabled={ending}
              onPress={() => {
                Alert.alert(
                  "End Video Call?",
                  "Are you sure you want to end this session?",
                  [
                    {
                      text:
                        "Cancel",
                      style:
                        "cancel",
                    },
                    {
                      text:
                        "End Call",
                      style:
                        "destructive",

                      onPress:
                        () => {
                          void endCall();
                        },
                    },
                  ]
                );
              }}
            >
              {ending ? (
                <ActivityIndicator
                  color="#ffffff"
                />
              ) : (
                <Ionicons
                  name="call"
                  size={28}
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

            <Text
              style={
                styles.controlLabel
              }
            >
              End
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ============================================
// STYLES
// ============================================

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "#123D3A",
    },

    centerContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 24,
    },

    title: {
      marginTop: 20,
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

    remoteVideoContainer: {
      flex: 1,
      position: "relative",
      backgroundColor:
        "#123D3A",
    },

    remoteVideo: {
      flex: 1,
      width: "100%",
      height: "100%",
    },

    waitingContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent:
        "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },

    waitingTitle: {
      marginTop: 18,
      color: "#ffffff",
      fontSize: 17,
      textAlign: "center",
    },

    header: {
      position: "absolute",
      top: 22,
      left: 20,
      right: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    secureBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor:
        "rgba(0,0,0,0.35)",
    },

    secureText: {
      color: "#D8FFF8",
      fontSize: 12,
      fontWeight: "600",
    },

    timer: {
      color: "#ffffff",
      fontSize: 16,
      fontWeight: "700",
      backgroundColor:
        "rgba(0,0,0,0.35)",
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 18,
    },

    localVideoContainer: {
      position: "absolute",
      top: 85,
      right: 18,
      width: 110,
      height: 155,
      borderRadius: 15,
      overflow: "hidden",
      backgroundColor:
        "#284D4A",
      borderWidth: 2,
      borderColor:
        "rgba(255,255,255,0.65)",
    },

    localVideo: {
      width: "100%",
      height: "100%",
    },

    localCameraOff: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      backgroundColor:
        "#284D4A",
    },

    controls: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 35,
      flexDirection: "row",
      justifyContent:
        "space-evenly",
      alignItems: "center",
      paddingHorizontal: 20,
    },

    controlItem: {
      alignItems: "center",
      minWidth: 80,
    },

    controlButton: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor:
        "rgba(20,20,20,0.60)",
      justifyContent:
        "center",
      alignItems: "center",
    },

    controlButtonActive: {
      backgroundColor:
        "#566A68",
    },

    endButton: {
      width: 62,
      height: 62,
      borderRadius: 31,
      backgroundColor:
        "#E05D5D",
      justifyContent:
        "center",
      alignItems: "center",
    },

    controlLabel: {
      marginTop: 8,
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "500",
    },
  });