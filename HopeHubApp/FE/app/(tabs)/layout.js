import { StyleSheet } from "react-native";

export const navStyles = StyleSheet.create({
    tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.15)",
    elevation: 0,
    shadowOpacity: 0,
  },

  blurView: {
    flex: 1,
    overflow: "hidden",
  },

  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },

  iconWrapActive: {
    backgroundColor: "rgba(44, 166, 164, 0.15)",
    // Subtle inner border for extra glass feel
    borderWidth: 0.5,
    borderColor: "rgba(44, 166, 164, 0.35)",
  },
})