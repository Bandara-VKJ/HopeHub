import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
  Platform,
  BackHandler,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

import {
  styles,
  aiStyles,
} from "./supportStyles";
import { ngrokFetch } from "@/utill/ngrokFetch";




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
  "No ratings yet": "තවම ඇගයීම් නොමැත",
  "Ratings unavailable": "ඇගයීම් ලබා ගත නොහැක",
  "ratings": "ඇගයීම්",
  "Patient ratings": "රෝගී ඇගයීම්",
  "Rate your sessions": "ඔබේ සැසි ඇගයීමට ලක් කරන්න",
  "Your rating": "ඔබේ ඇගයීම",
  "Choose a score": "ලකුණු තෝරන්න",
  "Submit rating": "ඇගයීම යවන්න",
  "Saving...": "සුරකිමින්...",
  "Rating saved": "ඇගයීම සුරකින ලදී",
  "Thank you for your feedback.": "ඔබේ අදහස් සඳහා ස්තූතියි.",
  "Could not save your rating. Please try again.": "ඇගයීම සුරැකිය නොහැක. නැවත උත්සාහ කරන්න.",
  "Could not load rating sessions.": "ඇගයීම් සඳහා සැසි පූරණය කළ නොහැක.",
  "Retry": "නැවත උත්සාහ කරන්න",
  "Rate 1 star": "තරුවක් දෙන්න",
  "Rate 2 stars": "තරු දෙකක් දෙන්න",
  "Rate 3 stars": "තරු තුනක් දෙන්න",
  "Rate 4 stars": "තරු හතරක් දෙන්න",
  "Rate 5 stars": "තරු පහක් දෙන්න",
  "Rate your session after a connected voice or video call ends.": "සම්බන්ධ වූ හඬ හෝ වීඩියෝ ඇමතුම අවසන් වූ පසු ඔබේ සැසිය ඇගයීමට ලක් කරන්න.",
  "Recommended Counselors": "නිර්දේශිත උපදේශකවරු",
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



const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

type RatingSession = {
  _id: string;
  counselorName: string;
  sessionDate: string;
  sessionTime: string;
  score?: number;
};

const RatingSummary = ({ counselor, profile = false }: {
  counselor: Counselor; profile?: boolean;
}) => {
  const summary = counselor.ratingSummary;
  return (
    <View style={{ alignItems: profile ? "center" : "flex-start", marginTop: 6, marginBottom: 8 }}>
      {profile && <Text style={{ fontWeight: "600", color: "#466363", marginBottom: 5 }}>Patient ratings</Text>}
      {counselor.ratingsUnavailable ? <Text style={{ color: "#667777" }}>Ratings unavailable</Text>
        : !summary?.count ? <Text style={{ color: "#667777", fontSize: 12 }}>No ratings yet</Text>
        : <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap" }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <Ionicons key={value} name={summary.average >= value ? "star" : summary.average >= value - 0.5 ? "star-half" : "star-outline"}
                size={profile ? 20 : 14} color="#B87500" accessible={false} />
            ))}
            <Text style={{ marginLeft: 6, fontWeight: "700", color: "#354B4B" }}>{summary.average.toFixed(1)} / 5</Text>
            <Text style={{ marginLeft: 5, color: "#667777", fontSize: 12 }}>({summary.count} <Text>ratings</Text>)</Text>
          </View>}
    </View>
  );
};

