import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  dynamicStyles,
  chartStyles,
  cardStyles,
  badgeStyles,
  modalStyles,
  nudgeStyles,
  choiceStyles,
  quizStyles,
  screenStyles,
} from './dashboardStyles';
import { ngrokFetch } from '@/utill/ngrokFetch';
import { useLanguage } from '@/i18n/LanguageContext';
import { en, type Translations } from '@/i18n/en';

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;

type DiaryT = Translations['diary'];

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

const emotionName = (d: DiaryT, emotion: string) =>
  (d.emotions as Record<string, string>)[emotion] ?? emotion;

const HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

interface EmotionAnalysis {
  dominantEmotion: string;
  emotionPercentages: Record<string, number>;
}

interface DiaryEntry {
  id: string;
  date: string;
  mood: 'good' | 'bad';
  content: string;
  // 'questionnaire' = quick check-in; anything else (or missing) = written diary
  source?: 'diary' | 'questionnaire';
  questionnaire?: QuizAnswers;
  emotionAnalysis?: EmotionAnalysis;
}

const todayDateString = () => new Date().toISOString().split('T')[0];

const formatDisplayDate = (dateStr: string, d: DiaryT) => {
  const date = new Date(dateStr);
  // UTC getters, because "YYYY-MM-DD" strings are parsed as UTC
  return d.formatDate(
    d.weekdays[date.getUTCDay()],
    date.getUTCDate(),
    d.months[date.getUTCMonth()],
    date.getUTCFullYear()
  );
};

type QuizKey = 'feeling' | 'sleep' | 'craving' | 'stress' | 'trigger';
type QuizAnswers = Partial<Record<QuizKey, string>>;

const QUIZ: {
  key: QuizKey;
  options: { value: string; emoji?: string }[];
}[] = [
  {
    key: 'feeling',
    options: [
      { value: 'good', emoji: '😊' },
      { value: 'okay', emoji: '😐' },
      { value: 'not_good', emoji: '😔' },
    ],
  },
  {
    key: 'sleep',
    options: [
      { value: 'well', emoji: '😊' },
      { value: 'not_enough', emoji: '😐' },
      { value: 'barely', emoji: '😔' },
    ],
  },
  { key: 'craving', options: [{ value: 'no' }, { value: 'little' }, { value: 'strong' }] },
  { key: 'stress', options: [{ value: 'no' }, { value: 'little' }, { value: 'a_lot' }] },
  { key: 'trigger', options: [{ value: 'no' }, { value: 'yes' }] },
];

type QuizText = {
  question: string;
  hint?: string;
  options: Record<string, string>;
  subs?: Record<string, string>;
};
const quizText = (d: DiaryT, key: QuizKey) => d.quiz[key] as QuizText;


const EMOTION_WEIGHTS: Record<QuizKey, Record<string, Record<string, number>>> = {
  feeling: {
    good: { joy: 4 },
    okay: { joy: 1, sadness: 1 },
    not_good: { sadness: 4 },
  },
  sleep: {
    well: { joy: 1 },
    not_enough: { stress: 1 },
    barely: { stress: 2, anxiety: 1 },
  },
  craving: {
    no: {},
    little: { anxiety: 1 },
    strong: { anxiety: 2, fear: 1 },
  },
  stress: {
    no: {},
    little: { stress: 1 },
    a_lot: { stress: 3, anxiety: 1 },
  },
  trigger: {
    no: {},
    yes: { fear: 2, anxiety: 1 },
  },
};

const computeQuizEmotions = (answers: QuizAnswers): EmotionAnalysis => {
  const totals: Record<string, number> = {};
  (Object.keys(EMOTION_WEIGHTS) as QuizKey[]).forEach((key) => {
    const value = answers[key];
    if (!value) return;
    const weights = EMOTION_WEIGHTS[key][value] || {};
    Object.entries(weights).forEach(([emotion, pts]) => {
      totals[emotion] = (totals[emotion] || 0) + pts;
    });
  });

  const sum = Object.values(totals).reduce((s, v) => s + v, 0) || 1;
  const parts = Object.entries(totals).map(([emotion, v]) => {
    const exact = (v / sum) * 100;
    return { emotion, exact, pct: Math.floor(exact) };
  });

  let remaining = 100 - parts.reduce((s, p) => s + p.pct, 0);
  [...parts]
    .sort((a, b) => (b.exact - b.pct) - (a.exact - a.pct))
    .forEach((p) => {
      if (remaining > 0) {
        p.pct += 1;
        remaining -= 1;
      }
    });

  const emotionPercentages: Record<string, number> = {};
  parts.forEach((p) => {
    if (p.pct > 0) emotionPercentages[p.emotion] = p.pct;
  });

  const dominantEmotion =
    Object.entries(emotionPercentages).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'joy';

  return { dominantEmotion, emotionPercentages };
};

