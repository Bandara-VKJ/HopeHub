import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import {
  styles,
  aiStyles,
} from "./supportStyles";
import { ngrokFetch } from "@/utill/ngrokFetch";




const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;




type FilterType =
  | "All Counselors"
  | "Available Now"
  | "Top Rated";


type Counselor = {
  _id: string;

  firstName?: string;
  lastName?: string;

  name: string;

  title: string;

  rating: number;
  reviews: number;

  specialty: string;
  experience: string;
  availability: string;

  available: boolean;
  topRated: boolean;

  avatar: string;
  avatarColor: string;

  email?: string;
  mobile?: string;

  image?: string;
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




const getAvatar = (
  counselor: Counselor
) => {
  if (counselor.avatar) {
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




const StarRating = ({
  rating,
}: {
  rating: number;
}) => {
  return (
    <View style={styles.ratingRow}>
      <Ionicons
        name="star"
        size={14}
        color="#F09C00"
      />

      <Text
        style={styles.ratingText}
      >
        {rating || 0}
      </Text>
    </View>
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


  const avatar =
    getAvatar(counselor);

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

              <Text
                style={[
                  styles.profileAvatarText,
                  {
                    color:
                      avatarColor,
                  },
                ]}
              >
                {avatar}
              </Text>

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


          {/* STATS */}

          <View
            style={
              styles.profileStatsRow
            }
          >

            <View
              style={
                styles.profileStatCard
              }
            >

              <Ionicons
                name="star"
                size={22}
                color="#F09C00"
              />

              <Text
                style={
                  styles.profileStatNumber
                }
              >
                {counselor.rating ||
                  0}
              </Text>

              <Text
                style={
                  styles.profileStatLabel
                }
              >
                Rating
              </Text>

            </View>


            <View
              style={
                styles.profileStatCard
              }
            >

              <Ionicons
                name="chatbubbles-outline"
                size={22}
                color="#2CA6A4"
              />

              <Text
                style={
                  styles.profileStatNumber
                }
              >
                {counselor.reviews ||
                  0}
              </Text>

              <Text
                style={
                  styles.profileStatLabel
                }
              >
                Reviews
              </Text>

            </View>


            <View
              style={
                styles.profileStatCard
              }
            >

              <Ionicons
                name="medal-outline"
                size={22}
                color="#8B5CF6"
              />

              <Text
                style={
                  styles.profileStatNumber
                }
              >
                {counselor.topRated
                  ? "Yes"
                  : "No"}
              </Text>

              <Text
                style={
                  styles.profileStatLabel
                }
              >
                Top Rated
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

  const avatar =
    getAvatar(counselor);

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

          <Text
            style={[
              styles.avatarText,
              {
                color:
                  avatarColor,
              },
            ]}
          >
            {avatar}
          </Text>

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


          <Text
            style={
              styles.counselorTitle
            }
          >
            {counselor.title}
          </Text>


          <View
            style={
              styles.ratingReviewRow
            }
          >

            <StarRating
              rating={
                counselor.rating ||
                0
              }
            />

            <Text
              style={
                styles.reviewCount
              }
            >
              ({counselor.reviews ||
                0}{" "}
              reviews)
            </Text>

          </View>

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

  const [
    activeFilter,
    setActiveFilter,
  ] =
    useState<FilterType>(
      "All Counselors"
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


  const filters:
    FilterType[] = [
      "All Counselors",
      "Available Now",
      "Top Rated",
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


        setCounselors(
          counselorList
        );

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


  const filteredCounselors =
    otherCounselors.filter(
      (counselor) => {

        if (
          activeFilter ===
          "Available Now"
        ) {

          return counselor.available;
        }


        if (
          activeFilter ===
          "Top Rated"
        ) {

          return counselor.topRated;
        }


        return true;
      }
    );


  

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

     

      <CounselorProfileModal
        visible={
          profileVisible
        }

        counselor={
          selectedCounselor
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