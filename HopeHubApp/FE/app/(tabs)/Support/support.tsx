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


// ============================================================
// BACKEND
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


// ============================================================
// AVAILABLE TIME SLOTS
// ============================================================

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


// ============================================================
// AVATAR
// ============================================================

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


// ============================================================
// AI COUNSELLING BUTTON
// ============================================================

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


// ============================================================
// STAR RATING
// ============================================================

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


// ============================================================
// BOOKING STATUS
// ============================================================

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


// ============================================================
// ACTION BUTTON
// ============================================================

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


// ============================================================
// BOOKING MODAL
// ============================================================

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


  // ----------------------------------------------------------
  // NEXT 7 DAYS
  // ----------------------------------------------------------

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

          {/* ==================================================
              SELECT DATE
          ================================================== */}

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


          {/* ==================================================
              SELECT TIME
          ================================================== */}

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


          {/* ==================================================
              INFORMATION
          ================================================== */}

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


          {/* ==================================================
              SELECTED SUMMARY
          ================================================== */}

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


          {/* ==================================================
              CONFIRM
          ================================================== */}

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


// ============================================================
// COUNSELOR PROFILE MODAL
// ============================================================

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


// ============================================================
// PROFILE INFO ROW
// ============================================================

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


// ============================================================
// COUNSELOR CARD
// ============================================================

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


  const hasBooking =
    !!booking &&
    booking.status !==
      "cancelled";


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

              <Text
                style={[
                  styles.pendingMessage,
                  {
                    color:
                      "#16A34A",
                  },
                ]}
              >
                Your session has
                been confirmed.
              </Text>

            )}

          </View>

        )}


      <View
        style={
          styles.divider
        }
      />


      {/* NO ACTIVE BOOKING */}

      {!hasBooking ? (

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

      ) : (

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

        </View>

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


// ============================================================
// SUPPORT SCREEN
// ============================================================

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


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadSupportData();
  }, []);


  // ==========================================================
  // LOAD ALL DATA
  // ==========================================================

  const loadSupportData =
    async () => {

      setLoading(true);

      await Promise.all([
        fetchCounselors(),
        fetchPatientBookings(),
      ]);

      setLoading(false);
    };


  // ==========================================================
  // FETCH COUNSELORS
  // ==========================================================

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


  // ==========================================================
  // GET CURRENT USER ID
  // ==========================================================

  const getPatientId =
    async (): Promise<
      string | null
    > => {

      try {

        // ------------------------------------------------------
        // First preference: userId
        // ------------------------------------------------------

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


        // ------------------------------------------------------
        // Second preference: saved user object
        // ------------------------------------------------------

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


  // ==========================================================
  // FETCH PATIENT BOOKINGS
  // ==========================================================

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


  // ==========================================================
  // OPEN PROFILE
  // ==========================================================

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


  // ==========================================================
  // CLOSE PROFILE
  // ==========================================================

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


  // ==========================================================
  // OPEN BOOKING
  // ==========================================================

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


  // ==========================================================
  // CLOSE BOOKING
  // ==========================================================

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


  // ==========================================================
  // FETCH BOOKED SLOTS
  // ==========================================================

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


  // ==========================================================
  // SELECT DATE
  // ==========================================================

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


  // ==========================================================
  // CHECK IF USER ALREADY HAS
  // AN ACTIVE BOOKING WITH COUNSELOR
  // ==========================================================

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


      // Prefer active bookings
      const active =
        matches.find(
          (booking) =>
            booking.status ===
              "pending" ||
            booking.status ===
              "confirmed"
        );


      if (active) {
        return active;
      }


      // Return cancelled only if
      // there are no active bookings.
      return matches[0];
    };


  // ==========================================================
  // CREATE BOOKING
  // ==========================================================

  const confirmBooking =
    async () => {

      // ------------------------------------------------------
      // Prevent duplicate button presses
      // ------------------------------------------------------

      if (bookingLoading) {
        return;
      }


      // ------------------------------------------------------
      // Counselor validation
      // ------------------------------------------------------

      if (
        !selectedCounselor?._id
      ) {

        Alert.alert(
          "Error",
          "Counselor information is missing."
        );

        return;
      }


      // ------------------------------------------------------
      // Date validation
      // ------------------------------------------------------

      if (!selectedDate) {

        Alert.alert(
          "Select Date",
          "Please select a session date."
        );

        return;
      }


      // ------------------------------------------------------
      // Time validation
      // ------------------------------------------------------

      if (!selectedTime) {

        Alert.alert(
          "Select Time",
          "Please select a session time."
        );

        return;
      }


      // ------------------------------------------------------
      // Make sure selected slot
      // wasn't already loaded as booked.
      // ------------------------------------------------------

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


        // ----------------------------------------------------
        // GET PATIENT ID
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // CHECK USER DOES NOT ALREADY
        // HAVE ACTIVE BOOKING WITH THIS COUNSELOR
        // ----------------------------------------------------

        const existingBooking =
          getExistingBooking(
            selectedCounselor._id
          );


        if (
          existingBooking &&
          (
            existingBooking.status ===
              "pending" ||
            existingBooking.status ===
              "confirmed"
          )
        ) {

          Alert.alert(
            "Existing Booking",
            `You already have a ${existingBooking.status} session with this counselor on ${existingBooking.sessionDate} at ${existingBooking.sessionTime}.`
          );

          return;
        }


        // ----------------------------------------------------
        // REQUEST BODY
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // POST BOOKING
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // READ RESPONSE AS TEXT FIRST
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // SERVER ERROR
        // ----------------------------------------------------

        if (!response.ok) {

          console.log(
            "BOOKING FAILED:",
            data
          );


          if (
            response.status ===
            409
          ) {

            // Refresh booked slots
            // because somebody may
            // have booked it meanwhile.

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


        // ----------------------------------------------------
        // VALIDATE RETURNED BOOKING
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // SUCCESS
        // ----------------------------------------------------

        console.log(
          "BOOKING CREATED SUCCESSFULLY:"
        );

        console.log(
          data.booking
        );


        // ----------------------------------------------------
        // Add immediately to local state
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Close modal
        // ----------------------------------------------------

        setBookingVisible(
          false
        );

        setSelectedDate("");

        setSelectedTime("");

        setBookedSlots([]);


        // ----------------------------------------------------
        // Reload from MongoDB
        // ----------------------------------------------------

        await fetchPatientBookings();


        // ----------------------------------------------------
        // SUCCESS MESSAGE
        // ----------------------------------------------------

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


  // ==========================================================
  // REFRESH
  // ==========================================================

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


  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

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


  // ==========================================================
  // COMMUNICATION
  // ==========================================================

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
          "Chat Unavailable",
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

      Alert.alert(
        `${type} Session`,
        `${type} communication will be available for your confirmed counseling session.`
      );
    };


  // ==========================================================
  // FIND BOOKING FOR COUNSELOR
  // ==========================================================

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


      // ------------------------------------------------------
      // Prefer pending/confirmed
      // ------------------------------------------------------

      const activeBooking =
        counselorBookings.find(
          (booking) =>
            booking.status ===
              "pending" ||
            booking.status ===
              "confirmed"
        );


      if (activeBooking) {
        return activeBooking;
      }


      return counselorBookings[0];
    };


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredCounselors =
    counselors.filter(
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


  // ==========================================================
  // LOADING SCREEN
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
          Loading counselors...
        </Text>

      </View>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <View
      style={{
        flex: 1,
      }}
    >

      {/* ======================================================
          COUNSELOR PROFILE MODAL
      ====================================================== */}

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


      {/* ======================================================
          BOOKING MODAL
      ====================================================== */}

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


      {/* ======================================================
          MAIN SCROLL
      ====================================================== */}

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

        {/* ====================================================
            HEADER
        ==================================================== */}

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


        {/* ====================================================
            FILTERS
        ==================================================== */}

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


        {/* ====================================================
            RESULT COUNT
        ==================================================== */}

        <Text
          style={
            styles.resultCount
          }
        >

          {filteredCounselors.length}{" "}

          counselor
          {filteredCounselors.length !==
          1
            ? "s"
            : ""}{" "}

          found

        </Text>


        {/* ====================================================
            COUNSELOR LIST
        ==================================================== */}

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


        {/* ====================================================
            EMERGENCY
        ==================================================== */}

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


      {/* ======================================================
          AI COUNSELLING BUTTON
      ====================================================== */}

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