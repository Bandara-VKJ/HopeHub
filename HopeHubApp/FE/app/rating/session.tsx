import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useLanguage } from "@/i18n/LanguageContext";
import { callRatingApi } from "@/utill/callRatingApi";

type Eligibility = { eligible: boolean; score?: number; counselorName: string };

export default function SessionRatingScreen() {
  const params = useLocalSearchParams<{ bookingId?: string }>();
  const bookingId = Array.isArray(params.bookingId) ? params.bookingId[0] : params.bookingId;
  const { language } = useLanguage();
  const si = language === "si";
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [name, setName] = useState("");
  const [score, setScore] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const mounted = useRef(true);

  const close = useCallback(() => {
    if (lock.current) return;
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/Support/support");
  }, []);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        if (!bookingId) throw new Error("Missing booking");
        const result = await callRatingApi<Eligibility>(`/api/bookings/${encodeURIComponent(bookingId)}/rating`);
        if (!mounted.current) return;
        if (result.score || !result.eligible) { close(); return; }
        setAllowed(true); setName(result.counselorName);
      } catch { if (mounted.current) setError("load"); }
      finally { if (mounted.current) setLoading(false); }
    })();
    return () => { mounted.current = false; };
  }, [bookingId, close]);

  const submit = async () => {
    if (lock.current || !score || !allowed || !bookingId) return;
    lock.current = true; setSaving(true); setError("");
    try {
      await callRatingApi(`/api/bookings/${encodeURIComponent(bookingId)}/rating`, { score });
      if (mounted.current) setSaved(true);
    } catch (reason: any) {
      if (!mounted.current) return;
      if (reason.status === 409 && reason.score) setSaved(true);
      else setError("save");
    } finally { lock.current = false; if (mounted.current) setSaving(false); }
  };

  return <SafeAreaView style={s.page}>
    <Modal visible transparent animationType="fade" onRequestClose={close}>
      <View style={s.overlay}><View style={s.card} accessibilityViewIsModal>
        {loading ? <><ActivityIndicator color="#247E7C" /><Text style={s.body}>{si ? "පූරණය වෙමින්..." : "Checking your session..."}</Text></>
          : saved ? <>
            <Ionicons name="checkmark-circle" size={48} color="#247E7C" />
            <Text style={s.title}>{si ? "ස්තූතියි!" : "Thank you!"}</Text>
            <Text style={s.body}>{si ? "ඔබේ ඇගයීම සුරකින ලදී." : "Your rating has been saved."}</Text>
            <TouchableOpacity style={s.submit} onPress={close}><Text style={s.submitText}>{si ? "හරි" : "Done"}</Text></TouchableOpacity>
          </> : <>
            <Text style={s.title}>{si ? "ඔබේ සැසිය කෙසේද?" : "How was your session?"}</Text>
            {!!name && <Text style={s.body}>{name}</Text>}
            {allowed && <>
              <Text style={s.body}>{si ? "තරු 1 සිට 5 දක්වා තෝරන්න" : "Choose 1 to 5 stars"}</Text>
              <View style={s.stars}>{[1,2,3,4,5].map(value =>
                <TouchableOpacity key={value} disabled={saving} onPress={() => setScore(value)} style={s.star}
                  accessibilityRole="button" accessibilityState={{ selected: score === value, disabled: saving }}
                  accessibilityLabel={si ? `තරු ${value}` : `Rate ${value} ${value === 1 ? "star" : "stars"}`}>
                  <Ionicons name={value <= score ? "star" : "star-outline"} size={32} color="#B87500" />
                </TouchableOpacity>)}</View>
              <TouchableOpacity onPress={submit} disabled={!score || saving} accessibilityRole="button"
                style={[s.submit, (!score || saving) && { opacity: 0.5 }]}>
                <Text style={s.submitText}>{saving ? (si ? "සුරකිමින්..." : "Saving...") : (si ? "ඇගයීම යවන්න" : "Submit rating")}</Text>
              </TouchableOpacity>
            </>}
            {!!error && <Text accessibilityRole="alert" style={s.error}>{si ? "ඉල්ලීම අසාර්ථකයි. පසුව නැවත උත්සාහ කරන්න." : error === "load" ? "Unable to load this session. You can rate it later from Support." : "Could not save. Please try again."}</Text>}
            <TouchableOpacity disabled={saving} onPress={close} style={s.skip} accessibilityRole="button">
              <Text style={{ color: "#536B6B" }}>{si ? "දැන් නොවේ" : "Not now"}</Text>
            </TouchableOpacity>
          </>}
      </View></View>
    </Modal>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#EAF5F3" },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 22 },
  card: { width: "100%", maxWidth: 420, alignSelf: "center", backgroundColor: "white", borderRadius: 22, padding: 22, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", color: "#244444", textAlign: "center", marginTop: 10 },
  body: { color: "#536B6B", textAlign: "center", marginTop: 10 },
  stars: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginVertical: 18 },
  star: { minWidth: 44, minHeight: 48, justifyContent: "center", alignItems: "center" },
  submit: { alignSelf: "stretch", backgroundColor: "#247E7C", borderRadius: 12, padding: 14, alignItems: "center", marginTop: 12 },
  submitText: { color: "white", fontWeight: "700" },
  skip: { padding: 16 },
  error: { color: "#AD3434", marginTop: 12, textAlign: "center" },
});
