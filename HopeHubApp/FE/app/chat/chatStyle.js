import {
  StyleSheet,
  Platform,
} from "react-native";

export const chatStyles = StyleSheet.create({
  // ============================================================
  // MAIN
  // ============================================================

  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F5F7F8",
  },

  keyboardContainer: {
    flex: 1,
    width: "100%",
    backgroundColor: "#F5F7F8",
  },

  // ============================================================
  // LOADING
  // ============================================================

  loadingContainer: {
    flex: 1,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#F5F7F8",
  },

  loadingText: {
    marginTop: 14,

    fontSize: 15,
    fontWeight: "500",

    color: "#4B5563",
  },

  // ============================================================
  // HEADER
  // ============================================================

  header: {
    height: 72,

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 14,

    backgroundColor: "#FFFFFF",

    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",

    zIndex: 10,

    ...Platform.select({
      ios: {
        shadowColor: "#000000",

        shadowOffset: {
          width: 0,
          height: 1,
        },

        shadowOpacity: 0.06,
        shadowRadius: 3,
      },

      android: {
        elevation: 2,
      },

      web: {
        boxShadow:
          "0px 1px 4px rgba(0,0,0,0.06)",
      },
    }),
  },

  backButton: {
    width: 42,
    height: 42,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 21,

    marginRight: 8,
  },

  avatar: {
    width: 44,
    height: 44,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 22,

    backgroundColor: "#E6F7F6",

    marginRight: 11,
  },

  headerInfo: {
    flex: 1,

    justifyContent: "center",

    minWidth: 0,
  },

  headerTitle: {
    fontSize: 17,

    fontWeight: "700",

    color: "#1F2937",

    marginBottom: 4,
  },

  // ============================================================
  // STATUS
  // ============================================================

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,

    borderRadius: 4,

    marginRight: 6,
  },

  connectedDot: {
    backgroundColor: "#22C55E",
  },

  disconnectedDot: {
    backgroundColor: "#F59E0B",
  },

  statusText: {
    fontSize: 12,

    fontWeight: "500",

    color: "#6B7280",
  },

  // ============================================================
  // MESSAGE LIST
  // ============================================================

  messagesListContainer: {
    flex: 1,

    minHeight: 0,

    width: "100%",

    backgroundColor: "#F5F7F8",
  },

  messagesList: {
    paddingHorizontal: 14,

    paddingTop: 16,

    paddingBottom: 20,
  },

  emptyList: {
    flexGrow: 1,

    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 25,

    paddingVertical: 30,
  },

  // ============================================================
  // EMPTY CHAT
  // ============================================================

  emptyContainer: {
    width: "100%",

    maxWidth: 320,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 20,
  },

  emptyIcon: {
    width: 76,
    height: 76,

    justifyContent: "center",
    alignItems: "center",

    borderRadius: 38,

    backgroundColor: "#E6F7F6",

    marginBottom: 18,
  },

  emptyTitle: {
    fontSize: 20,

    fontWeight: "700",

    color: "#1F2937",

    textAlign: "center",

    marginBottom: 8,
  },

  emptyText: {
    fontSize: 14,

    lineHeight: 21,

    color: "#6B7280",

    textAlign: "center",
  },

  // ============================================================
  // MESSAGE ROW
  // ============================================================

  messageRow: {
    width: "100%",

    flexDirection: "row",

    marginBottom: 10,
  },

  myMessageRow: {
    justifyContent: "flex-end",
  },

  otherMessageRow: {
    justifyContent: "flex-start",
  },

  // ============================================================
  // MESSAGE BUBBLE
  // ============================================================

  messageBubble: {
    maxWidth: "78%",

    minWidth: 70,

    paddingHorizontal: 14,

    paddingTop: 10,

    paddingBottom: 7,

    borderRadius: 18,
  },

  myBubble: {
    backgroundColor: "#2CA6A4",

    borderBottomRightRadius: 5,
  },

  otherBubble: {
    backgroundColor: "#FFFFFF",

    borderBottomLeftRadius: 5,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    ...Platform.select({
      ios: {
        shadowColor: "#000000",

        shadowOffset: {
          width: 0,
          height: 1,
        },

        shadowOpacity: 0.04,

        shadowRadius: 2,
      },

      android: {
        elevation: 1,
      },

      web: {
        boxShadow:
          "0px 1px 3px rgba(0,0,0,0.04)",
      },
    }),
  },

  // ============================================================
  // MESSAGE TEXT
  // ============================================================

  messageText: {
    fontSize: 15,

    lineHeight: 21,

    letterSpacing: 0.1,
  },

  myMessageText: {
    color: "#FFFFFF",
  },

  otherMessageText: {
    color: "#1F2937",
  },

  // ============================================================
  // TIME
  // ============================================================

  timeText: {
    fontSize: 10,

    lineHeight: 14,

    marginTop: 4,

    alignSelf: "flex-end",
  },

  myTimeText: {
    color: "rgba(255,255,255,0.75)",
  },

  otherTimeText: {
    color: "#9CA3AF",
  },

  // ============================================================
  // INPUT AREA
  // ============================================================

  inputArea: {
    flexDirection: "row",

    alignItems: "flex-end",

    width: "100%",

    paddingHorizontal: 12,

    paddingTop: 9,

    paddingBottom:
      Platform.OS === "ios"
        ? 12
        : 10,

    backgroundColor: "#FFFFFF",

    borderTopWidth: 1,

    borderTopColor: "#E5E7EB",

    zIndex: 50,

    ...Platform.select({
      android: {
        elevation: 5,
      },

      ios: {
        shadowColor: "#000000",

        shadowOffset: {
          width: 0,
          height: -1,
        },

        shadowOpacity: 0.05,

        shadowRadius: 3,
      },

      web: {
        boxShadow:
          "0px -1px 4px rgba(0,0,0,0.05)",
      },
    }),
  },

  inputBox: {
    flex: 1,

    minHeight: 46,

    maxHeight: 120,

    justifyContent: "center",

    backgroundColor: "#F3F4F6",

    borderWidth: 1,

    borderColor: "#E5E7EB",

    borderRadius: 23,

    paddingHorizontal: 16,

    paddingVertical: 5,
  },

  // ============================================================
  // TEXT INPUT
  // ============================================================

  textInput: {
    width: "100%",

    minHeight: 34,

    maxHeight: 105,

    paddingTop: 7,

    paddingBottom: 7,

    paddingHorizontal: 0,

    fontSize: 15,

    lineHeight: 21,

    color: "#1F2937",
  },

  // ============================================================
  // SEND BUTTON
  // ============================================================

  sendButton: {
    width: 46,

    height: 46,

    justifyContent: "center",

    alignItems: "center",

    borderRadius: 23,

    backgroundColor: "#2CA6A4",

    marginLeft: 8,

    ...Platform.select({
      ios: {
        shadowColor: "#2CA6A4",

        shadowOffset: {
          width: 0,
          height: 2,
        },

        shadowOpacity: 0.18,

        shadowRadius: 4,
      },

      android: {
        elevation: 3,
      },

      web: {
        boxShadow:
          "0px 2px 6px rgba(44,166,164,0.18)",
      },
    }),
  },

  sendButtonDisabled: {
    backgroundColor: "#B8D9D8",

    elevation: 0,

    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },

      web: {
        boxShadow: "none",
      },
    }),
  },
});