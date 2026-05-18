import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Pill, Screen, SectionTitle } from '../components/ui';
import { BLUE, INK, MUTED, calendarDays, schedules } from '../data/yetiData';

export function HomeScreen({ goTo }) {
  return (
    <Screen noHeader>
      <View style={styles.appHeader}>
        <Text style={styles.brand}>예티<Text style={styles.dot}>.</Text></Text>
        <View style={styles.headerIcons}>
          <Text style={styles.icon}>⌕</Text>
          <Pressable onPress={() => goTo('notices')}>
            <Text style={styles.icon}>♧</Text>
          </Pressable>
        </View>
      </View>

      <Card style={styles.calendarCard}>
        <View style={styles.monthRow}>
          <Text style={styles.month}>2026년 5월⌄</Text>
          <View style={styles.chevrons}>
            <Text style={styles.chevron}>‹</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
        </View>
        <View style={styles.weekRow}>
          {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
            <Text key={day} style={[styles.week, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{day}</Text>
          ))}
        </View>
        <View style={styles.days}>
          {calendarDays.map((day) => (
            <View key={day} style={styles.dayCell}>
              <View style={[styles.dayCircle, day === 18 && styles.todayCircle]}>
                <Text style={[styles.dayText, day === 18 && styles.todayText]}>{day}</Text>
              </View>
              {[5, 8, 12, 14, 18, 19, 21, 24, 27, 29].includes(day) ? (
                <View style={[styles.dot, day % 3 === 0 && styles.orangeDot, day % 4 === 0 && styles.purpleDot]} />
              ) : null}
            </View>
          ))}
        </View>
      </Card>

      <SectionTitle right="일정 4개">5월 18일 (월) <Pill style={styles.inlinePill}>오늘</Pill></SectionTitle>
      {schedules.map((item) => (
        <Pressable key={item.title} onPress={() => goTo('schedule')}>
          <Card style={styles.scheduleRow}>
            <View style={[styles.scheduleIcon, { backgroundColor: `${item.color}18` }]}>
              <Text style={[styles.scheduleIconText, { color: item.color }]}>{item.icon}</Text>
            </View>
            <View style={styles.scheduleText}>
              <Text style={styles.scheduleTitle}>{item.title}</Text>
              <Text style={styles.scheduleMeta}>{item.meta}</Text>
            </View>
            <View>
              <Text style={styles.time}>{item.time}</Text>
              <Text style={styles.end}>~{item.end}</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 2,
  },
  brand: {
    color: INK,
    fontSize: 20,
    fontWeight: '900',
  },
  dot: {
    color: BLUE,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 18,
  },
  icon: {
    color: INK,
    fontSize: 22,
  },
  calendarCard: {
    borderWidth: 0,
    shadowOpacity: 0,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  month: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
  },
  chevrons: {
    flexDirection: 'row',
    gap: 18,
  },
  chevron: {
    color: '#667085',
    fontSize: 20,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 9,
  },
  week: {
    color: MUTED,
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
  },
  sunday: {
    color: '#ef4444',
  },
  saturday: {
    color: BLUE,
  },
  days: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    alignItems: 'center',
    height: 32,
    width: `${100 / 7}%`,
  },
  dayCircle: {
    alignItems: 'center',
    borderRadius: 14,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  todayCircle: {
    backgroundColor: BLUE,
  },
  dayText: {
    color: '#475467',
    fontSize: 12,
    fontWeight: '700',
  },
  todayText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  orangeDot: {
    backgroundColor: '#f97316',
  },
  purpleDot: {
    backgroundColor: '#9333ea',
  },
  inlinePill: {
    marginLeft: 4,
  },
  scheduleRow: {
    alignItems: 'center',
    borderWidth: 0,
    flexDirection: 'row',
    gap: 12,
    shadowOpacity: 0,
  },
  scheduleIcon: {
    alignItems: 'center',
    borderRadius: 9,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  scheduleIconText: {
    fontSize: 16,
    fontWeight: '900',
  },
  scheduleText: {
    flex: 1,
  },
  scheduleTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  scheduleMeta: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  time: {
    color: INK,
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'right',
  },
  end: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    textAlign: 'right',
  },
});
