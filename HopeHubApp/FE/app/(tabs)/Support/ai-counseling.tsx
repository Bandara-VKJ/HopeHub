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

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";

import {
  aiCounselingStyles as styles,
} from "./ai-counselingStyles";

/*
============================================================
BACKEND URL
============================================================
*/

const BASE_URL =
  "https://connector-removed-stoneware.ngrok-free.dev";

/*
============================================================
TYPES
============================================================
*/

type MessageRole =
  | "user"
  | "assistant";

type AIMessage = {
  _id?: string;

  role: MessageRole;

  content: string;

  createdAt?: string;
};

/*
============================================================
FETCH HELPER
============================================================
*/

const apiFetch = (
  url: string,
  options: RequestInit = {}
) => {
  return fetch(url, {
    ...options,

    headers: {
      Accept:
        "application/json",

      ...(options.headers || {}),

      "ngrok-skip-browser-warning":
        "true",
    },
  });
};

/*
============================================================
GET USER ID
============================================================
*/

const getUserId = async (): Promise<
  string | null
> => {
  const directUserId =
    await AsyncStorage.getItem(
      "userId"
    );

  if (directUserId) {
    return directUserId;
  }

  const storedUser =
    await AsyncStorage.getItem(
      "user"
    );

  if (!storedUser) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(storedUser);

    return (
      parsed?._id ||
      parsed?.id ||
      parsed?.userId ||
      null
    );
  } catch {
    return null;
  }
};

/*
============================================================
TIME
============================================================
*/

