import { useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { Room, RoomEvent } from "livekit-client";
import { callRatingApi } from "@/utill/callRatingApi";
import { useLanguage } from "@/i18n/LanguageContext";

type Status = { ended: boolean; eligible: boolean };

export function useCallRating({ bookingId, disconnectRoom, onEnding }: {
  bookingId?: string;
  disconnectRoom: () => Promise<void>;
  onEnding: (ending: boolean) => void;
}) {
  const { language } = useLanguage();
  const languageRef = useRef(language); languageRef.current = language;
  const roomRef = useRef<Room | null>(null);
  const sidRef = useRef("");
  const roleRef = useRef("");
  const closing = useRef(false);
  const mounted = useRef(true);
  const checking = useRef(false);
  const verifiedSid = useRef("");

  const finish = useCallback(async (eligible: boolean) => {
    if (closing.current || !mounted.current) return;
    closing.current = true;
    onEnding(true);
    await disconnectRoom();
    if (!mounted.current) return;
    if (eligible && roleRef.current === "user" && bookingId) {
      router.replace({ pathname: "/rating/session" as any, params: { bookingId } });
    } else if (router.canGoBack()) router.back();
    else router.replace(roleRef.current === "counselor" ? "/(counselor)/counselor" : "/(tabs)/Support/support");
  }, [bookingId, disconnectRoom, onEnding]);

  const checkEnded = useCallback(async () => {
    if (!bookingId || !sidRef.current || closing.current || checking.current) return;
    checking.current = true;
    try {
      const status = await callRatingApi<Status>(`/api/calls/${encodeURIComponent(bookingId)}/status?roomSid=${encodeURIComponent(sidRef.current)}`);
      if (status.ended) await finish(status.eligible);
    } catch { /* A network interruption does not count as a finished call. */ }
    finally { checking.current = false; }
  }, [bookingId, finish]);

  const verifyConnected = useCallback(async () => {
    const room = roomRef.current;
    if (!bookingId || !room || closing.current || room.remoteParticipants.size === 0) return;
    try {
      const sid = sidRef.current || await room.getSid();
      sidRef.current = sid;
      if (verifiedSid.current === sid) return;
      const result = await callRatingApi<{ connected: boolean }>(`/api/calls/${encodeURIComponent(bookingId)}/connected`, { roomSid: sid });
      if (result.connected) verifiedSid.current = sid;
    } catch { /* Retry while connected; End Call also verifies participants. */ }
  }, [bookingId]);

  const attachRoom = useCallback((room: Room, role: string) => {
    roomRef.current = room; roleRef.current = role;
    sidRef.current = ""; verifiedSid.current = "";
    room.on(RoomEvent.ParticipantConnected, () => { void verifyConnected(); });
    room.on(RoomEvent.Disconnected, () => { void checkEnded(); });
  }, [checkEnded, verifyConnected]);

  const connected = useCallback(async () => {
    const room = roomRef.current;
    if (!room) return;
    sidRef.current = await room.getSid();
    await verifyConnected();
  }, [verifyConnected]);

  const endCall = useCallback(async () => {
    if (closing.current) return;
    // Lock synchronously; two button presses cannot start two end requests.
    closing.current = true; onEnding(true);
    try {
      const room = roomRef.current;
      const sid = sidRef.current || (room ? await room.getSid() : "");
      if (!sid || !bookingId) {
        closing.current = false; await finish(false); return;
      }
      const result = await callRatingApi<Status>(`/api/calls/${encodeURIComponent(bookingId)}/end`, { roomSid: sid });
      closing.current = false;
      await finish(result.eligible);
    } catch {
      closing.current = false;
      if (!mounted.current) return;
      onEnding(false);
      const si = languageRef.current === "si";
      Alert.alert(si ? "ඇමතුම අවසන් කරන්න" : "End call",
        si ? "ඇමතුම අවසන් වූ බව තහවුරු කළ නොහැක. නැවත උත්සාහ කරන්න හෝ ඉවත් වන්න." : "The server could not confirm the call ended. Retry End, or leave this screen.",
        [{ text: si ? "රැඳී සිටින්න" : "Stay", style: "cancel" },
         { text: si ? "ඉවත් වන්න" : "Leave", onPress: () => { void finish(false); } }]);
    }
  }, [bookingId, finish, onEnding]);

  useEffect(() => {
    mounted.current = true;
    const timer = setInterval(() => {
      void verifyConnected(); void checkEnded();
    }, 3000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, [checkEnded, verifyConnected]);

  return { attachRoom, connected, endCall };
}
