import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
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


// ============================================================
// BACKEND URL
// ============================================================

const BASE_URL =
  "https://connector-removed-stoneware.ngrok-free.dev";


// ============================================================
// NGROK FETCH
// ============================================================

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


// ============================================================
// TYPES
// ============================================================

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


// ============================================================
// COUNSELOR SCREEN
// ============================================================

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


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadCounselor();
  }, []);


  // ==========================================================
  // GO TO COUNSELOR LOGIN
  // ==========================================================

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


  // ==========================================================
  // LOAD COUNSELOR
  // ==========================================================

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


  // ==========================================================
  // FETCH BOOKINGS
  // ==========================================================

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


  // ==========================================================
  // REFRESH BOOKINGS
  // ==========================================================

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


  // ==========================================================
  // GET PATIENT NAME
  // ==========================================================

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


  // ==========================================================
  // GET PATIENT EMAIL
  // ==========================================================

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


  // ==========================================================
  // CONFIRM BOOKING
  // ==========================================================

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


  // ==========================================================
  // CANCEL BOOKING
  // ==========================================================

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


  // ==========================================================
  // OPEN CHAT WITH PATIENT
  // ==========================================================

  const openPatientChat =
    async (
      booking: Booking
    ) => {

      // --------------------------------------------------------
      // CHAT ONLY AFTER CONFIRMATION
      // --------------------------------------------------------

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


      // --------------------------------------------------------
      // CHECK BOOKING ID
      // --------------------------------------------------------

      if (
        !booking._id
      ) {

        Alert.alert(
          "Chat Error",
          "Booking ID is missing."
        );

        return;
      }


      // --------------------------------------------------------
      // CHECK COUNSELOR ID
      // --------------------------------------------------------

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


      // ========================================================
      // IMPORTANT:
      // YOUR chat.tsx IS INSIDE:
      //
      // app/(tabs)/Support/chat.tsx
      //
      // Therefore:
      //
      // /Chat/chat       ❌ WRONG
      //
      // /(tabs)/Support/chat  ✅ CORRECT
      // ========================================================

      router.push({
        pathname:
          "/(tabs)/Support/chat",

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


  // ==========================================================
  // AVAILABILITY
  // ==========================================================

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


  // ==========================================================
  // LOGOUT
  // ==========================================================

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


  // ==========================================================
  // CONFIRM LOGOUT
  // ==========================================================

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


  // ==========================================================
  // LOADING
  // ==========================================================

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


  // ==========================================================
  // COUNSELOR NOT FOUND
  // ==========================================================

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
          style={{
            marginTop:
              20,

            backgroundColor:
              "#2CA6A4",

            paddingHorizontal:
              25,

            paddingVertical:
              12,

            borderRadius:
              10,
          }}

          onPress={
            goToCounselorLogin
          }
        >

          <Text
            style={{
              color:
                "#FFFFFF",

              fontWeight:
                "700",
            }}
          >
            Login Again
          </Text>

        </TouchableOpacity>

      </View>
    );
  }


  // ==========================================================
  // BOOKING FILTERS
  // ==========================================================

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


  // ==========================================================
  // MAIN UI
  // ==========================================================

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


      {/* ======================================================
          HEADER
      ======================================================= */}

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


        {/* ====================================================
            PROFILE CARD
        ===================================================== */}

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
            style={{
              flex: 1,
            }}
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


      {/* ======================================================
          BODY
      ======================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={{
          paddingBottom:
            30,
        }}
      >

        {/* ====================================================
            AVAILABILITY
        ===================================================== */}

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


        {/* ====================================================
            BOOKING REQUESTS
        ===================================================== */}

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


          {/* ==================================================
              NO BOOKINGS
          =================================================== */}

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

                    {/* ======================================
                        PATIENT
                    ======================================= */}

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
                        style={{
                          flex: 1,
                          marginLeft:
                            12,
                        }}
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


                      {/* STATUS */}

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


                    {/* ======================================
                        DETAILS
                    ======================================= */}

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


                    {/* ======================================
                        PENDING ACTIONS
                    ======================================= */}

                    {booking.status ===
                      "pending" && (

                      <View
                        style={
                          styles.bookingActions
                        }
                      >

                        {/* CANCEL */}

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


                        {/* CONFIRM */}

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


                    {/* ======================================
                        CONFIRMED
                    ======================================= */}

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


                        {/* =================================
                            CHAT WITH PATIENT
                        ================================== */}

                        <TouchableOpacity
                          style={{
                            marginTop:
                              12,

                            backgroundColor:
                              "#2CA6A4",

                            paddingVertical:
                              12,

                            paddingHorizontal:
                              16,

                            borderRadius:
                              10,

                            flexDirection:
                              "row",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            gap:
                              8,
                          }}

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
                            style={{
                              color:
                                "#FFFFFF",

                              fontSize:
                                15,

                              fontWeight:
                                "700",
                            }}
                          >
                            Chat with Patient
                          </Text>

                        </TouchableOpacity>

                      </View>

                    )}


                    {/* ======================================
                        CANCELLED
                    ======================================= */}

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


        {/* ====================================================
            STATISTICS
        ===================================================== */}

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


        {/* ====================================================
            PROFILE DETAILS
        ===================================================== */}

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


        {/* ====================================================
            QUICK ACTIONS
        ===================================================== */}

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

            {/* SCHEDULE */}

            <TouchableOpacity
              style={
                styles.actionCard
              }

              activeOpacity={
                0.75
              }
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

            </TouchableOpacity>


            {/* CHATS */}

            <TouchableOpacity
              style={
                styles.actionCard
              }

              activeOpacity={
                0.75
              }

              onPress={() => {

                const confirmedBooking =
                  confirmedBookings[0];


                if (
                  !confirmedBooking
                ) {

                  Alert.alert(
                    "No Active Chat",
                    "You do not have a confirmed counseling session yet."
                  );

                  return;
                }


                openPatientChat(
                  confirmedBooking
                );
              }}
            >

              <View
                style={[
                  styles.actionIcon,

                  {
                    backgroundColor:
                      "#FF9800",
                  },
                ]}
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

            </TouchableOpacity>


            {/* REPORTS */}

            <TouchableOpacity
              style={
                styles.actionCard
              }

              activeOpacity={
                0.75
              }
            >

              <View
                style={[
                  styles.actionIcon,

                  {
                    backgroundColor:
                      "#9C27B0",
                  },
                ]}
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

            </TouchableOpacity>


            {/* PATIENTS */}

            <TouchableOpacity
              style={
                styles.actionCard
              }

              activeOpacity={
                0.75
              }

              onPress={() =>
                router.push(
                  "/(patients)/patients"
                )
              }
            >

              <View
                style={[
                  styles.actionIcon,

                  {
                    backgroundColor:
                      "#E91E63",
                  },
                ]}
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

            </TouchableOpacity>

          </View>

        </View>


        {/* ====================================================
            LOGOUT
        ===================================================== */}

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


        {/* ====================================================
            QUOTE
        ===================================================== */}

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


// ============================================================
// INFO ROW
// ============================================================

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
        style={{
          flex: 1,
        }}
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