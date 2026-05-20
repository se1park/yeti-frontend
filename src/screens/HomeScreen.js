import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Plus, Search, Sparkles } from 'lucide-react-native';
import { Card, Pill, Screen, SectionTitle } from '../components/ui';
import { BLUE, INK, MUTED } from '../data/yetiData';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

function pad(value) {
  return String(value).padStart(2, '0');
}

function getDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getMonthLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function getDayLabel(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${weekDays[date.getDay()]}요일`;
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  return Array.from({ length: 42 }, (_, index) => {
    const dayOffset = index - firstDay + 1;
    const date = new Date(year, month, dayOffset);

    return {
      date,
      day: dayOffset < 1 ? prevMonthDays + dayOffset : dayOffset > daysInMonth ? dayOffset - daysInMonth : dayOffset,
      outside: dayOffset < 1 || dayOffset > daysInMonth,
      key: getDateKey(date),
    };
  });
}

function formatTime(value) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 5);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeSchedule(item, index) {
  const completed = Boolean(item.completed || item.status === 'COMPLETED');

  return {
    id: item.scheduleId || item.id || `${item.title}-${index}`,
    title: item.title || '제목 없는 일정',
    meta: [item.category, item.location].filter(Boolean).join(' · ') || item.meta || '일정',
    time: item.time || formatTime(item.startAt),
    end: item.end || formatTime(item.endAt),
    color: completed ? '#cbd5e1' : item.color || [BLUE, '#0fbf73', '#d946ef', '#fb923c'][index % 4],
    completed,
    statusLabel: completed ? '완료' : '예정',
  };
}

export function HomeScreen({ apiError, goTo, schedules }) {
  const today = useMemo(() => new Date(2026, 4, 20), []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(2026, 4, 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedKey = getDateKey(selectedDate);
  const todayKey = getDateKey(today);
  const selectedLabel = getDayLabel(selectedDate);
  const displaySchedules = (schedules || []).map(normalizeSchedule);
  const markedDayKeys = useMemo(() => new Set((schedules || []).map((item) => {
    const date = new Date(item.startAt);
    return Number.isNaN(date.getTime()) ? '' : getDateKey(date);
  }).filter(Boolean)), [schedules]);

  const moveMonth = (amount) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
  };

  const selectDay = (item) => {
    setSelectedDate(item.date);
    if (item.outside) {
      setVisibleMonth(new Date(item.date.getFullYear(), item.date.getMonth(), 1));
    }
  };

  return (
    <Screen noHeader>
      <View style={styles.appHeader}>
        <View>
          <Text style={styles.eyebrow}>오늘의 예티</Text>
          <Text style={styles.brand}>{selectedLabel}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable style={styles.iconButton}>
            <Search color={INK} size={18} strokeWidth={2.3} />
          </Pressable>
          <Pressable onPress={() => goTo('notices')} style={styles.iconButton}>
            <Bell color={INK} size={18} strokeWidth={2.3} />
          </Pressable>
        </View>
      </View>
      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

      <Card style={styles.aiCard}>
        <View style={styles.aiIcon}>
          <Sparkles color="#ffffff" size={18} strokeWidth={2.5} />
        </View>
        <Text style={styles.aiTitle}>말로 적으면 일정이 정리돼요</Text>
        <Text style={styles.aiCopy}>“내일 오후 2시 지민이랑 강남에서 회의”처럼 입력해보세요.</Text>
        <View style={styles.createActions}>
          <Pressable onPress={() => goTo('ai')} style={styles.aiButton}>
            <Plus color="#ffffff" size={16} strokeWidth={2.5} />
            <Text style={styles.aiButtonText}>AI로 일정 만들기</Text>
          </Pressable>
          <Pressable onPress={() => goTo('scheduleEdit')} style={styles.manualButton}>
            <Text style={styles.manualButtonText}>직접 입력</Text>
          </Pressable>
        </View>
      </Card>

      <Card style={styles.calendarCard}>
        <View style={styles.monthRow}>
          <View style={styles.monthTitle}>
            <CalendarDays color={BLUE} size={19} strokeWidth={2.3} />
            <Text style={styles.month}>{getMonthLabel(visibleMonth)}</Text>
          </View>
          <View style={styles.monthControls}>
            <Pressable hitSlop={8} onPress={() => moveMonth(-1)} style={styles.monthButton}>
              <ChevronLeft color={MUTED} size={18} strokeWidth={2.4} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => moveMonth(1)} style={styles.monthButton}>
              <ChevronRight color={MUTED} size={18} strokeWidth={2.4} />
            </Pressable>
          </View>
        </View>
        <View style={styles.weekRow}>
          {weekDays.map((day, index) => (
            <Text key={day} style={[styles.week, index === 0 && styles.sunday, index === 6 && styles.saturday]}>{day}</Text>
          ))}
        </View>
        <View style={styles.days}>
          {calendarDays.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => selectDay(item)}
              style={({ pressed }) => [styles.dayCell, pressed && styles.dayPressed]}
            >
              {markedDayKeys.has(item.key) && item.key !== selectedKey ? <View style={styles.eventHalo} /> : null}
              <View style={[
                styles.dayCircle,
                markedDayKeys.has(item.key) && item.key !== selectedKey && styles.eventCircle,
                item.key === selectedKey && styles.selectedCircle,
                item.key === todayKey && item.key !== selectedKey && styles.todayOutline,
              ]}>
                <Text style={[
                  styles.dayText,
                  item.outside && styles.outsideDayText,
                  item.key === selectedKey && styles.selectedDayText,
                ]}>
                  {item.day}
                </Text>
              </View>
              {markedDayKeys.has(item.key) ? <View style={[styles.eventMark, item.key === selectedKey && styles.selectedEventMark]} /> : null}
            </Pressable>
          ))}
        </View>
      </Card>

      <SectionTitle right="전체 보기">{selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() ? '오늘 일정' : '선택한 날짜 일정'}</SectionTitle>
      {displaySchedules.length ? (
        displaySchedules.map((item) => (
          <Pressable key={item.id || item.title} onPress={() => goTo('schedule')}>
            <Card style={styles.scheduleRow}>
              <View style={styles.timeBlock}>
                <Clock3 color={MUTED} size={14} strokeWidth={2.3} />
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <View style={[styles.scheduleBar, { backgroundColor: item.color }]} />
              <View style={styles.scheduleText}>
                <View style={styles.scheduleTitleRow}>
                  <Text numberOfLines={1} style={styles.scheduleTitle}>{item.title}</Text>
                  <Pill tone={item.completed ? 'green' : 'gray'}>{item.statusLabel}</Pill>
                </View>
                <View style={styles.metaRow}>
                  <MapPin color={MUTED} size={13} strokeWidth={2.2} />
                  <Text numberOfLines={1} style={styles.scheduleMeta}>{item.meta}</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>등록된 일정이 없습니다</Text>
          <Text style={styles.emptyText}>AI로 일정을 만들거나 백엔드에 저장된 일정이 있으면 여기에 표시돼요.</Text>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  errorText: {
    color: '#f04454',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
  },
  eyebrow: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 5,
  },
  brand: {
    color: INK,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e8ebf0',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  aiCard: {
    backgroundColor: INK,
    borderColor: INK,
    marginBottom: 14,
  },
  aiIcon: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 14,
    height: 34,
    justifyContent: 'center',
    marginBottom: 12,
    width: 34,
  },
  aiTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  aiCopy: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 7,
  },
  aiButton: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  createActions: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  aiButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  manualButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  manualButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  calendarCard: {
    paddingBottom: 14,
  },
  monthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthTitle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  month: {
    color: INK,
    fontSize: 17,
    fontWeight: '900',
  },
  monthControls: {
    alignItems: 'center',
    backgroundColor: '#f3f5f8',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  monthButton: {
    alignItems: 'center',
    borderRadius: 16,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 10,
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
    height: 38,
    justifyContent: 'center',
    width: `${100 / 7}%`,
  },
  dayPressed: {
    opacity: 0.72,
  },
  dayCircle: {
    alignItems: 'center',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    width: 30,
    zIndex: 1,
  },
  eventHalo: {
    backgroundColor: '#e8f1ff',
    borderRadius: 17,
    height: 34,
    position: 'absolute',
    top: 0,
    width: 34,
  },
  eventCircle: {
    backgroundColor: '#f3f7ff',
    borderColor: '#b9d0ff',
    borderWidth: 1,
  },
  selectedCircle: {
    backgroundColor: BLUE,
  },
  todayOutline: {
    borderColor: BLUE,
    borderWidth: 1.5,
  },
  dayText: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '800',
  },
  outsideDayText: {
    color: '#c4cad4',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  eventMark: {
    backgroundColor: BLUE,
    borderRadius: 3,
    bottom: 1,
    height: 5,
    position: 'absolute',
    width: 18,
  },
  selectedEventMark: {
    backgroundColor: '#ffffff',
    bottom: 1,
  },
  scheduleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
  },
  timeBlock: {
    alignItems: 'center',
    gap: 4,
    width: 48,
  },
  time: {
    color: INK,
    fontSize: 13,
    fontWeight: '900',
  },
  scheduleBar: {
    borderRadius: 2,
    height: 42,
    width: 4,
  },
  scheduleText: {
    flex: 1,
  },
  scheduleTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  scheduleTitle: {
    color: INK,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 5,
  },
  scheduleMeta: {
    color: MUTED,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    color: INK,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
  },
});
