import {

  Text,

  View,

  TextInput,

  TouchableOpacity,

  Alert,

  ScrollView,

  Platform,
  ActivityIndicator,

} from "react-native";

import { useRef, useState } from "react";

import { router } from "expo-router";

import { Ionicons } from "@expo/vector-icons";

import { ngrokFetch } from "@/utill/ngrokFetch";

import LottieView from "lottie-react-native";

import { useLanguage } from "@/i18n/LanguageContext";

import LanguageToggle from "@/components/LanguageToggle";

import {

  accountCreateStyles as styles,

} from "./createAccountStyles";

import { Image } from "react-native";

import * as ImagePicker from "expo-image-picker";

const BASE_URL =

  process.env.EXPO_PUBLIC_BASE_URL;

// UI language is independent of the stable specialty values submitted to the API.
const accountCopy = {
  "en": {
    "common": {
      "error": "Error",
      "success": "Success",
      "user": "User",
      "counselor": "Counselor",
      "email": "Email",
      "password": "Password",
      "login": "Login",
      "networkError": "Could not connect to the server. Please try again."
    },
    "createAccount": {
      "welcome": "Start your journey with",
      "counselorDetails": "Create a counselor account",
      "accountDetails": "Create your account",
      "firstName": "First name",
      "lastName": "Last name",
      "mobile": "Mobile number",
      "professionalInfo": "Counselor profile details",
      "titlePlaceholder": "Professional title",
      "specialtyPlaceholder": "Specialty / support area",
      "experiencePlaceholder": "Experience (e.g. 3 years)",
      "availabilityPlaceholder": "Availability note (optional)",
      "confirmPassword": "Confirm password",
      "createCounselor": "Create counselor account",
      "createAccount": "Create account",
      "haveAccount": "Already have an account?",
      "fillBasic": "Please fill in your first name, last name, email and both password fields.",
      "passwordMismatch": "The passwords do not match.",
      "passwordShort": "Use a password with at least 6 characters.",
      "fillCounselor": "Please enter your mobile number, title, specialty and experience.",
      "registrationFailed": "Account creation failed. Please check your details and try again.",
      "userCreated": "Your account has been created successfully."
    },
    "photoPermission": "Please allow photo library access to select a counselor image.",
    "photoError": "Unable to select an image. Please try again.",
    "changePhoto": "Change counselor image",
    "selectPhoto": "Select counselor image",
    "optionalPhoto": "Select counselor image (optional)",
    "selectedPhoto": "Selected counselor image",
    "accountCreated": "Account created successfully",
    "approvalPending": "Your counselor account has been created successfully. Please wait for HopeHub System approval before logging in.",
    "ok": "OK",
    "specialtyChoices": "Choose a support area, or type your own",
    "specialtyHelp": "These are self-described support areas used for simple suggestions. Selecting one does not verify qualifications.",
    "approvalHelp": "Your profile will appear in recommendations only after HopeHub System approval.",
    "invalidEmail": "Please enter a valid email address.",
    "serverError": "The server returned an invalid response. Please try again.",
    "missingServer": "The server address is not configured. Please contact the app administrator.",
    "showPassword": "Show password",
    "hidePassword": "Hide password",
    "counselingLanguages": "Counseling languages",
    "counselingLanguagesHelp": "Choose the languages you can conduct counseling sessions in. You can select one or both.",
    "selectCounselingLanguages": "Please select Sinhala, English, or both.",
    "sinhala": "Sinhala",
    "english": "English"
  },
  "si": {
    "common": {
      "error": "දෝෂයකි",
      "success": "සාර්ථකයි",
      "user": "පරිශීලක",
      "counselor": "උපදේශක",
      "email": "විද්‍යුත් තැපෑල",
      "password": "මුරපදය",
      "login": "පිවිසෙන්න",
      "networkError": "සේවාදායකයට සම්බන්ධ විය නොහැක. කරුණාකර නැවත උත්සාහ කරන්න."
    },
    "createAccount": {
      "welcome": "ඔබේ ගමන අරඹන්න",
      "counselorDetails": "උපදේශක ගිණුමක් සාදන්න",
      "accountDetails": "ඔබේ ගිණුම සාදන්න",
      "firstName": "මුල් නම",
      "lastName": "වාසගම",
      "mobile": "ජංගම දුරකථන අංකය",
      "professionalInfo": "උපදේශක පැතිකඩ විස්තර",
      "titlePlaceholder": "වෘත්තීය පදවි නාමය",
      "specialtyPlaceholder": "විශේෂත්වය / සහාය ක්ෂේත්‍රය",
      "experiencePlaceholder": "පළපුරුද්ද (උදා: වසර 3)",
      "availabilityPlaceholder": "ලබා ගත හැකි වේලාව පිළිබඳ සටහන (අත්‍යවශ්‍ය නොවේ)",
      "confirmPassword": "මුරපදය තහවුරු කරන්න",
      "createCounselor": "උපදේශක ගිණුම සාදන්න",
      "createAccount": "ගිණුම සාදන්න",
      "haveAccount": "දැනටමත් ගිණුමක් තිබේද?",
      "fillBasic": "මුල් නම, වාසගම, විද්‍යුත් තැපෑල සහ මුරපද ක්ෂේත්‍ර දෙකම පුරවන්න.",
      "passwordMismatch": "මුරපද දෙක නොගැලපේ.",
      "passwordShort": "අවම වශයෙන් අක්ෂර 6ක් සහිත මුරපදයක් භාවිත කරන්න.",
      "fillCounselor": "ජංගම දුරකථන අංකය, පදවි නාමය, විශේෂත්වය සහ පළපුරුද්ද ඇතුළත් කරන්න.",
      "registrationFailed": "ගිණුම සෑදීම අසාර්ථකයි. තොරතුරු පරීක්ෂා කර නැවත උත්සාහ කරන්න.",
      "userCreated": "ඔබේ ගිණුම සාර්ථකව සාදන ලදී."
    },
    "photoPermission": "උපදේශක ඡායාරූපයක් තේරීමට ඡායාරූප ගබඩාවට ප්‍රවේශ වීමට අවසර දෙන්න.",
    "photoError": "ඡායාරූපය තේරීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    "changePhoto": "උපදේශක ඡායාරූපය වෙනස් කරන්න",
    "selectPhoto": "උපදේශක ඡායාරූපයක් තෝරන්න",
    "optionalPhoto": "උපදේශක ඡායාරූපයක් තෝරන්න (අත්‍යවශ්‍ය නොවේ)",
    "selectedPhoto": "තෝරාගත් උපදේශක ඡායාරූපය",
    "accountCreated": "ගිණුම සාර්ථකව සාදන ලදී",
    "approvalPending": "ඔබේ උපදේශක ගිණුම සාර්ථකව සාදන ලදී. පිවිසීමට පෙර HopeHub පද්ධතියේ අනුමැතිය ලැබෙන තෙක් රැඳී සිටින්න.",
    "ok": "හරි",
    "specialtyChoices": "සහාය ක්ෂේත්‍රයක් තෝරන්න, නැතහොත් ඔබම ඇතුළත් කරන්න",
    "specialtyHelp": "මෙම සහාය ක්ෂේත්‍ර ඔබ විසින් සඳහන් කරන තොරතුරු වන අතර සරල යෝජනා සඳහා භාවිත වේ. එකක් තේරීමෙන් සුදුසුකම් තහවුරු නොවේ.",
    "approvalHelp": "ඔබේ පැතිකඩ නිර්දේශවල දිස්වන්නේ HopeHub පද්ධතියේ අනුමැතිය ලැබුණු පසුව පමණි.",
    "invalidEmail": "වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.",
    "serverError": "සේවාදායකයෙන් වලංගු ප්‍රතිචාරයක් නොලැබුණි. නැවත උත්සාහ කරන්න.",
    "missingServer": "සේවාදායක ලිපිනය සකසා නොමැත. යෙදුමේ පරිපාලක අමතන්න.",
    "showPassword": "මුරපදය පෙන්වන්න",
    "hidePassword": "මුරපදය සඟවන්න",
    "counselingLanguages": "උපදේශන සැසි පවත්වන භාෂා",
    "counselingLanguagesHelp": "ඔබට උපදේශන සැසි පැවැත්විය හැකි භාෂා තෝරන්න. එක් භාෂාවක් හෝ භාෂා දෙකම තෝරාගත හැක.",
    "selectCounselingLanguages": "සිංහල, ඉංග්‍රීසි හෝ භාෂා දෙකම තෝරන්න.",
    "sinhala": "සිංහල",
    "english": "ඉංග්‍රීසි"
  }
};
const specialtyOptions = [
  {
    "value": "Addiction recovery",
    "en": "Addiction recovery",
    "si": "ඇබ්බැහිවීමෙන් සුවය ලැබීම"
  },
  {
    "value": "Alcohol and substance recovery",
    "en": "Alcohol and substance recovery",
    "si": "මත්පැන් සහ මත්ද්‍රව්‍ය භාවිතයෙන් සුවය ලැබීම"
  },
  {
    "value": "Relapse prevention",
    "en": "Relapse prevention",
    "si": "නැවත ඇබ්බැහි වීම වැළැක්වීම"
  },
  {
    "value": "Stress and anxiety",
    "en": "Stress and anxiety",
    "si": "ආතතිය සහ කාංසාව"
  },
  {
    "value": "General counseling",
    "en": "General counseling",
    "si": "සාමාන්‍ය උපදේශනය"
  }
];

