import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ngrokFetch } from '@/utill/ngrokFetch';
import { CHART_HEIGHT, dynamicStyles, weeklyEmotionStyles as s } from './weeklyEmotionChartStyles';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

const EMOTION_META: Record<string, { color: string; emoji: string }> = {
  joy: { color: '#3DB87C', emoji: '😊' },
  love: { color: '#EC4899', emoji: '❤️' },
  surprise: { color: '#F5A623', emoji: '😮' },
  sadness: { color: '#5B8DEF', emoji: '😢' },
  fear: { color: '#6366F1', emoji: '😨' },
  anger: { color: '#E5624A', emoji: '😠' },
  stress: { color: '#F97316', emoji: '😖' },
  anxiety: { color: '#A855F7', emoji: '😰' },
};

const emotionMeta = (emotion: string) =>
  EMOTION_META[emotion] || { color: '#9EA5B0', emoji: '•' };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MIN_BAR = 8;

type DayEmotion = {
  date: string;
  dominantEmotion: string | null;
  percentage: number;
  entryCount: number;
};

const weekdayOf = (date: string) => WEEKDAYS[new Date(`${date}T00:00:00Z`).getUTCDay()];

const barHeight = (percentage: number) => {
  const pct = Math.min(100, Math.max(0, percentage));
  return Math.max(MIN_BAR, Math.round((pct / 100) * CHART_HEIGHT));
};

export default function WeeklyEmotionChart({ patientId }: { patientId: string }) {
  const [days, setDays] = useState<DayEmotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const counselorId = await AsyncStorage.getItem('counselorId');
        if (!counselorId) throw new Error('counselorId not found');

        const response = await ngrokFetch(`${BASE_URL}/api/diary/diaries/counselor/${patientId}/${counselorId}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.message || 'Failed to load weekly emotions');

        if (!cancelled) {
          setDays(data.days || []);
          setError(false);
        }
      } catch (err) {
        console.log('Weekly emotions error:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const hasData = days.some((d) => d.dominantEmotion);

  return (
    <View style={s.card}>
      <Text style={s.title}>Emotions this week</Text>
      <Text style={s.subtitle}>Main emotion each day, last 7 days</Text>

      {loading ? (
        <ActivityIndicator style={s.loading} size="small" color="#3DB87C" />
      ) : error ? (
        <Text style={s.message}>Could not load emotions. Please try again later.</Text>
      ) : !hasData ? (
        <Text style={s.message}>No emotion data in the last 7 days.</Text>
      ) : (
        <>
          <View style={s.barsRow}>
            {days.map((day, index) => {
              const meta = day.dominantEmotion ? emotionMeta(day.dominantEmotion) : null;
              const isToday = index === days.length - 1;

              return (
                <View key={day.date} style={s.column}>
                  <Text style={s.emoji}>{meta ? meta.emoji : ''}</Text>
                  <View style={s.barArea}>
                    {meta && <View style={[s.bar, dynamicStyles.bar(barHeight(day.percentage), meta.color)]} />}
                  </View>
                  <Text style={s.percent}>{meta ? `${Math.round(day.percentage)}%` : '–'}</Text>
                  <Text style={[s.dayLabel, isToday && s.dayLabelToday]}>{weekdayOf(day.date)}</Text>
                </View>
              );
            })}
          </View>

          <View style={s.key}>
            <Text style={s.keyTitle}>Emotion guide</Text>
            <View style={s.keyGrid}>
              {Object.entries(EMOTION_META).map(([emotion, meta]) => (
                <View key={emotion} style={s.keyItem}>
                  <View style={[s.keyDot, dynamicStyles.dot(meta.color)]} />
                  <Text style={s.keyEmoji}>{meta.emoji}</Text>
                  <Text style={s.keyText}>{emotion}</Text>
                </View>
              ))}
            </View>
          </View>
        </>
      )}
    </View>
  );
}