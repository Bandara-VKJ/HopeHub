import { StyleSheet } from 'react-native';

export const CHART_HEIGHT = 120;


export const dynamicStyles = {
  /** @param {number} height @param {string} color @returns {import('react-native').ViewStyle} */
  bar: (height, color) => ({ height, backgroundColor: color }),

  /** @param {string} color @returns {import('react-native').ViewStyle} */
  dot: (color) => ({ backgroundColor: color }),
};

export const weeklyEmotionStyles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1D23',
  },
  subtitle: {
    fontSize: 12,
    color: '#9EA5B0',
    marginTop: 2,
    marginBottom: 14,
  },
  loading: {
    paddingVertical: 36,
  },
  message: {
    fontSize: 13,
    color: '#9EA5B0',
    textAlign: 'center',
    paddingVertical: 28,
  },

  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 18,
    height: 24,
    marginBottom: 4,
  },
  barArea: {
    width: 28,
    height: CHART_HEIGHT,
    borderRadius: 8,
    backgroundColor: '#F3F5F7',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  percent: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
  },
  dayLabel: {
    fontSize: 11,
    color: '#9EA5B0',
    fontWeight: '500',
    marginTop: 2,
  },
  dayLabelToday: {
    color: '#1A1D23',
    fontWeight: '800',
  },

  // "Emotion guide": every emotion with its colour, emoji and name, in two columns
  key: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F5F7',
  },
  keyTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#9EA5B0',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  keyItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  keyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  keyEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  keyText: {
    fontSize: 13,
    color: '#4B5563',
    textTransform: 'capitalize',
  },
});