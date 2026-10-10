import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { jobPageStyles } from "./jobpagestyles";

const BASE_URL = (process.env.EXPO_PUBLIC_BASE_URL || "").replace(/\/+$/, "");

const NGROK_HEADERS = { "ngrok-skip-browser-warning": "true" };

type Job = {
  _id: string;
  title: string;
  company: string;
  location?: string;
  type?: string;
  salary?: string;
  description?: string;
  recommendedFor?: string;
  image?: string;
};

type JobPageProps = {
  safetyScore: number;
  onRestart: () => void;
};

const getImageUrl = (image?: string) => {
  if (!image) return "";
  if (image.startsWith("http") || image.startsWith("data:")) return image;
  return `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
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

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!isEligibleForCareer) return;

    const controller = new AbortController();

    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        setJobsError("");

        const response = await fetch(`${BASE_URL}/api/job/all-jobs`, {
          headers: NGROK_HEADERS,
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load jobs");
        }

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.log("Fetch jobs error:", error);
        setJobsError(error.message || "Failed to load jobs");
      } finally {
        setLoadingJobs(false);
      }
    };

    fetchJobs();

    return () => controller.abort();
  }, [isEligibleForCareer]);

  return (
    <View style={jobPageStyles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
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

              {loadingJobs ? (
                <ActivityIndicator
                  size="small"
                  color="#2CA6A4"
                  style={{ marginVertical: 20 }}
                />
              ) : jobsError ? (
                <Text style={jobPageStyles.resultCareerText}>{jobsError}</Text>
              ) : jobs.length === 0 ? (
                <Text style={jobPageStyles.resultCareerText}>
                  No job opportunities are available right now. Please check
                  again later.
                </Text>
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
              <Text style={jobPageStyles.supportTitle}>
                Focus on Your Recovery
              </Text>
              <Text style={jobPageStyles.supportDescription}>
                Your Recovery Safety Score is currently below 50%. Continue
                focusing on your recovery and support activities. Career
                recommendations will become available when your score reaches
                50% or above.
              </Text>
            </View>
          )}

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

              {selectedJob?.description ? (
                <>
                  <Text style={jobPageStyles.sectionLabel}>About this job</Text>
                  <Text style={jobPageStyles.body}>
                    {selectedJob.description}
                  </Text>
                </>
              ) : null}

              {selectedJob?.recommendedFor ? (
                <>
                  <Text style={jobPageStyles.sectionLabel}>Good fit for</Text>
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