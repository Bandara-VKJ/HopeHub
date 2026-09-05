import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  TextInput,
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

const BASE_URL =
  "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (
  url: string,
  options: RequestInit = {}
) => {
  return fetch(url, {
    ...options,

    headers: {
      ...(options.headers || {}),

      "ngrok-skip-browser-warning":
        "true",

      Accept:
        "application/json",
    },
  });
};

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

export default function CounselorScreen() {

  const [
    counselor,
    setCounselor,
  ] = useState<Counselor | null>(
    null
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
    "schedule" | "chats" | "reports" | "patients" | null
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

            <Text
              style={
                styles.avatarText
              }
            >
              {counselor.avatar ||
                "CN"}
            </Text>

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

                        <Text
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
                      : "My Patients"}
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
                      : "Patients assigned to your counseling sessions"}
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

                                <Text
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

                                  <Text
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

                              <Text
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

                            <Text
                              style={styles.boldDark333}
                            >
                              {report.patientName}
                            </Text>

                            <Text
                              style={styles.previousReportDate}
                            >
                              {report.sessionDate}
                            </Text>

                            <Text
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

                                <Text
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