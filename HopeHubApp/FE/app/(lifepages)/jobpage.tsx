import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { jobPageStyles } from "./jobpagestyles";

type Career = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

const CAREER_PATHS: Career[] = [
  {
    id: 1,
    title: "Data Entry",
    description:
      "A structured career path that can help you develop computer and administrative skills.",
    icon: "laptop-outline",
  },
  {
    id: 2,
    title: "Office Assistant",
    description:
      "Support daily office activities and gradually build workplace confidence.",
    icon: "briefcase-outline",
  },
  {
    id: 3,
    title: "ICT / Computer Course",
    description:
      "Develop practical computer skills through suitable training or NVQ courses.",
    icon: "school-outline",
  },
];

type JobPageProps = {
  safetyScore: number;
  onRestart: () => void;
};

const getRiskLevel = (safetyScore: number) => {
  if (safetyScore >= 75) {
    return {
      level: "Low Risk",
      description:
        "You currently show a stronger recovery safety level. You can explore suitable career paths.",
      color: "#17a673",
      background: "#e9fbea",
      icon: "shield-checkmark",
    };
  }

  if (safetyScore >= 50) {
    return {
      level: "Moderate Recovery Safety",
      description:
        "You have reached the minimum recovery safety level to explore suitable career paths.",
      color: "#f09c00",
      background: "#fff7e6",
      icon: "shield-half",
    };
  }

  return {
    level: "Needs More Recovery Support",
    description:
      "Your current recovery safety score is below 50%. Focus on your recovery activities and support plan.",
    color: "#e0362e",
    background: "#fff0f0",
    icon: "shield-outline",
  };
};

export default function JobPage({ safetyScore, onRestart }: JobPageProps) {
  const riskInfo = getRiskLevel(safetyScore);
  const isEligibleForCareer = safetyScore >= 50;

  return (
    <ScrollView
      style={jobPageStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={jobPageStyles.header}>
        <View style={jobPageStyles.headerCircleLarge} />
        <View style={jobPageStyles.headerCircleSmall} />

        <View style={jobPageStyles.headerContent}>
          <Text style={jobPageStyles.headerSmallText}>
            YOUR ASSESSMENT RESULT
          </Text>
          <Text style={jobPageStyles.headerTitle}>LifeBuild</Text>
          <Text style={jobPageStyles.headerDescription}>
            Here is your current Recovery Safety Score and recommended next
            steps.
          </Text>
        </View>

        <View style={jobPageStyles.headerIcon}>
          <Ionicons name="trophy-outline" size={40} color="#fff" />
        </View>
      </View>

      <View style={jobPageStyles.content}>
        {/* Score + Status */}
        <View style={jobPageStyles.resultScoreCard}>
          <View style={jobPageStyles.resultScoreHeader}>
            <Ionicons name="shield-checkmark" size={20} color="#2CA6A4" />
            <Text style={jobPageStyles.resultScoreHeaderText}>
              Recovery Safety Score
            </Text>
          </View>

          <View style={jobPageStyles.resultScoreBody}>
            <View style={jobPageStyles.resultCircleWrap}>
              <View style={jobPageStyles.resultCircleOuter}>
                <View style={jobPageStyles.resultCircleInner}>
                  <Text style={jobPageStyles.resultScoreValue}>
                    {safetyScore}%
                  </Text>
                  <Text style={jobPageStyles.resultScoreLabel}>
                    Safety Score
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                jobPageStyles.resultStatusBox,
                { backgroundColor: riskInfo.background },
              ]}
            >
              <View style={jobPageStyles.resultStatusIconRow}>
                <Ionicons
                  name={riskInfo.icon as any}
                  size={20}
                  color={riskInfo.color}
                />
                <Text
                  style={[
                    jobPageStyles.resultStatusTitle,
                    { color: riskInfo.color },
                  ]}
                >
                  {riskInfo.level}
                </Text>
              </View>
              <Text style={jobPageStyles.resultStatusDesc}>
                {riskInfo.description}
              </Text>
            </View>
          </View>

          <View style={jobPageStyles.resultProgressTrack}>
            <View
              style={[
                jobPageStyles.resultProgressFill,
                { width: `${safetyScore}%`, backgroundColor: riskInfo.color },
              ]}
            />
          </View>
        </View>

        {/* Career Paths or Support */}
        {isEligibleForCareer ? (
          <View style={jobPageStyles.resultCareerCard}>
            <View style={jobPageStyles.resultCareerHeader}>
              <Ionicons name="briefcase" size={20} color="#2CA6A4" />
              <Text style={jobPageStyles.resultCareerHeaderText}>
                Recommended Career Paths
              </Text>
            </View>

            <Text style={jobPageStyles.resultCareerDesc}>
              Based on your recovery safety score, skills, interests and
              background, these career paths may be suitable for your current
              recovery journey.
            </Text>

            {CAREER_PATHS.map((career) => (
              <TouchableOpacity
                key={career.id}
                style={jobPageStyles.resultCareerItem}
                activeOpacity={0.7}
              >
                <View style={jobPageStyles.resultCareerIcon}>
                  <Ionicons
                    name={career.icon as any}
                    size={22}
                    color="#2CA6A4"
                  />
                </View>

                <View style={jobPageStyles.resultCareerContent}>
                  <Text style={jobPageStyles.resultCareerTitle}>
                    {career.title}
                  </Text>
                  <Text style={jobPageStyles.resultCareerText}>
                    {career.description}
                  </Text>
                </View>

                <Ionicons name="chevron-forward" size={18} color="#8a9a9a" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={jobPageStyles.supportCard}>
            <View style={jobPageStyles.supportIcon}>
              <Ionicons name="heart-outline" size={30} color="#e0362e" />
            </View>
            <Text style={jobPageStyles.supportTitle}>
              Focus on Your Recovery
            </Text>
            <Text style={jobPageStyles.supportDescription}>
              Your Recovery Safety Score is currently below 50%. Continue
              focusing on your recovery and support activities. Career
              recommendations will become available when your score reaches 50%
              or above.
            </Text>
          </View>
        )}

        {/* Restart */}
        <TouchableOpacity
          onPress={onRestart}
          style={jobPageStyles.restartButton}
          activeOpacity={0.7}
        >
          <Text style={jobPageStyles.restartButtonText}>
            Take Assessment Again
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}