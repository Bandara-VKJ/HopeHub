import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { dashStyles } from './dashboardStyles'

const weeklyData = [
  { day: 'Mon', taskCompletion: 85, moodScore: 75, cravings: 20 },
  { day: 'Tue', taskCompletion: 92, moodScore: 82, cravings: 15 },
  { day: 'Wed', taskCompletion: 78, moodScore: 68, cravings: 35 },
  { day: 'Thu', taskCompletion: 95, moodScore: 88, cravings: 10 },
  { day: 'Fri', taskCompletion: 88, moodScore: 80, cravings: 18 },
  { day: 'Sat', taskCompletion: 100, moodScore: 92, cravings: 5 },
  { day: 'Sun', taskCompletion: 90, moodScore: 85, cravings: 12 },
];

const monthlyProgress = [
  { week: 'Week 1', adherence: 72 },
  { week: 'Week 2', adherence: 78 },
  { week: 'Week 3', adherence: 85 },
  { week: 'Week 4', adherence: 89 },
];

const riskFactors = [
  { factor: 'High Stress Levels', severity: 'high', value: 75 },
  { factor: 'Social Triggers', severity: 'moderate', value: 45 },
  { factor: 'Sleep Quality', severity: 'moderate', value: 52 },
  { factor: 'Support Network', severity: 'low', value: 20 },
];

export default function AnalyticsScreen() {
  const navigation = useNavigation();
  const [selectedMetric, setSelectedMetric] = useState('tasks');

  const avgRiskScore = Math.round(
    riskFactors.reduce((sum, r) => sum + r.value, 0) / riskFactors.length
  );

  const riskLevel =
    avgRiskScore < 30 ? 'low' : avgRiskScore < 60 ? 'moderate' : 'high';

  const currentData = weeklyData.map((d) => ({
    day: d.day,
    value:
      selectedMetric === 'tasks'
        ? d.taskCompletion
        : selectedMetric === 'mood'
        ? d.moodScore
        : d.cravings,
  }));

  return (
    <ScrollView style={dashStyles.container}>
      {/* Header */}
      <View style={dashStyles.header}>
        <Text style={dashStyles.title}>HopeHub</Text>
        <Text style={dashStyles.subtitle}>Analytics & Insights</Text>
      </View>

      {/* Risk Card */}
      <View style={dashStyles.card}>
        <Text style={dashStyles.cardTitle}>Relaps Prediction</Text>
        <Text style={dashStyles.riskText}>{riskLevel.toUpperCase()} RISK</Text>
        <Text>Score: {avgRiskScore}/100</Text>
      </View>


      {/* Metric Buttons */}
      <View style={dashStyles.buttonRow}>
        {['tasks', 'mood', 'cravings'].map((m) => (
          <TouchableOpacity
            key={m}
            style={[
              dashStyles.metricBtn,
              selectedMetric === m && dashStyles.activeBtn,
            ]}
            onPress={() => setSelectedMetric(m)}
          >
            <Text style={dashStyles.btnText}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart */}
      <View style={dashStyles.chart}>
        {currentData.map((d, i) => (
          <View key={i} style={dashStyles.barContainer}>
            <View
              style={[
                dashStyles.bar,
                { height: `${d.value}%` },
              ]}
            />
            <Text>{d.day}</Text>
          </View>
        ))}
      </View>

      {/* Monthly */}
      <View style={dashStyles.card}>
        <Text style={dashStyles.cardTitle}>Monthly Progress</Text>
        {monthlyProgress.map((w, i) => (
          <View key={i} style={dashStyles.row}>
            <Text>{w.week}</Text>
            <Text>{w.adherence}%</Text>
          </View>
        ))}
      </View>
      
    </ScrollView>
  );
}