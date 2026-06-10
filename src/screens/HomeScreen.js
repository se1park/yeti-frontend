import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, CalendarDays, ChevronLeft, ChevronRight, Clock3, MapPin, Plus, Sparkles } from 'lucide-react-native';
import { Card, Pill, Screen, SectionTitle } from '../components/ui';
import { BLUE, INK, MUTED } from '../data/yetiData';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

const dayCodeToIndex = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

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

function getScheduleStartAt(item) {
  return item?.startAt || item?.start_at || item?.start || item?.startedAt || item?.startsAt || item?.data?.startAt || item?.result?.startAt;
}

function getScheduleEndAt(item) {
  return item?.endAt || item?.end_at || item?.end || item?.endedAt || item?.endsAt || item?.data?.endAt || item?.result?.endAt;
}

function getRecurrenceRule(item) {
  const recurrence = item?.recurrence;
  if (typeof recurrence === 'string') return recurrence;
  return item?.recurrenceRule
    || item?.recurrence_rule
    || item?.rrule
    || item?.repeatRule
    || item?.repeat_rule
    || recurrence?.rule
    || recurrence?.rrule
    || '';
}

function isRecurring(item, rule) {
  const recurrence = item?.recurrence;
  return Boolean(
    item?.recurring
    || item?.isRecurring
    || item?.repeat
    || item?.repeating
    || rule
    || recurrence?.frequency
    || recurrence?.type
  );
}

function getWeeklyDays(item) {
  const startDate = new Date(getScheduleStartAt(item));
  const fallbackDay = Number.isNaN(startDate.getTime()) ? null : startDate.getDay();
  const rule = String(getRecurrenceRule(item)).toUpperCase();
  const byDay = rule.match(/BYDAY=([^;]+)/)?.[1];

  if (!byDay) return fallbackDay === null ? [] : [fallbackDay];

  const days = byDay
    .split(',')
    .map((value) => value.replace(/^[+-]?\d+/, '').trim())
    .map((value) => dayCodeToIndex[value])
    .filter((value) => value !== undefined);

  return days.length ? days : fallbackDay === null ? [] : [fallbackDay];
}

function scheduleOccursOnDate(item, date) {
  const startAt = getScheduleStartAt(item);
  const startDate = new Date(startAt);
  if (Number.isNaN(startDate.getTime())) return false;
  if (getDateKey(startDate) === getDateKey(date)) return true;

  const rule = String(getRecurrenceRule(item)).toUpperCase();
  const weekly = isRecurring(item, rule) && (!rule || rule.includes('FREQ=WEEKLY') || rule.includes('WEEKLY'));
  if (!weekly) return false;

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const first = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  if (target.getTime() < first.getTime()) return false;

  return getWeeklyDays(item).includes(date.getDay());
}

function shiftOccurrenceToDate(item, date) {
  const startDate = new Date(getScheduleStartAt(item));
  const endDate = new Date(getScheduleEndAt(item));
  if (Number.isNaN(startDate.getTime())) return item;

  const nextStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startDate.getHours(), startDate.getMinutes(), startDate.getSeconds());
  const duration = Number.isNaN(endDate.getTime()) ? 60 * 60 * 1000 : Math.max(0, endDate.getTime() - startDate.getTime());
  const nextEnd = new Date(nextStart.getTime() + duration);

  return {
    ...item,
    endAt: nextEnd.toISOString(),
    occurrenceDate: getDateKey(date),
    startAt: nextStart.toISOString(),
  };
}

function normalizeSchedule(item, index) {
  const completed = Boolean(item.completed || item.status === 'COMPLETED');
  const startAt = getScheduleStartAt(item);
  const endAt = getScheduleEndAt(item);

  return {
    ...item,
    id: item.scheduleId || item.id || `${item.title}-${index}`,
    title: item.title || '제목 없는 일정',
    meta: [item.category, item.location].filter(Boolean).join(' · ') || item.meta || '일정',
    time: item.time || formatTime(startAt),
    end: item.end || formatTime(endAt),
    color: completed ? '#cbd5e1' : item.color || [BLUE, '#0fbf73', '#d946ef', '#fb923c'][index % 4],
    completed,
    statusLabel: completed ? '완료' : '예정',
  };
}

export function HomeScreen({ apiError, goTo, notificationCount = 0, onNewSchedule, onOpenSchedule, schedules }) {
  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(today);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
  const selectedKey = getDateKey(selectedDate);
  const todayKey = getDateKey(today);
  const selectedLabel = getDayLabel(selectedDate);
  const displaySchedules = useMemo(() => (schedules || [])
    .filter((item) => scheduleOccursOnDate(item, selectedDate))
    .map((item, index) => normalizeSchedule(shiftOccurrenceToDate(item, selectedDate), index)), [schedules, selectedKey]);
  const markedDayKeys = useMemo(() => new Set(calendarDays
    .filter((day) => (schedules || []).some((item) => scheduleOccursOnDate(item, day.date)))
    .map((day) => day.key)), [calendarDays, schedules]);

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
          <Pressable onPress={() => goTo('notices')} style={styles.iconButton}>
            <Bell color={INK} size={18} strokeWidth={2.3} />
            {notificationCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>
      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}

      <View style={styles.dashboardGrid}>
        <Card style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Sparkles color="#ffffff" size={18} strokeWidth={2.5} />
          </View>
          <Text style={styles.aiTitle}>말로 적으면 일정이 정리돼요</Text>
          <Text style={styles.aiCopy}>“내일 오후 2시 @username 회의”처럼 입력해보세요.</Text>
          <View style={styles.createActions}>
            <Pressable onPress={() => goTo('ai')} style={styles.aiButton}>
              <Plus color="#ffffff" size={16} strokeWidth={2.5} />
              <Text style={styles.aiButtonText}>AI로 일정 만들기</Text>
            </Pressable>
            <Pressable onPress={onNewSchedule} style={styles.manualButton}>
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
      </View>

      <SectionTitle right="전체 보기">{selectedDate.getDate() === today.getDate() && selectedDate.getMonth() === today.getMonth() && selectedDate.getFullYear() === today.getFullYear() ? '오늘 일정' : '선택한 날짜 일정'}</SectionTitle>
      {displaySchedules.length ? (
        displaySchedules.map((item) => (
          <Pressable key={item.id || item.title} onPress={() => onOpenSchedule?.(item)}>
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
  dashboardGrid: {
    alignItems: 'stretch',
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 18 : 0,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e8ebf0',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    width: 36,
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: '#f04454',
    borderColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1.5,
    height: 15,
    justifyContent: 'center',
    minWidth: 15,
    paddingHorizontal: 3,
    position: 'absolute',
    right: -2,
    top: -3,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    lineHeight: 10,
  },
  aiCard: {
    backgroundColor: INK,
    borderColor: INK,
    flex: Platform.OS === 'web' ? 0.85 : undefined,
    justifyContent: 'space-between',
    marginBottom: 14,
    minWidth: Platform.OS === 'web' ? 310 : undefined,
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
    flex: Platform.OS === 'web' ? 1.35 : undefined,
    paddingBottom: 14,
    minWidth: Platform.OS === 'web' ? 440 : undefined,
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
