import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { en, Translations } from "./en";
import { si } from "./si";

export type Language = "en" | "si";

const STORAGE_KEY = "selectedLanguage";

const translations: Record<Language, Translations> = { en, si };

type LanguageContextValue = {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en"); // default English
  const [ready, setReady] = useState(false);

  // Load saved language once, when the app starts
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored === "en" || stored === "si") {
          setLanguageState(stored);
        }
      } catch (error) {
        console.log("Error loading language:", error);
      } finally {
        setReady(true);
      }
    };
    load();
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.log("Error saving language:", error);
    }
  }, []);

  const toggleLanguage = useCallback(async () => {
    await setLanguage(language === "en" ? "si" : "en");
  }, [language, setLanguage]);

  // Wait for the saved language so the app never flashes English first
  if (!ready) return null;

  return (
    <LanguageContext.Provider
      value={{ language, t: translations[language], setLanguage, toggleLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}