// English is the source of truth. si.ts is typed against this file,
// so TypeScript errors if a key is missing or misspelled in Sinhala.

export const en = {
  // Shared across many screens
  common: {
    error: "Error",
    success: "Success",
    networkError: "Network error",
    user: "User",
    counselor: "Counselor",
    family: "Family",
    email: "Email address",
    password: "Password",
    login: "Login",
  },

  login: {
    welcome: "Welcome back to",
    userLogin: "User Login",
    counselorLogin: "Counselor Login",
    familyLogin: "Family Member Login",
    noAccount: "Don't have an account?",
    createNow: "Create now",
    enterCredentials: "Please enter email and password",
    loginFailed: "Login failed",
  },

  createAccount: {
    welcome: "Welcome to",
    accountDetails: "Account Details",
    counselorDetails: "Counselor Details",
    firstName: "First name",
    lastName: "Last name",
    mobile: "Mobile number",
    professionalInfo: "Professional Information",
    titlePlaceholder: "Title e.g. Clinical Psychologist",
    specialtyPlaceholder: "Specialty e.g. Addiction Recovery",
    experiencePlaceholder: "Experience e.g. 5 years experience",
    availabilityPlaceholder: "Availability",
    confirmPassword: "Confirm password",
    createAccount: "Create Account",
    createCounselor: "Create Counselor Profile",
    haveAccount: "Already have an account?",
    fillBasic: "Please fill all basic fields",
    passwordMismatch: "Passwords do not match",
    passwordShort: "Password must be at least 6 characters",
    fillCounselor: "Please fill all counselor details",
    counselorCreated: "Account created successfully. Please login.",
    userCreated: "User account created",
    registrationFailed: "Registration failed",
  },
};

export type Translations = typeof en;