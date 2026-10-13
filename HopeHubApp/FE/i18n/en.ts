export const en = {

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
  questionnaire: {
  sessionExpired: "Session expired.",
  userIdMissing: "User ID missing",
  failed: "Failed",
  skipAll: "Skip all",
  progress: (current: number, total: number) => `Question ${current} of ${total}`,
  explain: "Explain the Problem",
  hideExplain: "Hide Explanation",
  yourAnswer: "Your answer",
  defaultPlaceholder: "Type your answer or tap the mic...",
  listening: "Listening... speak now",
  back: "Back",
  next: "Next",
  finish: "Finish",
  allSet: "All set!",
  answered: (count: number, total: number) => `You answered ${count} of ${total} questions.`,
  startJourney: "Let's Start Journey..!",
  review: "Review my answers",

  sections: {
    lifestyle: "Lifestyle & Habits",
    mental: "Mental Wellbeing",
    social: "Social Energy",
    personality: "Personality Traits",
  },


  options: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],

  questions: [
    "How often do you consume alcohol?",
    "How often do you use cannabis?",
    "How often do you use cocaine?",
    "How often do you use heroin?",
    "How often do you use methamphetamine?",
    "How often do you use nicotine (smoking/vaping)?",
    "How often do you feel anxious or stressed?",
    "Do you frequently feel emotionally unstable or worried?",
    "Do you enjoy being in social gatherings frequently?",
    "Do you feel energized when interacting with others?",
    "Do you enjoy trying new and unusual experiences?",
    "Are you open to taking risks or exploring new ideas?",
    "Do you consider yourself cooperative and empathetic?",
    "Do you often avoid conflicts with others?",
    "Do you plan your tasks and follow routines?",
    "Do you consider yourself disciplined and responsible?",
    "Do you often act without thinking about consequences?",
    "Do you make quick decisions without planning?",
    "Do you enjoy thrilling or risky activities?",
    "Do you seek excitement even if it involves danger?",
  ],


  details: {
    6: {
      explanation: "Stress or anxiety can include overthinking, constant worrying, panic feelings, racing thoughts, headaches, or difficulty sleeping.",
      example: "Example: I overthink at night and feel nervous before exams.",
    },
    7: {
      explanation: "Emotional instability may include mood swings, becoming upset easily, or feeling emotionally overwhelmed.",
      example: "Example: My emotions change quickly and small problems affect me deeply.",
    },
    8: {
      explanation: "This question checks whether you enjoy spending time with people or attending social gatherings.",
      example: "Example: I enjoy spending time with friends and group activities.",
    },
    9: {
      explanation: "Feeling energized around people means social interaction improves your mood and motivation.",
      example: "Example: Talking with people makes me feel more active and motivated.",
    },
    10: {
      explanation: "Trying new experiences includes exploring new hobbies, activities, or environments.",
      example: "Example: I enjoy learning new things and trying different experiences.",
    },
    11: {
      explanation: "Risk-taking may include making bold decisions or enjoying uncertain challenges.",
      example: "Example: I like trying challenging things even if success is uncertain.",
    },
    12: {
      explanation: "Being cooperative and empathetic means understanding and supporting other people emotionally.",
      example: "Example: I try to understand others and help when they are struggling.",
    },
    13: {
      explanation: "Avoiding conflict means trying to prevent arguments or uncomfortable situations.",
      example: "Example: I prefer peaceful discussions instead of arguments.",
    },
    14: {
      explanation: "Planning routines means organizing tasks, managing schedules, and preparing ahead.",
      example: "Example: I make plans and schedules before starting work.",
    },
    15: {
      explanation: "Discipline and responsibility include finishing tasks on time and staying focused on goals.",
      example: "Example: I complete my responsibilities seriously and on time.",
    },
    16: {
      explanation: "Acting without thinking may include impulsive decisions or emotional reactions.",
      example: "Example: Sometimes I react quickly and regret it later.",
    },
    17: {
      explanation: "Quick decisions without planning involve acting fast without fully considering consequences.",
      example: "Example: I often decide things immediately without much thought.",
    },
    18: {
      explanation: "Thrill-seeking behavior includes enjoying adventurous or risky activities.",
      example: "Example: I enjoy exciting and adventurous experiences.",
    },
    19: {
      explanation: "Seeking excitement despite danger means enjoying risky situations for excitement.",
      example: "Example: I sometimes enjoy risky activities because they feel exciting.",
    },
  } as Record<number, { explanation: string; example: string }>,
},
home: {
  greetingMorning: "Good morning 👋",
  greetingAfternoon: "Good afternoon ☀️",
  greetingEvening: "Good evening 🌙",
  welcomeLoading: "Welcome...",
  welcome: (name: string) => `Welcome ,${name}`,
  defaultUser: "User",
  sobrietyStreak: "Sobriety Streak",
  streakDays: (n: number) => `${n} Days!`,
  riskLevelLabel: "RISK LEVEL",
  levelNotSet: "Not set",
  levelNoData: "Level not set yet. contact counselor to see your risk analysis.",
  setByCounselor: "Set by your counselor",
  inviteFamily: "Invite Family Member",
  inviteMail: "Invite mail",
  send: "Send",
  role: "Role",
  rolePlaceholder: "e.g. mother",
  email: "Email",
  emailPlaceholder: "e.g. kamala@gmail.com",
  phone: "Phone",
  phonePlaceholder: "e.g. 07x xxxxxxx",
  cancel: "Cancel",
  sending: "Sending...",
  sendInvite: "Send invite",
  missingNameTitle: "Missing name",
  missingNameMsg: "Please enter the family member's role.",
  invalidEmailTitle: "Invalid email",
  invalidEmailMsg: "Please enter a valid email address.",
  missingPhoneTitle: "Missing contact number",
  missingPhoneMsg: "Please enter a contact number.",
  inviteSentTitle: "Invite sent",
  inviteSentMsg: (email: string) => `An invite was sent to ${email}.`,
  inviteFailed: "Could not send invite. Try again.",
  somethingWrong: "Something went wrong. Please try again.",
  dailyTasks: "Daily Tasks",
  complete: "Complete",
  noTasks: "No tasks assigned for today",
  familyReview: (status: string) => `Family review: ${status}`,
  taskUpdateFailed: "Failed to update task",
  taskBreakdown: "Task Status Breakdown",
  noTaskData: "No task data yet",

  // Risk levels, in the same order as LEVEL_ORDER in the screen
  levels: [
    { label: "Level 1 - No Risk", description: "No signs of risk detected. Keep up your daily habits." },
    { label: "Level 2 - Very Low", description: "You're doing well. Keep up with your daily tasks and check-ins." },
    { label: "Level 3 - Low", description: "Low risk overall. Stay mindful of your habits and triggers." },
    { label: "Level 4 - Moderate", description: "Stay alert to your triggers. Do not forget to contact your counselor every week." },
    { label: "Level 5 - High", description: "Elevated risk. Reach out to your counselor and stay close to your support system." },
    { label: "Level 6 - Very High", description: "Stay connect with your counselor & connect your family member to help." },
    { label: "Level 7 - Severe Addiction", description: "This needs immediate attention. Please contact your counselor right away." },
  ],

  statusLabels: {
    completed: "Completed",
    confirmed: "Confirmed by Family",
    pending: "Pending",
    rejected: "Rejected",
    expired: "Expired",
  },
},
profile: {
  title: "My Profile",
  subtitle: "Manage your profile information",
  firstName: "First Name",
  lastName: "Last Name",
  firstNamePlaceholder: "Enter first name",
  lastNamePlaceholder: "Enter last name",
  saveProfile: "Save Profile",
  logout: "Log out",

  loading: "Loading Profile...",
  permissionDenied: "Permission denied!",
  error: "Error",
  success: "Success",
  saveFailed: "Save failed",
  profileSaved: "Profile saved!",
  networkError: "Network error",
},
lifeBuild: {
  checking: "Checking your assessment...",
  buildYourFuture: "BUILD YOUR FUTURE",
  title: "LifeBuild",
  headerDescription:
    "Every step you take brings you closer to a stronger, healthier and brighter future.",
 
  yourScoreTitle: "Your Recovery Safety Score",
  points: (obtained: number, max: number) => `${obtained} / ${max} points`,
  scoreGood: "Great progress! You're ready to explore career paths that suit you.",
  scoreLow:
    "Your score is below 50%. Keep building your recovery support, then retake the assessment to unlock career recommendations.",
  findJob: "Let's Find Job",
  retake: "Retake Assessment",
  startTitle: "Start Your Assessment",
  startDescription:
    "Complete your personal information and Recovery Safety Assessment to understand your current recovery safety level.",
  startButton: "Start Assessment",
 
  steps: [
    {
      title: "Complete Recovery Assessment",
      description: "Answer 20 Recovery Safety Assessment questions and submit.",
    },
    {
      title: "See Your Safety Score",
      description: "Your score is calculated from your 20 answers and shown right away.",
    },
    {
      title: "Tell Us About Yourself",
      description:
        "Answer 16 questions about your background, skills, interests and recovery support needs.",
    },
    {
      title: "Discover Your Career Path",
      description:
        "If your Recovery Safety Score is 50% or above, suitable career paths can be recommended.",
    },
  ],
 
  profileSectionLabel: "PERSONAL & CAREER INFORMATION",
  profileTitle: "Tell Us About Yourself",
  profileSubtitle:
    "This information helps us understand your background, skills and interests for future career recommendations.",
  progress: (current: number, total: number) => `Question ${current} of ${total}`,
  enterAnswer: "Enter your answer",
  selectUpTo: (n: number) => `Select up to ${n} options`,
  rateSkills: "Rate each skill from 1 to 5.",
 
  profileQuestions: [
    { section: "Demographic Information", question: "What is your age?" },
    { section: "Demographic Information", question: "What is your gender?" },
    { section: "Demographic Information", question: "What is your education level?" },
    {
      section: "Skills, Interests & Reintegration",
      question: "Which activities do you enjoy most? Select up to three.",
    },
  ],
 
  profileOptions: {
    gender: ["Male", "Female", "Prefer not to say"],
    education: ["No formal education", "Primary", "Secondary", "Diploma", "Degree or higher"],
    jobInterest: [
      "Fixing machines or tools",
      "Working with computers",
      "Drawing or designing",
      "Helping people",
      "Teaching or mentoring",
      "Managing projects",
      "Farming or gardening",
      "Cooking",
      "Selling products",
      "Organizing events",
      "Driving",
      "Working outdoors",
    ],
  } as Record<string, string[]>,
 
  skills: [
    "Communication",
    "Teamwork",
    "Problem Solving",
    "Time Management",
    "Computer Skills",
    "Leadership",
    "Creativity",
    "Decision Making",
  ],
 
  assessmentSectionLabel: "RECOVERY SAFETY ASSESSMENT",
  assessmentTitle: "Recovery Assessment",
  assessmentSubtitle: "Please select the answer that best describes how you currently feel.",
  sectionPrefix: (name: string) => `SECTION: ${name}`,
  recoveryQuestionLabel: (n: number) => `RECOVERY QUESTION ${n}`,
 
  recoverySections: [
    "Recovery Self-Efficacy",
    "Emotional Stability",
    "Lifestyle Stability",
    "Social Support",
    "Career Readiness",
  ],
 
  answerOptions: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
 
  recoveryQuestions: [
    "I am confident that I can resist using drugs even when I feel stressed.",
    "I can control my urges without using drugs.",
    "I believe I can continue my recovery successfully.",
    "I can refuse drugs even if someone offers them to me.",
    "I can manage my emotions in healthy ways.",
    "I usually remain calm when facing problems.",
    "I feel hopeful about my future.",
    "I believe I have control over my life.",
    "I maintain a regular daily routine.",
    "I get enough sleep most nights.",
    "I avoid places or people that encourage drug use.",
    "I spend my free time in productive activities.",
    "My family supports my recovery.",
    "I have friends who encourage me to stay drug-free.",
    "I know where to seek help if I need support.",
    "I have someone I trust to discuss my problems.",
    "I believe I can perform well in a job.",
    "I can work responsibly with others.",
    "I am willing to attend vocational training.",
    "I believe having a career will help me maintain recovery.",
  ],
 
  back: "Back",
  next: "Next",
  saving: "Saving...",
  findJobs: "Find Jobs",
  submit: "Submit",
  maxSelectionTitle: "Maximum Selection",
  maxSelectionMsg: (n: number) => `You can select up to ${n} options.`,
  answerRequiredTitle: "Answer Required",
  answerRequiredMsg: "Please provide an answer before continuing.",
  selectAnswerMsg: "Please select an answer before continuing.",
  couldNotSaveTitle: "Could Not Save",
  couldNotSaveMsg: "Could not save your answers. Please try again.",
  notLoggedIn: "User not logged in",
  failedSaveAssessment: "Failed to save assessment",
  failedSaveProfile: "Failed to save profile",
},
jobPage: {
  headerSmall: "YOUR ASSESSMENT RESULT",
  title: "LifeBuild",
  headerDescription:
    "Here is your current Recovery Safety Score and recommended next steps.",
 
  scoreHeader: "Recovery Safety Score",
  safetyScoreLabel: "Safety Score",

  lowRiskLevel: "Low Risk",
  lowRiskDesc:
    "You currently show a stronger recovery safety level. You can explore suitable career paths.",
  moderateLevel: "Moderate Recovery Score",
  moderateDesc:
    "You have reached the minimum recovery safety level to explore suitable career paths.",
  needsSupportLevel: "Needs More Recovery Support",
  needsSupportDesc:
    "Your current recovery safety score is below 50%. Focus on your recovery activities and support plan.",
 
  careerHeader: "Recommended Career Paths",
  careerDesc:
    "Based on your recovery safety score, skills, interests and background, these career paths may be suitable for your current recovery journey.",
  noJobs: "No job opportunities are available right now. Please check again later.",
  failedLoadJobs: "Failed to load jobs",
 

  focusTitle: "Focus on Your Recovery",
  focusDesc:
    "Your Recovery Safety Score is currently below 50%. Continue focusing on your recovery and support activities. Career recommendations will become available when your score reaches 50% or above.",
 
  restart: "Take Assessment Again",

  aboutJob: "About this job",
  goodFit: "Good fit for",
},
};

export type Translations = typeof en;