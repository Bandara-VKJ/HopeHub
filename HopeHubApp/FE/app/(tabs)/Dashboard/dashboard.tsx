import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chartStyles, cardStyles, modalStyles, screenStyles } from './dashboardStyles';


interface DiaryEntry {
  id: string;
  date: string;
  isoDate: string;
  mood: 'good' | 'bad';
  content: string;
}

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const todayLabel = () => formatDate(new Date());
const todayISO = () => new Date().toISOString();

const seed: DiaryEntry[] = [
  { id: '1', date: 'Mon, 5 May 2026', isoDate: '2026-05-05T09:00:00.000Z', mood: 'good', content: 'Felt really motivated today. Completed all my tasks and went for a walk in the evening. Small victories matter.' },
  { id: '2', date: 'Tue, 6 May 2026', isoDate: '2026-05-06T09:00:00.000Z', mood: 'bad', content: 'Struggled with cravings in the afternoon. Called my sponsor and it helped a bit, but it was a tough day overall.' },
  { id: '3', date: 'Wed, 7 May 2026', isoDate: '2026-05-07T09:00:00.000Z', mood: 'good', content: 'Group session was uplifting. Shared my progress and received warm encouragement. Grateful for the support network.' },
  { id: '4', date: 'Thu, 8 May 2026', isoDate: '2026-05-08T09:00:00.000Z', mood: 'bad', content: "Didn't sleep well. Anxiety crept in around 3 AM. Journaling helped me process the feelings before the morning." },
  { id: '5', date: 'Fri, 9 May 2026', isoDate: '2026-05-09T09:00:00.000Z', mood: 'good', content: 'Cooked a healthy meal and called mum. Stress was low. Proud that I stuck to my routine even on a Friday night.' },
  { id: '6', date: 'Sat, 10 May 2026', isoDate: '2026-05-10T09:00:00.000Z', mood: 'good', content: 'Morning meditation + a long walk. Nature recharges me. Feeling hopeful about next week.' },
];


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


function EntryCard({ entry }: { entry: DiaryEntry }) {
  const [expanded, setExpanded] = useState(false);
  const isGood = entry.mood === 'good';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => setExpanded(v => !v)}
      style={cardStyles.wrapper}
    >
      <View style={cardStyles.row}>
        <View style={[cardStyles.moodDot, { backgroundColor: isGood ? '#3DB87C' : '#E5624A' }]} />
        <View style={cardStyles.meta}>
          <Text style={cardStyles.date}>{entry.date}</Text>
          <View style={[cardStyles.pill, { backgroundColor: isGood ? '#EBF8F2' : '#FEF0ED' }]}>
            <Text style={[cardStyles.pillText, { color: isGood ? '#1B7A50' : '#B03D2A' }]}>
              {isGood ? 'Good day' : 'Tough day'}
            </Text>
          </View>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color="#9EA5B0" />
      </View>

      {expanded && (
        <Text style={cardStyles.content}>{entry.content}</Text>
      )}
    </TouchableOpacity>
  );
}


function NewEntryModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DiaryEntry, 'id'>) => void;
}) {
  const [mood, setMood] = useState<'good' | 'bad'>('good');
  const [content, setContent] = useState('');
  const dateLabel = todayLabel();

  const handleSave = () => {
    if (!content.trim()) return;
    onSave({ date: dateLabel, isoDate: todayISO(), mood, content: content.trim() });
    setContent('');
    setMood('good');
    onClose();
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
            <Text style={modalStyles.title}>New Entry</Text>
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
              <Text style={modalStyles.saveText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


export default function DiaryScreen() {
  const [entries, setEntries] = useState<DiaryEntry[]>(seed);
  const [modalOpen, setModalOpen] = useState(false);

  const sorted = [...entries].sort(
    (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
  );

  const handleSave = (entry: Omit<DiaryEntry, 'id'>) => {
    setEntries(prev => [{ id: Date.now().toString(), ...entry }, ...prev]);
  };

  return (
    <View style={screenStyles.root}>
      {/* Sticky header + chart */}
      <View style={screenStyles.sticky}>
        <View style={screenStyles.header}>
          <View>
            <Text style={screenStyles.pageTitle}>My Diary</Text>
          </View>
        </View>
        <MoodChart entries={entries} />
      </View>

      {/* Entry list */}
      <FlatList
        data={sorted}
        keyExtractor={e => e.id}
        renderItem={({ item }) => <EntryCard entry={item} />}
        contentContainerStyle={screenStyles.list}
        ListHeaderComponent={<Text style={screenStyles.sectionLabel}>All Entries</Text>}
        ListEmptyComponent={
          <View style={screenStyles.empty}>
            <Ionicons name="book-outline" size={40} color="#D1D5DB" />
            <Text style={screenStyles.emptyText}>No entries yet.{'\n'}Tap + to write your first.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={screenStyles.fab}
        onPress={() => setModalOpen(true)}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modal */}
      <NewEntryModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </View>
  );
}