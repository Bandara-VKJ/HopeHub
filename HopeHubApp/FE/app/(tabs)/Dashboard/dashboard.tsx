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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { chartStyles, cardStyles, modalStyles, screenStyles } from './dashboardStyles';

const BASE_URL = "https://connector-removed-stoneware.ngrok-free.dev";

const ngrokFetch = (url: string, options: RequestInit = {}) =>
  fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

interface DiaryEntry {
  id: string;
  date: string;
  mood: 'good' | 'bad';
  content: string;
  emotionAnalysis?: {
    label: string;
    positivePercentage: number;
    negativePercentage: number;
    confidence: number;
  };
}

const todayDateString = () => new Date().toISOString().split("T")[0];

const formatDisplayDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};


function MoodChart({ entries }: { entries: DiaryEntry[] }) {
  const good = entries.filter(e => e.mood === 'good').length;
  const bad = entries.filter(e => e.mood === 'bad').length;
  const total = entries.length || 1;
  const goodPct = Math.round((good / total) * 100);
  const badPct = Math.round((bad / total) * 100);

  return (
    <View style={chartStyles.wrapper}>
      <Text style={chartStyles.heading}>Mood Overview</Text>
      <Text style={chartStyles.sub}>
        {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
      </Text>

      <View style={chartStyles.bars}>
        <View style={chartStyles.barGroup}>
          <Text style={chartStyles.barValue}>{good}</Text>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.barFill, { height: `${goodPct}%` as any, backgroundColor: '#3DB87C' }]} />
          </View>
          <View style={[chartStyles.dot, { backgroundColor: '#3DB87C' }]} />
          <Text style={chartStyles.barLabel}>Good</Text>
        </View>

        <View style={chartStyles.divider} />

        <View style={chartStyles.barGroup}>
          <Text style={chartStyles.barValue}>{bad}</Text>
          <View style={chartStyles.barTrack}>
            <View style={[chartStyles.barFill, { height: `${badPct}%` as any, backgroundColor: '#E5624A' }]} />
          </View>
          <View style={[chartStyles.dot, { backgroundColor: '#E5624A' }]} />
          <Text style={chartStyles.barLabel}>Bad</Text>
        </View>
      </View>

      <View style={chartStyles.track}>
        <View style={[chartStyles.trackFill, { flex: goodPct, backgroundColor: '#3DB87C' }]} />
        <View style={[chartStyles.trackFill, { flex: badPct, backgroundColor: '#E5624A' }]} />
      </View>
      <View style={chartStyles.trackLabels}>
        <Text style={[chartStyles.trackLabel, { color: '#3DB87C' }]}>{goodPct}% good</Text>
        <Text style={[chartStyles.trackLabel, { color: '#E5624A' }]}>{badPct}% bad</Text>
      </View>
    </View>
  );
}

 function MiniEmotionBar({ analysis }: { analysis: DiaryEntry['emotionAnalysis'] }) {
  if (!analysis) return null;
  const { positivePercentage, negativePercentage } = analysis;

  return (
    <View style={{ marginLeft: 8, flex: 1, maxWidth: 60 }}>
      <View
        style={{
          flexDirection: 'row',
          height: 5,
          borderRadius: 3,
          overflow: 'hidden',
          backgroundColor: '#EEE',
        }}
      >
        <View style={{ flex: positivePercentage || 0.01, backgroundColor: '#3DB87C' }} />
        <View style={{ flex: negativePercentage || 0.01, backgroundColor: '#E5624A' }} />
      </View>
      <Text style={{ fontSize: 9, color: '#9EA5B0', marginTop: 2 }}>
        {Math.round(positivePercentage)}% good
      </Text>
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
  const [expanded, setExpanded] = useState(false);
  const isGood = entry.mood === 'good';
  const isToday = entry.date === todayDateString();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(v => !v)}
      style={cardStyles.wrapper}
    >
      <View style={cardStyles.row}>
        <View style={[cardStyles.moodDot, { backgroundColor: isGood ? '#3DB87C' : '#E5624A' }]} />
        <View style={cardStyles.meta}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={cardStyles.date}>{formatDisplayDate(entry.date)}</Text>
            <MiniEmotionBar analysis={entry.emotionAnalysis} />
          </View>
          <View style={[cardStyles.pill, { backgroundColor: isGood ? '#EBF8F2' : '#FEF0ED' }]}>
            <Text style={[cardStyles.pillText, { color: isGood ? '#1B7A50' : '#B03D2A' }]}>
              {isGood ? 'Good day' : 'Tough day'}
            </Text>
          </View>
        </View>

        {isToday && (
          <View style={{ flexDirection: 'row', gap: 12, marginRight: 8 }}>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={(e) => {
                e.stopPropagation();
                onEdit(entry);
              }}
            >
              <Ionicons name="pencil-outline" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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

      {expanded && (
        <Text style={cardStyles.content}>{entry.content}</Text>
      )}
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
  const [mood, setMood] = useState<'good' | 'bad'>(initialMood || 'good');
  const [content, setContent] = useState(initialContent || '');

  useEffect(() => {
    if (visible) {
      setMood(initialMood || 'good');
      setContent(initialContent || '');
    }
  }, [visible, initialMood, initialContent]);

  const dateLabel = formatDisplayDate(todayDateString());

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
            <Text style={modalStyles.title}>{mode === 'add' ? 'New Entry' : 'Edit Entry'}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
              <Text style={[modalStyles.moodBtnText, mood === 'good' && { color: '#1B7A50' }]}>
                😊  Good day
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.moodBtn, mood === 'bad' && modalStyles.moodBtnActiveBad]}
              onPress={() => setMood('bad')}
            >
              <Text style={[modalStyles.moodBtnText, mood === 'bad' && { color: '#B03D2A' }]}>
                😔  Tough day
              </Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={modalStyles.textArea}
            multiline
            placeholder="Write about your day…"
            placeholderTextColor="#C4C9D0"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          <View style={modalStyles.actions}>
            <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
              <Text style={modalStyles.cancelText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.saveBtn, !content.trim() && modalStyles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={!content.trim()}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" style={{ marginRight: 6 }} />
              <Text style={modalStyles.saveText}>{mode === 'add' ? 'Save Entry' : 'Update Entry'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const fetchDiaries = useCallback(async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await ngrokFetch(`${BASE_URL}/api/diary/diaries/${userId}`);
      const data = await response.json();

      if (response.ok) {
        const mapped: DiaryEntry[] = (data.diaries || []).map((d: any) => ({
          id: d._id,
          date: d.date,
          mood: d.mood,
          content: d.content,
          emotionAnalysis: d.emotionAnalysis,
        }));
        setEntries(mapped);
      } else {
        Alert.alert("Error", data.message || "Failed to load diaries");
      }
    } catch (error) {
      console.log("Fetch diaries error:", error);
      Alert.alert("Error", "Failed to load diaries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

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
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const response = await ngrokFetch(`${BASE_URL}/api/diary/diary-add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          date: todayDateString(),
          mood,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to save entry");
        return;
      }

      fetchDiaries();
    } catch (error) {
      console.log("Add diary error:", error);
      Alert.alert("Error", "Failed to save entry");
    }
  };

  const handleEdit = async (diaryId: string, mood: 'good' | 'bad', content: string) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      const response = await ngrokFetch(
        `${BASE_URL}/api/diary/diaries/${userId}/${diaryId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, content }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message || "Failed to update entry");
        return;
      }

      setEntries((prev) =>
        prev.map((e) => (e.id === diaryId ? { ...e, mood, content } : e))
      );
    } catch (error) {
      console.log("Edit diary error:", error);
      Alert.alert("Error", "Failed to update entry");
    }
  };

  const handleDelete = (entry: DiaryEntry) => {
    Alert.alert(
      "Delete entry",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const userId = await AsyncStorage.getItem("userId");
              if (!userId) return;

              const response = await ngrokFetch(
                `${BASE_URL}/api/diary/diaries/${userId}/${entry.id}`,
                { method: "DELETE" }
              );

              const data = await response.json();

              if (!response.ok) {
                Alert.alert("Error", data.message || "Failed to delete entry");
                return;
              }

              setEntries((prev) => prev.filter((e) => e.id !== entry.id));
            } catch (error) {
              console.log("Delete diary error:", error);
              Alert.alert("Error", "Failed to delete entry");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={screenStyles.root}>
      <View style={screenStyles.sticky}>
        <View style={screenStyles.header}>
          <View>
            <Text style={screenStyles.pageTitle}>My Diary</Text>
          </View>
        </View>
        <MoodChart entries={entries} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#3DB87C" />
        </View>
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={e => e.id}
          renderItem={({ item }) => (
            <EntryCard entry={item} onEdit={openEditModal} onDelete={handleDelete} />
          )}
          contentContainerStyle={screenStyles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={<Text style={screenStyles.sectionLabel}>All Entries</Text>}
          ListEmptyComponent={
            <View style={screenStyles.empty}>
              <Ionicons name="book-outline" size={40} color="#D1D5DB" />
              <Text style={screenStyles.emptyText}>No entries yet.{'\n'}Tap + to write your first.</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={screenStyles.fab}
        onPress={openAddModal}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

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