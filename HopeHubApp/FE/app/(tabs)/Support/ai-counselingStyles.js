import { StyleSheet } from "react-native";

export const aiCounselingStyles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor: "#F5F7F8",
    },

    header: {
      height: 76,
      backgroundColor: "#2CA6A4",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,

      elevation: 4,

      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(255,255,255,0.16)",
    },

    headerTextContainer: {
      flex: 1,
      marginLeft: 12,
    },

    headerTitle: {
      color: "#FFFFFF",
      fontSize: 18,
      fontWeight: "700",
    },

    headerSubtitle: {
      color:
        "rgba(255,255,255,0.85)",
      fontSize: 12,
      marginTop: 2,
    },

    headerIcon: {
      width: 42,
      height: 42,
      borderRadius: 21,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor:
        "rgba(255,255,255,0.16)",
    },

    chatContent: {
      paddingHorizontal: 14,
      paddingTop: 18,
      paddingBottom: 20,
    },

    messageRow: {
      flexDirection: "row",
      marginBottom: 14,
    },

    userMessageRow: {
      justifyContent: "flex-end",
    },

    assistantMessageRow: {
      justifyContent: "flex-start",
    },

    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,

      backgroundColor: "#2CA6A4",

      alignItems: "center",
      justifyContent: "center",

      marginRight: 8,
    },

    userAvatar: {
      backgroundColor: "#6B7280",

      marginRight: 0,
      marginLeft: 8,
    },

    messageBubble: {
      maxWidth: "78%",

      paddingHorizontal: 14,
      paddingVertical: 11,

      borderRadius: 18,
    },

    assistantBubble: {
      backgroundColor: "#FFFFFF",

      borderBottomLeftRadius: 5,

      elevation: 1,

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 3,

      shadowOffset: {
        width: 0,
        height: 1,
      },
    },

    userBubble: {
      backgroundColor: "#2CA6A4",

      borderBottomRightRadius: 5,
    },

    assistantText: {
      color: "#263636",

      fontSize: 15,
      lineHeight: 21,
    },

    userText: {
      color: "#FFFFFF",

      fontSize: 15,
      lineHeight: 21,
    },

    timeText: {
      fontSize: 9,
      marginTop: 5,
      opacity: 0.55,
    },

    assistantTime: {
      color: "#536565",
    },

    userTime: {
      color: "#FFFFFF",
    },

    welcomeCard: {
      backgroundColor: "#FFFFFF",

      borderRadius: 20,

      padding: 20,

      marginBottom: 18,

      alignItems: "center",

      elevation: 2,

      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 5,

      shadowOffset: {
        width: 0,
        height: 2,
      },
    },

    welcomeIcon: {
      width: 62,
      height: 62,

      borderRadius: 31,

      backgroundColor: "#E5F7F6",

      alignItems: "center",
      justifyContent: "center",

      marginBottom: 12,
    },

    welcomeTitle: {
      fontSize: 20,
      fontWeight: "700",

      color: "#193737",

      marginBottom: 7,

      textAlign: "center",
    },

    welcomeText: {
      fontSize: 13,
      lineHeight: 19,

      color: "#687878",

      textAlign: "center",
    },

    typingBubble: {
      backgroundColor: "#FFFFFF",

      borderRadius: 18,

      borderBottomLeftRadius: 5,

      paddingHorizontal: 16,
      paddingVertical: 12,

      flexDirection: "row",
      alignItems: "center",
    },

    typingText: {
      color: "#697878",

      marginLeft: 8,

      fontSize: 13,
    },

    inputArea: {
      backgroundColor: "#FFFFFF",

      borderTopWidth: 1,
      borderTopColor: "#E5EAEA",

      paddingHorizontal: 10,
      paddingTop: 9,
      paddingBottom: 10,

      flexDirection: "row",
      alignItems: "flex-end",
    },

    inputWrapper: {
      flex: 1,

      minHeight: 46,
      maxHeight: 120,

      backgroundColor: "#F2F5F5",

      borderRadius: 23,

      paddingHorizontal: 15,

      justifyContent: "center",
    },

    input: {
      color: "#263636",

      fontSize: 15,

      maxHeight: 100,

      paddingTop: 10,
      paddingBottom: 10,
    },

    sendButton: {
      width: 46,
      height: 46,

      borderRadius: 23,

      backgroundColor: "#2CA6A4",

      alignItems: "center",
      justifyContent: "center",

      marginLeft: 8,
    },

    sendButtonDisabled: {
      backgroundColor: "#A9C9C8",
    },

    safetyBanner: {
      marginHorizontal: 12,
      marginBottom: 8,

      backgroundColor: "#FFF8EF",

      borderRadius: 12,

      paddingHorizontal: 12,
      paddingVertical: 9,

      flexDirection: "row",
      alignItems: "center",
    },

    safetyTextContainer: {
      flex: 1,
      marginLeft: 8,
    },

    safetyTitle: {
      color: "#9A5A17",

      fontWeight: "700",

      fontSize: 11,
    },

    safetyText: {
      color: "#8A6A47",

      fontSize: 10,

      lineHeight: 14,

      marginTop: 2,
    },

    loadingContainer: {
      flex: 1,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: "#F5F7F8",
    },

    loadingText: {
      marginTop: 10,

      color: "#647474",

      fontSize: 14,
    },

    errorText: {
      color: "#B42318",

      fontSize: 12,

      textAlign: "center",

      paddingHorizontal: 20,

      marginBottom: 8,
    },
  });