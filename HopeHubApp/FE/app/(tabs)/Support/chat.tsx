import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  io,
  Socket,
} from "socket.io-client";

import { chatStyles } from "./chatStyle";

// ============================================================
// BACKEND URL
// ============================================================

const BASE_URL =
  "https://connector-removed-stoneware.ngrok-free.dev";

// ============================================================
// NGROK FETCH
// ============================================================

const ngrokFetch = (
  url: string,
  options: RequestInit = {}
) => {
  return fetch(url, {
    ...options,

    headers: {
      ...(options.headers || {}),

      "ngrok-skip-browser-warning": "true",
    },
  });
};

// ============================================================
// TYPES
// ============================================================

type ChatRole =
  | "user"
  | "counselor";

type Message = {
  _id?: string;

  booking?: string;

  sender?: string;

  senderRole?:
    | "user"
    | "counselor";

  receiver?: string;

  message: string;

  createdAt?: string;

  isRead?: boolean;
};

// ============================================================
// COMPONENT
// ============================================================

export default function Chat() {
  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigation = useNavigation();

  // ==========================================================
  // PARAMETERS
  // ==========================================================

  const params =
    useLocalSearchParams<{
      bookingId?: string | string[];

      role?:
        | string
        | string[];
    }>();

  const bookingId =
    Array.isArray(params.bookingId)
      ? params.bookingId[0]
      : params.bookingId;

  const roleParam =
    Array.isArray(params.role)
      ? params.role[0]
      : params.role;

  const role: ChatRole =
    roleParam === "counselor"
      ? "counselor"
      : "user";

  // ==========================================================
  // HIDE BOTTOM TAB BAR
  // ==========================================================
  //
  // IMPORTANT:
  // Chat can be nested several levels below the Tabs navigator.
  // Therefore we walk through all parent navigators until we
  // find the navigator whose type is "tab".
  //
  // This fixes the bottom navigation appearing over the chat.
  // ==========================================================

  useFocusEffect(
    useCallback(() => {
      const tabParents: any[] = [];

      let parent: any =
        navigation.getParent();

      // --------------------------------------------------------
      // Find every parent navigator
      // --------------------------------------------------------

      while (parent) {
        tabParents.push(parent);

        const state =
          parent.getState?.();

        // If this is the Tabs navigator, hide its tab bar.
        if (state?.type === "tab") {
          parent.setOptions({
            tabBarStyle: {
              display: "none",
              height: 0,
            },
          });

          break;
        }

        parent =
          parent.getParent?.();
      }

      // --------------------------------------------------------
      // Restore tab bar when leaving Chat
      // --------------------------------------------------------

      return () => {
        for (
          let i = tabParents.length - 1;
          i >= 0;
          i--
        ) {
          const current =
            tabParents[i];

          const state =
            current?.getState?.();

          if (state?.type === "tab") {
            current.setOptions({
              tabBarStyle: undefined,
            });

            break;
          }
        }
      };
    }, [navigation])
  );

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    messages,
    setMessages,
  ] = useState<Message[]>([]);

  const [
    messageText,
    setMessageText,
  ] = useState("");

  const [
    currentUserId,
    setCurrentUserId,
  ] = useState<string | null>(
    null
  );

  const [
    counselorId,
    setCounselorId,
  ] = useState<string | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    connected,
    setConnected,
  ] = useState(false);

  const [
    otherName,
    setOtherName,
  ] = useState(
    role === "counselor"
      ? "Patient"
      : "Counselor"
  );

  const [
    typing,
    setTyping,
  ] = useState(false);

  // ==========================================================
  // REFS
  // ==========================================================

  const socketRef =
    useRef<Socket | null>(
      null
    );

  const flatListRef =
    useRef<
      FlatList<Message> | null
    >(null);

  const inputRef =
    useRef<TextInput | null>(
      null
    );

  // ==========================================================
  // GET CURRENT USER ID
  // ==========================================================

  const getCurrentUserId =
    async (): Promise<
      string | null
    > => {
      try {
        // ------------------------------------------------------
        // COUNSELOR
        // ------------------------------------------------------

        if (
          role ===
          "counselor"
        ) {
          const counselorId =
            await AsyncStorage.getItem(
              "counselorId"
            );

          if (
            counselorId?.trim()
          ) {
            return counselorId.trim();
          }

          const counselor =
            await AsyncStorage.getItem(
              "counselor"
            );

          if (counselor) {
            try {
              const parsed =
                JSON.parse(
                  counselor
                );

              const id =
                parsed?._id ||
                parsed?.id;

              return id
                ? String(id)
                : null;
            } catch {
              return null;
            }
          }

          return null;
        }

        // ------------------------------------------------------
        // USER
        // ------------------------------------------------------

        const userId =
          await AsyncStorage.getItem(
            "userId"
          );

        if (
          userId?.trim()
        ) {
          return userId.trim();
        }

        const user =
          await AsyncStorage.getItem(
            "user"
          );

        if (user) {
          try {
            const parsed =
              JSON.parse(user);

            const id =
              parsed?._id ||
              parsed?.id;

            return id
              ? String(id)
              : null;
          } catch {
            return null;
          }
        }

        return null;
      } catch (error) {
        console.log(
          "GET CURRENT USER ID ERROR:",
          error
        );

        return null;
      }
    };

  // ==========================================================
  // LOAD BOOKING
  // ==========================================================

  const loadBooking =
    useCallback(
      async (
        userId: string
      ) => {
        if (!bookingId) {
          throw new Error(
            "Booking ID is missing."
          );
        }

        const endpoint =
          role === "counselor"
            ? `${BASE_URL}/api/bookings/counselor/${userId}`
            : `${BASE_URL}/api/bookings/patient/${userId}`;

        const response =
          await ngrokFetch(
            endpoint
          );

        const data =
          await response.json();

        console.log(
          "BOOKINGS:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load booking."
          );
        }

        const bookings =
          Array.isArray(
            data?.bookings
          )
            ? data.bookings
            : [];

        const booking =
          bookings.find(
            (item: any) =>
              String(
                item?._id
              ) ===
              String(
                bookingId
              )
          );

        if (!booking) {
          throw new Error(
            "Booking not found."
          );
        }

        // ------------------------------------------------------
        // ONLY CONFIRMED BOOKINGS CAN CHAT
        // ------------------------------------------------------

        if (
          booking.status !==
          "confirmed"
        ) {
          throw new Error(
            "This counseling session has not been confirmed by the counselor yet."
          );
        }

        // ------------------------------------------------------
        // COUNSELOR
        // ------------------------------------------------------

        if (
          role ===
          "counselor"
        ) {
          const patient =
            booking.patient;

          const patientId =
            patient?._id ||
            patient?.id ||
            patient;

          if (!patientId) {
            throw new Error(
              "Patient information is missing."
            );
          }

          const patientName =
            patient?.name ||
            `${patient?.firstName || ""} ${
              patient?.lastName || ""
            }`.trim();

          setOtherName(
            patientName ||
              "Patient"
          );

          setCounselorId(
            String(userId)
          );

          return booking;
        }

        // ------------------------------------------------------
        // USER
        // ------------------------------------------------------

        const counselor =
          booking.counselor;

        const id =
          counselor?._id ||
          counselor?.id ||
          counselor;

        if (!id) {
          throw new Error(
            "Counselor information is missing."
          );
        }

        setCounselorId(
          String(id)
        );

        const counselorName =
          counselor?.name ||
          `${counselor?.firstName || ""} ${
            counselor?.lastName || ""
          }`.trim();

        setOtherName(
          counselorName ||
            "Counselor"
        );

        return booking;
      },
      [
        bookingId,
        role,
      ]
    );

  // ==========================================================
  // LOAD CHAT HISTORY
  // ==========================================================

  const loadMessages =
    useCallback(
      async (
        userId: string
      ) => {
        if (!bookingId) {
          return;
        }

        try {
          const response =
            await ngrokFetch(
              `${BASE_URL}/api/chat/${bookingId}/messages?userId=${encodeURIComponent(
                userId
              )}`
            );

          const data =
            await response.json();

          console.log(
            "CHAT HISTORY:",
            data
          );

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to load chat."
            );
          }

          setMessages(
            Array.isArray(
              data?.messages
            )
              ? data.messages
              : []
          );
        } catch (error) {
          console.log(
            "LOAD CHAT ERROR:",
            error
          );

          throw error;
        }
      },
      [bookingId]
    );

  // ==========================================================
  // CONNECT SOCKET
  // ==========================================================

  const connectSocket =
    useCallback(
      (
        userId: string
      ) => {
        if (!bookingId) {
          return;
        }

        // ------------------------------------------------------
        // CLOSE OLD SOCKET
        // ------------------------------------------------------

        if (
          socketRef.current
        ) {
          socketRef.current.disconnect();

          socketRef.current =
            null;
        }

        console.log(
          "CONNECTING SOCKET:",
          {
            bookingId,
            userId,
            role,
          }
        );

        // ------------------------------------------------------
        // CREATE SOCKET
        // ------------------------------------------------------

        const socket =
          io(
            BASE_URL,
            {
              transports: [
                "websocket",
                "polling",
              ],

              reconnection: true,

              reconnectionAttempts: 10,

              timeout: 10000,

              extraHeaders: {
                "ngrok-skip-browser-warning":
                  "true",
              },
            }
          );

        socketRef.current =
          socket;

        // ======================================================
        // CONNECTED
        // ======================================================

        socket.on(
          "connect",
          () => {
            console.log(
              "SOCKET CONNECTED:",
              socket.id
            );

            setConnected(
              true
            );

            socket.emit(
              "joinBooking",
              {
                bookingId,

                userId,

                role,
              }
            );
          }
        );

        // ======================================================
        // JOINED BOOKING
        // ======================================================

        socket.on(
          "joinedBooking",
          (
            data
          ) => {
            console.log(
              "JOINED BOOKING:",
              data
            );
          }
        );

        // ======================================================
        // NEW MESSAGE
        // ======================================================

        socket.on(
          "newMessage",
          (
            newMessage: Message
          ) => {
            console.log(
              "NEW MESSAGE:",
              newMessage
            );

            setMessages(
              (previous) => {
                // Prevent duplicate messages
                if (
                  newMessage?._id &&
                  previous.some(
                    (item) =>
                      item._id ===
                      newMessage._id
                  )
                ) {
                  return previous;
                }

                return [
                  ...previous,
                  newMessage,
                ];
              }
            );

            setTimeout(
              () => {
                flatListRef.current?.scrollToEnd(
                  {
                    animated: true,
                  }
                );
              },
              100
            );
          }
        );

        // ======================================================
        // TYPING
        // ======================================================

        socket.on(
          "userTyping",
          () => {
            setTyping(
              true
            );
          }
        );

        socket.on(
          "userStoppedTyping",
          () => {
            setTyping(
              false
            );
          }
        );

        // ======================================================
        // CHAT ERROR
        // ======================================================

        socket.on(
          "chatError",
          (
            error
          ) => {
            console.log(
              "CHAT ERROR:",
              error
            );

            setSending(
              false
            );

            Alert.alert(
              "Chat Error",
              error?.message ||
                "Unable to process chat request."
            );
          }
        );

        // ======================================================
        // CONNECTION ERROR
        // ======================================================

        socket.on(
          "connect_error",
          (
            error
          ) => {
            console.log(
              "SOCKET CONNECTION ERROR:",
              error.message
            );

            setConnected(
              false
            );
          }
        );

        // ======================================================
        // DISCONNECT
        // ======================================================

        socket.on(
          "disconnect",
          (
            reason
          ) => {
            console.log(
              "SOCKET DISCONNECTED:",
              reason
            );

            setConnected(
              false
            );
          }
        );
      },
      [
        bookingId,
        role,
      ]
    );

  // ==========================================================
  // INITIALIZE CHAT
  // ==========================================================

  useEffect(() => {
    let mounted =
      true;

    const initialize =
      async () => {
        try {
          if (!bookingId) {
            Alert.alert(
              "Chat Error",
              "Booking ID is missing."
            );

            return;
          }

          const userId =
            await getCurrentUserId();

          if (!userId) {
            Alert.alert(
              "Login Required",
              role ===
                "counselor"
                ? "Counselor ID was not found. Please login again."
                : "User ID was not found. Please login again."
            );

            return;
          }

          if (!mounted) {
            return;
          }

          setCurrentUserId(
            userId
          );

          // ----------------------------------------------------
          // LOAD BOOKING
          // ----------------------------------------------------

          await loadBooking(
            userId
          );

          // ----------------------------------------------------
          // LOAD HISTORY
          // ----------------------------------------------------

          await loadMessages(
            userId
          );

          // ----------------------------------------------------
          // CONNECT SOCKET
          // ----------------------------------------------------

          connectSocket(
            userId
          );
        } catch (error: any) {
          console.log(
            "INITIALIZE CHAT ERROR:",
            error
          );

          if (mounted) {
            Alert.alert(
              "Unable to Open Chat",
              error?.message ||
                "Something went wrong while opening the chat."
            );
          }
        } finally {
          if (mounted) {
            setLoading(
              false
            );
          }
        }
      };

    initialize();

    return () => {
      mounted =
        false;

      if (
        socketRef.current
      ) {
        socketRef.current.disconnect();

        socketRef.current =
          null;
      }
    };
  }, [
    bookingId,
    role,
    loadBooking,
    loadMessages,
    connectSocket,
  ]);

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const sendMessage =
    () => {
      const cleanMessage =
        messageText.trim();

      if (!cleanMessage) {
        return;
      }

      if (!bookingId) {
        Alert.alert(
          "Error",
          "Booking ID is missing."
        );

        return;
      }

      if (!currentUserId) {
        Alert.alert(
          "Error",
          "User ID is missing."
        );

        return;
      }

      if (
        !socketRef.current ||
        !socketRef.current.connected
      ) {
        Alert.alert(
          "Connection Error",
          "Chat server is not connected. Please try again."
        );

        return;
      }

      try {
        setSending(
          true
        );

        // Backend determines sender,
        // senderRole and receiver.

        socketRef.current.emit(
          "sendMessage",
          {
            bookingId,

            message:
              cleanMessage,
          }
        );

        setMessageText("");

        setTimeout(
          () => {
            setSending(
              false
            );
          },
          500
        );

        requestAnimationFrame(
          () => {
            inputRef.current?.focus();

            setTimeout(
              () => {
                flatListRef.current?.scrollToEnd(
                  {
                    animated: true,
                  }
                );
              },
              100
            );
          }
        );
      } catch (error) {
        console.log(
          "SEND MESSAGE ERROR:",
          error
        );

        setSending(
          false
        );

        Alert.alert(
          "Error",
          "Unable to send message."
        );
      }
    };

  // ==========================================================
  // TYPING
  // ==========================================================

  const handleTyping =
    (
      text: string
    ) => {
      setMessageText(
        text
      );

      if (
        socketRef.current?.connected &&
        bookingId &&
        currentUserId
      ) {
        if (
          text.length > 0
        ) {
          socketRef.current.emit(
            "typing",
            {
              bookingId,

              userId:
                currentUserId,
            }
          );
        } else {
          socketRef.current.emit(
            "stopTyping",
            {
              bookingId,

              userId:
                currentUserId,
            }
          );
        }
      }
    };

  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime =
    (
      date?: string
    ) => {
      if (!date) {
        return "";
      }

      try {
        return new Date(
          date
        ).toLocaleTimeString(
          [],
          {
            hour:
              "2-digit",

            minute:
              "2-digit",
          }
        );
      } catch {
        return "";
      }
    };

  // ==========================================================
  // RENDER MESSAGE
  // ==========================================================

  const renderMessage =
    ({
      item,
    }: {
      item: Message;
    }) => {
      const isMine =
        String(
          item.sender
        ) ===
        String(
          currentUserId
        );

      return (
        <View
          style={[
            chatStyles.messageRow,

            isMine
              ? chatStyles.myMessageRow
              : chatStyles.otherMessageRow,
          ]}
        >
          <View
            style={[
              chatStyles.messageBubble,

              isMine
                ? chatStyles.myBubble
                : chatStyles.otherBubble,
            ]}
          >
            <Text
              style={[
                chatStyles.messageText,

                isMine
                  ? chatStyles.myMessageText
                  : chatStyles.otherMessageText,
              ]}
            >
              {item.message}
            </Text>

            <Text
              style={[
                chatStyles.timeText,

                isMine
                  ? chatStyles.myTimeText
                  : chatStyles.otherTimeText,
              ]}
            >
              {formatTime(
                item.createdAt
              )}
            </Text>
          </View>
        </View>
      );
    };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (loading) {
    return (
      <SafeAreaView
        style={
          chatStyles.container
        }
      >
        <View
          style={
            chatStyles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2CA6A4"
          />

          <Text
            style={
              chatStyles.loadingText
            }
          >
            Opening chat...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================================
  // MAIN CHAT UI
  // ==========================================================

  return (
    <SafeAreaView
      style={
        chatStyles.container
      }
    >
      <KeyboardAvoidingView
        style={
          chatStyles.keyboardContainer
        }
        behavior={
          Platform.OS ===
          "ios"
            ? "padding"
            : "height"
        }
        keyboardVerticalOffset={
          0
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            chatStyles.header
          }
        >
          <TouchableOpacity
            style={
              chatStyles.backButton
            }
            onPress={() =>
              router.back()
            }
            activeOpacity={
              0.7
            }
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#1F2937"
            />
          </TouchableOpacity>

          <View
            style={
              chatStyles.avatar
            }
          >
            <Ionicons
              name={
                role ===
                "counselor"
                  ? "person"
                  : "medkit-outline"
              }
              size={22}
              color="#2CA6A4"
            />
          </View>

          <View
            style={
              chatStyles.headerInfo
            }
          >
            <Text
              numberOfLines={
                1
              }
              style={
                chatStyles.headerTitle
              }
            >
              {otherName}
            </Text>

            <View
              style={
                chatStyles.statusRow
              }
            >
              <View
                style={[
                  chatStyles.statusDot,

                  connected
                    ? chatStyles.connectedDot
                    : chatStyles.disconnectedDot,
                ]}
              />

              <Text
                style={
                  chatStyles.statusText
                }
              >
                {connected
                  ? typing
                    ? "Typing..."
                    : "Online"
                  : "Connecting..."}
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            MESSAGES
        ================================================== */}

        <FlatList
          ref={
            flatListRef
          }
          style={
            chatStyles.messagesListContainer
          }
          data={
            messages
          }
          keyExtractor={(
            item,
            index
          ) =>
            item._id ||
            `${item.sender}-${item.createdAt}-${index}`
          }
          renderItem={
            renderMessage
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={
            messages.length ===
            0
              ? chatStyles.emptyList
              : chatStyles.messagesList
          }
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd(
              {
                animated:
                  false,
              }
            );
          }}
          ListEmptyComponent={
            <View
              style={
                chatStyles.emptyContainer
              }
            >
              <View
                style={
                  chatStyles.emptyIcon
                }
              >
                <Ionicons
                  name="chatbubbles-outline"
                  size={40}
                  color="#2CA6A4"
                />
              </View>

              <Text
                style={
                  chatStyles.emptyTitle
                }
              >
                Start Conversation
              </Text>

              <Text
                style={
                  chatStyles.emptyText
                }
              >
                {role ===
                "counselor"
                  ? "Start a conversation with your patient."
                  : "Send a message to your counselor."}
              </Text>
            </View>
          }
        />

        {/* ==================================================
            MESSAGE INPUT
        ================================================== */}

        <View
          style={
            chatStyles.inputArea
          }
        >
          <View
            style={
              chatStyles.inputBox
            }
          >
            <TextInput
              ref={
                inputRef
              }
              style={
                chatStyles.textInput
              }
              value={
                messageText
              }
              onChangeText={
                handleTyping
              }
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={
                1000
              }
              editable={
                connected &&
                !sending
              }
              textAlignVertical="center"
              returnKeyType="default"
              blurOnSubmit={false}
            />
          </View>

          <TouchableOpacity
            style={[
              chatStyles.sendButton,

              (!messageText.trim() ||
                !connected ||
                sending) &&
                chatStyles.sendButtonDisabled,
            ]}
            onPress={
              sendMessage
            }
            disabled={
              !messageText.trim() ||
              !connected ||
              sending
            }
            activeOpacity={
              0.8
            }
          >
            {sending ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="send"
                size={20}
                color="#FFFFFF"
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}