const quizMood = (a: QuizAnswers): 'good' | 'bad' =>
  a.feeling === 'not_good' || a.craving === 'strong' || a.stress === 'a_lot' ? 'bad' : 'good';

const labelOf = (d: DiaryT, key: QuizKey, value?: string) =>
  (value && quizText(d, key).options[value]) || '';

const buildQuizContent = (a: QuizAnswers, d: DiaryT) => {
  const c = d.quickContent;
  return (
    `${c.prefix}${c.feeling}: ${labelOf(d, 'feeling', a.feeling)}. ` +
    `${c.sleep}: ${labelOf(d, 'sleep', a.sleep)}. ` +
    `${c.craving}: ${labelOf(d, 'craving', a.craving)}. ` +
    `${c.stress}: ${labelOf(d, 'stress', a.stress)}. ` +
    `${c.trigger}: ${labelOf(d, 'trigger', a.trigger)}.`
  );
};

function MoodChart({ entries }: { entries: DiaryEntry[] }) {
  const { t } = useLanguage();
  const d = t.diary;
  const good = entries.filter((e) => e.mood === 'good').length;
  const bad = entries.filter((e) => e.mood === 'bad').length;
  const total = entries.length || 1;
  const goodPct = Math.round((good / total) * 100);
  const badPct = Math.round((bad / total) * 100);

  return (
    <View style={chartStyles.wrapper}>
      <Text style={chartStyles.heading}>{d.moodOverview}</Text>
      <Text style={chartStyles.sub}>{d.entriesTotal(entries.length)}</Text>

      <View style={chartStyles.bars}>
        <View style={chartStyles.barGroup}>
          <Text style={chartStyles.barValue}>{good}</Text>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.barFill, dynamicStyles.barFill(goodPct, COLORS.good)]} />
          </View>
          <View style={[chartStyles.dot, dynamicStyles.bg(COLORS.good)]} />
          <Text style={chartStyles.barLabel}>{d.good}</Text>
        </View>

        <View style={chartStyles.divider} />

        <View style={chartStyles.barGroup}>
          <Text style={chartStyles.barValue}>{bad}</Text>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.barFill, dynamicStyles.barFill(badPct, COLORS.bad)]} />
          </View>
          <View style={[chartStyles.dot, dynamicStyles.bg(COLORS.bad)]} />
          <Text style={chartStyles.barLabel}>{d.bad}</Text>
        </View>
      </View>

      <View style={chartStyles.track}>
        <View style={[chartStyles.trackFill, dynamicStyles.flexFill(goodPct, COLORS.good)]} />
        <View style={[chartStyles.trackFill, dynamicStyles.flexFill(badPct, COLORS.bad)]} />
      </View>
      <View style={chartStyles.trackLabels}>
        <Text style={[chartStyles.trackLabel, dynamicStyles.textColor(COLORS.good)]}>{d.goodPct(goodPct)}</Text>
        <Text style={[chartStyles.trackLabel, dynamicStyles.textColor(COLORS.bad)]}>{d.badPct(badPct)}</Text>
      </View>
    </View>
  );
}

function DominantEmotionBadge({ analysis }: { analysis: DiaryEntry['emotionAnalysis'] }) {
  const { t } = useLanguage();
  if (!analysis) return null;
  const { dominantEmotion } = analysis;
  const meta = emotionMeta(dominantEmotion);

  return (
    <View style={[badgeStyles.container, dynamicStyles.tint(meta.color)]}>
      <Text style={badgeStyles.emoji}>{meta.emoji}</Text>
      <Text style={[badgeStyles.text, dynamicStyles.textColor(meta.color)]}>
        {emotionName(t.diary, dominantEmotion)}
      </Text>
    </View>
  );
}

