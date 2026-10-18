import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jobPageStyles } from "./jobpagestyles";
import { useLanguage } from "@/i18n/LanguageContext";

const BASE_URL = (process.env.EXPO_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" };

type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  contactNumber?: string;
  description?: string;
  recommendedFor?: string;
  image?: string;
};

type JobPageProps = {
  safetyScore: number;
};

const getImageUrl = (image?: string) => {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  return `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

export default function JobPage({ safetyScore }: JobPageProps) {
  const { t } = useLanguage();
  const jp = t.jobPage;

  // Inside the component so the text follows the selected language
  const getRiskLevel = (score: number) => {
    if (score >= 75) {
      return {
        level: jp.lowRiskLevel,
        description: jp.lowRiskDesc,
        color: "#17a673",
        background: "#e9fbea",
        icon: "shield-checkmark",
      };
    }

    if (score >= 50) {
      return {
        level: jp.moderateLevel,
        description: jp.moderateDesc,
        color: "#f09c00",
        background: "#fff7e6",
        icon: "shield-half",
      };
    }

    return {
      level: jp.needsSupportLevel,
      description: jp.needsSupportDesc,
      color: "#e0362e",
      background: "#fff0f0",
      icon: "shield-outline",
    };
  };

  const riskInfo = getRiskLevel(safetyScore);
  const isEligibleForCareer = safetyScore >= 50;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!isEligibleForCareer) return;

    const controller = new AbortController();

    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        setJobsError("");

        const userId = await AsyncStorage.getItem("userId");

        // The backend returns only the recommended jobs when userId is sent
        const url = userId
          ? `${BASE_URL}/api/job/all-jobs?userId=${encodeURIComponent(userId)}`
          : `${BASE_URL}/api/job/all-jobs`;

        const response = await fetch(url, {
          headers: NGROK_HEADERS,
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || jp.failedLoadJobs);
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.log("Fetch jobs error:", error);
        setJobsError(error.message || jp.failedLoadJobs);
      } finally {
        setLoadingJobs(false);
      }
    };

    loadJobs();

    return () => controller.abort();
  }, [isEligibleForCareer]);

  return (
    <View style={jobPageStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={jobPageStyles.header}>
          <View style={jobPageStyles.headerCircleLarge} />
          <View style={jobPageStyles.headerCircleSmall} />

          <View style={jobPageStyles.headerContent}>
            <Text style={jobPageStyles.headerSmallText}>{jp.headerSmall}</Text>
            <Text style={jobPageStyles.headerTitle}>{jp.title}</Text>
            <Text style={jobPageStyles.headerDescription}>
              {jp.headerDescription}
            </Text>
          </View>

          <View style={jobPageStyles.headerIcon}>
            <Ionicons name="trophy-outline" size={40} color="#fff" />
          </View>
        </View>

        <View style={jobPageStyles.content}>
          <View style={jobPageStyles.resultScoreCard}>
            <View style={jobPageStyles.resultScoreHeader}>
              <Ionicons name="shield-checkmark" size={20} color="#2CA6A4" />
              <Text style={jobPageStyles.resultScoreHeaderText}>
                {jp.scoreHeader}
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
                      {jp.safetyScoreLabel}
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

          {isEligibleForCareer ? (
            <View style={jobPageStyles.resultCareerCard}>
              <View style={jobPageStyles.resultCareerHeader}>
                <Ionicons name="briefcase" size={20} color="#2CA6A4" />
                <Text style={jobPageStyles.resultCareerHeaderText}>
                  {jp.careerHeader}
                </Text>
              </View>

              <Text style={jobPageStyles.resultCareerDesc}>{jp.careerDesc}</Text>

              {loadingJobs ? (
                <ActivityIndicator
                  size="small"
                  color="#2CA6A4"
                  style={{ marginVertical: 20 }}
                />
              ) : jobsError ? (
                <Text style={jobPageStyles.resultCareerText}>{jobsError}</Text>
              ) : jobs.length === 0 ? (
                <Text style={jobPageStyles.resultCareerText}>{jp.noJobs}</Text>
              ) : (
                jobs.map((job) => (
                  <TouchableOpacity
                    key={job._id}
                    style={jobPageStyles.resultCareerItem}
                    activeOpacity={0.7}
                    onPress={() => setSelectedJob(job)}
                  >
                    <View style={jobPageStyles.resultCareerIcon}>
                      {job.image ? (
                        <Image
                          source={{
                            uri: getImageUrl(job.image),
                            headers: NGROK_HEADERS,
                          }}
                          style={jobPageStyles.resultCareerImage}
                          resizeMode="cover"
                          onError={(e) =>
                            console.log(
                              "Image load error:",
                              getImageUrl(job.image),
                              e.nativeEvent.error
                            )
                          }
                        />
                      ) : (
                        <Ionicons
                          name="briefcase-outline"
                          size={22}
                          color="#2CA6A4"
                        />
                      )}
                    </View>

                    <View style={jobPageStyles.resultCareerContent}>
                      <Text style={jobPageStyles.resultCareerTitle}>
                        {job.title}
                      </Text>
                      <Text style={jobPageStyles.resultCareerText}>
                        {job.company}
                        {job.location ? ` · ${job.location}` : ""}
                      </Text>
                      {(job.type || job.salary) && (
                        <Text style={jobPageStyles.resultCareerText}>
                          {[job.type, job.salary].filter(Boolean).join(" · ")}
                        </Text>
                      )}
                    </View>

                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#8a9a9a"
                    />
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <View style={jobPageStyles.supportCard}>
              <View style={jobPageStyles.supportIcon}>
                <Ionicons name="heart-outline" size={30} color="#e0362e" />
              </View>
              <Text style={jobPageStyles.supportTitle}>{jp.focusTitle}</Text>
              <Text style={jobPageStyles.supportDescription}>{jp.focusDesc}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={!!selectedJob}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedJob(null)}
      >
        <View style={jobPageStyles.overlay}>
          <View style={jobPageStyles.sheet}>
            <View style={jobPageStyles.modalHeader}>
              <Text style={jobPageStyles.title} numberOfLines={2}>
                {selectedJob?.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedJob(null)}>
                <Ionicons name="close" size={26} color="#444" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedJob?.image ? (
                <Image
                  source={{
                    uri: getImageUrl(selectedJob.image),
                    headers: NGROK_HEADERS,
                  }}
                  style={jobPageStyles.image}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={jobPageStyles.company}>
                {selectedJob?.company}
                {selectedJob?.location ? ` · ${selectedJob.location}` : ""}
              </Text>

              <View style={jobPageStyles.tags}>
                {selectedJob?.type ? (
                  <Text style={jobPageStyles.tag}>{selectedJob.type}</Text>
                ) : null}
                {selectedJob?.salary ? (
                  <Text style={jobPageStyles.tag}>{selectedJob.salary}</Text>
                ) : null}
              </View>

              {selectedJob?.contactNumber ? (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${selectedJob.contactNumber}`)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginVertical: 8,
                  }}
                >
                  <Ionicons name="call-outline" size={18} color="#2CA6A4" />
                  <Text
                    style={{
                      marginLeft: 8,
                      fontSize: 15,
                      fontWeight: "600",
                      color: "#2CA6A4",
                    }}
                  >
                    {selectedJob.contactNumber}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {selectedJob?.description ? (
                <>
                  <Text style={jobPageStyles.sectionLabel}>{jp.aboutJob}</Text>
                  <Text style={jobPageStyles.body}>
                    {selectedJob.description}
                  </Text>
                </>
              ) : null}

              {selectedJob?.recommendedFor ? (
                <>
                  <Text style={jobPageStyles.sectionLabel}>{jp.goodFit}</Text>
                  <Text style={jobPageStyles.body}>
                    {selectedJob.recommendedFor}
                  </Text>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}