import {
  View,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";

import { CounselorStyles as styles } from "./counselorStyles";

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import {
  useEffect,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { router } from "expo-router";
import { io } from "socket.io-client";
import { ngrokFetch } from "@/utill/ngrokFetch";

import * as React from "react";
import { forwardRef, useMemo, useRef } from "react";
import {
  Text as NativeText,
  TextInput as NativeTextInput,
  Image as NativeImage,
  TouchableOpacity as NativeTouchableOpacity,
  Alert as NativeAlert,
} from "react-native";
import { useLanguage } from "@/i18n/LanguageContext";



// UI-only translations. Backend/session/filter values remain English.
const sinhala: Record<string, string> = {
  "Error": "දෝෂයකි",
  "Success": "සාර්ථකයි",
  "Network Error": "ජාල දෝෂයකි",
  "Network error": "ජාල දෝෂයකි",
  "OK": "හරි",
  "Yes": "ඔව්",
  "No": "නැත",
  "Cancel": "අවලංගු කරන්න",
  "Confirm": "තහවුරු කරන්න",
  "Counselor": "උපදේශක",
  "Patient": "රෝගියා",
  "A patient": "රෝගියෙකු",
  "No email": "විද්‍යුත් තැපෑලක් නොමැත",
  "Welcome Back 👋": "නැවත සාදරයෙන් පිළිගනිමු 👋",
  "Professional Counselor": "වෘත්තීය උපදේශක",
  "Mental Health & Wellness Counselor": "මානසික සෞඛ්‍ය සහ යහපැවැත්ම පිළිබඳ උපදේශක",
  "Rating": "ඇගයීම",
  "Rating ·": "ඇගයීම ·",
  "Reviews": "සමාලෝචන",
  "reviews)": "සමාලෝචන)",
  "Current Status": "වත්මන් තත්ත්වය",
  "● Available": "● ලබා ගත හැක",
  "● Busy": "● කාර්යබහුලයි",
  "Available": "ලබා ගත හැක",
  "Available Now": "දැන් ලබා ගත හැක",
  "Available Today": "අද ලබා ගත හැක",
  "Busy": "කාර්යබහුලයි",
  "Set Busy": "කාර්යබහුල ලෙස සකසන්න",
  "Set Available": "ලබා ගත හැකි ලෙස සකසන්න",
  "Status Updated": "තත්ත්වය යාවත්කාලීන කරන ලදී",
  "You are now Available.": "ඔබ දැන් සැසි සඳහා ලබා ගත හැක.",
  "You are now Busy.": "ඔබ දැන් කාර්යබහුලයි.",
  "Booking Requests": "සැසි ඉල්ලීම්",
  "pending request": "පොරොත්තු ඉල්ලීම්",
  "s": "",
  "No Booking Requests": "සැසි ඉල්ලීම් නොමැත",
  "New patient session requests will appear here.": "නව රෝගී සැසි ඉල්ලීම් මෙහි දිස්වනු ඇත.",
  "Pending": "පොරොත්තුවෙන්",
  "Confirmed": "තහවුරු කරන ලදී",
  "Cancelled": "අවලංගු කරන ලදී",
  "Confirm Session": "සැසිය තහවුරු කරන්න",
  "Cancel Session": "සැසිය අවලංගු කරන්න",
  "Open Chat": "කතාබහ විවෘත කරන්න",
  "Finished Session": "අවසන් වූ සැසිය",
  "Session Finished": "සැසිය අවසන් වී ඇත",
  "Waiting for counselor confirmation.": "උපදේශකවරයාගේ තහවුරු කිරීම බලාපොරොත්තුවෙන්.",
  "Session confirmed.": "සැසිය තහවුරු කරන ලදී.",
  "Session cancelled.": "සැසිය අවලංගු කරන ලදී.",
  "Chat": "කතාබහ",
  "Voice": "හඬ",
  "Video": "වීඩියෝ",
  "Voice Call": "හඬ ඇමතුම",
  "Video Call": "වීඩියෝ ඇමතුම",
  "Sessions": "සැසි",
  "My Profile Details": "මගේ පැතිකඩ විස්තර",
  "Email": "විද්‍යුත් තැපෑල",
  "Mobile": "ජංගම දුරකථනය",
  "Title": "පදවි නාමය",
  "Specialty": "විශේෂඥතාව",
  "Experience": "පළපුරුද්ද",
  "Availability": "ලබා ගත හැකි වේලාව",
  "Quick Actions": "ඉක්මන් ක්‍රියාමාර්ග",
  "Schedule": "කාලසටහන",
  "Chats": "කතාබස්",
  "Reports": "වාර්තා",
  "Patients": "රෝගීන්",
  "Patient Profile": "රෝගී පැතිකඩ",
  "View patient details": "රෝගී විස්තර බලන්න",
  "My Schedule": "මගේ කාලසටහන",
  "All your scheduled counseling sessions": "ඔබේ නියමිත සියලු උපදේශන සැසි",
  "My Chats": "මගේ කතාබස්",
  "Active and previous counseling chats": "සක්‍රිය සහ පෙර උපදේශන කතාබස්",
  "Patient Reports": "රෝගී වාර්තා",
  "Create and manage patient reports": "රෝගී වාර්තා සාදන්න සහ කළමනාකරණය කරන්න",
  "My Patients": "මගේ රෝගීන්",
  "Patients assigned to your counseling sessions": "ඔබේ උපදේශන සැසි සඳහා යොමු කළ රෝගීන්",
  "View detailed patient information": "විස්තරාත්මක රෝගී තොරතුරු බලන්න",
  "No Scheduled Sessions": "නියමිත සැසි නොමැත",
  "Your scheduled counseling sessions will appear here.": "ඔබේ නියමිත උපදේශන සැසි මෙහි දිස්වනු ඇත.",
  "No Chats Yet": "තවම කතාබස් නොමැත",
  "Confirmed or previous counseling sessions will appear here.": "තහවුරු කළ හෝ පෙර උපදේශන සැසි මෙහි දිස්වනු ඇත.",
  "Select Patient": "රෝගියෙකු තෝරන්න",
  "No patients available.": "රෝගීන් නොමැත.",
  "Counseling Report": "උපදේශන වාර්තාව",
  "Write your counseling session report...": "ඔබේ උපදේශන සැසි වාර්තාව ලියන්න...",
  "Create Report": "වාර්තාව සාදන්න",
  "Previous Reports": "පෙර වාර්තා",
  "No Patients": "රෝගීන් නොමැත",
  "Patients with your counseling sessions will appear here.": "ඔබේ උපදේශන සැසිවලට සහභාගී වන රෝගීන් මෙහි දිස්වනු ඇත.",
  "Chat with Patient": "රෝගියා සමඟ කතාබහ කරන්න",
  "Last session:": "අවසන් සැසිය:",
  "Full Name": "සම්පූර්ණ නම",
  "Last Session": "අවසන් සැසිය",
  "Session Time": "සැසි වේලාව",
  "Session Type": "සැසි වර්ගය",
  "Booking Status": "වෙන්කිරීමේ තත්ත්වය",
  "Logout": "ගිණුමෙන් ඉවත් වන්න",
  "Are you sure you want to logout?": "ඔබට ගිණුමෙන් ඉවත් වීමට අවශ්‍ය බව විශ්වාසද?",
  "\"Healing takes time, and asking for help is a courageous step.\"": "“සුවය ලැබීමට කාලය ගත වන අතර, උදව් ඉල්ලා සිටීම ධෛර්ය සම්පන්න පියවරකි.”",
  "Loading counselor profile...": "උපදේශක පැතිකඩ පූරණය වෙමින්...",
  "Counselor profile not found.": "උපදේශක පැතිකඩ සොයාගත නොහැක.",
  "Login Again": "නැවත පිවිසෙන්න",
  "Login Error": "පිවිසුම් දෝෂයකි",
  "Counselor information is incomplete. Please login again.": "උපදේශක තොරතුරු අසම්පූර්ණයි. කරුණාකර නැවත පිවිසෙන්න.",
  "Unable to load counselor profile.": "උපදේශක පැතිකඩ පූරණය කළ නොහැක.",
  "Failed to load bookings.": "සැසි වෙන්කිරීම් පූරණය කිරීම අසාර්ථකයි.",
  "Could not load bookings. Please check your backend and ngrok connection.": "සැසි වෙන්කිරීම් පූරණය කළ නොහැක. කරුණාකර සේවාදායක සම්බන්ධතාව පරීක්ෂා කරන්න.",
  "Invalid Booking": "වලංගු නොවන වෙන්කිරීමකි",
  "Only pending bookings can be confirmed.": "තහවුරු කළ හැක්කේ පොරොත්තු වෙන්කිරීම් පමණි.",
  "Failed to confirm booking.": "වෙන්කිරීම තහවුරු කිරීම අසාර්ථකයි.",
  "The booking has been confirmed successfully.": "වෙන්කිරීම සාර්ථකව තහවුරු කරන ලදී.",
  "Could not confirm the booking.": "වෙන්කිරීම තහවුරු කළ නොහැක.",
  "Already Cancelled": "දැනටමත් අවලංගු කර ඇත",
  "This booking has already been cancelled.": "මෙම වෙන්කිරීම දැනටමත් අවලංගු කර ඇත.",
  "Failed to cancel booking.": "වෙන්කිරීම අවලංගු කිරීම අසාර්ථකයි.",
  "The booking has been cancelled successfully.": "වෙන්කිරීම සාර්ථකව අවලංගු කරන ලදී.",
  "Could not cancel the booking.": "වෙන්කිරීම අවලංගු කළ නොහැක.",
  "Chat Unavailable": "කතාබහ ලබා ගත නොහැක",
  "You can chat with the patient only after confirming the booking.": "රෝගියා සමඟ කතාබහ කළ හැක්කේ වෙන්කිරීම තහවුරු කිරීමෙන් පසුව පමණි.",
  "Chat Error": "කතාබස් දෝෂයකි",
  "Booking ID is missing.": "වෙන්කිරීමේ හැඳුනුම නොමැත.",
  "Counselor ID was not found. Please login again.": "උපදේශක හැඳුනුම සොයාගත නොහැක. කරුණාකර නැවත පිවිසෙන්න.",
  "Voice Unavailable": "හඬ සැසිය ලබා ගත නොහැක",
  "You can start a voice session only after confirming the booking.": "හඬ සැසියක් ආරම්භ කළ හැක්කේ වෙන්කිරීම තහවුරු කිරීමෙන් පසුව පමණි.",
  "Voice Error": "හඬ සැසි දෝෂයකි",
  "Video Unavailable": "වීඩියෝ සැසිය ලබා ගත නොහැක",
  "You can start a video session only after confirming the booking.": "වීඩියෝ සැසියක් ආරම්භ කළ හැක්කේ වෙන්කිරීම තහවුරු කිරීමෙන් පසුව පමණි.",
  "Video Error": "වීඩියෝ සැසි දෝෂයකි",
  "Failed to update availability.": "ලබා ගත හැකි තත්ත්වය යාවත්කාලීන කිරීම අසාර්ථකයි.",
  "Could not update your availability. Please try again.": "ඔබේ ලබා ගත හැකි තත්ත්වය යාවත්කාලීන කළ නොහැක. නැවත උත්සාහ කරන්න.",
  "Please select a patient first.": "කරුණාකර පළමුව රෝගියෙකු තෝරන්න.",
  "Report Required": "වාර්තාවක් අවශ්‍යයි",
  "Please enter the counseling report.": "කරුණාකර උපදේශන වාර්තාව ඇතුළත් කරන්න.",
  "Report Created": "වාර්තාව සාදන ලදී",
  "Could not save the report.": "වාර්තාව සුරැකීමට නොහැකි විය.",
  "Logout failed. Please try again.": "ගිණුමෙන් ඉවත් වීම අසාර්ථකයි. නැවත උත්සාහ කරන්න.",
  "🔔 New Booking": "🔔 නව සැසි වෙන්කිරීමක්",
  "View Booking": "වෙන්කිරීම බලන්න",
  "Date:": "දිනය:",
  "Time:": "වේලාව:",
  "Type:": "වර්ගය:",
  "Counselor Profile": "උපදේශක පැතිකඩ",
  "Professional Details": "වෘත්තීය විස්තර",
  "Book Session": "සැසියක් වෙන්කරන්න",
  "Currently Busy": "දැනට කාර්යබහුලයි",
  "All Counselors": "සියලු උපදේශකවරු",
  "Top Rated": "ඉහළම ඇගයීම් ලැබූ",
  "Booking Confirmation": "වෙන්කිරීම තහවුරු කිරීම",
  "Select Date": "දිනය තෝරන්න",
  "Select Time": "වේලාව තෝරන්න",
  "Select a date": "දිනයක් තෝරන්න",
  "Select a time": "වේලාවක් තෝරන්න",
  "Please select a date first.": "කරුණාකර පළමුව දිනයක් තෝරන්න.",
  "Booked": "වෙන්කර ඇත",
  "Your Session": "ඔබේ සැසිය",
  "Selected Session": "තෝරාගත් සැසිය",
  "Confirm Book Session": "සැසි වෙන්කිරීම තහවුරු කරන්න",
  "Your booking will initially be marked as Pending. The counselor must confirm it before the session is officially confirmed.": "ඔබේ වෙන්කිරීම මුලින් පොරොත්තු තත්ත්වයේ සටහන් වේ. සැසිය නිල වශයෙන් තහවුරු වීමට උපදේශකවරයා එය තහවුරු කළ යුතුය.",
  "SESSION STARTS IN": "සැසිය ආරම්භ වීමට",
  "HR": "පැය",
  "MIN": "මිනිත්තු",
  "SEC": "තත්පර",
  "Session time has arrived": "සැසි වේලාව පැමිණ ඇත",
  "YOUR COUNSELING SUPPORT": "ඔබේ උපදේශන සහාය",
  "Connect with Counselors": "උපදේශකවරුන් සමඟ සම්බන්ධ වන්න",
  "Professional Support Available": "වෘත්තීය සහාය ලබා ගත හැක",
  "Connect with counselors who specialize in addiction recovery. All conversations are confidential and secure.": "ඇබ්බැහිවීමෙන් සුවය ලැබීම පිළිබඳ විශේෂඥ උපදේශකවරුන් සමඟ සම්බන්ධ වන්න. සියලු කතාබස් රහසිගත සහ ආරක්ෂිතයි.",
  "Your Counselors": "ඔබේ උපදේශකවරු",
  "Your selected recovery support counselors": "ඔබ තෝරාගත් සුවය ලැබීමේ සහාය උපදේශකවරු",
  "SELECTED": "තෝරාගෙන ඇත",
  "Explore Other Counselors": "වෙනත් උපදේශකවරු සොයන්න",
  "Find another counselor who matches your support needs.": "ඔබේ සහාය අවශ්‍යතාවලට ගැලපෙන වෙනත් උපදේශකවරයෙකු සොයන්න.",
  "other counselor": "වෙනත් උපදේශකවරු",
  "found": "හමු විය",
  "No counselors found": "උපදේශකවරු හමු නොවීය",
  "No counselors are currently available. Please refresh the page or try again later.": "දැනට උපදේශකවරු ලබා ගත නොහැක. පිටුව නැවුම් කරන්න හෝ පසුව නැවත උත්සාහ කරන්න.",
  "Need Immediate Help?": "වහාම උදව් අවශ්‍යද?",
  "If you're in crisis, contact your local emergency service or a qualified crisis professional immediately.": "ඔබ අර්බුදයක සිටී නම්, වහාම ඔබේ ප්‍රදේශයේ හදිසි සේවාවක් හෝ සුදුසුකම් ලත් අර්බුද සහාය වෘත්තිකයෙකු අමතන්න.",
  "Loading counselors...": "උපදේශකවරු පූරණය වෙමින්...",
  "AI": "කෘත්‍රිම බුද්ධිය",
  "Counselor Busy": "උපදේශකවරයා කාර්යබහුලයි",
  "Counselor ID is missing.": "උපදේශක හැඳුනුම නොමැත.",
  "This counselor is currently unavailable. Please choose another counselor.": "මෙම උපදේශකවරයා දැනට ලබා ගත නොහැක. කරුණාකර වෙනත් උපදේශකවරයෙකු තෝරන්න.",
  "Counselor information is missing.": "උපදේශක තොරතුරු නොමැත.",
  "Please select a session date.": "කරුණාකර සැසි දිනයක් තෝරන්න.",
  "Please select a session time.": "කරුණාකර සැසි වේලාවක් තෝරන්න.",
  "Time Unavailable": "වේලාව ලබා ගත නොහැක",
  "This time slot has already been booked. Please select another time.": "මෙම වේලාව දැනටමත් වෙන්කර ඇත. කරුණාකර වෙනත් වේලාවක් තෝරන්න.",
  "Login Required": "පිවිසීම අවශ්‍යයි",
  "Your user ID was not found. Please logout and login again.": "ඔබේ පරිශීලක හැඳුනුම සොයාගත නොහැක. කරුණාකර ඉවත් වී නැවත පිවිසෙන්න.",
  "Existing Booking": "පවතින වෙන්කිරීමක්",
  "Booking Failed": "වෙන්කිරීම අසාර්ථකයි",
  "Could not parse booking response.": "වෙන්කිරීමේ ප්‍රතිචාරය කියවීමට නොහැකි විය.",
  "Booking Error": "වෙන්කිරීමේ දෝෂයකි",
  "The server did not return a valid booking.": "සේවාදායකය වලංගු වෙන්කිරීමක් ලබා දී නොමැත.",
  "Booking Submitted": "වෙන්කිරීම ඉදිරිපත් කරන ලදී",
  "Your counseling session has been booked successfully. Status: Pending The counselor must confirm the session before it becomes confirmed.": "ඔබේ උපදේශන සැසිය සාර්ථකව වෙන්කර ඇත.\n\nතත්ත්වය: පොරොත්තුවෙන්\n\nසැසිය තහවුරු වීමට උපදේශකවරයා එය තහවුරු කළ යුතුය.",
  "Could not connect to the server. Please make sure the backend and ngrok are running.": "සේවාදායකයට සම්බන්ධ විය නොහැක. කරුණාකර සේවාදායකය සහ ngrok ක්‍රියාත්මක බව තහවුරු කරන්න.",
  "Session Unavailable": "සැසිය ලබා ගත නොහැක",
  "The booking ID could not be found. Please refresh the Support page and try again.": "වෙන්කිරීමේ හැඳුනුම සොයාගත නොහැක. සහාය පිටුව නැවුම් කර නැවත උත්සාහ කරන්න.",
  "Account Created Successfully": "ගිණුම සාර්ථකව සාදන ලදී",
  "Your counselor account has been created successfully. Please wait for HopeHub System approval before logging in.": "ඔබේ උපදේශක ගිණුම සාර්ථකව සාදන ලදී. පිවිසීමට පෙර HopeHub පද්ධතියේ අනුමැතිය ලැබෙන තෙක් රැඳී සිටින්න.",
  "Please allow photo library access to select a counselor image.": "උපදේශක ඡායාරූපයක් තෝරා ගැනීමට ඡායාරූප ගබඩාවට ප්‍රවේශ වීමට අවසර දෙන්න.",
  "Unable to select an image. Please try again.": "ඡායාරූපයක් තෝරාගත නොහැක. කරුණාකර නැවත උත්සාහ කරන්න.",
  "Change counselor image": "උපදේශක ඡායාරූපය වෙනස් කරන්න",
  "Select counselor image": "උපදේශක ඡායාරූපයක් තෝරන්න",
  "Select counselor image (optional)": "උපදේශක ඡායාරූපයක් තෝරන්න (අත්‍යවශ්‍ය නොවේ)",
  "Selected counselor image": "තෝරාගත් උපදේශක ඡායාරූපය",
  "Counselor profile photo": "උපදේශක පැතිකඩ ඡායාරූපය",
  "active": "සක්‍රිය",
  "reports": "වාර්තා",
  "patients": "රෝගීන්",
  "sessions": "සැසි",
  "Sun": "ඉරිදා",
  "Mon": "සඳුදා",
  "Tue": "අඟහරුවාදා",
  "Wed": "බදාදා",
  "Thu": "බ්‍රහස්පතින්දා",
  "Fri": "සිකුරාදා",
  "Sat": "සෙනසුරාදා",
  "Jan": "ජනවාරි",
  "Feb": "පෙබරවාරි",
  "Mar": "මාර්තු",
  "Apr": "අප්‍රේල්",
  "May": "මැයි",
  "Jun": "ජූනි",
  "Jul": "ජූලි",
  "Aug": "අගෝස්තු",
  "Sep": "සැප්තැම්බර්",
  "Oct": "ඔක්තෝබර්",
  "Nov": "නොවැම්බර්",
  "Dec": "දෙසැම්බර්",
  "AM": "පෙ.ව.",
  "PM": "ප.ව."
};

function translateCounselorText(value: string, language: string): string {
  if (language !== "si" || !value.trim()) return value;
  const key = value.replace(/\s+/g, " ").trim();
  if (Object.prototype.hasOwnProperty.call(sinhala, key)) {
    return (value.match(/^\s*/)?.[0] || "") + sinhala[key] + (value.match(/\s*$/)?.[0] || "");
  }
  let match = key.match(/^Confirm the session with (.+)\?$/);
  if (match) return match[1] + " සමඟ සැසිය තහවුරු කරන්නද?";
  match = key.match(/^Cancel the session with (.+)\?$/);
  if (match) return match[1] + " සමඟ සැසිය අවලංගු කරන්නද?";
  match = key.match(/^The report for (.+) has been saved successfully\.$/);
  if (match) return match[1] + " සඳහා වාර්තාව සාර්ථකව සුරකින ලදී.";
  match = key.match(/^You already have a (\w+) session with this counselor on (.+) at (.+)\.$/);
  if (match) {
    const status = ({ pending: "පොරොත්තු", confirmed: "තහවුරු කළ", cancelled: "අවලංගු කළ" } as Record<string, string>)[match[1]] || match[1];
    return "ඔබට මෙම උපදේශකවරයා සමඟ " + match[2] + " දින " + match[3] + " වේලාවට " + status + " සැසියක් දැනටමත් ඇත.";
  }
  match = key.match(/^Server returned (\d+)\.$/);
  if (match) return "සේවාදායකය ලබා දුන් තත්ත්ව කේතය: " + match[1] + ".";
  // Notification template: keep patient identity and date/time values untouched.
  const booked = value.indexOf(" has booked a counseling session.");
  if (booked >= 0) {
    return value.slice(0, booked) + " උපදේශන සැසියක් වෙන්කර ඇත." +
      value.slice(booked + " has booked a counseling session.".length)
        .replace(/Date:/g, "දිනය:").replace(/Time:/g, "වේලාව:")
        .replace(/Type: (Chat|Video|Voice)/g, (_, kind) => "වර්ගය: " + sinhala[kind]);
  }
  if (/^\d{1,2}:\d{2}\s+(AM|PM)$/.test(key)) {
    return value.replace(/\bAM\b/, "පෙ.ව.").replace(/\bPM\b/, "ප.ව.");
  }
  return value;
}

function localizeChildren(children: React.ReactNode, language: string): React.ReactNode {
  if (typeof children === "string") return translateCounselorText(children, language);
  if (Array.isArray(children)) return children.map(child => localizeChildren(child, language));
  return children;
}

type TextProps = React.ComponentProps<typeof NativeText> & { translateText?: boolean };
const Text = forwardRef<React.ElementRef<typeof NativeText>, TextProps>(
  ({ children, accessibilityLabel, accessibilityHint, translateText = true, ...props }, ref) => {
    const { language } = useLanguage();
    return (
      <NativeText {...props} ref={ref}
        accessibilityLabel={accessibilityLabel ? translateCounselorText(accessibilityLabel, language) : accessibilityLabel}
        accessibilityHint={accessibilityHint ? translateCounselorText(accessibilityHint, language) : accessibilityHint}
      >
        {translateText ? localizeChildren(children, language) : children}
      </NativeText>
    );
  }
);
Text.displayName = "CounselorLocalizedText";

const TextInput = forwardRef<React.ElementRef<typeof NativeTextInput>, React.ComponentProps<typeof NativeTextInput>>(
  ({ placeholder, accessibilityLabel, ...props }, ref) => {
    const { language } = useLanguage();
    return <NativeTextInput {...props} ref={ref}
      placeholder={placeholder ? translateCounselorText(placeholder, language) : placeholder}
      accessibilityLabel={accessibilityLabel ? translateCounselorText(accessibilityLabel, language) : accessibilityLabel}
    />;
  }
);
TextInput.displayName = "CounselorLocalizedTextInput";

const Image = forwardRef<React.ElementRef<typeof NativeImage>, React.ComponentProps<typeof NativeImage>>(
  ({ accessibilityLabel, ...props }, ref) => {
    const { language } = useLanguage();
    return <NativeImage {...props} ref={ref}
      accessibilityLabel={accessibilityLabel ? translateCounselorText(accessibilityLabel, language) : accessibilityLabel}
    />;
  }
);
Image.displayName = "CounselorLocalizedImage";

const TouchableOpacity = forwardRef<React.ElementRef<typeof NativeTouchableOpacity>, React.ComponentProps<typeof NativeTouchableOpacity>>(
  ({ accessibilityLabel, accessibilityHint, ...props }, ref) => {
    const { language } = useLanguage();
    return <NativeTouchableOpacity {...props} ref={ref}
      accessibilityLabel={accessibilityLabel ? translateCounselorText(accessibilityLabel, language) : accessibilityLabel}
      accessibilityHint={accessibilityHint ? translateCounselorText(accessibilityHint, language) : accessibilityHint}
    />;
  }
);
TouchableOpacity.displayName = "CounselorLocalizedTouchableOpacity";

// A stable object with a live language reference also localizes socket callbacks.
function useLocalizedAlert() {
  const { language } = useLanguage();
  const currentLanguage = useRef(language);
  currentLanguage.current = language;
  return useMemo(() => ({
    alert: (...args: Parameters<typeof NativeAlert.alert>) => {
      const [title, message, buttons, options] = args;
      const translate = (text: string) => translateCounselorText(text, currentLanguage.current);
      NativeAlert.alert(
        translate(title),
        message ? translate(message) : message,
        buttons?.map(button => ({ ...button, text: button.text ? translate(button.text) : button.text })),
        options
      );
    },
  }), []);
}


import LanguageToggle from "@/components/LanguageToggle";

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

type Counselor = {
  _id: string;

  firstName?: string;

  lastName?: string;

  name?: string;

  email?: string;

  mobile?: string;

  title?: string;

  specialty?: string;

  experience?: string;

  availability?: string;

  rating?: number;

  reviews?: number;

  available: boolean;

  // The backend/login response must include the saved photo URL or path.
  image?: string;
  imageUrl?: string;
  profileImage?: string;

  avatar?: string;

  avatarColor?: string;
};

type Patient = {
  _id: string;

  firstName?: string;

  lastName?: string;

  name?: string;

  email?: string;

  mobile?: string;
};

type Booking = {
  _id: string;

  counselor:
    | Counselor
    | string;

  patient:
    | Patient
    | string;

  sessionDate: string;

  sessionTime: string;

  sessionType:
    | "Chat"
    | "Video"
    | "Voice";

  status:
    | "pending"
    | "confirmed"
    | "cancelled";

  notes?: string;

  createdAt?: string;

  updatedAt?: string;
};

// Keep initials separate from image URLs, including legacy avatar URLs.
function resolveCounselorImage(value?: string): string | null {
  const path = value?.trim().replace(/\\/g, "/");
  if (!path) return null;
  if (/^(https?:|data:image\/|file:|content:|blob:)/i.test(path)) {
    return path;
  }
  if (!BASE_URL) return null;
  try {
    return new URL(path, BASE_URL.replace(/\/+$/, "") + "/").toString();
  } catch {
    return null;
  }
}

function getCounselorImage(counselor: Counselor): string | null {
  const image = [counselor.image, counselor.imageUrl, counselor.profileImage]
    .find(value => typeof value === "string" && value.trim());
  const avatar = counselor.avatar?.trim();
  const legacyAvatar = avatar && (
    /^(https?:|data:image\/|file:|content:|blob:)/i.test(avatar) ||
    /[/\\]/.test(avatar) ||
    /\.(jpe?g|png|webp|gif|heic|heif)(?:[?#]|$)/i.test(avatar)
  ) ? avatar : undefined;
  return resolveCounselorImage(image || legacyAvatar);
}

async function fetchCounselorPhoto(uri: string, signal: AbortSignal) {
  const response = await fetch(uri, {
    headers: { "ngrok-skip-browser-warning": "true" },
    signal,
  });
  if (!response.ok) {
    throw new Error("Photo request returned HTTP " + response.status);
  }
  const type = (response.headers.get("content-type") || "").toLowerCase();
  if (!type.startsWith("image/")) {
    throw new Error("Photo URL returned " + (type || "an unknown content type") + " instead of an image");
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Browser image elements cannot attach the ngrok header themselves.
// Fetch first, then display a local blob URL; native keeps the remote URL.
function useCounselorPhoto(remoteUri: string | null): string | null {
  const [photo, setPhoto] = useState<{ remote: string; local: string } | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web" || !remoteUri || !/^https?:/i.test(remoteUri)) {
      return;
    }

    const controller = new AbortController();
    let active = true;
    let objectUrl: string | null = null;

    fetchCounselorPhoto(remoteUri, controller.signal)
      .then(local => {
        if (!active) {
          URL.revokeObjectURL(local);
          return;
        }
        objectUrl = local;
        setPhoto({ remote: remoteUri, local });
      })
      .catch(error => {
        if (active) console.log("Counselor photo download failed:", remoteUri, error.message);
      });

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [remoteUri]);

  if (Platform.OS !== "web" || !remoteUri || !/^https?:/i.test(remoteUri)) {
    return remoteUri;
  }
  return photo?.remote === remoteUri ? photo.local : null;
}

export default function CounselorScreen() {
  const Alert = useLocalizedAlert();

  const [
    counselor,
    setCounselor,
  ] = useState<Counselor | null>(
    null
  );

  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);

  const counselorImageUri = useCounselorPhoto(
    counselor ? getCounselorImage(counselor) : null
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    updatingAvailability,
    setUpdatingAvailability,
  ] = useState(false);

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>(
    []
  );

  const [
    bookingLoading,
    setBookingLoading,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [quickAction, setQuickAction] = useState<
  "schedule" | "chats" | "reports" | "patients" | "profiles" | null
>(null);

  const [reportPatient, setReportPatient] =
    useState<Booking | null>(null);

  const [reportText, setReportText] =
    useState("");

  const [savedReports, setSavedReports] =
    useState<any[]>([]);

  useEffect(() => {
    loadCounselor();
    loadReports();
  }, []);

  useEffect(() => {
    if (!counselor?._id) {
      return;
    }

    const counselorId = String(counselor._id);

    console.log(
      "Connecting counselor to real-time notifications:",
      counselorId
    );

    const socket = io(BASE_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log(
        "Counselor Socket.IO connected:",
        socket.id
      );

      socket.emit(
        "joinCounselorRoom",
        counselorId
      );
    });

    socket.on("connect_error", (error) => {
      console.log(
        "Counselor Socket.IO connection error:",
        error.message
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        "Counselor Socket.IO disconnected:",
        reason
      );
    });

    socket.on(
      "newBooking",
      async (data: {
        bookingId?: string;
        message?: string;
        patientName?: string;
        sessionDate?: string;
        sessionTime?: string;
        sessionType?: string;
      }) => {
        console.log(
          "NEW BOOKING NOTIFICATION:",
          data
        );

        await fetchBookings(counselorId);

        const patientName =
          data?.patientName ||
          "A patient";

        const sessionDate =
          data?.sessionDate
            ? `\nDate: ${data.sessionDate}`
            : "";

        const sessionTime =
          data?.sessionTime
            ? `\nTime: ${data.sessionTime}`
            : "";

        const sessionType =
          data?.sessionType
            ? `\nType: ${data.sessionType}`
            : "";

        Alert.alert(
          "🔔 New Booking",
          data?.message ||
            `${patientName} has booked a counseling session.${sessionDate}${sessionTime}${sessionType}`,
          [
            {
              text: "View Booking",
              onPress: () => {
                console.log(
                  "Viewing newly received booking:",
                  data?.bookingId
                );
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      }
    );

    return () => {
      console.log(
        "Disconnecting counselor Socket.IO..."
      );

      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("newBooking");
      socket.disconnect();
    };
  }, [counselor?._id]);

  const goToCounselorLogin =
    () => {

      router.replace({
        pathname:
          "/(auth)/Login/login",

        params: {
          role:
            "counselor",
        },
      });
    };

  const loadCounselor =
    async () => {

      try {

        const savedCounselor =
          await AsyncStorage.getItem(
            "counselor"
          );

        const role =
          await AsyncStorage.getItem(
            "role"
          );

        if (
          role !== "counselor" ||
          !savedCounselor
        ) {

          goToCounselorLogin();

          return;
        }

        let parsedCounselor:
          Counselor;

        try {

          parsedCounselor =
            JSON.parse(
              savedCounselor
            );

        } catch {

          await AsyncStorage.multiRemove([
            "counselor",
            "counselorId",
          ]);

          goToCounselorLogin();

          return;
        }

        if (
          !parsedCounselor?._id
        ) {

          Alert.alert(
            "Login Error",
            "Counselor information is incomplete. Please login again.",
            [
              {
                text: "OK",
                onPress:
                  goToCounselorLogin,
              },
            ]
          );

          return;
        }

        // Refresh the cached login profile so a saved photo is loaded too.
        // Keep the cached profile usable if the request is unavailable.
        try {
          const token = await AsyncStorage.getItem("token");
          const profileResponse = await ngrokFetch(
            BASE_URL + "/api/counselors/" + encodeURIComponent(parsedCounselor._id),
            {
              headers: token ? { Authorization: "Bearer " + token } : {},
            }
          );
          if (profileResponse.ok) {
            const payload = await profileResponse.json();
            const profile = payload?.counselor || payload?.data || payload;
            if (profile?._id && String(profile._id) === String(parsedCounselor._id)) {
              parsedCounselor = { ...parsedCounselor, ...profile };
              await AsyncStorage.setItem("counselor", JSON.stringify(parsedCounselor));
            }
          } else {
            console.log("Counselor profile refresh status:", profileResponse.status);
          }
        } catch (error) {
          console.log("Counselor profile refresh unavailable:", error);
        }

        setCounselor(
          parsedCounselor
        );

        await AsyncStorage.setItem(
          "counselorId",
          String(
            parsedCounselor._id
          )
        );

        await fetchBookings(
          parsedCounselor._id
        );

      } catch (error) {

        console.log(
          "Load counselor error:",
          error
        );

        Alert.alert(
          "Error",
          "Unable to load counselor profile."
        );

      } finally {

        setLoading(false);
      }
    };

  const fetchBookings =
    async (
      counselorId: string
    ) => {

      if (!counselorId) {
        return;
      }

      try {

        const response =
          await ngrokFetch(
            `${BASE_URL}/api/bookings/counselor/${counselorId}`
          );

        const text =
          await response.text();

        let data: any = {};

        try {

          data =
            text
              ? JSON.parse(text)
              : {};

        } catch {

          throw new Error(
            "Invalid server response."
          );
        }

        console.log(
          "COUNSELOR BOOKINGS:",
          data
        );

        if (
          !response.ok
        ) {

          Alert.alert(
            "Error",
            data?.message ||
              "Failed to load bookings."
          );

          return;
        }

        setBookings(
          Array.isArray(
            data?.bookings
          )
            ? data.bookings
            : []
        );

      } catch (error) {

        console.log(
          "Fetch counselor bookings error:",
          error
        );

        Alert.alert(
          "Network Error",
          "Could not load bookings. Please check your backend and ngrok connection."
        );
      }
    };

  const refreshBookings =
    async () => {

      if (
        !counselor?._id ||
        refreshing
      ) {
        return;
      }

      try {

        setRefreshing(
          true
        );

        await fetchBookings(
          counselor._id
        );

      } finally {

        setRefreshing(
          false
        );
      }
    };

  const getPatientName =
    (
      booking: Booking
    ) => {

      if (
        typeof booking.patient ===
        "string"
      ) {
        return "Patient";
      }

      return (
        booking.patient?.name ||
        `${booking.patient?.firstName || ""} ${
          booking.patient?.lastName || ""
        }`.trim() ||
        "Patient"
      );
    };

  const getPatientEmail =
    (
      booking: Booking
    ) => {

      if (
        typeof booking.patient ===
        "string"
      ) {
        return "No email";
      }

      return (
        booking.patient?.email ||
        "No email"
      );
    };

  const confirmBooking =
    (
      booking: Booking
    ) => {

      if (
        booking.status !==
        "pending"
      ) {

        Alert.alert(
          "Invalid Booking",
          "Only pending bookings can be confirmed."
        );

        return;
      }

      const patientName =
        getPatientName(
          booking
        );

      Alert.alert(
        "Confirm Session",

        `Confirm the session with ${patientName}?`,

        [
          {
            text: "No",

            style: "cancel",
          },

          {
            text: "Confirm",

            onPress:
              async () => {

                if (
                  bookingLoading
                ) {
                  return;
                }

                try {

                  setBookingLoading(
                    true
                  );

                  const response =
                    await ngrokFetch(
                      `${BASE_URL}/api/bookings/${booking._id}/confirm`,
                      {
                        method:
                          "PATCH",
                      }
                    );

                  const text =
                    await response.text();

                  let data: any = {};

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

                  if (
                    !response.ok
                  ) {

                    Alert.alert(
                      "Error",
                      data?.message ||
                        "Failed to confirm booking."
                    );

                    return;
                  }

                  setBookings(
                    previous =>
                      previous.map(
                        item =>
                          item._id ===
                          booking._id
                            ? {
                                ...item,

                                status:
                                  "confirmed",
                              }
                            : item
                      )
                  );

                  Alert.alert(
                    "Confirmed",
                    "The booking has been confirmed successfully."
                  );

                } catch (error) {

                  console.log(
                    "Confirm booking error:",
                    error
                  );

                  Alert.alert(
                    "Network Error",
                    "Could not confirm the booking."
                  );

                } finally {

                  setBookingLoading(
                    false
                  );
                }
              },
          },
        ]
      );
    };

  const cancelBooking =
    (
      booking: Booking
    ) => {

      if (
        booking.status ===
        "cancelled"
      ) {

        Alert.alert(
          "Already Cancelled",
          "This booking has already been cancelled."
        );

        return;
      }

      const patientName =
        getPatientName(
          booking
        );

      Alert.alert(
        "Cancel Session",

        `Cancel the session with ${patientName}?`,

        [
          {
            text: "No",

            style: "cancel",
          },

          {
            text: "Cancel Session",

            style:
              "destructive",

            onPress:
              async () => {

                if (
                  bookingLoading
                ) {
                  return;
                }

                try {

                  setBookingLoading(
                    true
                  );

                  const response =
                    await ngrokFetch(
                      `${BASE_URL}/api/bookings/${booking._id}/cancel`,
                      {
                        method:
                          "PATCH",
                      }
                    );

                  const text =
                    await response.text();

                  let data: any = {};

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

                  if (
                    !response.ok
                  ) {

                    Alert.alert(
                      "Error",
                      data?.message ||
                        "Failed to cancel booking."
                    );

                    return;
                  }

                  setBookings(
                    previous =>
                      previous.map(
                        item =>
                          item._id ===
                          booking._id
                            ? {
                                ...item,

                                status:
                                  "cancelled",
                              }
                            : item
                      )
                  );

                  Alert.alert(
                    "Cancelled",
                    "The booking has been cancelled successfully."
                  );

                } catch (error) {

                  console.log(
                    "Cancel booking error:",
                    error
                  );

                  Alert.alert(
                    "Network Error",
                    "Could not cancel the booking."
                  );

                } finally {

                  setBookingLoading(
                    false
                  );
                }
              },
          },
        ]
      );
    };

  const openPatientChat =
    async (
      booking: Booking
    ) => {

      if (
        booking.status !==
        "confirmed"
      ) {

        Alert.alert(
          "Chat Unavailable",
          "You can chat with the patient only after confirming the booking."
        );

        return;
      }

      if (
        !booking._id
      ) {

        Alert.alert(
          "Chat Error",
          "Booking ID is missing."
        );

        return;
      }

      const counselorId =
        counselor?._id ||
        await AsyncStorage.getItem(
          "counselorId"
        );

      if (
        !counselorId
      ) {

        Alert.alert(
          "Login Error",
          "Counselor ID was not found. Please login again."
        );

        return;
      }

      console.log(
        "OPENING COUNSELOR CHAT:",
        {
          bookingId:
            booking._id,

          counselorId:
            counselorId,

          role:
            "counselor",
        }
      );

      router.push({
        pathname:
          "/chat/chat",

        params: {
          bookingId:
            String(
              booking._id
            ),

          role:
            "counselor",
        },
      });
    };

  const openPatientVoice = async (booking: Booking) => {
  if (booking.status !== "confirmed") {
    Alert.alert(
      "Voice Unavailable",
      "You can start a voice session only after confirming the booking."
    );
    return;
  }

  if (!booking._id) {
    Alert.alert(
      "Voice Error",
      "Booking ID is missing."
    );
    return;
  }

  router.push({
    pathname: "/voice/voice" as any,
    params: {
      bookingId: String(booking._id),
      role: "counselor",
    },
  });
};

const openPatientVideo = async (booking: Booking) => {
  if (booking.status !== "confirmed") {
    Alert.alert(
      "Video Unavailable",
      "You can start a video session only after confirming the booking."
    );
    return;
  }

  if (!booking._id) {
    Alert.alert(
      "Video Error",
      "Booking ID is missing."
    );
    return;
  }

  router.push({
    pathname: "/video/video" as any,
    params: {
      bookingId: String(booking._id),
      role: "counselor",
    },
  });
};

const toggleAvailability =
  async () => {

      if (
        !counselor ||
        updatingAvailability
      ) {
        return;
      }

      const oldCounselor =
        counselor;

      const nextAvailable =
        !counselor.available;

      const temporaryCounselor:
        Counselor = {

        ...counselor,

        available:
          nextAvailable,

        availability:
          nextAvailable
            ? "Available Today"
            : "Busy",
      };

      setCounselor(
        temporaryCounselor
      );

      setUpdatingAvailability(
        true
      );

      try {

        const response =
          await ngrokFetch(
            `${BASE_URL}/api/counselors/${counselor._id}/availability`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  available:
                    nextAvailable,
                }),
            }
          );

        const text =
          await response.text();

        let data: any = {};

        try {

          data =
            text
              ? JSON.parse(text)
              : {};

        } catch {

          data = {};
        }

        if (
          !response.ok
        ) {

          setCounselor(
            oldCounselor
          );

          Alert.alert(
            "Error",
            data?.message ||
              "Failed to update availability."
          );

          return;
        }

        const updatedCounselor =
          data?.counselor ||
          data?.user ||
          {
            ...counselor,

            available:
              nextAvailable,

            availability:
              nextAvailable
                ? "Available Today"
                : "Busy",
          };

        setCounselor(
          updatedCounselor
        );

        await AsyncStorage.setItem(
          "counselor",
          JSON.stringify(
            updatedCounselor
          )
        );

        await AsyncStorage.setItem(
          "counselorId",
          String(
            updatedCounselor._id ||
              counselor._id
          )
        );

        Alert.alert(
          "Status Updated",

          updatedCounselor.available
            ? "You are now Available."
            : "You are now Busy."
        );

      } catch (error) {

        setCounselor(
          oldCounselor
        );

        console.log(
          "Availability update error:",
          error
        );

        Alert.alert(
          "Network Error",
          "Could not update your availability. Please try again."
        );

      } finally {

        setUpdatingAvailability(
          false
        );
      }
    };

  const openSchedule = () => {
    setQuickAction("schedule");
  };

  const openChats = () => {
    setQuickAction("chats");
  };

  const openReports = () => {
    setQuickAction("reports");
  };

  const openPatients = () => {
    setQuickAction("patients");
  };

  const openProfiles = () => {
    setQuickAction("profiles");
  }

  const uniquePatients = bookings.reduce(
    (patients: Booking[], booking) => {

      const patientId =
        typeof booking.patient === "string"
          ? booking.patient
          : booking.patient?._id;

      if (!patientId) {
        return patients;
      }

      const alreadyExists = patients.some(
        item => {

          const existingId =
            typeof item.patient === "string"
              ? item.patient
              : item.patient?._id;

          return String(existingId) === String(patientId);
        }
      );

      if (!alreadyExists) {
        patients.push(booking);
      }

      return patients;
    },
    []
  );

  const saveReport = async () => {

    if (!reportPatient) {
      Alert.alert(
        "Select Patient",
        "Please select a patient first."
      );

      return;
    }

    if (!reportText.trim()) {
      Alert.alert(
        "Report Required",
        "Please enter the counseling report."
      );

      return;
    }

    try {

      const patientName =
        getPatientName(reportPatient);

      const newReport = {
        id: Date.now().toString(),
        counselorId: counselor?._id,
        patientId:
          typeof reportPatient.patient === "string"
            ? reportPatient.patient
            : reportPatient.patient?._id,
        patientName,
        bookingId: reportPatient._id,
        sessionDate: reportPatient.sessionDate,
        sessionTime: reportPatient.sessionTime,
        report: reportText.trim(),
        createdAt: new Date().toISOString(),
      };

      const existingReports =
        await AsyncStorage.getItem("counselorReports");

      const reports =
        existingReports
          ? JSON.parse(existingReports)
          : [];

      reports.unshift(newReport);

      await AsyncStorage.setItem(
        "counselorReports",
        JSON.stringify(reports)
      );

      setSavedReports(reports);
      setReportText("");
      setReportPatient(null);

      Alert.alert(
        "Report Created",
        `The report for ${patientName} has been saved successfully.`
      );

    } catch (error) {

      console.log(
        "Save report error:",
        error
      );

      Alert.alert(
        "Error",
        "Could not save the report."
      );
    }
  };

  const loadReports = async () => {

    try {

      const stored =
        await AsyncStorage.getItem("counselorReports");

      if (stored) {
        setSavedReports(JSON.parse(stored));
      } else {
        setSavedReports([]);
      }

    } catch (error) {

      console.log(
        "Load reports error:",
        error
      );
    }
  };

  const logout =
    async () => {

      try {

        await AsyncStorage.multiRemove([
          "role",

          "counselor",

          "counselorId",

          "loginRole",

          "token",
        ]);

        router.replace({
          pathname:
            "/(auth)/Login/login",

          params: {
            role:
              "counselor",
          },
        });

      } catch (error) {

        console.log(
          "Logout error:",
          error
        );

        Alert.alert(
          "Error",
          "Logout failed. Please try again."
        );
      }
    };

  const confirmLogout =
    () => {

      Alert.alert(
        "Logout",

        "Are you sure you want to logout?",

        [
          {
            text:
              "Cancel",

            style:
              "cancel",
          },

          {
            text:
              "Logout",

            style:
              "destructive",

            onPress:
              logout,
          },
        ]
      );
    };

  if (loading) {

    return (
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
          Loading counselor profile...
        </Text>

      </View>
    );
  }

  if (!counselor) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <Text
          style={
            styles.loadingText
          }
        >
          Counselor profile not found.
        </Text>

        <TouchableOpacity
          style={styles.loginAgainButton}

          onPress={
            goToCounselorLogin
          }
        >

          <Text
            style={styles.loginAgainButtonText}
          >
            Login Again
          </Text>

        </TouchableOpacity>

      </View>
    );
  }

  const avatarIsImage = Boolean(getCounselorImage({
    _id: counselor._id,
    available: counselor.available,
    avatar: counselor.avatar,
  }));

  const isAvailable =
    counselor.available ??
    false;

  const pendingBookings =
    bookings.filter(
      booking =>
        booking.status ===
        "pending"
    );

  const confirmedBookings =
    bookings.filter(
      booking =>
        booking.status ===
        "confirmed"
    );

  return (
    <View
      style={
        styles.container
      }
    >

      <View style={{ alignItems: "flex-end", paddingHorizontal: 16, paddingTop: 8, backgroundColor: "#2CA6A4" }}>
        <LanguageToggle />
      </View>

      <StatusBar
        barStyle="light-content"
        backgroundColor="#2CA6A4"
      />

      <View
        style={
          styles.header
        }
      >

        <View
          style={
            styles.topRow
          }
        >

          <View>

            <Text
              style={
                styles.greeting
              }
            >
              Welcome Back 👋
            </Text>

            <Text
              style={
                styles.name
              }
            >
              {counselor.name ||
                "Counselor"}
            </Text>

          </View>

          <TouchableOpacity
            style={
              styles.profileBtn
            }

            onPress={
              confirmLogout
            }
          >

            <Ionicons
              name="log-out-outline"
              size={24}
              color="#fff"
            />

          </TouchableOpacity>

        </View>

        <View
          style={
            styles.profileCard
          }
        >

          <View
            style={
              styles.avatarCircle
            }
          >

            {counselorImageUri && failedImageUri !== counselorImageUri ? (
              <Image
                key={counselorImageUri}
                source={{
                  uri: counselorImageUri,
                  headers: { "ngrok-skip-browser-warning": "true" },
                }}
                style={{ width: "100%", height: "100%", borderRadius: 999 }}
                resizeMode="cover"
                accessibilityLabel="Counselor profile photo"
                onError={(event) => {
                  console.log("Counselor photo failed:", counselorImageUri, event.nativeEvent.error);
                  setFailedImageUri(counselorImageUri);
                }}
              />
            ) : (
              <Text style={styles.avatarText}>
                {(!avatarIsImage && counselor.avatar) || "CN"}
              </Text>
            )}

          </View>

          <View
            style={styles.flexOne}
          >

            <Text
              style={
                styles.profileName
              }
            >
              {counselor.name ||
                `${counselor.firstName || ""} ${
                  counselor.lastName || ""
                }`.trim() ||
                "Counselor"}
            </Text>

            <Text
              style={
                styles.profileTitle
              }
            >
              {counselor.title ||
                "Professional Counselor"}
            </Text>

            <View
              style={
                styles.ratingRow
              }
            >

              <Ionicons
                name="star"
                size={16}
                color="#FFC107"
              />

              <Text
                style={
                  styles.ratingText
                }
              >
                {counselor.rating ??
                  0}{" "}
                Rating ·{" "}
                {counselor.reviews ??
                  0}{" "}
                Reviews
              </Text>

            </View>

          </View>

        </View>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={{
          paddingBottom:
            30,
        }}
      >

        <View
          style={
            styles.statusBox
          }
        >

          <View>

            <Text
              style={
                styles.statusLabel
              }
            >
              Current Status
            </Text>

            <Text
              style={[
                styles.statusText,

                {
                  color:
                    isAvailable
                      ? "#16A34A"
                      : "#DC2626",
                },
              ]}
            >
              {isAvailable
                ? "● Available"
                : "● Busy"}
            </Text>

          </View>

          <TouchableOpacity
            style={[
              styles.statusButton,

              {
                backgroundColor:
                  isAvailable
                    ? "#FDE8E8"
                    : "#E6F9EE",
              },
            ]}

            onPress={
              toggleAvailability
            }

            disabled={
              updatingAvailability
            }
          >

            {updatingAvailability ? (

              <ActivityIndicator
                size="small"
                color={
                  isAvailable
                    ? "#DC2626"
                    : "#16A34A"
                }
              />

            ) : (

              <>

                <Ionicons
                  name={
                    isAvailable
                      ? "pause-circle-outline"
                      : "checkmark-circle-outline"
                  }

                  size={20}

                  color={
                    isAvailable
                      ? "#DC2626"
                      : "#16A34A"
                  }
                />

                <Text
                  style={[
                    styles.statusButtonText,

                    {
                      color:
                        isAvailable
                          ? "#DC2626"
                          : "#16A34A",
                    },
                  ]}
                >
                  {isAvailable
                    ? "Set Busy"
                    : "Set Available"}
                </Text>

              </>

            )}

          </TouchableOpacity>

        </View>

        <View
          style={
            styles.bookingSection
          }
        >

          <View
            style={
              styles.bookingHeader
            }
          >

            <View>

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Booking Requests
              </Text>

              <Text
                style={
                  styles.bookingSubtitle
                }
              >
                {pendingBookings.length}{" "}
                pending request
                {pendingBookings.length !==
                1
                  ? "s"
                  : ""}
              </Text>

            </View>

            <TouchableOpacity
              style={
                styles.refreshButton
              }

              onPress={
                refreshBookings
              }

              disabled={
                refreshing
              }
            >

              {refreshing ? (

                <ActivityIndicator
                  size="small"
                  color="#2CA6A4"
                />

              ) : (

                <Ionicons
                  name="refresh"
                  size={20}
                  color="#2CA6A4"
                />

              )}

            </TouchableOpacity>

          </View>

          {bookings.length ===
          0 ? (

            <View
              style={
                styles.noBookingsCard
              }
            >

              <Ionicons
                name="calendar-outline"
                size={42}
                color="#A8CACA"
              />

              <Text
                style={
                  styles.noBookingsTitle
                }
              >
                No Booking Requests
              </Text>

              <Text
                style={
                  styles.noBookingsText
                }
              >
                New patient session requests
                will appear here.
              </Text>

            </View>

          ) : (

            bookings.map(
              booking => {

                const patientName =
                  getPatientName(
                    booking
                  );

                const patientEmail =
                  getPatientEmail(
                    booking
                  );

                return (
                  <View
                    key={
                      booking._id
                    }

                    style={
                      styles.bookingCard
                    }
                  >

                    <View
                      style={
                        styles.bookingCardTop
                      }
                    >

                      <View
                        style={
                          styles.patientAvatar
                        }
                      >

                        <Ionicons
                          name="person"
                          size={22}
                          color="#2CA6A4"
                        />

                      </View>

                      <View
                        style={styles.flexOneML12}
                      >

                        <Text translateText={false}
                          style={
                            styles.patientName
                          }
                        >
                          {patientName}
                        </Text>

                        <Text
                          style={
                            styles.patientEmail
                          }
                        >
                          {patientEmail}
                        </Text>

                      </View>

                      <View
                        style={[
                          styles.statusBadge,

                          booking.status ===
                            "pending" &&
                            styles.statusPending,

                          booking.status ===
                            "confirmed" &&
                            styles.statusConfirmed,

                          booking.status ===
                            "cancelled" &&
                            styles.statusCancelled,
                        ]}
                      >

                        <Text
                          style={
                            styles.statusBadgeText
                          }
                        >
                          {booking.status
                            .charAt(
                              0
                            )
                            .toUpperCase() +
                            booking.status.slice(
                              1
                            )}
                        </Text>

                      </View>

                    </View>

                    <View
                      style={
                        styles.bookingDetails
                      }
                    >

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >

                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color="#2CA6A4"
                        />

                        <Text
                          style={
                            styles.bookingDetailText
                          }
                        >
                          {booking.sessionDate}
                        </Text>

                      </View>

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >

                        <Ionicons
                          name="time-outline"
                          size={18}
                          color="#2CA6A4"
                        />

                        <Text
                          style={
                            styles.bookingDetailText
                          }
                        >
                          {booking.sessionTime}
                        </Text>

                      </View>

                      <View
                        style={
                          styles.bookingDetailRow
                        }
                      >

                        <Ionicons
                          name="chatbubble-outline"
                          size={18}
                          color="#2CA6A4"
                        />

                        <Text
                          style={
                            styles.bookingDetailText
                          }
                        >
                          {booking.sessionType}
                        </Text>

                      </View>

                    </View>

                    {booking.status ===
                      "pending" && (

                      <View
                        style={
                          styles.bookingActions
                        }
                      >

                        <TouchableOpacity
                          style={
                            styles.cancelBookingButton
                          }

                          disabled={
                            bookingLoading
                          }

                          onPress={() =>
                            cancelBooking(
                              booking
                            )
                          }
                        >

                          <Ionicons
                            name="close-circle-outline"
                            size={18}
                            color="#DC2626"
                          />

                          <Text
                            style={
                              styles.cancelBookingText
                            }
                          >
                            Cancel
                          </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                          style={
                            styles.confirmBookingButton
                          }

                          disabled={
                            bookingLoading
                          }

                          onPress={() =>
                            confirmBooking(
                              booking
                            )
                          }
                        >

                          {bookingLoading ? (

                            <ActivityIndicator
                              size="small"
                              color="#FFFFFF"
                            />

                          ) : (

                            <>

                              <Ionicons
                                name="checkmark-circle-outline"
                                size={18}
                                color="#FFFFFF"
                              />

                              <Text
                                style={
                                  styles.confirmBookingText
                                }
                              >
                                Confirm
                              </Text>

                            </>

                          )}

                        </TouchableOpacity>

                      </View>

                    )}

                    {booking.status ===
                      "confirmed" && (

                      <View>

                        <View
                          style={
                            styles.confirmedMessage
                          }
                        >

                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#16A34A"
                          />

                          <Text
                            style={
                              styles.confirmedMessageText
                            }
                          >
                            Session confirmed.
                          </Text>

                        </View>

                        <TouchableOpacity
                          style={styles.chatWithPatientButton}

                          onPress={() =>
                            openPatientChat(
                              booking
                            )
                          }

                          activeOpacity={
                            0.8
                          }
                        >

                          <Ionicons
                            name="chatbubble-outline"
                            size={19}
                            color="#FFFFFF"
                          />

                          <Text
                            style={styles.chatWithPatientButtonText}
                          >
                            Chat with Patient
                          </Text>

                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.chatWithPatientButton,
                            { marginTop: 10 },
                          ]}
                          onPress={() =>
                            openPatientVoice(booking)
                          }
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="mic-outline"
                            size={19}
                            color="#FFFFFF"
                          />

                          <Text
                            style={styles.chatWithPatientButtonText}
                          >
                            Voice Call
                          </Text>
                        </TouchableOpacity>

                        {/* Video call for confirmed bookings */}
                        <TouchableOpacity
                          style={[
                            styles.chatWithPatientButton,
                            {
                              marginTop: 10,
                              backgroundColor: "#6366F1",
                            },
                          ]}
                          onPress={() => openPatientVideo(booking)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name="videocam-outline"
                            size={19}
                            color="#FFFFFF"
                          />
                          <Text style={styles.chatWithPatientButtonText}>
                            Video Call
                          </Text>
                        </TouchableOpacity>

                      </View>

                    )}

                    {booking.status ===
                      "cancelled" && (

                      <View
                        style={
                          styles.cancelledMessage
                        }
                      >

                        <Ionicons
                          name="close-circle"
                          size={18}
                          color="#DC2626"
                        />

                        <Text
                          style={
                            styles.cancelledMessageText
                          }
                        >
                          Session cancelled.
                        </Text>

                      </View>

                    )}

                  </View>
                );
              }
            )
          )}

        </View>

        <View
          style={
            styles.statsContainer
          }
        >

          <View
            style={
              styles.statCard
            }
          >

            <Ionicons
              name="heart-outline"
              size={28}
              color="#2CA6A4"
            />

            <Text
              style={
                styles.statNumber
              }
            >
              {counselor.specialty
                ? "1"
                : "0"}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Specialty
            </Text>

          </View>

          <View
            style={
              styles.statCard
            }
          >

            <Ionicons
              name="calendar-outline"
              size={28}
              color="#2CA6A4"
            />

            <Text
              style={
                styles.statNumber
              }
            >
              {isAvailable
                ? "Yes"
                : "No"}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Available
            </Text>

          </View>

          <View
            style={
              styles.statCard
            }
          >

            <Ionicons
              name="chatbubble-outline"
              size={28}
              color="#2CA6A4"
            />

            <Text
              style={
                styles.statNumber
              }
            >
              {bookings.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Sessions
            </Text>

          </View>

        </View>

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            My Profile Details
          </Text>

          <View
            style={
              styles.infoCard
            }
          >

            <InfoRow
              icon="mail-outline"
              label="Email"
              value={
                counselor.email ||
                "-"
              }
            />

            <InfoRow
              icon="call-outline"
              label="Mobile"
              value={
                counselor.mobile ||
                "-"
              }
            />

            <InfoRow
              icon="briefcase-outline"
              label="Title"
              value={
                counselor.title ||
                "-"
              }
            />

            <InfoRow
              icon="heart-outline"
              label="Specialty"
              value={
                counselor.specialty ||
                "-"
              }
            />

            <InfoRow
              icon="school-outline"
              label="Experience"
              value={
                counselor.experience ||
                "-"
              }
            />

            <InfoRow
              icon="time-outline"
              label="Availability"
              value={
                counselor.availability ||
                (isAvailable
                  ? "Available Today"
                  : "Busy")
              }
            />

          </View>

        </View>

        <View
          style={
            styles.section
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Quick Actions
          </Text>

          <View
            style={
              styles.actionsGrid
            }
          >

            <TouchableOpacity
              style={
                styles.actionCard
              }
              activeOpacity={0.75}
              onPress={openSchedule}
            >

              <View
                style={
                  styles.actionIcon
                }
              >

                <Ionicons
                  name="calendar"
                  size={26}
                  color="#fff"
                />

              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Schedule
              </Text>

              <Text
                style={styles.actionCardSubtext}
              >
                {bookings.length} sessions
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionCard
              }
              activeOpacity={0.75}
              onPress={openChats}
            >

              <View
                style={[styles.actionIcon, styles.actionIconOrange]}
              >

                <Ionicons
                  name="chatbubble"
                  size={26}
                  color="#fff"
                />

              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Chats
              </Text>

              <Text
                style={styles.actionCardSubtext}
              >
                {bookings.filter(
                  booking =>
                    booking.status === "confirmed"
                ).length} active
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionCard
              }
              activeOpacity={0.75}
              onPress={openReports}
            >

              <View
                style={[styles.actionIcon, styles.actionIconPurple]}
              >

                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={26}
                  color="#fff"
                />

              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Reports
              </Text>

              <Text
                style={styles.actionCardSubtext}
              >
                {savedReports.length} reports
              </Text>

            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.actionCard
              }
              activeOpacity={0.75}
              onPress={openPatients}
            >

              <View
                style={[styles.actionIcon, styles.actionIconPink]}
              >

                <FontAwesome5
                  name="users"
                  size={22}
                  color="#fff"
                />

              </View>

              <Text
                style={
                  styles.actionText
                }
              >
                Patients
              </Text>

              <Text
                style={styles.actionCardSubtext}
              >
                {uniquePatients.length} patients
              </Text>

            </TouchableOpacity>

          </View>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.75}
            onPress={() => router.push("/(patients)/patients")}
          >
            <View
              style={[
                styles.actionIcon,
                styles.actionIconBlue,
              ]}
            >
              <Ionicons
                name="person-circle"
                size={26}
                color="#fff"
              />
            </View>

            <Text style={styles.actionText}>
              Patient Profile
            </Text>

            <Text style={styles.actionCardSubtext}>
              View patient details
            </Text>
          </TouchableOpacity>

        </View>

        {quickAction !== null && (

          <View
            style={styles.overlayBackdrop}
          >

            <View
              style={styles.overlaySheet}
            >

              <View
                style={styles.overlayHeaderRow}
              >

                <View
                  style={styles.flexOne}
                >

                  <Text
                    style={styles.overlayTitle}
                  >
                    {quickAction === "schedule"
                      ? "My Schedule"
                      : quickAction === "chats"
                      ? "My Chats"
                      : quickAction === "reports"
                      ? "Patient Reports"
                      : quickAction === "patients"
                      ? "My Patients"
                      : "Patient Profile"}
                  </Text>

                  <Text
                    style={styles.overlaySubtitle}
                  >
                    {quickAction === "schedule"
                      ? "All your scheduled counseling sessions"
                      : quickAction === "chats"
                      ? "Active and previous counseling chats"
                      : quickAction === "reports"
                      ? "Create and manage patient reports"
                      : quickAction === "patients"
                      ? "Patients assigned to your counseling sessions"
                      : "View detailed patient information"}
                  </Text>

                </View>

                <TouchableOpacity
                  onPress={() => setQuickAction(null)}
                  style={styles.overlayCloseButton}
                >

                  <Ionicons
                    name="close"
                    size={25}
                    color="#333"
                  />

                </TouchableOpacity>

              </View>

              {quickAction === "schedule" && (

                <ScrollView
                  showsVerticalScrollIndicator={false}
                >

                  {bookings.length === 0 ? (

                    <View
                      style={styles.emptyStateContainer}
                    >

                      <Ionicons
                        name="calendar-outline"
                        size={55}
                        color="#B8CCCC"
                      />

                      <Text
                        style={styles.emptyStateTitle}
                      >
                        No Scheduled Sessions
                      </Text>

                      <Text
                        style={styles.emptyStateText}
                      >
                        Your scheduled counseling sessions
                        will appear here.
                      </Text>

                    </View>

                  ) : (

                    bookings.map(
                      booking => {

                        const patientName =
                          getPatientName(booking);

                        return (

                          <View
                            key={booking._id}
                            style={styles.scheduleCard}
                          >

                            <View
                              style={styles.rowCenter}
                            >

                              <View
                                style={styles.scheduleCardIcon}
                              >

                                <Ionicons
                                  name="calendar"
                                  size={22}
                                  color="#2CA6A4"
                                />

                              </View>

                              <View
                                style={styles.flexOneML12}
                              >

                                <Text translateText={false}
                                  style={styles.cardPatientName}
                                >
                                  {patientName}
                                </Text>

                                <Text
                                  style={styles.scheduleCardDate}
                                >
                                  {booking.sessionDate}
                                </Text>

                              </View>

                              <View
                                style={[styles.scheduleStatusChip, { backgroundColor: booking.status === "confirmed" ? "#E6F7ED" : booking.status === "pending" ? "#FFF5DD" : "#FDEAEA" }]}
                              >

                                <Text
                                  style={[styles.scheduleStatusChipText, { color: booking.status === "confirmed" ? "#168447" : booking.status === "pending" ? "#B77900" : "#C62828" }]}
                                >
                                  {booking.status.charAt(0).toUpperCase() +
                                    booking.status.slice(1)}
                                </Text>

                              </View>

                            </View>

                            <View
                              style={styles.scheduleCardDetailsRow}
                            >

                              <View
                                style={styles.rowCenter}
                              >

                                <Ionicons
                                  name="time-outline"
                                  size={17}
                                  color="#2CA6A4"
                                />

                                <Text
                                  style={styles.scheduleCardDetailText}
                                >
                                  {booking.sessionTime}
                                </Text>

                              </View>

                              <View
                                style={styles.rowCenter}
                              >

                                <Ionicons
                                  name="chatbubble-outline"
                                  size={17}
                                  color="#2CA6A4"
                                />

                                <Text
                                  style={styles.scheduleCardDetailText}
                                >
                                  {booking.sessionType}
                                </Text>

                              </View>

                            </View>

                          </View>

                        );
                      }
                    )

                  )}

                </ScrollView>

              )}

              {quickAction === "chats" && (

                <ScrollView
                  showsVerticalScrollIndicator={false}
                >

                  {bookings.filter(
                    booking =>
                      booking.status === "confirmed" ||
                      booking.status === "cancelled"
                  ).length === 0 ? (

                    <View
                      style={styles.emptyStateContainer}
                    >

                      <Ionicons
                        name="chatbubbles-outline"
                        size={55}
                        color="#B8CCCC"
                      />

                      <Text
                        style={styles.emptyStateTitle}
                      >
                        No Chats Yet
                      </Text>

                      <Text
                        style={styles.emptyStateText}
                      >
                        Confirmed or previous counseling
                        sessions will appear here.
                      </Text>

                    </View>

                  ) : (

                    bookings
                      .filter(
                        booking =>
                          booking.status === "confirmed" ||
                          booking.status === "cancelled"
                      )
                      .map(
                        booking => {

                          const patientName =
                            getPatientName(booking);

                          const canChat =
                            booking.status === "confirmed";

                          return (

                            <View
                              key={booking._id}
                              style={styles.chatCard}
                            >

                              <View
                                style={styles.rowCenter}
                              >

                                <View
                                  style={styles.chatCardIcon}
                                >

                                  <Ionicons
                                    name="person"
                                    size={22}
                                    color="#FF9800"
                                  />

                                </View>

                                <View
                                  style={styles.flexOneML12}
                                >

                                  <Text translateText={false}
                                    style={styles.cardPatientName}
                                  >
                                    {patientName}
                                  </Text>

                                  <Text
                                    style={styles.chatCardDate}
                                  >
                                    {booking.sessionDate}
                                    {" • "}
                                    {booking.sessionTime}
                                  </Text>

                                </View>

                              </View>

                              <TouchableOpacity
                                disabled={!canChat}
                                onPress={() =>
                                  openPatientChat(booking)
                                }
                                style={[styles.chatOpenButton, { backgroundColor: canChat ? "#FF9800" : "#D5D5D5" }]}
                              >

                                <Ionicons
                                  name="chatbubble-outline"
                                  size={18}
                                  color="#FFFFFF"
                                />

                                <Text
                                  style={styles.buttonTextWhiteBold}
                                >
                                  {canChat
                                    ? "Open Chat"
                                    : "Finished Session"}
                                </Text>

                              </TouchableOpacity>

                            </View>

                          );
                        }
                      )

                  )}

                </ScrollView>

              )}

              {quickAction === "reports" && (

                <ScrollView
                  showsVerticalScrollIndicator={false}
                >

                  <Text
                    style={styles.selectPatientLabel}
                  >
                    Select Patient
                  </Text>

                  {uniquePatients.length === 0 ? (

                    <View
                      style={styles.emptyStateContainerSmall}
                    >

                      <Ionicons
                        name="people-outline"
                        size={50}
                        color="#C4D1D1"
                      />

                      <Text
                        style={styles.emptyStateTextSmall}
                      >
                        No patients available.
                      </Text>

                    </View>

                  ) : (

                    uniquePatients.map(
                      booking => {

                        const selected =
                          reportPatient?._id === booking._id;

                        return (

                          <TouchableOpacity
                            key={booking._id}
                            onPress={() =>
                              setReportPatient(booking)
                            }
                            style={[styles.patientSelectRow, { borderColor: selected ? "#9C27B0" : "#E3E8E8", backgroundColor: selected ? "#F8EEFB" : "#FFFFFF" }]}
                          >

                            <View
                              style={styles.patientSelectAvatar}
                            >

                              <Ionicons
                                name="person"
                                size={20}
                                color="#9C27B0"
                              />

                            </View>

                            <View
                              style={styles.flexOneML12}
                            >

                              <Text translateText={false}
                                style={styles.boldDark333}
                              >
                                {getPatientName(booking)}
                              </Text>

                              <Text
                                style={styles.patientSelectDate}
                              >
                                {booking.sessionDate}
                              </Text>

                            </View>

                            {selected && (

                              <Ionicons
                                name="checkmark-circle"
                                size={23}
                                color="#9C27B0"
                              />

                            )}

                          </TouchableOpacity>

                        );
                      }
                    )

                  )}

                  {reportPatient && (

                    <View
                      style={styles.reportSection}
                    >

                      <Text
                        style={styles.reportLabel}
                      >
                        Counseling Report
                      </Text>

                      <TextInput
                        value={reportText}
                        onChangeText={setReportText}
                        placeholder="Write your counseling session report..."
                        placeholderTextColor="#999"
                        multiline
                        textAlignVertical="top"
                        style={styles.reportTextInput}
                      />

                      <TouchableOpacity
                        onPress={saveReport}
                        style={styles.createReportButton}
                      >

                        <MaterialCommunityIcons
                          name="file-document-plus-outline"
                          size={20}
                          color="#FFFFFF"
                        />

                        <Text
                          style={styles.createReportButtonText}
                        >
                          Create Report
                        </Text>

                      </TouchableOpacity>

                    </View>

                  )}

                  {savedReports.length > 0 && (

                    <View
                      style={styles.previousReportsSection}
                    >

                      <Text
                        style={styles.previousReportsTitle}
                      >
                        Previous Reports
                      </Text>

                      {savedReports.map(
                        report => (

                          <View
                            key={report.id}
                            style={styles.previousReportCard}
                          >

                            <Text translateText={false}
                              style={styles.boldDark333}
                            >
                              {report.patientName}
                            </Text>

                            <Text
                              style={styles.previousReportDate}
                            >
                              {report.sessionDate}
                            </Text>

                            <Text translateText={false}
                              style={styles.previousReportText}
                            >
                              {report.report}
                            </Text>

                          </View>

                        )
                      )}

                    </View>

                  )}

                </ScrollView>

              )}

              {quickAction === "patients" && (

                <ScrollView
                  showsVerticalScrollIndicator={false}
                >

                  {uniquePatients.length === 0 ? (

                    <View
                      style={styles.emptyStateContainer}
                    >

                      <FontAwesome5
                        name="users"
                        size={50}
                        color="#C4D1D1"
                      />

                      <Text
                        style={styles.emptyStateTitle}
                      >
                        No Patients
                      </Text>

                      <Text
                        style={styles.emptyStateText}
                      >
                        Patients with your counseling
                        sessions will appear here.
                      </Text>

                    </View>
                    

                  ) : (

                    uniquePatients.map(
                      booking => {

                        const patientName =
                          getPatientName(booking);

                        const patientEmail =
                          getPatientEmail(booking);

                        return (

                          <View
                            key={booking._id}
                            style={styles.patientCard}
                          >

                            <View
                              style={styles.rowCenter}
                            >

                              <View
                                style={styles.patientCardAvatar}
                              >

                                <FontAwesome5
                                  name="user"
                                  size={22}
                                  color="#E91E63"
                                />

                              </View>

                              <View
                                style={styles.flexOneML13}
                              >

                                <Text translateText={false}
                                  style={styles.patientCardName}
                                >
                                  {patientName}
                                </Text>

                                <Text
                                  style={styles.chatCardDate}
                                >
                                  {patientEmail}
                                </Text>

                              </View>

                            </View>

                            <View
                              style={styles.patientCardSessionRow}
                            >

                              <Ionicons
                                name="calendar-outline"
                                size={17}
                                color="#E91E63"
                              />

                              <Text
                                style={styles.patientCardSessionText}
                              >
                                Last session: {booking.sessionDate}
                              </Text>

                            </View>

                            <TouchableOpacity
                              onPress={() =>
                                openPatientChat(booking)
                              }
                              disabled={
                                booking.status !== "confirmed"
                              }
                              style={[styles.patientChatButton, { backgroundColor: booking.status === "confirmed" ? "#E91E63" : "#D4D4D4" }]}
                            >

                              <Ionicons
                                name="chatbubble-outline"
                                size={18}
                                color="#FFFFFF"
                              />

                              <Text
                                style={styles.buttonTextWhiteBold}
                              >
                                {booking.status === "confirmed"
                                  ? "Chat with Patient"
                                  : "Session Finished"}
                              </Text>

                            </TouchableOpacity>

                          </View>

                        );
                      }
                    )

                  )}

                </ScrollView>

              )}

            </View>

          </View>

        )}
        
        {quickAction === "profiles" && (
          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.selectPatientLabel}>
              Select Patient
            </Text>

            {uniquePatients.length === 0 ? (
              <View
                style={styles.emptyStateContainer}
              >
                <Ionicons
                  name="person-circle-outline"
                  size={55}
                  color="#C4D1D1"
                />

                <Text style={styles.emptyStateTitle}>
                  No Patients
                </Text>

                <Text style={styles.emptyStateText}>
                  Patients with your counseling
                  sessions will appear here.
                </Text>
              </View>
            ) : (
              uniquePatients.map((booking) => {
                const patient =
                  typeof booking.patient === "string"
                    ? null
                    : booking.patient;

                const selected =
                  reportPatient?._id === booking._id;

                return (
                  <TouchableOpacity
                    key={booking._id}
                    onPress={() =>
                      setReportPatient(booking)
                    }
                    style={[
                      styles.patientSelectRow,
                      {
                        borderColor: selected
                          ? "#2196F3"
                          : "#E3E8E8",
                        backgroundColor: selected
                          ? "#EEF7FF"
                          : "#FFFFFF",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.patientSelectAvatar,
                        {
                          backgroundColor: "#E3F2FD",
                        },
                      ]}
                    >
                      <Ionicons
                        name="person"
                        size={20}
                        color="#2196F3"
                      />
                    </View>

                    <View style={styles.flexOneML12}>
                      <Text translateText={false} style={styles.boldDark333}>
                        {getPatientName(booking)}
                      </Text>

                      <Text
                        style={styles.patientSelectDate}
                      >
                        {getPatientEmail(booking)}
                      </Text>
                    </View>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={23}
                        color="#2196F3"
                      />
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            {reportPatient && (
              <View style={styles.patientProfileContainer}>
                <View style={styles.patientProfileHeader}>
                  <View
                    style={[
                      styles.patientProfileAvatar,
                      {
                        backgroundColor: "#E3F2FD",
                      },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={35}
                      color="#2196F3"
                    />
                  </View>

                  <View style={styles.flexOneML12}>
                    <Text translateText={false}
                      style={styles.patientProfileName}
                    >
                      {getPatientName(reportPatient)}
                    </Text>

                    <Text
                      style={styles.patientProfileSubtitle}
                    >
                      Patient Profile
                    </Text>
                  </View>
                </View>

                <View style={styles.patientProfileInfoCard}>
                  <InfoRow
                    icon="person-outline"
                    label="Full Name"
                    value={getPatientName(reportPatient)}
                  />

                  <InfoRow
                    icon="calendar-outline"
                    label="Last Session"
                    value={
                      reportPatient.sessionDate || "-"
                    }
                  />

                  <InfoRow
                    icon="time-outline"
                    label="Session Time"
                    value={
                      reportPatient.sessionTime || "-"
                    }
                  />

                  <InfoRow
                    icon="chatbubble-outline"
                    label="Session Type"
                    value={
                      reportPatient.sessionType || "-"
                    }
                  />

                  <InfoRow
                    icon="information-circle-outline"
                    label="Booking Status"
                    value={
                      reportPatient.status
                        .charAt(0)
                        .toUpperCase() +
                      reportPatient.status.slice(1)
                    }
                  />
                </View>
              </View>
            )}
          </ScrollView>
        )}

        <TouchableOpacity
          style={
            styles.logoutButton
          }

          onPress={
            confirmLogout
          }

          activeOpacity={
            0.75
          }
        >

          <Ionicons
            name="log-out-outline"
            size={22}
            color="#E05C5C"
          />

          <Text
            style={
              styles.logoutText
            }
          >
            Logout
          </Text>

        </TouchableOpacity>

        <View
          style={
            styles.quoteCard
          }
        >

          <Ionicons
            name="heart"
            size={28}
            color="#fff"
          />

          <Text
            style={
              styles.quoteText
            }
          >
            "Healing takes time, and asking
            for help is a courageous step."
          </Text>

        </View>

      </ScrollView>

    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon:
    keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;
}) {

  return (
    <View
      style={
        styles.infoRow
      }
    >

      <View
        style={
          styles.infoIcon
        }
      >

        <Ionicons
          name={icon}
          size={19}
          color="#2CA6A4"
        />

      </View>

      <View
        style={styles.flexOne}
      >

        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
        >
          {value}
        </Text>

      </View>

    </View>
  );
}