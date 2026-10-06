import { StyleSheet } from 'react-native';

export const COLORS = {
  good: '#3DB87C',
  bad: '#E5624A',
  goodSoft: '#EBF8F2',
  badSoft: '#FEF0ED',
  goodText: '#1B7A50',
  badText: '#B03D2A',
};

export const dynamicStyles = {
  /** @param {string} color @returns {import('react-native').ViewStyle} */
  bg: (color) => ({ backgroundColor: color }),

  /** @param {string} color @returns {import('react-native').TextStyle} */
  textColor: (color) => ({ color }),

  /** @param {string} color @returns {import('react-native').ViewStyle} */
  tint: (color) => ({ backgroundColor: `${color}1A` }),

  /** @param {number} pct @param {string} color @returns {import('react-native').ViewStyle} */
  barFill: (pct, color) => ({
    height: /** @type {import('react-native').DimensionValue} */ (`${pct}%`),
    backgroundColor: color,
  }),

  /** @param {number} flex @param {string} color @returns {import('react-native').ViewStyle} */
  flexFill: (flex, color) => ({ flex, backgroundColor: color }),
};

export const chartStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF0F3',
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1D23',
    letterSpacing: 0.2,
  },
  sub: {
    fontSize: 12,
    color: '#9EA5B0',
    marginTop: 2,
    marginBottom: 14,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: 14,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1D23',
    marginBottom: 4,
  },
  barTrack: {
    width: 36,
    height: 48,
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
    minHeight: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#EEF0F3',
    marginHorizontal: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  track: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#F3F5F7',
  },
  trackFill: {
    height: '100%',
  },
  trackLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  trackLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export const cardStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  meta: {
    flex: 1,
    gap: 4,
  },
  date: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1D23',
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginRight: 8,
  },
  quickTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    gap: 3,
  },
  quickTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  content: {
    marginTop: 12,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    borderTopWidth: 1,
    borderTopColor: '#F3F5F7',
    paddingTop: 12,
  },
});

export const badgeStyles = StyleSheet.create({
  container: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 11,
    marginRight: 3,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDE1E7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1D23',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F5F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  moodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  moodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  moodBtnActiveGood: {
    borderColor: '#3DB87C',
    backgroundColor: '#EBF8F2',
  },
  moodBtnActiveBad: {
    borderColor: '#E5624A',
    backgroundColor: '#FEF0ED',
  },
  moodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9EA5B0',
  },
  moodTextGood: {
    color: '#1B7A50',
  },
  moodTextBad: {
    color: '#B03D2A',
  },
  textArea: {
    height: 160,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#1A1D23',
    lineHeight: 22,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionsTop: {
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#3B82C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: '#B0C4D8',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnIcon: {
    marginRight: 6,
  },
});

export const nudgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF8F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
  },
  body: {
    flex: 1,
  },
  text: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1B7A50',
    fontWeight: '500',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1B7A50',
  },
});

export const choiceStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconGreen: {
    backgroundColor: '#EBF8F2',
  },
  iconIndigo: {
    backgroundColor: '#EEF2FF',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  sub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});


export const quizStyles = StyleSheet.create({
  scrollQuestions: {
    maxHeight: 400,
  },
  scrollResult: {
    maxHeight: 460,
  },
  question: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  questionHint: {
    fontSize: 12,
    color: '#9EA5B0',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    borderColor: '#3DB87C',
    backgroundColor: '#EBF8F2',
  },
  chipText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#1B7A50',
    fontWeight: '700',
  },
  chipSub: {
    fontSize: 11,
    color: '#9EA5B0',
    marginTop: 1,
  },
  resultTop: {
    alignItems: 'center',
    marginBottom: 8,
  },
  resultEmoji: {
    fontSize: 56,
  },
  resultName: {
    fontSize: 24,
    fontWeight: '800',
    textTransform: 'capitalize',
    marginTop: 6,
  },
  resultSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  estimateNote: {
    fontSize: 11,
    color: '#9EA5B0',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
});

export const screenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  sticky: {
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
  },
  appName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: '#3B82C4',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1D23',
    letterSpacing: -0.3,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF0ED',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B03D2A',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingTop: 10,
    paddingBottom: 100,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#9EA5B0',
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9EA5B0',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2CA6A4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82C4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});