export default function CreateAccount() {

  const {

    language,

  } = useLanguage();
  const t = language === "si" ? accountCopy.si : accountCopy.en;
  const submitting = useRef(false);
  const [counselingLanguages, setCounselingLanguages] = useState<Array<"en" | "si">>([]);
  const toggleCounselingLanguage = (code: "en" | "si") => {
    setCounselingLanguages(current => current.includes(code)
      ? current.filter(item => item !== code) : [...current, code]);
  };

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

  const [counselorImage, setCounselorImage] =
    useState<ImagePicker.ImagePickerAsset | null>(null);

  const pickCounselorImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t.common.error, t.photoPermission);
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setCounselorImage(result.assets[0]);
      }
    } catch (error) {
      console.log("Counselor image picker error:", error);
      Alert.alert(t.common.error, t.photoError);
    }
  };

  // ==========================================================

  // CREATE ACCOUNT

  // ==========================================================

  const handleCreateAccount = async () => {

    if (submitting.current) {

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

    if (!BASE_URL?.trim()) {
      Alert.alert(t.common.error, t.missingServer);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t.common.error, t.invalidEmail);
      return;
    }
    submitting.current = true;
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

        if (counselingLanguages.length === 0) {
          Alert.alert(t.common.error, t.selectCounselingLanguages);
          return;
        }
        const formData = new FormData();
        formData.append("counselingLanguages", JSON.stringify(counselingLanguages));
        formData.append("firstName", first.trim());
        formData.append("lastName", last.trim());
        formData.append("email", email.trim().toLowerCase());
        formData.append("password", password);
        formData.append("mobile", mobile.trim());
        formData.append("title", title.trim());
        formData.append("specialty", specialty.trim());
        formData.append("experience", experience.trim());
        formData.append("availability", availability.trim());

        if (counselorImage) {
          const name = counselorImage.fileName ||
            counselorImage.uri.split("/").pop()?.split("?")[0] ||
            "counselor-image.jpg";
          const extension = name.split(".").pop()?.toLowerCase();
          const type = counselorImage.mimeType ||
            (extension === "png" ? "image/png" :
              extension === "webp" ? "image/webp" :
              extension === "heic" ? "image/heic" :
              extension === "heif" ? "image/heif" : "image/jpeg");

          if (Platform.OS === "web") {
            const file = counselorImage.file ||
              await (await fetch(counselorImage.uri)).blob();
            formData.append("image", file, name);
          } else {
            // React Native accepts a URI-backed file descriptor for uploads.
            formData.append("image", {
              uri: counselorImage.uri,
              name,
              type,
            } as unknown as Blob);
          }
        }

        // Fetch supplies the multipart Content-Type and boundary.
        const response = await ngrokFetch(
          `${BASE_URL}/api/counselors/register`,
          {
            method: "POST",
            body: formData,
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

          Alert.alert(t.common.error, t.serverError);
          return;

        }

        if (!response.ok) {

          Alert.alert(

            t.common.error,

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

          t.accountCreated,

          t.approvalPending,

          [

            {

              text: t.ok,

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

        Alert.alert(t.common.error, t.serverError);
        return;

      }

      if (!response.ok) {

        Alert.alert(

          t.common.error,

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

      submitting.current = false;
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

            <View style={styles.languageSection}>
              <Text style={styles.languageTitle}>{t.counselingLanguages}</Text>
              <Text style={styles.languageHelp}>{t.counselingLanguagesHelp}</Text>
              <View style={styles.languageOptions}>
                {(["si", "en"] as const).map(code => {
                  const selected = counselingLanguages.includes(code);
                  return (
                    <TouchableOpacity key={code} disabled={loading}
                      accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: loading }}
                      onPress={() => toggleCounselingLanguage(code)}
                      style={[styles.languageOption, selected && styles.languageOptionSelected, loading && styles.disabled]}>
                      <Ionicons name={selected ? "checkbox" : "square-outline"} size={24} color="#247E7C" />
                      <Text style={[styles.languageOptionText, selected && styles.languageOptionTextSelected]}>{code === "si" ? t.sinhala : t.english}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <Text style={styles.approvalHelp}>{t.approvalHelp}</Text>
            <View style={styles.photoSection}>
              <TouchableOpacity
                onPress={pickCounselorImage}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={counselorImage ? t.changePhoto : t.selectPhoto}
                style={[styles.photoPicker, loading && styles.disabled]}
              >
                {counselorImage ? (
                  <Image
                    source={{ uri: counselorImage.uri }}
                    style={styles.photoPreview}
                    resizeMode="cover"
                    accessibilityLabel={t.selectedPhoto}
                  />
                ) : (
                  <Ionicons name="camera-outline" size={48} color="#7A9A9A" />
                )}
                <Text style={styles.photoLabel}>
                  {counselorImage ? t.changePhoto : t.optionalPhoto}
                </Text>
              </TouchableOpacity>
            </View>

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

            <View style={styles.specialtySection}>
              <Text style={styles.sectionLabel}>{t.specialtyChoices}</Text>
              <View style={styles.specialtyOptions}>
                {specialtyOptions.map((option) => {
                  const selected = specialty === option.value;
                  return (
                    <TouchableOpacity key={option.value} disabled={loading}
                      accessibilityRole="button" accessibilityState={{ selected, disabled: loading }}
                      onPress={() => setSpecialty(option.value)}
                      style={[styles.specialtyOption, selected && styles.specialtyOptionSelected, loading && styles.disabled]}>
                      <Text style={styles.specialtyOptionText}>{language === "si" ? option.si : option.en}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text style={styles.specialtyHelp}>{t.specialtyHelp}</Text>
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

                value={language === "si" ? (specialtyOptions.find(option => option.value === specialty)?.si || specialty) : specialty}

                onChangeText={value => setSpecialty(specialtyOptions.find(option => option.si === value)?.value || value)}

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

            accessibilityRole="button" accessibilityLabel={showpassword ? t.hidePassword : t.showPassword}
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

            accessibilityRole="button" accessibilityLabel={showconfpassword ? t.hidePassword : t.showPassword}
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