function RatingSessionRow({ session, onSaved }: { session: RatingSession; onSaved: () => Promise<void> }) {
  const Alert = useLocalizedAlert();
  const [score, setScore] = useState(session.score || 0);
  const [savedScore, setSavedScore] = useState(session.score || 0);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  useEffect(() => {
    if (session.score) { setSavedScore(session.score); setScore(session.score); }
  }, [session.score]);
  const submit = async () => {
    if (submitting.current || savedScore || score < 1 || score > 5) return;
    submitting.current = true;
    setSaving(true);
    try {
      const response = await ngrokFetch(BASE_URL + "/api/bookings/" + encodeURIComponent(session._id) + "/rating", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ score }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Another device, double submission, or a retried response may already have saved it.
        if (response.status === 409 && data.score) {
          setSavedScore(data.score); setScore(data.score); await onSaved(); return;
        }
        throw new Error("Rating request failed");
      }
      setSavedScore(data.score); setScore(data.score);
      Alert.alert("Rating saved", "Thank you for your feedback.");
      await onSaved();
    } catch {
      Alert.alert("Error", "Could not save your rating. Please try again.");
    } finally { submitting.current = false; setSaving(false); }
  };
  return (
    <View style={{ padding: 14, marginTop: 10, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#DDEAEA" }}>
      <Text style={{ fontWeight: "700", color: "#244444" }}>{session.counselorName}</Text>
      <Text style={{ marginTop: 3, color: "#667777", fontSize: 12 }}>{session.sessionDate} · {session.sessionTime}</Text>
      <Text style={{ marginTop: 10 }}>{savedScore ? "Your rating" : "Choose a score"}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
        {[1, 2, 3, 4, 5].map((value) => (
          <TouchableOpacity key={value} disabled={saving || !!savedScore} onPress={() => setScore(value)}
            accessibilityRole="button" accessibilityLabel={value === 1 ? "Rate 1 star" : `Rate ${value} stars`}
            accessibilityState={{ selected: score === value, disabled: saving || !!savedScore }}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name={score >= value ? "star" : "star-outline"} size={28} color="#B87500" />
          </TouchableOpacity>
        ))}
      </View>
      {savedScore ? <Text style={{ color: "#26775B", marginTop: 5 }}>{savedScore} / 5</Text>
        : <TouchableOpacity onPress={submit} disabled={!score || saving} accessibilityRole="button"
            style={{ backgroundColor: "#247E7C", opacity: !score || saving ? 0.5 : 1, borderRadius: 10, padding: 12, marginTop: 8, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>{saving ? "Saving..." : "Submit rating"}</Text>
          </TouchableOpacity>}
    </View>
  );
}

function SessionRatings({ onSaved }: { onSaved: () => Promise<void> }) {
  const [sessions, setSessions] = useState<RatingSession[]>([]);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const response = await ngrokFetch(BASE_URL + "/api/bookings/ratings/mine");
      if (!response.ok) throw new Error("Rating sessions request failed");
      const data = await response.json();
      if (!Array.isArray(data.sessions)) throw new Error("Invalid sessions response");
      if (mounted.current) { setSessions(data.sessions); setFailed(false); }
    } catch { if (mounted.current) setFailed(true); }
    finally { inFlight.current = false; if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => {
    mounted.current = true;
    void load();
    const timer = setInterval(() => { void load(); }, 10000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, [load]);
  return (
    <View style={{ marginHorizontal: 20, marginTop: 18, marginBottom: 18 }}>
      <Text style={{ fontSize: 19, fontWeight: "700", color: "#244444" }}>Rate your sessions</Text>
      <Text style={{ marginTop: 5, color: "#667777", fontSize: 12 }}>Rate your session after a connected voice or video call ends.</Text>
      {loading && <ActivityIndicator color="#247E7C" style={{ marginTop: 10 }} />}
      {failed && <View style={{ marginTop: 10 }}>
        <Text>Could not load rating sessions.</Text>
        <TouchableOpacity onPress={() => { void load(); }} accessibilityRole="button" style={{ paddingVertical: 12 }}><Text>Retry</Text></TouchableOpacity>
      </View>}
      {sessions.map((session) => <RatingSessionRow key={session._id} session={session}
        onSaved={async () => { await Promise.all([load(), onSaved()]); }} />)}
    </View>
  );
}





type FilterType =
  | "Recommended Counselors"
  | "Available Now"
  | "All Counselors";


type Counselor = {
  ratingSummary?: { average: number; count: number };
  ratingsUnavailable?: boolean;
  _id: string;

  firstName?: string;
  lastName?: string;

  name: string;

  title: string;


  specialty: string;
  experience: string;
  availability: string;

  available: boolean;

  avatar: string;
  avatarColor: string;

  email?: string;
  mobile?: string;

  image?: string;
  imageUrl?: string;
  profileImage?: string;
};


type Patient = {
  _id: string;

  firstName?: string;
  lastName?: string;

  name?: string;

  email?: string;
  mobile?: string;
};


type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled";


type Booking = {
  _id: string;

  counselor:
    | Counselor
    | string;

  patient:
    | Patient
    | string
    | any;

  sessionDate: string;

  sessionTime: string;

  sessionType:
    | "Chat"
    | "Video"
    | "Voice";

  status: BookingStatus;

  notes?: string;

  createdAt?: string;

  updatedAt?: string;
};




const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];




const isImageReference = (value?: string) => {
  const path = value?.trim();
  return Boolean(path && (
    /^(https?:|data:image\/|file:|content:|blob:)/i.test(path) ||
    /[/\\]/.test(path) ||
    /\.(jpe?g|png|webp|gif|heic|heif)(?:[?#]|$)/i.test(path)
  ));
};

const getCounselorImageUri = (counselor: Counselor): string | null => {
  const image = [counselor.image, counselor.imageUrl, counselor.profileImage]
    .find(value => typeof value === "string" && value.trim());
  const raw = image || (isImageReference(counselor.avatar) ? counselor.avatar : undefined);
  const path = raw?.trim().replace(/\\/g, "/");
  if (!path) return null;
  if (/^(https?:|data:image\/|file:|content:|blob:)/i.test(path)) return path;
  if (!BASE_URL) return null;
  try {
    return new URL(path, BASE_URL.replace(/\/+$/, "") + "/").toString();
  } catch {
    return null;
  }
};

const getAvatar = (
  counselor: Counselor
) => {
  if (counselor.avatar && !isImageReference(counselor.avatar)) {
    return counselor.avatar;
  }

  const first =
    counselor.firstName?.[0] || "";

  const last =
    counselor.lastName?.[0] || "";

  const initials =
    `${first}${last}`.toUpperCase();

  return initials || "CN";
};




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

// Shared by list cards and the profile modal; each instance tracks image failures.
const CounselorAvatar = ({
  counselor,
  profile = false,
}: {
  counselor: Counselor;
  profile?: boolean;
}) => {
  const uri = useCounselorPhoto(getCounselorImageUri(counselor));
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const avatarColor = counselor.avatarColor || "#2CA6A4";

  if (uri && failedUri !== uri) {
    return (
      <Image
        key={uri}
        source={{
          uri,
          headers: { "ngrok-skip-browser-warning": "true" },
        }}
        style={{ width: "100%", height: "100%", borderRadius: 999 }}
        resizeMode="cover"
        accessibilityLabel={counselor.name ? counselor.name + " profile photo" : "Counselor profile photo"}
        onError={(event) => {
          console.log("Support counselor photo failed:", uri, event.nativeEvent.error);
          setFailedUri(uri);
        }}
      />
    );
  }

  return (
    <Text
      style={[
        profile ? styles.profileAvatarText : styles.avatarText,
        { color: avatarColor },
      ]}
    >
      {getAvatar(counselor)}
    </Text>
  );
};

const AICounsellingFAB = ({
  onPress,
}: {
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={aiStyles.fab}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View
        style={aiStyles.fabInner}
      >
        <Ionicons
          name="sparkles"
          size={26}
          color="#fff"
        />
      </View>

      <View
        style={aiStyles.fabLabel}
      >
        <Text
          style={
            aiStyles.fabLabelText
          }
        >
          AI
        </Text>
      </View>

      <View
        style={aiStyles.fabRing}
      />
    </TouchableOpacity>
  );
};









const BookingStatus = ({
  status,
}: {
  status: BookingStatus;
}) => {
  let backgroundColor =
    "#FFF7E6";

  let color =
    "#D97706";

  let icon:
    keyof typeof Ionicons.glyphMap =
    "time-outline";

  let text =
    "Pending";


  if (status === "confirmed") {
    backgroundColor =
      "#E6F9EE";

    color =
      "#16A34A";

    icon =
      "checkmark-circle-outline";

    text =
      "Confirmed";
  }


  if (status === "cancelled") {
    backgroundColor =
      "#FDE8E8";

    color =
      "#DC2626";

    icon =
      "close-circle-outline";

    text =
      "Cancelled";
  }


  return (
    <View
      style={[
        styles.bookingStatus,
        {
          backgroundColor,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={color}
      />

      <Text
        style={[
          styles.bookingStatusText,
          {
            color,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};




const ActionButton = ({
  icon,
  label,
  primary,
  disabled,
  onPress,
}: {
  icon:
    | keyof typeof Ionicons.glyphMap;

  label: string;

  primary?: boolean;

  disabled?: boolean;

  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.actionBtn,

        primary &&
          styles.actionBtnPrimary,

        disabled &&
          styles.actionBtnDisabled,
      ]}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={16}
        color={
          disabled
            ? "#aaa"
            : primary
            ? "#fff"
            : "#333"
        }
        style={{
          marginRight: 5,
        }}
      />

      <Text
        style={[
          styles.actionBtnText,

          primary &&
            styles.actionBtnTextPrimary,

          disabled &&
            styles.actionBtnTextDisabled,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};




const BookingModal = ({
  visible,

  counselor,

  selectedDate,

  selectedTime,

  bookedSlots,

  booking,

  onClose,

  onSelectDate,

  onSelectTime,

  onConfirm,
}: {
  visible: boolean;

  counselor:
    | Counselor
    | null;

  selectedDate: string;

  selectedTime: string;

  bookedSlots: string[];

  booking: boolean;

  onClose: () => void;

  onSelectDate:
    (date: string) => void;

  onSelectTime:
    (time: string) => void;

  onConfirm: () => void;
}) => {

  if (!counselor) {
    return null;
  }


  

  const dates = Array.from(
    {
      length: 7,
    },
    (_, index) => {

      const date =
        new Date();

      date.setDate(
        date.getDate() +
          index
      );


      // Avoid UTC conversion
      // problems when displaying date.
      const year =
        date.getFullYear();

      const month =
        String(
          date.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          date.getDate()
        ).padStart(2, "0");


      const iso =
        `${year}-${month}-${day}`;


      return {
        value: iso,

        day:
          date.toLocaleDateString(
            "en-US",
            {
              weekday: "short",
            }
          ),

        number:
          date.getDate(),

        month:
          date.toLocaleDateString(
            "en-US",
            {
              month: "short",
            }
          ),
      };
    }
  );


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={
          styles.modalContainer
        }
      >

        {/* HEADER */}

        <View
          style={
            styles.modalHeader
          }
        >
          <PageBack onPress={onClose} dark disabled={booking} />
          <View>

            <Text
              style={
                styles.modalHeaderTitle
              }
            >
              Book Session
            </Text>

            <Text
              style={
                styles.modalHeaderSubtitle
              }
            >
              {counselor.name}
            </Text>
            <RatingSummary counselor={counselor} profile />

          </View>


          <TouchableOpacity
            style={
              styles.modalCloseBtn
            }
            onPress={onClose}
            disabled={booking}
          >
            <Ionicons
              name="close"
              size={22}
              color="#1A3A3A"
            />
          </TouchableOpacity>

        </View>


        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 35,
          }}
        >

          

          <View
            style={
              styles.bookingSection
            }
          >

            <Text
              style={
                styles.bookingSectionTitle
              }
            >
              Select Date
            </Text>


            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={{
                paddingRight: 20,
              }}
            >

              {dates.map(
                (date) => {

                  const selected =
                    selectedDate ===
                    date.value;


                  return (
                    <TouchableOpacity
                      key={
                        date.value
                      }
                      style={[
                        styles.dateCard,

                        selected &&
                          styles.dateCardSelected,
                      ]}
                      onPress={() =>
                        onSelectDate(
                          date.value
                        )
                      }
                      disabled={booking}
                      activeOpacity={
                        0.8
                      }
                    >

                      <Text
                        style={[
                          styles.dateDay,

                          selected &&
                            styles.dateTextSelected,
                        ]}
                      >
                        {date.day}
                      </Text>


                      <Text
                        style={[
                          styles.dateNumber,

                          selected &&
                            styles.dateTextSelected,
                        ]}
                      >
                        {date.number}
                      </Text>


                      <Text
                        style={[
                          styles.dateMonth,

                          selected &&
                            styles.dateTextSelected,
                        ]}
                      >
                        {date.month}
                      </Text>

                    </TouchableOpacity>
                  );
                }
              )}

            </ScrollView>

          </View>


          

          <View
            style={
              styles.bookingSection
            }
          >

            <Text
              style={
                styles.bookingSectionTitle
              }
            >
              Select Time
            </Text>


            {!selectedDate ? (

              <View
                style={{
                  paddingVertical: 20,
                  alignItems:
                    "center",
                }}
              >

                <Ionicons
                  name="calendar-outline"
                  size={30}
                  color="#A8CACA"
                />

                <Text
                  style={{
                    marginTop: 8,
                    color: "#777",
                  }}
                >
                  Please select a date
                  first.
                </Text>

              </View>

            ) : (

              <View
                style={
                  styles.timeGrid
                }
              >

                {TIME_SLOTS.map(
                  (time) => {

                    const disabled =
                      bookedSlots.includes(
                        time
                      );

                    const selected =
                      selectedTime ===
                      time;


                    return (
                      <TouchableOpacity
                        key={time}
                        disabled={
                          disabled ||
                          booking
                        }
                        onPress={() =>
                          onSelectTime(
                            time
                          )
                        }
                        style={[
                          styles.timeSlot,

                          selected &&
                            styles.timeSlotSelected,

                          disabled &&
                            styles.timeSlotDisabled,
                        ]}
                        activeOpacity={
                          0.8
                        }
                      >

                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={
                            disabled
                              ? "#aaa"
                              : selected
                              ? "#fff"
                              : "#2CA6A4"
                          }
                        />


                        <Text
                          style={[
                            styles.timeSlotText,

                            selected &&
                              styles.timeSlotTextSelected,

                            disabled &&
                              styles.timeSlotTextDisabled,
                          ]}
                        >
                          {time}
                        </Text>


                        {disabled && (
                          <Text
                            style={
                              styles.slotBookedText
                            }
                          >
                            Booked
                          </Text>
                        )}

                      </TouchableOpacity>
                    );
                  }
                )}

              </View>

            )}

          </View>


          

          <View
            style={
              styles.bookingInfoCard
            }
          >

            <Ionicons
              name="information-circle-outline"
              size={22}
              color="#2CA6A4"
            />


            <View
              style={{
                flex: 1,
                marginLeft: 10,
              }}
            >

              <Text
                style={
                  styles.bookingInfoTitle
                }
              >
                Booking Confirmation
              </Text>


              <Text
                style={
                  styles.bookingInfoText
                }
              >
                Your booking will
                initially be marked
                as Pending. The
                counselor must
                confirm it before
                the session is
                officially confirmed.
              </Text>

            </View>

          </View>


          

          <View
            style={
              styles.selectedSummary
            }
          >

            <Text
              style={
                styles.summaryTitle
              }
            >
              Selected Session
            </Text>


            <View
              style={
                styles.summaryRow
              }
            >

              <Ionicons
                name="person-outline"
                size={18}
                color="#2CA6A4"
              />

              <Text
                style={
                  styles.summaryText
                }
              >
                {counselor.name}
              </Text>

            </View>


            <View
              style={
                styles.summaryRow
              }
            >

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#2CA6A4"
              />

              <Text
                style={
                  styles.summaryText
                }
              >
                {selectedDate ||
                  "Select a date"}
              </Text>

            </View>


            <View
              style={
                styles.summaryRow
              }
            >

              <Ionicons
                name="time-outline"
                size={18}
                color="#2CA6A4"
              />

              <Text
                style={
                  styles.summaryText
                }
              >
                {selectedTime ||
                  "Select a time"}
              </Text>

            </View>

          </View>


          

          <TouchableOpacity
            style={[
              styles.confirmBookingButton,

              (
                !selectedDate ||
                !selectedTime ||
                booking
              ) &&
                styles.confirmBookingDisabled,
            ]}
            disabled={
              !selectedDate ||
              !selectedTime ||
              booking
            }
            onPress={onConfirm}
            activeOpacity={0.8}
          >

            {booking ? (

              <ActivityIndicator
                color="#fff"
              />

            ) : (

              <>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#fff"
                />

                <Text
                  style={
                    styles.confirmBookingText
                  }
                >
                  Confirm Book Session
                </Text>
              </>

            )}

          </TouchableOpacity>

        </ScrollView>

      </SafeAreaView>
    </Modal>
  );
};




const CounselorProfileModal = ({
  visible,

  counselor,

  onClose,

  onBook,
}: {
  visible: boolean;

  counselor:
    | Counselor
    | null;

  onClose: () => void;

  onBook: () => void;
}) => {

  if (!counselor) {
    return null;
  }


  const avatarColor =
    counselor.avatarColor ||
    "#2CA6A4";


  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >

      <SafeAreaView
        style={
          styles.modalContainer
        }
      >

        {/* HEADER */}

        <View
          style={
            styles.modalHeader
          }
        >
          <PageBack onPress={onClose} dark />

          <Text
            style={
              styles.modalHeaderTitle
            }
          >
            Counselor Profile
          </Text>


          <TouchableOpacity
            style={
              styles.modalCloseBtn
            }
            onPress={onClose}
          >

            <Ionicons
              name="close"
              size={22}
              color="#1A3A3A"
            />

          </TouchableOpacity>

        </View>


        <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={{
            paddingBottom: 35,
          }}
        >

          {/* PROFILE HERO */}

          <View
            style={
              styles.profileHero
            }
          >

            <View
              style={[
                styles.profileAvatar,
                {
                  backgroundColor:
                    avatarColor +
                    "22",
                },
              ]}
            >

              <CounselorAvatar counselor={counselor} profile />

            </View>


            <Text
              style={
                styles.profileName
              }
            >
              {counselor.name}
            </Text>


            <Text
              style={
                styles.profileTitle
              }
            >
              {counselor.title}
            </Text>


            <View
              style={[
                styles.profileStatusBadge,
                {
                  backgroundColor:
                    counselor.available
                      ? "#E6F9EE"
                      : "#FDE8E8",
                },
              ]}
            >

              <View
                style={[
                  styles.availDot,
                  {
                    backgroundColor:
                      counselor.available
                        ? "#22C55E"
                        : "#EF4444",
                  },
                ]}
              />


              <Text
                style={[
                  styles.profileStatusText,
                  {
                    color:
                      counselor.available
                        ? "#16A34A"
                        : "#DC2626",
                  },
                ]}
              >
                {counselor.available
                  ? "Available Now"
                  : "Busy"}
              </Text>

            </View>

          </View>


          {/* PROFESSIONAL DETAILS */}

          <View
            style={
              styles.profileInfoCard
            }
          >

            <Text
              style={
                styles.profileSectionTitle
              }
            >
              Professional Details
            </Text>


            <ProfileInfoRow
              icon="heart-outline"
              label="Specialty"
              value={
                counselor.specialty ||
                "-"
              }
            />


            <ProfileInfoRow
              icon="school-outline"
              label="Experience"
              value={
                counselor.experience ||
                "-"
              }
            />


            <ProfileInfoRow
              icon="calendar-outline"
              label="Availability"
              value={
                counselor.availability ||
                "-"
              }
            />


            <ProfileInfoRow
              icon="mail-outline"
              label="Email"
              value={
                counselor.email ||
                "-"
              }
            />


            <ProfileInfoRow
              icon="call-outline"
              label="Mobile"
              value={
                counselor.mobile ||
                "-"
              }
            />

          </View>


          {/* BOOK BUTTON */}

          <View
            style={
              styles.profileActions
            }
          >

            <TouchableOpacity
              style={
                styles.profilePrimaryBtn
              }
              onPress={onBook}
              disabled={
                !counselor.available
              }
              activeOpacity={0.8}
            >

              <Ionicons
                name="calendar-outline"
                size={18}
                color="#fff"
              />


              <Text
                style={
                  styles.profilePrimaryBtnText
                }
              >
                {counselor.available
                  ? "Book Session"
                  : "Currently Busy"}
              </Text>

            </TouchableOpacity>

          </View>

        </ScrollView>

      </SafeAreaView>

    </Modal>
  );
};




const ProfileInfoRow = ({
  icon,
  label,
  value,
}: {
  icon:
    | keyof typeof Ionicons.glyphMap;

  label: string;

  value: string;
}) => {
  return (
    <View
      style={
        styles.profileInfoRow
      }
    >

      <View
        style={
          styles.profileInfoIcon
        }
      >

        <Ionicons
          name={icon}
          size={19}
          color="#2CA6A4"
        />

      </View>


      <View
        style={{
          flex: 1,
        }}
      >

        <Text
          style={
            styles.profileInfoLabel
          }
        >
          {label}
        </Text>


        <Text
          style={
            styles.profileInfoValue
          }
        >
          {value}
        </Text>

      </View>

    </View>
  );
};





const getSessionDateTime = (
  sessionDate: string,
  sessionTime: string
) => {
  const dateMatch = sessionDate.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  const timeMatch = sessionTime
    .trim()
    .toUpperCase()
    .match(
      /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
    );

  if (!dateMatch || !timeMatch) {
    return null;
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);

  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  const period = timeMatch[3];

  if (period === "AM" && hour === 12) {
    hour = 0;
  }

  if (period === "PM" && hour !== 12) {
    hour += 12;
  }

  const sessionDateTime = new Date(
    year,
    month - 1,
    day,
    hour,
    minute,
    0,
    0
  );

  return Number.isNaN(
    sessionDateTime.getTime()
  )
    ? null
    : sessionDateTime;
};




const isSessionPastFiveMinutes = (
  booking: Booking,
  now: number = Date.now()
) => {
  if (booking.status !== "confirmed") {
    return false;
  }

  const sessionDateTime =
    getSessionDateTime(
      booking.sessionDate,
      booking.sessionTime
    );

  if (!sessionDateTime) {
    return false;
  }

  return (
    now >=
    sessionDateTime.getTime() +
      5 * 60 * 1000
  );
};


const SessionCountdown = ({
  sessionDate,
  sessionTime,
}: {
  sessionDate: string;
  sessionTime: string;
}) => {
  const getRemainingTime = () => {
    const sessionDateTime =
      getSessionDateTime(
        sessionDate,
        sessionTime
      );

    if (!sessionDateTime) {
      return null;
    }

    return Math.max(
      sessionDateTime.getTime() -
        Date.now(),
      0
    );
  };

  const [
    remainingTime,
    setRemainingTime,
  ] = useState<number | null>(
    getRemainingTime()
  );

  useEffect(() => {
    setRemainingTime(
      getRemainingTime()
    );

    const interval =
      setInterval(() => {
        setRemainingTime(
          getRemainingTime()
        );
      }, 1000);

    return () =>
      clearInterval(interval);
  }, [
    sessionDate,
    sessionTime,
  ]);

  if (remainingTime === null) {
    return null;
  }

  if (remainingTime <= 0) {
    return (
      <View
        style={
          styles.countdownContainer
        }
      >
        <Ionicons
          name="videocam-outline"
          size={24}
          color="#16A34A"
        />

        <Text
          style={
            styles.countdownStartedText
          }
        >
          Session time has arrived
        </Text>
      </View>
    );
  }

  const totalSeconds =
    Math.floor(
      remainingTime / 1000
    );

  const hours =
    Math.floor(
      totalSeconds / 3600
    );

  const minutes =
    Math.floor(
      (totalSeconds % 3600) /
        60
    );

  const seconds =
    totalSeconds % 60;

  const formatNumber = (
    value: number
  ) =>
    String(value).padStart(
      2,
      "0"
    );

  return (
    <View
      style={
        styles.countdownContainer
      }
    >
      <Text
        style={
          styles.countdownTitle
        }
      >
        SESSION STARTS IN
      </Text>

      <View
        style={
          styles.countdownRow
        }
      >
        <View
          style={
            styles.countdownItem
          }
        >
          <Text
            style={
              styles.countdownNumber
            }
          >
            {formatNumber(hours)}
          </Text>
          <Text
            style={
              styles.countdownLabel
            }
          >
            HR
          </Text>
        </View>

        <Text
          style={
            styles.countdownSeparator
          }
        >
          :
        </Text>

        <View
          style={
            styles.countdownItem
          }
        >
          <Text
            style={
              styles.countdownNumber
            }
          >
            {formatNumber(minutes)}
          </Text>
          <Text
            style={
              styles.countdownLabel
            }
          >
            MIN
          </Text>
        </View>

        <Text
          style={
            styles.countdownSeparator
          }
        >
          :
        </Text>

        <View
          style={
            styles.countdownItem
          }
        >
          <Text
            style={
              styles.countdownNumber
            }
          >
            {formatNumber(seconds)}
          </Text>
          <Text
            style={
              styles.countdownLabel
            }
          >
            SEC
          </Text>
        </View>
      </View>
    </View>
  );
};




const CounselorCard = ({
  counselor,

  booking,

  onViewProfile,

  onBook,

  onCommunication,
}: {
  counselor: Counselor;

  booking?: Booking;

  onViewProfile: () => void;

  onBook: () => void;

  onCommunication: (
    type:
      | "Chat"
      | "Video"
      | "Voice",
    bookingId?: string
  ) => void;
}) => {

  const avatarColor =
    counselor.avatarColor ||
    "#2CA6A4";


  
  const [
    now,
    setNow,
  ] = useState(Date.now());


  useEffect(() => {
    const timer =
      setInterval(() => {
        setNow(Date.now());
      }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);


  const sessionPastFiveMinutes =
    !!booking &&
    isSessionPastFiveMinutes(
      booking,
      now
    );


  const hasBooking =
    !!booking &&
    booking.status !==
      "cancelled" &&
    !sessionPastFiveMinutes;


  const canUsePreviousChat =
    !!booking &&
    booking.status ===
      "confirmed" &&
    sessionPastFiveMinutes;


  return (
    <View
      style={styles.card}
    >

      {/* CARD HEADER */}

      <View
        style={
          styles.cardHeader
        }
      >

        <View
          style={[
            styles.avatar,
            {
              backgroundColor:
                avatarColor +
                "22",
            },
          ]}
        >

          <CounselorAvatar counselor={counselor} />

        </View>


        <View
          style={
            styles.cardInfo
          }
        >

          <Text
            style={
              styles.counselorName
            }
          >
            {counselor.name}
          </Text>
          <RatingSummary counselor={counselor} />


          <Text
            style={
              styles.counselorTitle
            }
          >
            {counselor.title}
          </Text>




        </View>


        {/* AVAILABILITY */}

        <View
          style={[
            styles.availBadge,
            {
              backgroundColor:
                counselor.available
                  ? "#e6f9ee"
                  : "#fde8e8",
            },
          ]}
        >

          <View
            style={[
              styles.availDot,
              {
                backgroundColor:
                  counselor.available
                    ? "#22c55e"
                    : "#ef4444",
              },
            ]}
          />


          <Text
            style={[
              styles.availText,
              {
                color:
                  counselor.available
                    ? "#16a34a"
                    : "#dc2626",
              },
            ]}
          >
            {counselor.available
              ? "Available"
              : "Busy"}
          </Text>

        </View>

      </View>


      {/* META */}

      <View
        style={
          styles.metaContainer
        }
      >

        <View
          style={
            styles.metaRow
          }
        >

          <Ionicons
            name="person-circle-outline"
            size={15}
            color="#666"
          />

          <Text
            style={
              styles.metaText
            }
          >
            {counselor.specialty}
          </Text>

        </View>


        <View
          style={
            styles.metaRow
          }
        >

          <Ionicons
            name="time-outline"
            size={15}
            color="#666"
          />

          <Text
            style={
              styles.metaText
            }
          >
            {counselor.experience}
          </Text>

        </View>


        <View
          style={
            styles.metaRow
          }
        >

          <Ionicons
            name="calendar-outline"
            size={15}
            color="#666"
          />

          <Text
            style={
              styles.metaText
            }
          >
            {counselor.availability}
          </Text>

        </View>

      </View>


      {/* EXISTING BOOKING */}

      {hasBooking &&
        booking && (

          <View
            style={
              styles.existingBookingCard
            }
          >

            <View
              style={
                styles.existingBookingTop
              }
            >

              <Text
                style={
                  styles.existingBookingTitle
                }
              >
                Your Session
              </Text>


              <BookingStatus
                status={
                  booking.status
                }
              />

            </View>


            <View
              style={
                styles.existingBookingRow
              }
            >

              <Ionicons
                name="calendar-outline"
                size={16}
                color="#2CA6A4"
              />

              <Text
                style={
                  styles.existingBookingText
                }
              >
                {booking.sessionDate}
              </Text>

            </View>


            <View
              style={
                styles.existingBookingRow
              }
            >

              <Ionicons
                name="time-outline"
                size={16}
                color="#2CA6A4"
              />

              <Text
                style={
                  styles.existingBookingText
                }
              >
                {booking.sessionTime}
              </Text>

            </View>


            {booking.status ===
              "pending" && (

              <Text
                style={
                  styles.pendingMessage
                }
              >
                Waiting for counselor
                confirmation.
              </Text>

            )}


            {booking.status ===
              "confirmed" && (
              <>
                <SessionCountdown
                  sessionDate={
                    booking.sessionDate
                  }
                  sessionTime={
                    booking.sessionTime
                  }
                />


              </>
            )}

          </View>

        )}


      <View
        style={
          styles.divider
        }
      />


      {/* SESSION / POST-SESSION ACTIONS */}

      {hasBooking ? (

        <View
          style={
            styles.cardActions
          }
        >

          <ActionButton
            icon="chatbubble-outline"
            label="Chat"
            primary
            disabled={
              booking?.status !==
              "confirmed"
            }
            onPress={() =>
              onCommunication(
                "Chat",
                booking?._id
              )
            }
          />


          <ActionButton
            icon="mic-outline"
            label="Voice"
            disabled={
              booking?.status !==
              "confirmed"
            }
            onPress={() =>
              onCommunication(
                "Voice",
                booking?._id
              )
            }
          />


          <ActionButton
            icon="videocam-outline"
            label="Video"
            disabled={
              booking?.status !==
              "confirmed"
            }
            onPress={() =>
              onCommunication(
                "Video",
                booking?._id
              )
            }
          />

        </View>

      ) : canUsePreviousChat ? (

        <View
          style={
            styles.cardActions
          }
        >

          <ActionButton
            icon="calendar-outline"
            label={
              counselor.available
                ? "Book Session"
                : "Currently Busy"
            }
            primary
            disabled={
              !counselor.available
            }
            onPress={onBook}
          />


          <ActionButton
            icon="chatbubble-outline"
            label="Chat"
            onPress={() =>
              onCommunication(
                "Chat",
                booking?._id
              )
            }
          />

        </View>

      ) : (

        <TouchableOpacity
          style={
            styles.bookNowButton
          }
          onPress={onBook}
          disabled={
            !counselor.available
          }
          activeOpacity={0.8}
        >

          <Ionicons
            name="calendar-outline"
            size={17}
            color="#fff"
          />


          <Text
            style={
              styles.bookNowText
            }
          >
            {counselor.available
              ? "Book Session"
              : "Currently Busy"}
          </Text>

        </TouchableOpacity>

      )}


      {/* FULL PROFILE */}

      <TouchableOpacity
        style={
          styles.viewProfile
        }
        activeOpacity={0.7}
        onPress={
          onViewProfile
        }
      >

        <Text
          style={
            styles.viewProfileText
          }
        >
          View Full Profile
        </Text>


        <Ionicons
          name="chevron-forward"
          size={14}
          color="#2CA6A4"
        />

      </TouchableOpacity>

    </View>
  );
};




export default function SupportScreen() {
  const Alert = useLocalizedAlert();
  const bookingFromProfile = useRef(false);

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<FilterType>(
      "Recommended Counselors"
    );


  const [
    counselors,
    setCounselors,
  ] =
    useState<Counselor[]>(
      []
    );


  const [
    bookings,
    setBookings,
  ] =
    useState<Booking[]>(
      []
    );


  const [
    selectedCounselor,
    setSelectedCounselor,
  ] =
    useState<Counselor | null>(
      null
    );


  const [
    profileVisible,
    setProfileVisible,
  ] =
    useState(false);


  const [
    bookingVisible,
    setBookingVisible,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    bookingLoading,
    setBookingLoading,
  ] =
    useState(false);


  const [
    selectedDate,
    setSelectedDate,
  ] =
    useState("");


  const [
    selectedTime,
    setSelectedTime,
  ] =
    useState("");


  const [
    bookedSlots,
    setBookedSlots,
  ] =
    useState<string[]>(
      []
    );


  const filters: FilterType[] = [
    "Recommended Counselors",
    "Available Now",
    "All Counselors",
  ];


  

  useEffect(() => {
    loadSupportData();
  }, []);


  

  const loadSupportData =
    async () => {

      setLoading(true);

      await Promise.all([
        fetchCounselors(),
        fetchPatientBookings(),
      ]);

      setLoading(false);
    };


  

  const fetchCounselors =
    async () => {

      try {

        console.log(
          "Fetching counselors..."
        );


        const response =
          await ngrokFetch(
            `${BASE_URL}/api/counselors`
          );


        const text =
          await response.text();


        console.log(
          "Counselor HTTP status:",
          response.status
        );


        let data: any = null;


        try {

          data = text
            ? JSON.parse(text)
            : null;

        } catch {

          console.log(
            "Invalid counselor response:",
            text
          );

          data = null;
        }


        if (!response.ok) {

          console.log(
            "Counselor fetch failed:",
            data
          );

          setCounselors([]);

          return;
        }


        let counselorList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.counselors
              )
            ? data.counselors
            : Array.isArray(
                data?.data
              )
            ? data.data
            : [];


        counselorList =
          counselorList.filter(
            (item: any) =>
              item &&
              item._id
          );


        console.log(
          "Counselors loaded:",
          counselorList.length
        );


        // Always use saved patient ratings; legacy counselor.rating is not a vote source.
        try {
          const summaryResponse = await ngrokFetch(BASE_URL + "/api/bookings/ratings/summary");
          if (!summaryResponse.ok) throw new Error("Rating summary request failed");
          const summaryData = await summaryResponse.json();
          if (!Array.isArray(summaryData.summaries)) throw new Error("Invalid rating summary response");
          const summaries = new Map<string, { average: number; count: number }>(
            summaryData.summaries.map((item: any) => [String(item.counselorId),
              { average: item.average, count: item.count }])
          );
          counselorList = counselorList.map((item: any) => ({ ...item,
            ratingSummary: summaries.get(String(item._id)) || { average: 0, count: 0 },
            ratingsUnavailable: false,
          }));
        } catch {
          counselorList = counselorList.map((item: any) => ({ ...item,
            ratingSummary: undefined, ratingsUnavailable: true,
          }));
        }
        setCounselors(counselorList);

      } catch (error) {

        console.log(
          "Fetch counselors error:",
          error
        );

        setCounselors([]);

      }
    };


  

  const getPatientId =
    async (): Promise<
      string | null
    > => {

      try {

     

        const directId =
          await AsyncStorage.getItem(
            "userId"
          );


        if (
          directId &&
          directId.trim()
            .length > 0
        ) {

          return directId.trim();
        }


        

        const savedUser =
          await AsyncStorage.getItem(
            "user"
          );


        if (savedUser) {

          try {

            const parsed =
              JSON.parse(
                savedUser
              );


            const id =
              parsed?._id ||
              parsed?.id;


            if (id) {

              return String(id);
            }

          } catch (error) {

            console.log(
              "Saved user parse error:",
              error
            );

          }
        }


        return null;

      } catch (error) {

        console.log(
          "Get patient ID error:",
          error
        );

        return null;
      }
    };


  

  const fetchPatientBookings =
    async () => {

      try {

        const patientId =
          await getPatientId();


        console.log(
          "Patient ID:",
          patientId
        );


        if (!patientId) {

          console.log(
            "Patient ID not found."
          );

          setBookings([]);

          return;
        }


        const response =
          await ngrokFetch(
            `${BASE_URL}/api/bookings/patient/${encodeURIComponent(
              patientId
            )}`
          );


        const text =
          await response.text();


        console.log(
          "Patient bookings status:",
          response.status
        );


        let data: any = {};


        try {

          data = text
            ? JSON.parse(text)
            : {};

        } catch {

          console.log(
            "Invalid booking response:",
            text
          );

          data = {};
        }


        if (!response.ok) {

          console.log(
            "Booking fetch failed:",
            data
          );

          setBookings([]);

          return;
        }


        const bookingList =
          Array.isArray(
            data.bookings
          )
            ? data.bookings
            : [];


        setBookings(
          bookingList
        );


        console.log(
          "Patient bookings loaded:",
          bookingList.length
        );

      } catch (error) {

        console.log(
          "Fetch patient bookings error:",
          error
        );

        setBookings([]);

      }
    };


  

  const openProfile = (
    counselor: Counselor
  ) => {

    setSelectedCounselor(
      counselor
    );

    setProfileVisible(
      true
    );
  };


  

  const closeProfile =
    () => {

      if (bookingLoading) {
        return;
      }

      setProfileVisible(
        false
      );

      setSelectedCounselor(
        null
      );
    };


  

  const openBooking = (
    counselor: Counselor
  ) => {

    if (!counselor._id) {

      Alert.alert(
        "Error",
        "Counselor ID is missing."
      );

      return;
    }


    if (
      counselor.available ===
      false
    ) {

      Alert.alert(
        "Counselor Busy",
        "This counselor is currently unavailable. Please choose another counselor."
      );

      return;
    }


    bookingFromProfile.current = profileVisible;

    setSelectedCounselor(
      counselor
    );

    setProfileVisible(
      false
    );

    setSelectedDate("");

    setSelectedTime("");

    setBookedSlots([]);

    setBookingVisible(
      true
    );
  };


  

  const closeBooking =
    () => {

      if (bookingLoading) {
        return;
      }


      setBookingVisible(
        false
      );

      if (bookingFromProfile.current) {
        setProfileVisible(true);
        bookingFromProfile.current = false;
      }

      setSelectedDate("");

      setSelectedTime("");

      setBookedSlots([]);
    };


  

  const fetchBookedSlots =
    async (
      date: string
    ) => {

      if (
        !selectedCounselor?._id
      ) {

        return;
      }


      try {

        console.log(
          "Checking booked slots:",
          {
            counselor:
              selectedCounselor._id,

            date,
          }
        );


        const response =
          await ngrokFetch(
            `${BASE_URL}/api/bookings/counselor/${selectedCounselor._id}/slots?date=${encodeURIComponent(
              date
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

          console.log(
            "Invalid slots response:",
            text
          );

          data = {};
        }


        if (!response.ok) {

          console.log(
            "Booked slots error:",
            data
          );

          setBookedSlots([]);

          return;
        }


        const slots =
          Array.isArray(
            data.bookedSlots
          )
            ? data.bookedSlots
                .map(
                  (item: any) =>
                    item?.sessionTime
                )
                .filter(
                  Boolean
                )
            : [];


        console.log(
          "Booked slots:",
          slots
        );


        setBookedSlots(
          slots
        );


        setSelectedTime(
          (current) =>
            slots.includes(
              current
            )
              ? ""
              : current
        );

      } catch (error) {

        console.log(
          "Fetch booked slots error:",
          error
        );

        setBookedSlots([]);
      }
    };


  

  const handleDateSelect =
    (date: string) => {

      if (bookingLoading) {
        return;
      }


      setSelectedDate(
        date
      );

      setSelectedTime(
        ""
      );

      // Get current booking
      // status for selected date.
      fetchBookedSlots(
        date
      );
    };


 

  const getExistingBooking =
    (
      counselorId: string
    ): Booking | undefined => {

      const matches =
        bookings.filter(
          (booking) => {

            const bookingCounselorId =
              typeof booking.counselor ===
              "string"
                ? booking.counselor
                : booking.counselor
                    ?._id;


            return (
              String(
                bookingCounselorId
              ) ===
              String(
                counselorId
              )
            );
          }
        );


      const active =
        matches.find(
          (booking) =>
            booking.status ===
              "pending" ||
            (
              booking.status ===
                "confirmed" &&
              !isSessionPastFiveMinutes(
                booking
              )
            )
        );


      if (active) {
        return active;
      }


      
      return undefined;
    };


  

  const confirmBooking =
    async () => {

      

      if (bookingLoading) {
        return;
      }


      

      if (
        !selectedCounselor?._id
      ) {

        Alert.alert(
          "Error",
          "Counselor information is missing."
        );

        return;
      }


      

      if (!selectedDate) {

        Alert.alert(
          "Select Date",
          "Please select a session date."
        );

        return;
      }


      

      if (!selectedTime) {

        Alert.alert(
          "Select Time",
          "Please select a session time."
        );

        return;
      }


      

      if (
        bookedSlots.includes(
          selectedTime
        )
      ) {

        Alert.alert(
          "Time Unavailable",
          "This time slot has already been booked. Please select another time."
        );

        return;
      }


      try {

        setBookingLoading(
          true
        );


        

        const patientId =
          await getPatientId();


        console.log(
          "===================================="
        );

        console.log(
          "CREATE BOOKING"
        );

        console.log(
          "Patient ID:",
          patientId
        );

        console.log(
          "Counselor ID:",
          selectedCounselor._id
        );

        console.log(
          "Date:",
          selectedDate
        );

        console.log(
          "Time:",
          selectedTime
        );


        if (!patientId) {

          Alert.alert(
            "Login Required",
            "Your user ID was not found. Please logout and login again."
          );

          return;
        }


        

        const existingBooking =
          getExistingBooking(
            selectedCounselor._id
          );


        if (existingBooking) {

          Alert.alert(
            "Existing Booking",
            `You already have a ${existingBooking.status} session with this counselor on ${existingBooking.sessionDate} at ${existingBooking.sessionTime}.`
          );

          return;
        }


        

        const bookingData = {
          counselor:
            String(
              selectedCounselor._id
            ),

          patient:
            String(
              patientId
            ),

          sessionDate:
            String(
              selectedDate
            ).trim(),

          sessionTime:
            String(
              selectedTime
            ).trim(),

          sessionType:
            "Chat",

          notes:
            "",
        };


        console.log(
          "Booking request body:"
        );

        console.log(
          JSON.stringify(
            bookingData,
            null,
            2
          )
        );


        

        const response =
          await ngrokFetch(
            `${BASE_URL}/api/bookings`,
            {
              method:
                "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",

                "ngrok-skip-browser-warning":
                  "true",
              },

              body:
                JSON.stringify(
                  bookingData
                ),
            }
          );


        

        const responseText =
          await response.text();


        console.log(
          "Booking HTTP status:",
          response.status
        );

        console.log(
          "Booking response:",
          responseText
        );


        let data: any = {};


        try {

          data =
            responseText
              ? JSON.parse(
                  responseText
                )
              : {};

        } catch {

          console.log(
            "Could not parse booking response."
          );

          data = {
            message:
              responseText ||
              "Invalid server response.",
          };
        }


       

        if (!response.ok) {

          console.log(
            "BOOKING FAILED:",
            data
          );


          if (
            response.status ===
            409
          ) {

            

            await fetchBookedSlots(
              selectedDate
            );


            Alert.alert(
              "Time Unavailable",
              data.message ||
                "This time slot has already been booked. Please select another time."
            );

            return;
          }


          Alert.alert(
            "Booking Failed",
            data.message ||
              data.error ||
              `Server returned ${response.status}.`
          );

          return;
        }


        

        if (
          !data.booking ||
          !data.booking._id
        ) {

          console.log(
            "Invalid booking response:",
            data
          );


          Alert.alert(
            "Booking Error",
            "The server did not return a valid booking."
          );

          return;
        }


        

        console.log(
          "BOOKING CREATED SUCCESSFULLY:"
        );

        console.log(
          data.booking
        );


        

        setBookings(
          (previous) => {

            const withoutDuplicate =
              previous.filter(
                (item) =>
                  item._id !==
                  data.booking._id
              );


            return [
              data.booking,
              ...withoutDuplicate,
            ];
          }
        );


        

        setBookingVisible(
          false
        );

        setSelectedDate("");

        setSelectedTime("");

        setBookedSlots([]);


        

        await fetchPatientBookings();




        Alert.alert(
          "Booking Submitted",
          "Your counseling session has been booked successfully.\n\nStatus: Pending\n\nThe counselor must confirm the session before it becomes confirmed."
        );

      } catch (error: any) {

        console.log(
          "===================================="
        );

        console.log(
          "CREATE BOOKING NETWORK ERROR"
        );

        console.log(
          error
        );

        console.log(
          "===================================="
        );


        Alert.alert(
          "Network Error",
          error?.message ||
            "Could not connect to the server. Please make sure the backend and ngrok are running."
        );

      } finally {

        setBookingLoading(
          false
        );
      }
    };


 

  const onRefresh =
    async () => {

      setRefreshing(
        true
      );


      try {

        await Promise.all([
          fetchCounselors(),
          fetchPatientBookings(),
        ]);

      } finally {

        setRefreshing(
          false
        );
      }
    };


  

  useEffect(() => {

    const autoRefreshInterval =
      setInterval(() => {

        onRefresh();

      }, 5000);

    return () => {
      clearInterval(
        autoRefreshInterval
      );
    };

  }, []);


  

  const handleCommunication =
    (
      type:
        | "Chat"
        | "Video"
        | "Voice",
      bookingId?: string
    ) => {
      if (!bookingId) {
        Alert.alert(
          "Session Unavailable",
          "The booking ID could not be found. Please refresh the Support page and try again."
        );
        return;
      }

      if (type === "Chat") {
        router.push({
          pathname: "/chat/chat" as any,
          params: {
            bookingId: String(bookingId),
          },
        });
        return;
      }

      if (type === "Voice") {
        router.push({
          pathname: "/voice/voice" as any,
          params: {
            bookingId: String(bookingId),
            role: "user",
          },
        });
        return;
      }

      if (type === "Video") {
  router.push({
    pathname: "/video/video" as any,
    params: {
      bookingId: String(bookingId),
      role: "user",
    },
  });
  return;
}
    };




  const getCounselorBooking =
    (
      counselorId: string
    ) => {

      const counselorBookings =
        bookings.filter(
          (booking) => {

            const bookingCounselorId =
              typeof booking.counselor ===
              "string"
                ? booking.counselor
                : booking.counselor
                    ?._id;


            return (
              String(
                bookingCounselorId
              ) ===
              String(
                counselorId
              )
            );
          }
        );


      

      const activeBooking =
        counselorBookings.find(
          (booking) =>
            booking.status ===
              "pending" ||
            (
              booking.status ===
                "confirmed" &&
              !isSessionPastFiveMinutes(
                booking
              )
            )
        );


      if (activeBooking) {
        return activeBooking;
      }


      const previousConfirmed =
        counselorBookings.find(
          (booking) =>
            booking.status ===
              "confirmed"
        );


      if (previousConfirmed) {
        return previousConfirmed;
      }


      return counselorBookings[0];
    };


 
  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.status ===
          "pending" ||
        booking.status ===
          "confirmed"
    );


  const selectedCounselorIds =
    Array.from(
      new Set(
        activeBookings
          .map((booking) =>
            typeof booking.counselor ===
            "string"
              ? booking.counselor
              : booking.counselor?._id
          )
          .filter(
            (id): id is string =>
              Boolean(id)
          )
          .map(String)
      )
    );


  const selectedCounselors =
    selectedCounselorIds
      .map((counselorId) =>
        counselors.find(
          (counselor) =>
            String(
              counselor._id
            ) ===
            String(
              counselorId
            )
        )
      )
      .filter(
        (
          counselor
        ): counselor is Counselor =>
          Boolean(counselor)
      );


  

  const selectedCounselorIdSet =
    new Set(
      selectedCounselors.map(
        (counselor) =>
          String(counselor._id)
      )
    );


  const otherCounselors =
    counselors.filter(
      (counselor) =>
        !selectedCounselorIdSet.has(
          String(counselor._id)
        )
    );


  // Recommendations prioritize availability without using scores or changing API data.
  // Keep the existing order within each availability group.
  const filteredCounselors =
    activeFilter === "Available Now"
      ? otherCounselors.filter((counselor) => counselor.available)
      : activeFilter === "Recommended Counselors"
      ? [
          ...otherCounselors.filter((counselor) => counselor.available),
          ...otherCounselors.filter((counselor) => !counselor.available),
        ]
      : otherCounselors;


  


  const handleBack = () => {
    if (bookingVisible) { closeBooking(); return; }
    if (profileVisible) { closeProfile(); return; }
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [bookingVisible, profileVisible, bookingLoading]));

  if (loading) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <PageBack onPress={handleBack} dark />

        <ActivityIndicator
          size="large"
          color="#2CA6A4"
        />


        <Text
          style={
            styles.loadingText
          }
        >
          Loading counselors...
        </Text>

      </View>
    );
  }


 

  return (
    <View
      style={{
        flex: 1,
      }}
    >

     

      <View style={backStyles.bar}><PageBack onPress={handleBack} /></View>

      <CounselorProfileModal
        visible={
          profileVisible
        }

        counselor={
          counselors.find((item) => item._id === selectedCounselor?._id) || selectedCounselor
        }

        onClose={
          closeProfile
        }

        onBook={() => {

          if (
            selectedCounselor
          ) {

            openBooking(
              selectedCounselor
            );
          }

        }}
      />


      
      <BookingModal
        visible={
          bookingVisible
        }

        counselor={
          selectedCounselor
        }

        selectedDate={
          selectedDate
        }

        selectedTime={
          selectedTime
        }

        bookedSlots={
          bookedSlots
        }

        booking={
          bookingLoading
        }

        onClose={
          closeBooking
        }

        onSelectDate={
          handleDateSelect
        }

        onSelectTime={
          setSelectedTime
        }

        onConfirm={
          confirmBooking
        }
      />


      

      <ScrollView
        style={
          styles.container
        }

        contentContainerStyle={{
          paddingBottom: 40,
        }}

        showsVerticalScrollIndicator={
          false
        }

        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
          />
        }
      >

        

        <View
          style={
            styles.header
          }
        >

          <View
            style={
              styles.headerContent
            }
          >

            <View
              style={
                styles.logoRow
              }
            >

              <View
                style={
                  styles.logoIcon
                }
              >

                <Ionicons
                  name="heart"
                  size={18}
                  color="#fff"
                />

              </View>


              <View>

                <Text
                  style={
                    styles.logoTitle
                  }
                >
                  HopeHub
                </Text>


                <Text
                  style={
                    styles.logoSubtitle
                  }
                >
                  Connect with Counselors
                </Text>

              </View>

            </View>

          </View>



          {/* HERO */}

          <View
            style={
              styles.heroBanner
            }
          >

            <Ionicons
              name="shield-checkmark-outline"
              size={22}
              color="#fff"
              style={{
                marginBottom: 6,
              }}
            />


            <Text
              style={
                styles.heroTitle
              }
            >
              Professional Support Available
            </Text>


            <Text
              style={
                styles.heroBody
              }
            >
              Connect with counselors
              who specialize in
              addiction recovery.
              All conversations are
              confidential and secure.
            </Text>

          </View>

        </View>


     

        {selectedCounselors.length > 0 && (

          <View
            style={
              styles.selectedCounselorSection
            }
          >

            <View
              style={
                styles.selectedCounselorHeader
              }
            >

              <View
                style={
                  styles.selectedCounselorTitleRow
                }
              >

                <View
                  style={
                    styles.selectedCounselorIcon
                  }
                >

                  <Ionicons
                    name="heart"
                    size={21}
                    color="#2CA6A4"
                  />

                </View>


                <View
                  style={{
                    flex: 1,
                  }}
                >

                  <Text
                    style={
                      styles.selectedCounselorTitle
                    }
                  >
                    Your Counselors
                  </Text>


                  <Text
                    style={
                      styles.selectedCounselorSubtitle
                    }
                  >
                    Your selected recovery support counselors
                  </Text>

                </View>

              </View>


              <View
                style={
                  styles.selectedBadge
                }
              >

                <View
                  style={
                    styles.selectedBadgeDot
                  }
                />


                <Text
                  style={
                    styles.selectedBadgeText
                  }
                >
                  {selectedCounselors.length} SELECTED
                </Text>

              </View>

            </View>


            {selectedCounselors.map(
              (
                counselor,
                index
              ) => (

                <View
                  key={
                    counselor._id
                  }
                  style={[
                    styles.selectedCounselorCardWrapper,
                    index > 0 && {
                      marginTop: 14,
                    },
                  ]}
                >

                  <View
                    style={
                      styles.selectedTopLabel
                    }
                  >

                    <Ionicons
                      name="shield-checkmark"
                      size={15}
                      color="#2CA6A4"
                    />


                    <Text
                      style={
                        styles.selectedTopLabelText
                      }
                    >
                      YOUR COUNSELING SUPPORT
                    </Text>

                  </View>


                  <CounselorCard
                    counselor={
                      counselor
                    }

                    booking={
                      getCounselorBooking(
                        counselor._id
                      )
                    }

                    onViewProfile={() =>
                      openProfile(
                        counselor
                      )
                    }

                    onBook={() =>
                      openBooking(
                        counselor
                      )
                    }

                    onCommunication={
                      handleCommunication
                    }
                  />

                </View>

              )
            )}

          </View>

        )}




        <SessionRatings onSaved={fetchCounselors} />

        <View
          style={
            styles.browseCounselorSection
          }
        >

          <View
            style={
              styles.browseCounselorHeader
            }
          >

            <Text
              style={
                styles.browseCounselorTitle
              }
            >
              Explore Other Counselors
            </Text>


            <Text
              style={
                styles.browseCounselorSubtitle
              }
            >
              Find another counselor who matches your support needs.
            </Text>

          </View>

        </View>


       

        <View
          style={
            styles.filterContainer
          }
        >

          {filters.map(
            (filter) => (

              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterBtn,

                  activeFilter ===
                    filter &&
                    styles.filterBtnActive,
                ]}
                onPress={() =>
                  setActiveFilter(
                    filter
                  )
                }
                activeOpacity={
                  0.8
                }
              >

                <Text
                  style={[
                    styles.filterText,

                    activeFilter ===
                      filter &&
                      styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>

              </TouchableOpacity>

            )
          )}

        </View>


      

        <Text
          style={
            styles.resultCount
          }
        >

          {filteredCounselors.length}{" "}

          other counselor
          {filteredCounselors.length !==
          1
            ? "s"
            : ""}{" "}

          found

        </Text>




         <View
          style={
            styles.cardList
          }
        >

          {filteredCounselors.length >
          0 ? (

            filteredCounselors.map(
              (counselor) => {

                const booking =
                  getCounselorBooking(
                    counselor._id
                  );


                return (
                  <CounselorCard
                    key={
                      counselor._id
                    }

                    counselor={
                      counselor
                    }

                    booking={
                      booking
                    }

                    onViewProfile={() =>
                      openProfile(
                        counselor
                      )
                    }

                    onBook={() =>
                      openBooking(
                        counselor
                      )
                    }

                    onCommunication={
                      handleCommunication
                    }
                  />
                );
              }
            )

          ) : (

            <View
              style={
                styles.emptyCard
              }
            >

              <Ionicons
                name="people-outline"
                size={45}
                color="#A8CACA"
              />


              <Text
                style={
                  styles.emptyTitle
                }
              >
                No counselors found
              </Text>


              <Text
                style={
                  styles.emptyText
                }
              >
                No counselors are
                currently available.
                Please refresh the
                page or try again
                later.
              </Text>

            </View>

          )}

        </View>

      

        <View
          style={
            styles.emergencyBanner
          }
        >

          <Ionicons
            name="warning"
            size={20}
            color="#e26d36"
          />


          <View
            style={{
              flex: 1,
              marginLeft: 10,
            }}
          >

            <Text
              style={
                styles.emergencyTitle
              }
            >
              Need Immediate Help?
            </Text>


            <Text
              style={
                styles.emergencyBody
              }
            >
              If you're in crisis,
              contact your local
              emergency service or
              a qualified crisis
              professional immediately.
            </Text>

          </View>

        </View>

      </ScrollView>




      <AICounsellingFAB
        onPress={() => {
          router.push(
            "/ai-counseling/ai-counseling"
          );
        }}
      />

    </View>
  );
}

function PageBack({ onPress, dark = false, disabled = false }: {
  onPress: () => void;
  dark?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}
      accessibilityRole="button" accessibilityLabel="Go back"
      style={[backStyles.button, disabled && backStyles.disabled]}>
      <Ionicons name="chevron-back" size={20} color={dark ? "#1A3A3A" : "#FFFFFF"} />
      <Text style={[backStyles.label, { color: dark ? "#1A3A3A" : "#FFFFFF" }]}>Back</Text>
    </TouchableOpacity>
  );
}

const backStyles = StyleSheet.create({
  bar: { backgroundColor: "#2CA6A4", paddingHorizontal: 12, paddingTop: 4 },
  button: { minHeight: 44, minWidth: 44, flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 6 },
  label: { fontSize: 13, fontWeight: "600" },
  disabled: { opacity: 0.45 },
});
