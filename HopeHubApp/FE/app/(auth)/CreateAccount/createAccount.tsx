import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useState } from "react";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { ngrokFetch } from "@/utill/ngrokFetch";

import LottieView from "lottie-react-native";

import { useLanguage } from "@/i18n/LanguageContext";

import LanguageToggle from "@/components/LanguageToggle";

import {
  accountCreateStyles as styles,
} from "./createAccountStyles";


const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL;


export default function CreateAccount() {

  const {
    t,
    language,
  } = useLanguage();


  const [
    logrole,
    setLogrole,
  ] = useState<
    "user" | "counselor"
  >("user");


  const [
    first,
    setFirst,
  ] = useState("");


  const [
    last,
    setLast,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    mobile,
    setMobile,
  ] = useState("");


  const [
    title,
    setTitle,
  ] = useState("");


  const [
    specialty,
    setSpecialty,
  ] = useState("");


  const [
    experience,
    setExperience,
  ] = useState("");


  const [
    availability,
    setAvailability,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    confpassword,
    setconfPassword,
  ] = useState("");


  const [
    showpassword,
    setshowpassword,
  ] = useState(false);


  const [
    showconfpassword,
    setconfShowpassword,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================================
  // CREATE ACCOUNT
  // ==========================================================

  const handleCreateAccount = async () => {

    if (loading) {
      return;
    }


    if (
      !first.trim() ||
      !last.trim() ||
      !email.trim() ||
      !password ||
      !confpassword
    ) {

      Alert.alert(
        t.common.error,
        t.createAccount.fillBasic
      );

      return;
    }


    if (
      password !==
      confpassword
    ) {

      Alert.alert(
        t.common.error,
        t.createAccount.passwordMismatch
      );

      return;
    }


    if (
      password.length < 6
    ) {

      Alert.alert(
        t.common.error,
        t.createAccount.passwordShort
      );

      return;
    }


    try {

      setLoading(true);


      // ======================================================
      // COUNSELOR REGISTRATION
      // ======================================================

      if (
        logrole ===
        "counselor"
      ) {

        if (
          !mobile.trim() ||
          !title.trim() ||
          !specialty.trim() ||
          !experience.trim()
        ) {

          Alert.alert(
            t.common.error,
            t.createAccount.fillCounselor
          );

          return;
        }


        const response =
          await ngrokFetch(
            `${BASE_URL}/api/counselors/register`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                firstName:
                  first.trim(),

                lastName:
                  last.trim(),

                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,

                mobile:
                  mobile.trim(),

                title:
                  title.trim(),

                specialty:
                  specialty.trim(),

                experience:
                  experience.trim(),

                availability:
                  availability.trim(),
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


        if (!response.ok) {

          Alert.alert(
            t.common.error,

            data?.message ||
              t.createAccount.registrationFailed
          );

          return;
        }


        // ====================================================
        // IMPORTANT:
        // Do NOT store token / counselor / role here.
        //
        // Counselor is NOT logged in.
        // Admin must approve first.
        // ====================================================

        Alert.alert(
          "Account Created Successfully",

          "Your counselor account has been created successfully. Please wait for HopeHub System approval before logging in.",

          [
            {
              text: "OK",

              onPress: () => {

                router.replace({
                  pathname:
                    "/(auth)/Login/login",

                  params: {
                    role:
                      "counselor",
                  },
                });

              },
            },
          ]
        );


        return;
      }


      // ======================================================
      // NORMAL USER REGISTRATION
      // ======================================================

      const response =
        await ngrokFetch(
          `${BASE_URL}/api/auth/register`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              firstName:
                first.trim(),

              lastName:
                last.trim(),

              email:
                email
                  .trim()
                  .toLowerCase(),

              password,

              mobile:
                mobile.trim(),

              role:
                "user",

              language,
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


      if (!response.ok) {

        Alert.alert(
          t.common.error,

          data?.message ||
            t.createAccount.registrationFailed
        );

        return;
      }


      Alert.alert(
        t.common.success,
        t.createAccount.userCreated
      );


      router.replace(
        "/(auth)/Login/login"
      );


    } catch (error) {

      console.log(
        "Create account error:",
        error
      );


      Alert.alert(
        t.common.error,
        t.common.networkError
      );


    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <ScrollView
      style={styles.page}

      showsVerticalScrollIndicator={
        false
      }
    >

      {/* HERO */}

      <View style={styles.hero}>

        <LanguageToggle />


        <LottieView
          source={require(
            "../../../assets/animations/medicine online.json"
          )}

          autoPlay

          loop

          style={
            styles.heroAnimation
          }
        />


        <View
          style={
            styles.heroContent
          }
        >

          <Text
            style={
              styles.smallTitle
            }
          >
            {
              t.createAccount
                .welcome
            }
          </Text>


          <Text
            style={
              styles.brand
            }
          >
            HopeHub
          </Text>

        </View>

      </View>


      {/* ROLE SWITCH */}

      <View
        style={
          styles.roleSwitch
        }
      >

        <TouchableOpacity

          style={[
            styles.roleBtn,

            logrole ===
              "user" &&
              styles.roleBtnActive,
          ]}

          onPress={() =>
            setLogrole(
              "user"
            )
          }
        >

          <Text

            style={[
              styles.roleText,

              logrole ===
                "user" &&
                styles.roleTextActive,
            ]}
          >

            {t.common.user}

          </Text>

        </TouchableOpacity>


        <TouchableOpacity

          style={[
            styles.roleBtn,

            logrole ===
              "counselor" &&
              styles.roleBtnActive,
          ]}

          onPress={() =>
            setLogrole(
              "counselor"
            )
          }
        >

          <Text

            style={[
              styles.roleText,

              logrole ===
                "counselor" &&
                styles.roleTextActive,
            ]}
          >

            {
              t.common
                .counselor
            }

          </Text>

        </TouchableOpacity>

      </View>


      {/* FORM */}

      <View
        style={
          styles.card
        }
      >

        <Text
          style={
            styles.cardTitle
          }
        >

          {
            logrole ===
            "counselor"
              ? t.createAccount
                  .counselorDetails
              : t.createAccount
                  .accountDetails
          }

        </Text>


        {/* NAME */}

        <View
          style={
            styles.row
          }
        >

          <View
            style={[
              styles.inputWrapper,
              {
                flex: 1,
              },
            ]}
          >

            <Ionicons
              name="person-outline"
              size={20}
              color="#7A9A9A"
            />


            <TextInput
              placeholder={
                t.createAccount
                  .firstName
              }

              value={
                first
              }

              onChangeText={
                setFirst
              }

              style={
                styles.input
              }
            />

          </View>


          <View
            style={[
              styles.inputWrapper,
              {
                flex: 1,
              },
            ]}
          >

            <Ionicons
              name="person-outline"
              size={20}
              color="#7A9A9A"
            />


            <TextInput
              placeholder={
                t.createAccount
                  .lastName
              }

              value={
                last
              }

              onChangeText={
                setLast
              }

              style={
                styles.input
              }
            />

          </View>

        </View>


        {/* EMAIL */}

        <View
          style={
            styles.inputWrapper
          }
        >

          <Ionicons
            name="mail-outline"
            size={20}
            color="#7A9A9A"
          />


          <TextInput
            placeholder={
              t.common.email
            }

            value={
              email
            }

            onChangeText={
              setEmail
            }

            autoCapitalize="none"

            keyboardType="email-address"

            style={
              styles.input
            }
          />

        </View>


        {/* MOBILE */}

        <View
          style={
            styles.inputWrapper
          }
        >

          <Ionicons
            name="call-outline"
            size={20}
            color="#7A9A9A"
          />


          <TextInput
            placeholder={
              t.createAccount
                .mobile
            }

            value={
              mobile
            }

            onChangeText={
              setMobile
            }

            keyboardType="phone-pad"

            style={
              styles.input
            }
          />

        </View>


        {/* COUNSELOR DETAILS */}

        {logrole ===
          "counselor" && (
          <>

            <View
              style={
                styles.divider
              }
            />


            <Text
              style={
                styles.sectionLabel
              }
            >

              {
                t.createAccount
                  .professionalInfo
              }

            </Text>


            <View
              style={
                styles.inputWrapper
              }
            >

              <Ionicons
                name="briefcase-outline"
                size={20}
                color="#7A9A9A"
              />


              <TextInput
                placeholder={
                  t.createAccount
                    .titlePlaceholder
                }

                value={
                  title
                }

                onChangeText={
                  setTitle
                }

                style={
                  styles.input
                }
              />

            </View>


            <View
              style={
                styles.inputWrapper
              }
            >

              <Ionicons
                name="heart-outline"
                size={20}
                color="#7A9A9A"
              />


              <TextInput
                placeholder={
                  t.createAccount
                    .specialtyPlaceholder
                }

                value={
                  specialty
                }

                onChangeText={
                  setSpecialty
                }

                style={
                  styles.input
                }
              />

            </View>


            <View
              style={
                styles.inputWrapper
              }
            >

              <Ionicons
                name="school-outline"
                size={20}
                color="#7A9A9A"
              />


              <TextInput
                placeholder={
                  t.createAccount
                    .experiencePlaceholder
                }

                value={
                  experience
                }

                onChangeText={
                  setExperience
                }

                style={
                  styles.input
                }
              />

            </View>


            <View
              style={
                styles.inputWrapper
              }
            >

              <Ionicons
                name="calendar-outline"
                size={20}
                color="#7A9A9A"
              />


              <TextInput
                placeholder={
                  t.createAccount
                    .availabilityPlaceholder
                }

                value={
                  availability
                }

                onChangeText={
                  setAvailability
                }

                style={
                  styles.input
                }
              />

            </View>

          </>
        )}


        <View
          style={
            styles.divider
          }
        />


        {/* PASSWORD */}

        <View
          style={
            styles.inputWrapper
          }
        >

          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#7A9A9A"
          />


          <TextInput
            placeholder={
              t.common.password
            }

            value={
              password
            }

            onChangeText={
              setPassword
            }

            secureTextEntry={
              !showpassword
            }

            style={
              styles.input
            }
          />


          <TouchableOpacity
            onPress={() =>
              setshowpassword(
                !showpassword
              )
            }
          >

            <Ionicons

              name={
                showpassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }

              size={20}

              color="#7A9A9A"
            />

          </TouchableOpacity>

        </View>


        {/* CONFIRM PASSWORD */}

        <View
          style={
            styles.inputWrapper
          }
        >

          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#7A9A9A"
          />


          <TextInput
            placeholder={
              t.createAccount
                .confirmPassword
            }

            value={
              confpassword
            }

            onChangeText={
              setconfPassword
            }

            secureTextEntry={
              !showconfpassword
            }

            style={
              styles.input
            }
          />


          <TouchableOpacity

            onPress={() =>
              setconfShowpassword(
                !showconfpassword
              )
            }
          >

            <Ionicons

              name={
                showconfpassword
                  ? "eye-off-outline"
                  : "eye-outline"
              }

              size={20}

              color="#7A9A9A"
            />

          </TouchableOpacity>

        </View>


        {/* CREATE ACCOUNT */}

        <TouchableOpacity

          style={[
            styles.button,

            loading && {
              opacity: 0.6,
            },
          ]}

          onPress={
            handleCreateAccount
          }

          disabled={
            loading
          }
        >

          {loading ? (

            <ActivityIndicator
              color="#fff"
            />

          ) : (

            <Text
              style={
                styles.buttonText
              }
            >

              {
                logrole ===
                "counselor"
                  ? t.createAccount
                      .createCounselor
                  : t.createAccount
                      .createAccount
              }

            </Text>

          )}

        </TouchableOpacity>


        <Text
          style={
            styles.bottomText
          }
        >

          {
            t.createAccount
              .haveAccount
          }{" "}


          <Text

            style={
              styles.loginText
            }

            onPress={() =>
              router.push(
                "/(auth)/Login/login"
              )
            }
          >

            {
              t.common.login
            }

          </Text>

        </Text>

      </View>

    </ScrollView>
  );
}