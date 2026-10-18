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
    progress: (current: number, total: number) => `Question ${current} of ${total}`,
    yourAnswer: "Your answer",
    otherDrugNameLabel: "Drug name (optional)",
    otherDrugNamePlaceholder: "Drug name: ...",
    listening: "Listening... speak now",
    back: "Back",
    next: "Next",
    finish: "Finish",
    allSet: "All set!",
    answered: (count: number, total: number) => `You answered ${count} of ${total} questions.`,
    startJourney: "Let's Start Journey..!",
    review: "Review my answers",

    sections: {
      substance: "Substance Use Frequency",
      severity: "Addiction Severity",
      behavioral: "Behavioral & Psychological Risk",
    },

    // Display labels only. The English values sent to the backend
    // live in the screen file (OPTION_SETS) and must stay in the same order.
    optionSets: {
      frequency: ["Never", "Rarely", "Sometimes", "Often", "Very Often"],
      occurrence: ["Never", "Once", "A few times", "Often", "Very often"],
      attempts: ["Never", "Once", "A few times", "Many times", "Very often"],
      coping: [
        "Talk to someone I trust",
        "Exercise or a hobby",
        "Use alcohol or drugs",
        "Avoid or ignore it",
        "Something else",
      ],
      change: ["Decreased", "No change", "Increased slightly", "Increased", "Increased a lot"],
    },

    questions: [
      // Section A - Substance use frequency
      "During the past 3 months, have you consumed alcohol?",
      "During the past 3 months, do you use cannabis?",
      "During the past 3 months, have you used cocaine?",
      "During the past 3 months, have you used heroin?",
      "During the past 3 months, have you used methamphetamine (Ice)?",
      "During the past 3 months, have you used nicotine products (e.g., cigarettes or vaping products)?",
      "During the past 3 months, have you used any other drug not listed above? If so, please write down its name and select option.",
      // Section B - Addiction severity indicators
      "During the past 3 months, has your alcohol or drug use caused any problems in your life (e.g., school, work, relationships, money, health, or responsibilities)?",
      "During the past 3 months, have you tried to reduce or completely stop using drugs?",
      "During the past 3 months, has a friend, family member, or anyone else expressed concern about your drug use?",
      "During the past 3 months, have you ever felt unwell, experienced body tremors, or experienced other discomfort when you reduced or stopped using drugs?",
      // Section C - Behavioral & psychological risk indicators
      "During the past 3 months, have you acted without thinking about the consequences?",
      "During the past 3 months, have you engaged in illegal or risky activities?",
      "During the past 3 months, when you have felt stressed or upset, what have you usually done?",
      "How has your drug use changed during the past 3 months?",
    ],
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
          "Answer 5 questions about your background, skills and interests.",
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
    skillHeader: "Skill",

    profileQuestions: [
      { section: "Demographic Information", question: "What is your age?" },
      { section: "Demographic Information", question: "What is your gender?" },
      { section: "Demographic Information", question: "What is your education level?" },
      {
        section: "Skills, Interests & Reintegration",
        question: "Which activities do you enjoy most? Select up to three.",
      },
      {
        section: "Skills, Interests & Reintegration",
        question: "Rate each of your skills from 1 to 5.",
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

  diary: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    formatDate: (weekday: string, day: number, month: string, year: number) =>
      `${weekday}, ${day} ${month} ${year}`,

    title: "My Diary",
    allEntries: "All Entries",
    emptyText: "No entries yet.\nTap + to write your first.",

    moodOverview: "Mood Overview",
    entriesTotal: (n: number) => `${n} ${n === 1 ? "entry" : "entries"} total`,
    good: "Good",
    bad: "Bad",
    goodPct: (p: number) => `${p}% good`,
    badPct: (p: number) => `${p}% bad`,

    goodDay: "Good day",
    toughDay: "Tough day",
    quickCheckInTag: "Quick check-in",

    newEntry: "New Entry",
    editEntry: "Edit Entry",
    writePlaceholder: "Write about your day…",
    discard: "Discard",
    saveEntry: "Save Entry",
    updateEntry: "Update Entry",

    chooseTitle: "How do you want to check in?",
    writeDiary: "Write a diary",
    writeDiarySub: "Describe your day in your own words",
    quickCheckIn: "Quick check-in",
    quickCheckInSub: "Answer 5 quick questions, no writing needed",

    yourEmotionToday: "Your emotion today",
    mainEmotionToday: "Your main emotion today",
    estimateNote: "This is an estimate based on your answers.",
    seeEmotion: "See my emotion",
    cancel: "Cancel",
    done: "Done",
    nudgeText: "Hey, try to write a diary. It will help much more on your journey.",

    deleteTitle: "Delete entry",
    deleteConfirm: "Are you sure you want to delete this entry?",
    delete: "Delete",

    loadFailed: "Failed to load diaries",
    saveFailed: "Failed to save entry",
    updateFailed: "Failed to update entry",
    deleteFailed: "Failed to delete entry",
    checkInSaveFailed: "Failed to save check-in",
    loginAgain: "Please log in again to save your check-in",

    emotions: {
      joy: "joy",
      love: "love",
      surprise: "surprise",
      sadness: "sadness",
      fear: "fear",
      anger: "anger",
      stress: "stress",
      anxiety: "anxiety",
    },

    quickContent: {
      prefix: "Quick check-in — ",
      feeling: "Feeling",
      sleep: "Sleep",
      craving: "Craving",
      stress: "Stress",
      trigger: "Trigger",
    },

    quiz: {
      feeling: {
        question: "How are you feeling today?",
        options: { good: "Good", okay: "Okay", not_good: "Not good" },
      },
      sleep: {
        question: "How well did you sleep last night?",
        options: { well: "Well", not_enough: "Not enough", barely: "Barely slept" },
        subs: { well: "7+ hours", not_enough: "5-7 hours", barely: "under 5 hours" },
      },
      craving: {
        question: "Did you experience a strong craving today?",
        options: { no: "No", little: "A little", strong: "Strong" },
      },
      stress: {
        question: "Did you experience a difficult or stressful situation today?",
        options: { no: "No", little: "A little", a_lot: "A lot" },
      },
      trigger: {
        question: "Were you exposed to a trigger today?",
        hint: "e.g. people, places or situations that remind you of substance use",
        options: { no: "No", yes: "Yes" },
      },
    },
  },
};

export type Translations = typeof en;