function DiaryNudge({ onWrite }: { onWrite?: () => void }) {
  const { t } = useLanguage();
  const d = t.diary;
  return (
    <View style={nudgeStyles.container}>
      <Text style={nudgeStyles.icon}>📝</Text>
      <View style={nudgeStyles.body}>
        <Text style={nudgeStyles.text}>{d.nudgeText}</Text>
        {onWrite && (
          <TouchableOpacity onPress={onWrite} style={nudgeStyles.button} activeOpacity={0.8}>
            <Text style={nudgeStyles.buttonText}>{d.writeDiary}</Text>
            <Ionicons name="arrow-forward" size={14} color="#1B7A50" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function EntryCard({
  entry,
  onEdit,
  onDelete,
}: {
  entry: DiaryEntry;
  onEdit: (entry: DiaryEntry) => void;
  onDelete: (entry: DiaryEntry) => void;
}) {
  const { t } = useLanguage();
  const d = t.diary;
  const [expanded, setExpanded] = useState(false);
  const isGood = entry.mood === 'good';
  const isToday = entry.date === todayDateString();
  const isQuick = entry.source === 'questionnaire';

  const displayContent =
    isQuick && entry.questionnaire ? buildQuizContent(entry.questionnaire, d) : entry.content;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded((v) => !v)}
      style={cardStyles.wrapper}
    >
      <View style={cardStyles.row}>
        <View style={[cardStyles.moodDot, dynamicStyles.bg(isGood ? COLORS.good : COLORS.bad)]} />
        <View style={cardStyles.meta}>
          <View style={cardStyles.rowCenter}>
           <Text style={cardStyles.date}>{formatDisplayDate(entry.date, d)}</Text>
            <DominantEmotionBadge analysis={entry.emotionAnalysis} />
          </View>
          <View style={cardStyles.rowCenter}>
            <View style={[cardStyles.pill, dynamicStyles.bg(isGood ? COLORS.goodSoft : COLORS.badSoft)]}>
              <Text style={[cardStyles.pillText, dynamicStyles.textColor(isGood ? COLORS.goodText : COLORS.badText)]}>
                {isGood ? d.goodDay : d.toughDay}
              </Text>
            </View>
            {isQuick && (
              <View style={cardStyles.quickTag}>
                <Ionicons name="flash-outline" size={11} color="#6B7280" />
                <Text style={cardStyles.quickTagText}>{d.quickCheckInTag}</Text>
              </View>
            )}
          </View>
        </View>

        {isToday && (
          <View style={cardStyles.actionsRow}>
            {/* Quick check-ins are generated from answers, so only written diaries can be edited */}
            {!isQuick && (
              <TouchableOpacity
                hitSlop={HIT_SLOP}
                onPress={(e) => {
                  e.stopPropagation();
                  onEdit(entry);
                }}
              >
                <Ionicons name="pencil-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              hitSlop={HIT_SLOP}
              onPress={(e) => {
                e.stopPropagation();
                onDelete(entry);
              }}
            >
              <Ionicons name="trash-outline" size={18} color="#E05C5C" />
            </TouchableOpacity>
          </View>
        )}

        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9EA5B0" />
      </View>

      {expanded && <Text style={cardStyles.content}>{displayContent}</Text>}
    </TouchableOpacity>
  );
}

function EntryModal({
  visible,
  onClose,
  onSave,
  initialMood,
  initialContent,
  mode,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (mood: 'good' | 'bad', content: string) => void;
  initialMood?: 'good' | 'bad';
  initialContent?: string;
  mode: 'add' | 'edit';
}) {
  const { t } = useLanguage();
  const d = t.diary;
  const [mood, setMood] = useState<'good' | 'bad'>(initialMood || 'good');
  const [content, setContent] = useState(initialContent || '');

  useEffect(() => {
    if (visible) {
      setMood(initialMood || 'good');
      setContent(initialContent || '');
    }
  }, [visible, initialMood, initialContent]);

  const dateLabel = formatDisplayDate(todayDateString(), d);

  const handleSave = () => {
    if (!content.trim()) return;
    onSave(mood, content.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={modalStyles.overlay}
      >
        <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{mode === 'add' ? d.newEntry : d.editEntry}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={HIT_SLOP}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.dateRow}>
            <Ionicons name="calendar-outline" size={15} color="#9EA5B0" />
            <Text style={modalStyles.dateText}>{dateLabel}</Text>
          </View>

          <View style={modalStyles.moodRow}>
            <TouchableOpacity
              style={[modalStyles.moodBtn, mood === 'good' && modalStyles.moodBtnActiveGood]}
              onPress={() => setMood('good')}
            >
              <Text style={[modalStyles.moodBtnText, mood === 'good' && modalStyles.moodTextGood]}>
                😊  {d.goodDay}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.moodBtn, mood === 'bad' && modalStyles.moodBtnActiveBad]}
              onPress={() => setMood('bad')}
            >
              <Text style={[modalStyles.moodBtnText, mood === 'bad' && modalStyles.moodTextBad]}>
                😔  {d.toughDay}
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={modalStyles.textArea}
            multiline
            placeholder={d.writePlaceholder}
            placeholderTextColor="#C4C9D0"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>{d.discard}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, !content.trim() && modalStyles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!content.trim()}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" style={modalStyles.btnIcon} />
              <Text style={modalStyles.saveText}>{mode === 'add' ? d.saveEntry : d.updateEntry}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
function EntryChoiceModal({
  visible,
  onClose,
  onWriteDiary,
  onQuickCheckIn,
}: {
  visible: boolean;
  onClose: () => void;
  onWriteDiary: () => void;
  onQuickCheckIn: () => void;
}) {
  const { t } = useLanguage();
  const d = t.diary;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{d.chooseTitle}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={HIT_SLOP}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={choiceStyles.card} onPress={onWriteDiary} activeOpacity={0.85}>
            <View style={[choiceStyles.icon, choiceStyles.iconGreen]}>
              <Ionicons name="create-outline" size={22} color="#1B7A50" />
            </View>
            <View style={choiceStyles.body}>
              <Text style={choiceStyles.title}>{d.writeDiary}</Text>
              <Text style={choiceStyles.sub}>{d.writeDiarySub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9EA5B0" />
          </TouchableOpacity>

          <TouchableOpacity style={choiceStyles.card} onPress={onQuickCheckIn} activeOpacity={0.85}>
            <View style={[choiceStyles.icon, choiceStyles.iconIndigo]}>
              <Ionicons name="flash-outline" size={22} color="#4F46E5" />
            </View>
            <View style={choiceStyles.body}>
              <Text style={choiceStyles.title}>{d.quickCheckIn}</Text>
              <Text style={choiceStyles.sub}>{d.quickCheckInSub}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9EA5B0" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function QuickCheckInModal({
  visible,
  onClose,
  onSubmit,
  onWriteDiary,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    answers: QuizAnswers;
    mood: 'good' | 'bad';
    content: string;
    emotionAnalysis: EmotionAnalysis;
  }) => Promise<boolean>;
  onWriteDiary: () => void;
}) {
  const { t } = useLanguage();
  const d = t.diary;
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<EmotionAnalysis | null>(null);

  useEffect(() => {
    if (visible) {
      setAnswers({});
      setSubmitting(false);
      setResult(null);
    }
  }, [visible]);

  const allAnswered = QUIZ.every((q) => !!answers[q.key]);

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    const emotionAnalysis = computeQuizEmotions(answers);
    const ok = await onSubmit({
      answers,
      mood: quizMood(answers),
      content: buildQuizContent(answers, en.diary),
      emotionAnalysis,
    });
    setSubmitting(false);
    if (ok) setResult(emotionAnalysis);
  };

  const dominantMeta = result ? emotionMeta(result.dominantEmotion) : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <TouchableOpacity style={modalStyles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={modalStyles.sheet}>
          <View style={modalStyles.handle} />

          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{result ? d.yourEmotionToday : d.quickCheckIn}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={HIT_SLOP}>
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {result && dominantMeta ? (
            <ScrollView style={quizStyles.scrollResult} showsVerticalScrollIndicator={false}>
              <View style={quizStyles.resultTop}>
                <Text style={quizStyles.resultEmoji}>{dominantMeta.emoji}</Text>
                <Text style={[quizStyles.resultName, dynamicStyles.textColor(dominantMeta.color)]}>
                  {emotionName(d, result.dominantEmotion)}
                </Text>
                <Text style={quizStyles.resultSub}>{d.mainEmotionToday}</Text>
              </View>

              <Text style={quizStyles.estimateNote}>{d.estimateNote}</Text>

              <DiaryNudge onWrite={onWriteDiary} />

              <View style={[modalStyles.actions, modalStyles.actionsTop]}>
                <TouchableOpacity style={modalStyles.saveBtn} onPress={onClose}>
                  <Ionicons name="checkmark" size={16} color="#FFF" style={modalStyles.btnIcon} />
                  <Text style={modalStyles.saveText}>{d.done}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <>
              <DiaryNudge />

              <ScrollView style={quizStyles.scrollQuestions} showsVerticalScrollIndicator={false}>
                {QUIZ.map((q, i) => {
                  const qt = quizText(d, q.key);
                  return (
                    <View key={q.key} style={quizStyles.question}>
                      <Text style={quizStyles.questionText}>
                        {i + 1}. {qt.question}
                      </Text>
                      {qt.hint && <Text style={quizStyles.questionHint}>{qt.hint}</Text>}
                      <View style={quizStyles.chipRow}>
                        {q.options.map((o) => {
                          const active = answers[q.key] === o.value;
                          const sub = qt.subs?.[o.value];
                          return (
                            <TouchableOpacity
                              key={o.value}
                              style={[quizStyles.chip, active && quizStyles.chipActive]}
                              onPress={() => setAnswers((prev) => ({ ...prev, [q.key]: o.value }))}
                              activeOpacity={0.8}
                            >
                              <Text style={[quizStyles.chipText, active && quizStyles.chipTextActive]}>
                                {o.emoji ? `${o.emoji}  ` : ''}{qt.options[o.value]}
                              </Text>
                              {sub && (
                                <Text style={[quizStyles.chipSub, active && quizStyles.chipTextActive]}>{sub}</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <View style={modalStyles.actions}>
                <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
                  <Text style={modalStyles.cancelText}>{d.cancel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[modalStyles.saveBtn, (!allAnswered || submitting) && modalStyles.saveBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!allAnswered || submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="sparkles-outline" size={16} color="#FFF" style={modalStyles.btnIcon} />
                      <Text style={modalStyles.saveText}>{d.seeEmotion}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

export default function DiaryScreen() {
  const { t } = useLanguage();
  const d = t.diary;

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const fetchDiaries = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await ngrokFetch(`${BASE_URL}/api/diary/diaries/${userId}`);
      const data = await response.json();

      if (response.ok) {
        const mapped: DiaryEntry[] = (data.diaries || []).map((item: any) => ({
          id: item._id,
          date: item.date,
          mood: item.mood,
          content: item.content,
          source: item.source,
          questionnaire: item.questionnaire,
          emotionAnalysis: item.emotionAnalysis,
        }));
        setEntries(mapped);
      } else {
        Alert.alert(t.common.error, data.message || d.loadFailed);
      }
    } catch (error) {
      console.log('Fetch diaries error:', error);
      Alert.alert(t.common.error, d.loadFailed);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

  }, [t]);

  useEffect(() => {
    fetchDiaries();
  }, [fetchDiaries]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDiaries();
  };

  const sorted = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const openAddModal = () => {
    setEditingEntry(null);
    setModalOpen(true);
  };

  const openEditModal = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setModalOpen(true);
  };


  const openChoice = () => setChoiceOpen(true);

  const chooseWriteDiary = () => {
    setChoiceOpen(false);
    openAddModal();
  };

  const chooseQuickCheckIn = () => {
    setChoiceOpen(false);
    setQuizOpen(true);
  };


  const switchQuizToDiary = () => {
    setQuizOpen(false);
    openAddModal();
  };

  const handleModalSave = async (mood: 'good' | 'bad', content: string) => {
    if (editingEntry) {
      await handleEdit(editingEntry.id, mood, content);
    } else {
      await handleAdd(mood, content);
    }
    setModalOpen(false);
    setEditingEntry(null);
  };

  const handleAdd = async (mood: 'good' | 'bad', content: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await ngrokFetch(`${BASE_URL}/api/diary/diary-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: todayDateString(),
          mood,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(t.common.error, data.message || d.saveFailed);
        return;
      }

      fetchDiaries();
    } catch (error) {
      console.log('Add diary error:', error);
      Alert.alert(t.common.error, d.saveFailed);
    }
  };

  const handleQuizSave = async (payload: {
    answers: QuizAnswers;
    mood: 'good' | 'bad';
    content: string;
    emotionAnalysis: EmotionAnalysis;
  }): Promise<boolean> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert(t.common.error, d.loginAgain);
        return false;
      }

      const response = await ngrokFetch(`${BASE_URL}/api/diary/diary-add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: todayDateString(),
          mood: payload.mood,
          content: payload.content,
          source: 'questionnaire',
          questionnaire: payload.answers,
          emotionAnalysis: payload.emotionAnalysis,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(t.common.error, data.message || d.checkInSaveFailed);
        return false;
      }

      fetchDiaries();
      return true;
    } catch (error) {
      console.log('Quick check-in error:', error);
      Alert.alert(t.common.error, d.checkInSaveFailed);
      return false;
    }
  };

  const handleEdit = async (diaryId: string, mood: 'good' | 'bad', content: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await ngrokFetch(
        `${BASE_URL}/api/diary/diaries/${userId}/${diaryId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood, content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(t.common.error, data.message || d.updateFailed);
        return;
      }

      fetchDiaries();
    } catch (error) {
      console.log('Edit diary error:', error);
      Alert.alert(t.common.error, d.updateFailed);
    }
  };

  const handleDelete = (entry: DiaryEntry) => {
    Alert.alert(d.deleteTitle, d.deleteConfirm, [
      { text: d.cancel, style: 'cancel' },
      {
        text: d.delete,
        style: 'destructive',
        onPress: async () => {
          try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) return;

            const response = await ngrokFetch(
              `${BASE_URL}/api/diary/diaries/${userId}/${entry.id}`,
              { method: 'DELETE' }
            );

            const data = await response.json();

            if (!response.ok) {
              Alert.alert(t.common.error, data.message || d.deleteFailed);
              return;
            }

            setEntries((prev) => prev.filter((e) => e.id !== entry.id));
          } catch (error) {
            console.log('Delete diary error:', error);
            Alert.alert(t.common.error, d.deleteFailed);
          }
        },
      },
    ]);
  };

  return (
    <View style={screenStyles.root}>
      <View style={screenStyles.sticky}>
        <View style={screenStyles.header}>
          <View>
            <Text style={screenStyles.pageTitle}>{d.title}</Text>
          </View>
        </View>
        <MoodChart entries={entries} />
      </View>

      {loading ? (
        <View style={screenStyles.loading}>
          <ActivityIndicator size="large" color="#3DB87C" />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <EntryCard entry={item} onEdit={openEditModal} onDelete={handleDelete} />
          )}
          contentContainerStyle={screenStyles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={<Text style={screenStyles.sectionLabel}>{d.allEntries}</Text>}
          ListEmptyComponent={
            <View style={screenStyles.empty}>
              <Ionicons name="book-outline" size={40} color="#D1D5DB" />
              <Text style={screenStyles.emptyText}>{d.emptyText}</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity style={screenStyles.fab} onPress={openChoice} activeOpacity={0.88}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <EntryChoiceModal
        visible={choiceOpen}
        onClose={() => setChoiceOpen(false)}
        onWriteDiary={chooseWriteDiary}
        onQuickCheckIn={chooseQuickCheckIn}
      />

      <QuickCheckInModal
        visible={quizOpen}
        onClose={() => setQuizOpen(false)}
        onSubmit={handleQuizSave}
        onWriteDiary={switchQuizToDiary}
      />

      <EntryModal
        visible={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleModalSave}
        initialMood={editingEntry?.mood}
        initialContent={editingEntry?.content}
        mode={editingEntry ? 'edit' : 'add'}
      />
    </View>
  );
}