import { Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "@/i18n/LanguageContext";

type Props = {
  style?: StyleProp<ViewStyle>;
};

export default function LanguageToggle({ style }: Props) {
  const { language, toggleLanguage } = useLanguage();

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={toggleLanguage}
      accessibilityRole="button"
      accessibilityLabel="Change language"
    >
      <Ionicons name="language-outline" size={18} color="#2F6F6F" />
      {/* Shows the language you'll switch TO */}
      <Text style={styles.text}>{language === "en" ? "සිංහල" : "English"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    elevation: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2F6F6F",
  },
});