const formatTime = (
  dateString?: string
) => {
  if (!dateString) {
    return "";
  }

  const date =
    new Date(dateString);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

/*
============================================================
WELCOME
============================================================
*/

const welcomeMessage: AIMessage = {
  role: "assistant",

  content:
    "Hello. I'm your HopeHub AI Counselor. I'm here to listen and support you with your recovery journey. How are you feeling today?",

  createdAt:
    new Date().toISOString(),
};

/*
============================================================
SCREEN
============================================================
*/

export default function AICounselingScreen() {
  const [
    userId,
    setUserId,
  ] = useState<string | null>(
    null
  );

  const [
    messages,
    setMessages,
  ] = useState<AIMessage[]>(
    []
  );

  const [
    input,
    setInput,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const flatListRef =
    useRef<
      FlatList<AIMessage>
    >(null);

  /*
  ==========================================================
  LOAD CONVERSATION
  ==========================================================
  */

  const loadConversation =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const id =
            await getUserId();

          if (!id) {
            setMessages([
              welcomeMessage,
            ]);

            setError(
              "User account not found. Please login again."
            );

            return;
          }

          setUserId(id);

          const response =
            await apiFetch(
              `${BASE_URL}/api/ai-counseling/conversation/${encodeURIComponent(
                id
              )}`
            );

          const text =
            await response.text();

          let data: any = {};

          try {
            data = text
              ? JSON.parse(text)
              : {};
          } catch {
            throw new Error(
              "Invalid response from backend."
            );
          }

          if (!response.ok) {
            throw new Error(
              data.message ||
                "Could not load conversation."
            );
          }

          const savedMessages =
            Array.isArray(
              data?.conversation?.messages
            )
              ? data.conversation.messages
              : [];

          if (
            savedMessages.length >
            0
          ) {
            setMessages(
              savedMessages
            );
          } else {
            setMessages([
              welcomeMessage,
            ]);
          }

        } catch (err: any) {
          console.error(
            "LOAD AI CONVERSATION:",
            err
          );

          setMessages([
            welcomeMessage,
          ]);

          setError(
            err?.message ||
              "Could not connect to AI counseling."
          );

        } finally {
          setLoading(false);
        }
      },
      []
    );

  /*
  ==========================================================
  INITIAL LOAD
  ==========================================================
  */

  useEffect(() => {
    loadConversation();
  }, [
    loadConversation,
  ]);

  /*
  ==========================================================
  AUTO SCROLL
  ==========================================================
  */

  useEffect(() => {
    if (
      messages.length > 0
    ) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd(
          {
            animated: true,
          }
        );
      }, 100);
    }
  }, [messages.length]);

  /*
  ==========================================================
  SEND MESSAGE
  ==========================================================
  */

  const sendMessage =
    async () => {
      const text =
        input.trim();

      if (!text) {
        return;
      }

      if (sending) {
        return;
      }

      if (!userId) {
        Alert.alert(
          "Login Required",
          "Please login again."
        );

        return;
      }

      if (
        text.length > 2000
      ) {
        Alert.alert(
          "Message Too Long",
          "Please keep your message below 2000 characters."
        );

        return;
      }

      setInput("");
      setError("");

      const userMessage: AIMessage = {
        role: "user",

        content: text,

        createdAt:
          new Date().toISOString(),
      };

      setMessages(
        previous => [
          ...previous,
          userMessage,
        ]
      );

      setSending(true);

      try {
        const response =
          await apiFetch(
            `${BASE_URL}/api/ai-counseling/message`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                "ngrok-skip-browser-warning":
                  "true",
              },

              body: JSON.stringify({
                userId,
                message: text,
              }),
            }
          );

        const responseText =
          await response.text();

        let data: any = {};

        try {
          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};
        } catch {
          throw new Error(
            "Invalid response from AI server."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              data.error ||
              "AI counseling request failed."
          );
        }

        const aiText =
          data?.response ||
          data?.message?.content;

        if (
          typeof aiText !==
            "string" ||
          !aiText.trim()
        ) {
          throw new Error(
            "AI did not return a response."
          );
        }

        const assistantMessage: AIMessage = {
          role: "assistant",

          content:
            aiText.trim(),

          createdAt:
            data?.message
              ?.createdAt ||
            new Date().toISOString(),
        };

        setMessages(
          previous => [
            ...previous,
            assistantMessage,
          ]
        );

      } catch (err: any) {
        console.error(
          "SEND AI MESSAGE:",
          err
        );

        const message =
          err?.message ||
          "Could not connect to AI counselor.";

        setError(message);

        Alert.alert(
          "AI Counselor Unavailable",
          message
        );

      } finally {
        setSending(false);
      }
    };

  /*
  ==========================================================
  CLEAR CONVERSATION
  ==========================================================
  */

  const clearConversation =
    () => {
      if (!userId) {
        return;
      }

      Alert.alert(
        "Clear Conversation",
        "Delete your AI counseling conversation history?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },

          {
            text: "Clear",
            style: "destructive",

            onPress:
              async () => {
                try {
                  setLoading(true);

                  const response =
                    await apiFetch(
                      `${BASE_URL}/api/ai-counseling/conversation/${encodeURIComponent(
                        userId
                      )}`,
                      {
                        method:
                          "DELETE",

                        headers: {
                          Accept:
                            "application/json",

                          "ngrok-skip-browser-warning":
                            "true",
                        },
                      }
                    );

                  const text =
                    await response.text();

                  let data: any =
                    {};

                  try {
                    data =
                      text
                        ? JSON.parse(
                            text
                          )
                        : {};
                  } catch {
                    data = {};
                  }

                  if (!response.ok) {
                    throw new Error(
                      data.message ||
                        "Could not clear conversation."
                    );
                  }

                  setMessages([
                    welcomeMessage,
                  ]);

                  setError("");

                } catch (
                  err: any
                ) {
                  Alert.alert(
                    "Error",
                    err?.message ||
                      "Could not clear conversation."
                  );

                } finally {
                  setLoading(false);
                }
              },
          },
        ]
      );
    };

  /*
  ==========================================================
  MESSAGE
  ==========================================================
  */

  const renderMessage = ({
    item,
  }: {
    item: AIMessage;
  }) => {
    const isUser =
      item.role === "user";

    return (
      <View
        style={[
          styles.messageRow,

          isUser
            ? styles.userMessageRow
            : styles.assistantMessageRow,
        ]}
      >
        {!isUser && (
          <View
            style={styles.avatar}
          >
            <Ionicons
              name="sparkles"
              size={18}
              color="#FFFFFF"
            />
          </View>
        )}

        <View
          style={[
            styles.messageBubble,

            isUser
              ? styles.userBubble
              : styles.assistantBubble,
          ]}
        >
          <Text
            style={
              isUser
                ? styles.userText
                : styles.assistantText
            }
          >
            {item.content}
          </Text>

          {item.createdAt && (
            <Text
              style={[
                styles.timeText,

                isUser
                  ? styles.userTime
                  : styles.assistantTime,
              ]}
            >
              {formatTime(
                item.createdAt
              )}
            </Text>
          )}
        </View>

        {isUser && (
          <View
            style={[
              styles.avatar,
              styles.userAvatar,
            ]}
          >
            <Ionicons
              name="person"
              size={17}
              color="#FFFFFF"
            />
          </View>
        )}
      </View>
    );
  };

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <View
          style={
            styles.loadingContainer
          }
        >
          <ActivityIndicator
            size="large"
            color="#2CA6A4"
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Loading your AI counselor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /*
  ==========================================================
  UI
  ==========================================================
  */

  return (
    <SafeAreaView
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
        }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >

        {/* HEADER */}

        <View
          style={styles.header}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerTextContainer
            }
          >
            <Text
              style={
                styles.headerTitle
              }
            >
              HopeHub AI Counselor
            </Text>

            <Text
              style={
                styles.headerSubtitle
              }
            >
              Recovery support • Always available
            </Text>
          </View>

          <TouchableOpacity
            style={
              styles.headerIcon
            }
            onPress={
              clearConversation
            }
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* CHAT */}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={
            renderMessage
          }
          keyExtractor={(
            item,
            index
          ) =>
            item._id ||
            `${item.role}-${index}`
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            styles.chatContent
          }
          ListHeaderComponent={
            messages.length ===
            1 ? (
              <View
                style={
                  styles.welcomeCard
                }
              >
                <View
                  style={
                    styles.welcomeIcon
                  }
                >
                  <Ionicons
                    name="heart"
                    size={30}
                    color="#2CA6A4"
                  />
                </View>

                <Text
                  style={
                    styles.welcomeTitle
                  }
                >
                  You're not alone
                </Text>

                <Text
                  style={
                    styles.welcomeText
                  }
                >
                  Share what's on your mind.
                  I'll listen and provide
                  supportive recovery guidance.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            sending ? (
              <View
                style={[
                  styles.messageRow,
                  styles.assistantMessageRow,
                ]}
              >
                <View
                  style={
                    styles.avatar
                  }
                >
                  <Ionicons
                    name="sparkles"
                    size={18}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={
                    styles.typingBubble
                  }
                >
                  <ActivityIndicator
                    size="small"
                    color="#2CA6A4"
                  />

                  <Text
                    style={
                      styles.typingText
                    }
                  >
                    AI Counselor is thinking...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* ERROR */}

        {error ? (
          <Text
            style={
              styles.errorText
            }
          >
            {error}
          </Text>
        ) : null}

        {/* SAFETY */}

        <View
          style={
            styles.safetyBanner
          }
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={19}
            color="#B46B21"
          />

          <View
            style={
              styles.safetyTextContainer
            }
          >
            <Text
              style={
                styles.safetyTitle
              }
            >
              AI support is not a replacement for professional care
            </Text>

            <Text
              style={
                styles.safetyText
              }
            >
              If you are in immediate danger
              or experiencing an emergency,
              contact local emergency services
              or a qualified professional immediately.
            </Text>
          </View>
        </View>

        {/* INPUT */}

        <View
          style={
            styles.inputArea
          }
        >
          <View
            style={
              styles.inputWrapper
            }
          >
            <TextInput
              value={input}
              onChangeText={
                setInput
              }
              placeholder="Tell me how you're feeling..."
              placeholderTextColor="#899999"
              style={
                styles.input
              }
              multiline
              maxLength={2000}
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,

              (!input.trim() ||
                sending) &&
                styles.sendButtonDisabled,
            ]}
            disabled={
              !input.trim() ||
              sending
            }
            onPress={
              sendMessage
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