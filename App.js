import { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useFonts } from 'expo-font';
import { AppFrame, useHiddenWebScrollbars } from './src/components/AppFrame';
import { BottomTabs } from './src/components/BottomTabs';
import { IntroScreen, KakaoConsentScreen, LoginScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen.js';
import { AiInputScreen, AiReviewScreen } from './src/screens/AiScreen';
import { ScheduleScreen } from './src/screens/ScheduleScreen';
import { ChatListScreen, ChatRoomScreen } from './src/screens/ChatScreen';
import { FriendsScreen } from './src/screens/FriendsScreen';
import { FriendProfileScreen } from './src/screens/FriendProfileScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { StudyNoteScreen } from './src/screens/StudyNoteScreen';
import { AdminScreen, NotificationsScreen } from './src/screens/UtilityScreens';
import {
  clearSession,
  completeOnboarding,
  getPlan,
  isAccessTokenExpiring,
  loadSession,
  login,
  logout,
  oauthLogin,
  refresh,
  saveSession,
  signup,
} from './src/api/auth';
import {
  acceptFriendRequest,
  blockUser,
  completeSchedule,
  createChatRoom,
  createSchedule,
  createStudyNote,
  deleteChatMessage,
  deleteFriend,
  deleteSchedule,
  getChatMediaUploadUrl,
  getChatMessages,
  getChatRooms,
  getFriendRequests,
  getFriends,
  getSchedules,
  getSchedule,
  getScheduleInvitations,
  getStudyNotes,
  parseSchedule,
  proposeScheduleAdjust,
  reactToChatMessage,
  rejectFriendRequest,
  respondToInvitation,
  sendFriendRequest,
  summarizeStudyNote,
  updateSchedule,
} from './src/api/yeti';
import {
  ChatSearchScreen,
  ChatSettingsScreen,
  HelpFaqScreen,
  LanguageSettingsScreen,
  NotificationSettingsScreen,
  PrivacySettingsScreen,
  ProfileEditScreen,
  ScheduleEditScreen,
  TermsPrivacyScreen,
  ThemeSettingsScreen,
} from './src/screens/SettingsScreens';

const tabScreens = new Set(['home', 'chat', 'friends', 'my']);
const weekdayPatterns = [
  { code: 'SU', index: 0, label: '일요일', pattern: /(일요일|매주\s*일|일욜)/ },
  { code: 'MO', index: 1, label: '월요일', pattern: /(월요일|매주\s*월|월욜)/ },
  { code: 'TU', index: 2, label: '화요일', pattern: /(화요일|매주\s*화|화욜)/ },
  { code: 'WE', index: 3, label: '수요일', pattern: /(수요일|매주\s*수|수욜)/ },
  { code: 'TH', index: 4, label: '목요일', pattern: /(목요일|매주\s*목|목욜)/ },
  { code: 'FR', index: 5, label: '금요일', pattern: /(금요일|매주\s*금|금욜)/ },
  { code: 'SA', index: 6, label: '토요일', pattern: /(토요일|매주\s*토|토욜)/ },
];

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.list)) return value.list;
  if (Array.isArray(value?.requests)) return value.requests;
  if (Array.isArray(value?.friendRequests)) return value.friendRequests;
  if (Array.isArray(value?.received)) return value.received;
  if (Array.isArray(value?.incoming)) return value.incoming;
  if (value && typeof value === 'object') {
    const nestedArray = Object.values(value).find(Array.isArray);
    if (nestedArray) return nestedArray;
  }
  return [];
}

function unwrapApiValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
  if (value.data && typeof value.data === 'object') return unwrapApiValue(value.data);
  if (value.result && typeof value.result === 'object') return unwrapApiValue(value.result);
  if (value.payload && typeof value.payload === 'object') return unwrapApiValue(value.payload);
  return value;
}

function decodeBase64Url(value) {
  const base64 = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  if (typeof globalThis.atob === 'function') {
    return globalThis.atob(padded);
  }
  return '';
}

function getJwtPayload(token) {
  try {
    const payload = String(token || '').split('.')[1];
    if (!payload) return {};
    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return {};
  }
}

function getSessionUserId(session) {
  return session?.user?.id
    || session?.user?.userId
    || session?.id
    || session?.userId
    || getJwtPayload(session?.accessToken).sub
    || '';
}

function unwrapScheduleValue(value) {
  const item = unwrapApiValue(value);
  if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
  const nested = item.schedule || item.scheduleDto || item.scheduleResponse || item.event;
  if (!nested || typeof nested !== 'object' || Array.isArray(nested)) return item;
  return {
    ...item,
    ...nested,
    participantStatus: item.participantStatus || item.status,
  };
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

function getRecurringFlag(item, recurrenceRule) {
  const recurrence = item?.recurrence;
  return Boolean(
    item?.recurring
    || item?.isRecurring
    || item?.repeat
    || item?.repeating
    || recurrenceRule
    || recurrence?.frequency
    || recurrence?.type
  );
}

function normalizeScheduleParticipants(value) {
  if (!Array.isArray(value)) return [];
  return value.map((participant) => {
    if (typeof participant === 'string') {
      const username = participant.replace(/^@/, '').trim();
      return username ? { username, status: 'PENDING' } : null;
    }
    if (!participant || typeof participant !== 'object') return null;
    return {
      ...participant,
      userId: participant.userId || participant.id,
      username: participant.username || participant.handle?.replace(/^@/, '') || '',
      nickname: participant.nickname || participant.name || participant.username || '',
      profileImageUrl: participant.profileImageUrl || participant.avatarUrl || '',
      status: participant.status || 'PENDING',
    };
  }).filter(Boolean);
}

function normalizeScheduleValue(value) {
  const item = unwrapScheduleValue(value);
  if (!item || typeof item !== 'object') return item;
  const startAt = item.startAt || item.start_at || item.start || item.startedAt || item.startsAt;
  const endAt = item.endAt || item.end_at || item.end || item.endedAt || item.endsAt;
  const recurrenceRule = getRecurrenceRule(item);
  const id = item.id || item.scheduleId;
  return {
    ...item,
    allDay: Boolean(item.allDay),
    completed: Boolean(item.completed || item.status === 'COMPLETED'),
    id,
    owner: Boolean(item.owner),
    participants: normalizeScheduleParticipants(item.participants),
    recurrenceRule,
    recurring: getRecurringFlag(item, recurrenceRule),
    scheduleId: item.scheduleId || id,
    startAt,
    endAt,
    title: item.title || item.name || '제목 없는 일정',
  };
}

function normalizeScheduleList(value) {
  return toArray(value).map(normalizeScheduleValue).filter(Boolean);
}

function normalizeScheduleInvitation(value) {
  const item = unwrapApiValue(value);
  if (!item || typeof item !== 'object') return item;
  return {
    ...item,
    id: item.participantId || item.id || `${item.scheduleId}-${item.ownerId}`,
    participantId: item.participantId || item.userId || item.id,
    scheduleId: item.scheduleId || item.id,
    title: item.scheduleTitle || item.title || '초대받은 일정',
    ownerName: item.ownerNickname || item.ownerUsername || '친구',
    status: item.status || 'PENDING',
  };
}

function normalizeScheduleInvitations(value) {
  return toArray(value).map(normalizeScheduleInvitation).filter(Boolean);
}

function getInvitationStatus(value) {
  return String(value || '').toUpperCase();
}

function isPendingInvitation(value) {
  return ['PENDING', 'INVITED', 'REQUESTED'].includes(getInvitationStatus(value));
}

function isAcceptedInvitation(value) {
  return getInvitationStatus(value) === 'ACCEPTED';
}

function getVisibleSchedulesByInvitations(scheduleList, invitationList) {
  const invitationByScheduleId = new Map((invitationList || [])
    .filter((invitation) => invitation?.scheduleId)
    .map((invitation) => [invitation.scheduleId, invitation]));

  return (scheduleList || []).filter((schedule) => {
    if (schedule?.owner) return true;

    const invitation = invitationByScheduleId.get(schedule?.scheduleId || schedule?.id);
    if (!invitation) return true;

    return isAcceptedInvitation(invitation.status);
  });
}

function getMentionedUsernames(value) {
  return Array.from(new Set(String(value || '')
    .match(/@[A-Za-z0-9_.-]+/g)
    ?.map((item) => item.slice(1))
    .filter(Boolean) || []));
}

function normalizeParticipantUsername(value) {
  const raw = typeof value === 'string'
    ? value
    : value?.username || value?.handle || value?.userName || value?.nickname || '';
  const username = String(raw).trim().replace(/^@/, '');
  if (!username || username === '나' || username.toLowerCase() === 'me') return '';
  return username;
}

function getParsedParticipantUsernames(schedule, input) {
  const parsedParticipants = Array.isArray(schedule?.participants)
    ? schedule.participants.map(normalizeParticipantUsername)
    : [];
  return Array.from(new Set([
    ...parsedParticipants,
    ...getMentionedUsernames(input),
  ].filter(Boolean)));
}

function detectWeeklyWeekday(input) {
  const text = String(input || '').replace(/\s+/g, ' ');
  if (!/(매주|매\s*주|weekly|every week)/i.test(text)) return null;
  return weekdayPatterns.find((day) => day.pattern.test(text)) || null;
}

function moveScheduleToWeekday(schedule, weekday) {
  if (!weekday?.code || !schedule?.startAt) return schedule;

  const start = new Date(schedule.startAt);
  if (Number.isNaN(start.getTime())) return schedule;

  const end = new Date(schedule.endAt);
  const duration = Number.isNaN(end.getTime()) ? 60 * 60 * 1000 : Math.max(0, end.getTime() - start.getTime());
  const daysToAdd = (weekday.index - start.getDay() + 7) % 7 || 7;
  const nextStart = new Date(start);

  if (start.getDay() !== weekday.index) {
    nextStart.setDate(start.getDate() + daysToAdd);
  }

  const nextEnd = new Date(nextStart.getTime() + duration);

  return {
    ...schedule,
    endAt: nextEnd.toISOString(),
    recurrenceLabel: `매주 ${weekday.label}`,
    recurrenceRule: `FREQ=WEEKLY;BYDAY=${weekday.code}`,
    recurring: true,
    startAt: nextStart.toISOString(),
  };
}

function refineParsedScheduleFromInput(schedule, input) {
  const weeklyDay = detectWeeklyWeekday(input);
  if (!weeklyDay) return schedule;
  return moveScheduleToWeekday(schedule, weeklyDay);
}

function getFriendUsername(friend) {
  return friend?.username || friend?.handle?.replace(/^@/, '') || friend?.raw?.username || '';
}

Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.style = [{ fontFamily: 'Pretendard' }, Text.defaultProps.style];
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.style = [{ fontFamily: 'Pretendard' }, TextInput.defaultProps.style];

export default function App() {
  useHiddenWebScrollbars();
  const [fontsLoaded] = useFonts({
    Pretendard: require('./assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Bold': require('./assets/fonts/Pretendard-Bold.otf'),
    'Pretendard-Black': require('./assets/fonts/Pretendard-Black.otf'),
  });

  const [screen, setScreen] = useState('intro');
  const [history, setHistory] = useState([]);
  const [session, setSession] = useState(null);
  const [plan, setPlan] = useState(null);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [apiError, setApiError] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [scheduleInvitations, setScheduleInvitations] = useState([]);
  const [parsedSchedule, setParsedSchedule] = useState(null);
  const [parsedScheduleInput, setParsedScheduleInput] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [studyNotes, setStudyNotes] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [apiBusy, setApiBusy] = useState(false);
  const visibleSchedules = useMemo(
    () => getVisibleSchedulesByInvitations(schedules, scheduleInvitations),
    [schedules, scheduleInvitations],
  );
  const pendingInvitationCount = useMemo(
    () => scheduleInvitations.filter((invitation) => isPendingInvitation(invitation.status)).length,
    [scheduleInvitations],
  );

  useEffect(() => {
    loadSession().then((savedSession) => {
      if (!savedSession?.accessToken) return;
      setSession(savedSession);
      setScreen(savedSession.newUser ? 'onboardingSetup' : 'home');
    });
  }, []);

  const expireSession = useCallback(async () => {
    await clearSession();
    setSession(null);
    setPlan(null);
    setHistory([]);
    setScreen('login');
  }, []);

  const getProtectedToken = useCallback(async () => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    if (!isAccessTokenExpiring(session.accessToken)) {
      return session.accessToken;
    }

    if (!session.refreshToken) {
      await expireSession();
      throw new Error('로그인이 만료되었습니다. 다시 로그인해주세요.');
    }

    try {
      const refreshed = await refresh(session.refreshToken);
      const nextSession = {
        ...session,
        ...refreshed,
        refreshToken: refreshed.refreshToken || session.refreshToken,
        user: {
          ...(session.user || {}),
          ...(refreshed.user || {}),
        },
      };
      await saveSession(nextSession);
      setSession(nextSession);
      return nextSession.accessToken;
    } catch (error) {
      await expireSession();
      throw new Error(error.message || '로그인이 만료되었습니다. 다시 로그인해주세요.');
    }
  }, [expireSession, session]);

  const runWithProtectedToken = useCallback(async (requester) => {
    const token = await getProtectedToken();

    try {
      return await requester(token);
    } catch (error) {
      if (![401, 403].includes(error?.status) || !session?.refreshToken) {
        throw error;
      }

      const refreshed = await refresh(session.refreshToken);
      const nextSession = {
        ...session,
        ...refreshed,
        accessToken: refreshed.accessToken || session.accessToken,
        refreshToken: refreshed.refreshToken || session.refreshToken,
        user: {
          ...(session.user || {}),
          ...(refreshed.user || {}),
        },
      };
      await saveSession(nextSession);
      setSession(nextSession);
      return requester(nextSession.accessToken);
    }
  }, [getProtectedToken, session]);

  const refreshFriendData = useCallback(async () => {
    if (!session?.accessToken || session.newUser) return;

    const [friendResult, requestResult] = await Promise.allSettled([
      runWithProtectedToken((token) => getFriends(token)),
      runWithProtectedToken((token) => getFriendRequests(token)),
    ]);

    if (friendResult.status === 'fulfilled') {
      setFriends(toArray(friendResult.value));
    }

    if (requestResult.status === 'fulfilled') {
      setFriendRequests(toArray(requestResult.value));
    } else {
      setApiError(requestResult.reason?.message || '받은 친구 요청을 불러오지 못했습니다.');
    }
  }, [runWithProtectedToken, session?.accessToken, session?.newUser]);

  useEffect(() => {
    if (!session?.accessToken || session.newUser) return;

    let cancelled = false;
    setApiError('');

    Promise.allSettled([
      runWithProtectedToken((token) => getSchedules(token)),
      runWithProtectedToken((token) => getFriends(token)),
      runWithProtectedToken((token) => getFriendRequests(token)),
      runWithProtectedToken((token) => getScheduleInvitations(token)),
      runWithProtectedToken((token) => getChatRooms(token)),
    ]).then(([scheduleResult, friendResult, requestResult, invitationResult, roomResult]) => {
      if (cancelled) return;

      if (scheduleResult.status === 'fulfilled') {
        setSchedules(normalizeScheduleList(scheduleResult.value));
      }
      if (friendResult.status === 'fulfilled') {
        setFriends(toArray(friendResult.value));
      }
      if (requestResult.status === 'fulfilled') {
        setFriendRequests(toArray(requestResult.value));
      }
      if (invitationResult.status === 'fulfilled') {
        setScheduleInvitations(normalizeScheduleInvitations(invitationResult.value));
      }
      if (roomResult.status === 'fulfilled') {
        setChatRooms(toArray(roomResult.value));
      }

      if (scheduleResult.status === 'rejected') {
        setApiError(scheduleResult.reason?.message || '일정을 불러오지 못했습니다.');
      }
    }).catch((error) => {
      if (!cancelled) {
        setApiError(error.message || '데이터를 불러오지 못했습니다.');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [runWithProtectedToken, session?.accessToken, session?.newUser]);

  useEffect(() => {
    if (screen === 'friends') {
      refreshFriendData();
    }
  }, [refreshFriendData, screen]);

  const goTo = (nextScreen) => {
    if (nextScreen === screen) return;
    setHistory((previous) => [...previous, screen]);
    setScreen(nextScreen);
  };

  const switchTab = (nextScreen) => {
    if (nextScreen === screen) return;
    setHistory([]);
    setScreen(nextScreen);
  };

  const goBack = () => {
    setHistory((previous) => {
      if (!previous.length) {
        setScreen('home');
        return previous;
      }

      const nextScreen = previous[previous.length - 1];
      setScreen(nextScreen);
      return previous.slice(0, -1);
    });
  };

  const acceptSession = async (nextSession) => {
    if (!nextSession?.accessToken) {
      throw new Error('로그인 토큰이 응답에 없습니다. 이메일 로그인으로 다시 진행해주세요.');
    }

    setSession(nextSession);
    await saveSession(nextSession);

    if (nextSession.newUser) {
      setHistory([]);
      setScreen('onboardingSetup');
      return;
    }

    setHistory([]);
    setScreen('home');
  };

  const runAuth = async (action) => {
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');

    try {
      const nextSession = await action();
      await acceptSession(nextSession);
    } catch (error) {
      setAuthError(error.message || '인증 요청에 실패했습니다.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleEmailLogin = (credentials) => runAuth(() => login(credentials));

  const handleSignup = async (credentials) => {
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');

    try {
      await signup(credentials);
      setHistory([]);
      setScreen('login');
      setAuthNotice('회원가입이 완료되었습니다. 이메일과 비밀번호로 로그인해주세요.');
    } catch (error) {
      setAuthError(error.message || '회원가입 요청에 실패했습니다.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleOAuth = (provider, token) => {
    if (!token?.trim()) {
      setAuthError(`${provider === 'kakao' ? 'Kakao' : 'Google'} OAuth 토큰을 입력해주세요.`);
      return;
    }

    runAuth(() => oauthLogin(provider, token.trim()));
  };

  const handleOnboarding = async (profile) => {
    if (!session?.accessToken) return;
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');

    try {
      const token = await getProtectedToken();
      const onboarding = await completeOnboarding(profile, token);
      const nextSession = {
        ...session,
        newUser: false,
        user: {
          ...(session.user || {}),
          ...profile,
          ...(onboarding?.user || {}),
        },
      };
      await saveSession(nextSession);
      setSession(nextSession);
      setHistory([]);
      setScreen('home');
    } catch (error) {
      setAuthError(error.message || '온보딩 저장에 실패했습니다.');
    } finally {
      setAuthBusy(false);
    }
  };

  const refreshPlan = async () => {
    if (!session?.accessToken) return;

    try {
      const token = await getProtectedToken();
      const payload = await getPlan(token);
      setPlan(payload?.plan || payload?.data || payload);
    } catch (error) {
      setAuthError(error.message || '플랜 조회에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    const refreshToken = session?.refreshToken;
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');

    try {
      if (refreshToken) {
        await logout(refreshToken);
      }
    } catch (error) {
      setAuthError(error.message || '로그아웃 요청에 실패했습니다.');
    } finally {
      await clearSession();
      setSession(null);
      setPlan(null);
      setHistory([]);
      setScreen('login');
      setAuthBusy(false);
    }
  };

  const handleParseSchedule = async (input) => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    setApiBusy(true);
    setApiError('');
    try {
      const token = await getProtectedToken();
      const payload = await parseSchedule(input, token);
      const parsed = refineParsedScheduleFromInput(normalizeScheduleValue(payload), input);
      setParsedSchedule(parsed);
      setParsedScheduleInput(input);
      setHistory((previous) => [...previous, screen]);
      setScreen('aiReview');
      return parsed;
    } catch (error) {
      setApiError(error.message || 'AI 일정 파싱에 실패했습니다.');
      throw error;
    } finally {
      setApiBusy(false);
    }
  };

  const handleCreateParsedSchedule = async () => {
    if (!session?.accessToken || !parsedSchedule) return;
    const participantUsernames = getParsedParticipantUsernames(parsedSchedule, parsedScheduleInput);

    const body = {
      title: parsedSchedule.title,
      description: parsedSchedule.description || '',
      category: parsedSchedule.category || '약속',
      startAt: parsedSchedule.startAt,
      endAt: parsedSchedule.endAt,
      allDay: Boolean(parsedSchedule.allDay),
      location: parsedSchedule.location || '',
      recurring: Boolean(parsedSchedule.recurring || parsedSchedule.recurrenceRule),
      recurrenceRule: parsedSchedule.recurrenceRule || '',
      visibility: participantUsernames.length ? 'FRIENDS' : 'PRIVATE',
      participantUsernames,
    };

    setApiBusy(true);
    setApiError('');
    try {
      const created = normalizeScheduleValue(await runWithProtectedToken((token) => createSchedule(body, token)));
      setSchedules((previous) => [created, ...previous]);
      setSelectedSchedule(created);
      return created;
    } catch (error) {
      setApiError(error.message || '일정 생성에 실패했습니다.');
      throw error;
    } finally {
      setApiBusy(false);
    }
  };

  const handleCreateManualSchedule = async (body) => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    setApiBusy(true);
    setApiError('');
    try {
      const created = normalizeScheduleValue(await runWithProtectedToken((token) => createSchedule(body, token)));
      setSchedules((previous) => [created, ...previous]);
      setSelectedSchedule(created);
      return created;
    } catch (error) {
      setApiError(error.message || '일정 생성에 실패했습니다.');
      throw error;
    } finally {
      setApiBusy(false);
    }
  };

  const handleOpenSchedule = async (schedule) => {
    const scheduleId = schedule?.scheduleId || schedule?.id;
    if (!scheduleId) {
      setSelectedSchedule(schedule || null);
      goTo('schedule');
      return;
    }

    const normalizedSchedule = normalizeScheduleValue(schedule);
    setSelectedSchedule(normalizedSchedule);
    setApiError('');
    try {
      const token = await getProtectedToken();
      const detail = normalizeScheduleValue(await getSchedule(scheduleId, token));
      setSelectedSchedule(detail);
    } catch (error) {
      setApiError(error.message || '일정 상세 조회에 실패했습니다.');
    } finally {
      goTo('schedule');
    }
  };

  const handleNewSchedule = () => {
    setSelectedSchedule(null);
    goTo('scheduleEdit');
  };

  const handleUpdateSchedule = async (scheduleId, body) => {
    if (!session?.accessToken || !scheduleId) throw new Error('수정할 일정을 찾을 수 없습니다.');
    setApiBusy(true);
    setApiError('');
    try {
      const token = await getProtectedToken();
      const updated = normalizeScheduleValue(await updateSchedule(scheduleId, body, token));
      setSelectedSchedule(updated);
      setSchedules((previous) => previous.map((item) => ((item.scheduleId || item.id) === scheduleId ? { ...item, ...updated } : item)));
      return updated;
    } catch (error) {
      setApiError(error.message || '일정 수정에 실패했습니다.');
      throw error;
    } finally {
      setApiBusy(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!session?.accessToken || !scheduleId) throw new Error('삭제할 일정을 찾을 수 없습니다.');
    setApiError('');
    const token = await getProtectedToken();
    await deleteSchedule(scheduleId, token);
    setSchedules((previous) => previous.filter((item) => (item.scheduleId || item.id) !== scheduleId));
    setSelectedSchedule(null);
    switchTab('home');
  };

  const handleCompleteSchedule = async (scheduleId) => {
    if (!session?.accessToken || !scheduleId) {
      throw new Error('완료 처리할 일정을 찾을 수 없습니다.');
    }

    try {
      const token = await getProtectedToken();
      await completeSchedule(scheduleId, token);
      setSchedules((previous) => previous.map((item) => {
        const itemId = item.scheduleId || item.id;
        return itemId === scheduleId ? { ...item, completed: true, status: 'COMPLETED' } : item;
      }));
      setSelectedSchedule((previous) => {
        const itemId = previous?.scheduleId || previous?.id;
        return itemId === scheduleId ? { ...previous, completed: true, status: 'COMPLETED' } : previous;
      });
    } catch (error) {
      setApiError(error.message || '일정 완료 처리에 실패했습니다.');
      throw error;
    }
  };

  const handleParticipantStatus = async (scheduleId, userId, body) => {
    const token = await getProtectedToken();
    const action = body?.action || (body?.status === 'REJECTED' ? 'REJECT' : 'ACCEPT');
    const updated = normalizeScheduleValue(await respondToInvitation(scheduleId, action, token));
    setSelectedSchedule(updated);
    return updated;
  };

  const refreshSchedulesAndInvitations = async () => {
    const [scheduleResult, invitationResult] = await Promise.allSettled([
      runWithProtectedToken((token) => getSchedules(token)),
      runWithProtectedToken((token) => getScheduleInvitations(token)),
    ]);

    if (scheduleResult.status === 'fulfilled') {
      setSchedules(normalizeScheduleList(scheduleResult.value));
    }
    if (invitationResult.status === 'fulfilled') {
      setScheduleInvitations(normalizeScheduleInvitations(invitationResult.value));
    }
  };

  const handleScheduleInvitationAction = async (invitation, status) => {
    const scheduleId = invitation?.scheduleId;
    const participantId = invitation?.participantId || invitation?.userId || invitation?.id;
    const action = status === 'REJECTED' || status === 'REJECT' ? 'REJECT' : 'ACCEPT';
    const nextStatus = action === 'REJECT' ? 'REJECTED' : 'ACCEPTED';

    if (!scheduleId) {
      throw new Error('초대 응답에 필요한 식별자를 찾을 수 없습니다.');
    }

    setApiBusy(true);
    setApiError('');
    try {
      await runWithProtectedToken((token) => respondToInvitation(scheduleId, action, token));
      setScheduleInvitations((previous) => previous.map((item) => (
        (item.participantId || item.id) === participantId ? { ...item, status: nextStatus } : item
      )));
      await refreshSchedulesAndInvitations();
    } catch (error) {
      setApiError(error.message || '일정 초대 응답에 실패했습니다.');
      throw error;
    } finally {
      setApiBusy(false);
    }
  };

  const handleProposeAdjust = async (scheduleId, userId, body) => {
    const token = await getProtectedToken();
    return proposeScheduleAdjust(scheduleId, userId, body, token);
  };

  const handleFriendRequestAction = async (friendshipId, action) => {
    if (!session?.accessToken) return;
    if (!friendshipId) {
      setApiError('친구 요청 ID를 찾을 수 없습니다.');
      return;
    }

    setApiError('');
    try {
      if (action === 'accept') {
        await runWithProtectedToken((token) => acceptFriendRequest(friendshipId, token));
      } else {
        await runWithProtectedToken((token) => rejectFriendRequest(friendshipId, token));
      }
      setFriendRequests((previous) => previous.filter((item) => item.friendshipId !== friendshipId));
      await refreshFriendData();
    } catch (error) {
      setApiError(error.message || '친구 요청 처리에 실패했습니다.');
    }
  };

  const handleSendFriendRequest = async (username) => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const targetUsername = String(username || '').trim().replace(/^@/, '');
    if (!targetUsername) {
      throw new Error('username을 입력해주세요.');
    }

    setApiError('');
    const sent = await runWithProtectedToken((token) => sendFriendRequest(targetUsername, token));
    await refreshFriendData();
    return sent;
  };

  const handleDeleteFriend = async (friendshipId) => {
    const token = await getProtectedToken();
    await deleteFriend(friendshipId, token);
    setFriends((previous) => previous.filter((item) => item.friendshipId !== friendshipId));
  };

  const handleBlockFriend = async (friendshipId) => {
    const token = await getProtectedToken();
    await blockUser(friendshipId, token);
    setFriends((previous) => previous.filter((item) => item.friendshipId !== friendshipId));
  };

  const handleOpenFriendProfile = (friend) => {
    setSelectedFriend(friend || null);
    goTo('friendProfile');
  };

  const handleOpenStudyNote = async (schedule = selectedSchedule || schedules[0]) => {
    const scheduleId = schedule?.scheduleId || schedule?.id;
    setSelectedSchedule(schedule || null);
    setStudyNotes([]);
    if (scheduleId) {
      try {
        const token = await getProtectedToken();
        setStudyNotes(toArray(await getStudyNotes(scheduleId, token)));
      } catch (error) {
        setApiError(error.message || '학습 노트를 불러오지 못했습니다.');
      }
    }
    goTo('studyNote');
  };

  const handleCreateStudyNote = async (body) => {
    const token = await getProtectedToken();
    const created = await createStudyNote(body, token);
    setStudyNotes((previous) => [created, ...previous]);
    return created;
  };

  const handleSummarizeStudyNote = async (noteId) => {
    const token = await getProtectedToken();
    const summarized = await summarizeStudyNote(noteId, token);
    setStudyNotes((previous) => previous.map((note) => (note.id === noteId ? summarized : note)));
    return summarized;
  };

  const handleOpenChatRoom = async (room) => {
    setSelectedRoom(room);
    setChatMessages([]);
    if (room?.id) {
      try {
        const token = await getProtectedToken();
        setChatMessages(toArray(await getChatMessages(room.id, token, { size: 50 })));
      } catch (error) {
        setApiError(error.message || '채팅 메시지를 불러오지 못했습니다.');
      }
    }
    goTo('chatRoom');
  };

  const handleCreateChatRoom = async (body) => {
    const created = unwrapApiValue(await runWithProtectedToken((token) => createChatRoom(body, token)));
    setChatRooms((previous) => [created, ...previous]);
    return created;
  };

  const handleStartDirectChat = async (friend = selectedFriend) => {
    const username = getFriendUsername(friend);
    if (!username) {
      setApiError('채팅방을 만들 친구 username을 찾을 수 없습니다.');
      return;
    }

    setApiError('');
    const room = await handleCreateChatRoom({
      type: 'DIRECT',
      name: friend?.nickname || friend?.name || username,
      memberUsernames: [username],
    });
    await handleOpenChatRoom(room);
  };

  const handleReactMessage = async (messageId, emoji) => {
    const token = await getProtectedToken();
    const updated = await reactToChatMessage(messageId, emoji, token);
    setChatMessages((previous) => previous.map((message) => (message.id === messageId ? updated : message)));
    return updated;
  };

  const handleDeleteMessage = async (messageId) => {
    const token = await getProtectedToken();
    await deleteChatMessage(messageId, token);
    setChatMessages((previous) => previous.filter((message) => message.id !== messageId));
  };

  const handleCreateMediaUpload = async (roomId, contentType) => {
    const token = await getProtectedToken();
    return getChatMediaUploadUrl(roomId, { contentType }, token);
  };

  const content = useMemo(() => {
    if (!fontsLoaded) return null;
    if (screen === 'intro') return <IntroScreen onNext={() => goTo('login')} />;
    if (screen === 'login') {
      return (
        <LoginScreen
          busy={authBusy}
          error={authError}
          notice={authNotice}
          onEmailLogin={handleEmailLogin}
          onOAuth={handleOAuth}
          onSignup={handleSignup}
        />
      );
    }
    if (screen === 'kakaoConsent') return <KakaoConsentScreen busy={authBusy} error={authError} onCancel={goBack} onContinue={(token) => handleOAuth('kakao', token)} />;
    if (screen === 'onboardingSetup') return <KakaoConsentScreen busy={authBusy} error={authError} onboardingOnly onCancel={handleLogout} onOnboarding={handleOnboarding} session={session} />;

    if (screen === 'home') return <HomeScreen apiError={apiError} goTo={goTo} notificationCount={pendingInvitationCount} onNewSchedule={handleNewSchedule} onOpenSchedule={handleOpenSchedule} schedules={visibleSchedules} />;
    if (screen === 'ai') return <AiInputScreen apiBusy={apiBusy} apiError={apiError} friends={friends} goTo={goTo} goBack={goBack} onParse={handleParseSchedule} />;
    if (screen === 'aiReview') return <AiReviewScreen apiBusy={apiBusy} apiError={apiError} goTo={goTo} goBack={goBack} onCreate={handleCreateParsedSchedule} parsedSchedule={parsedSchedule} />;
    if (screen === 'schedule') {
      return (
        <ScheduleScreen
          apiError={apiError}
          goTo={goTo}
          goBack={goBack}
          onComplete={handleCompleteSchedule}
          onDelete={handleDeleteSchedule}
          onOpenStudyNote={handleOpenStudyNote}
          onParticipantStatus={handleParticipantStatus}
          onProposeAdjust={handleProposeAdjust}
          schedule={selectedSchedule || visibleSchedules[0]}
        />
      );
    }
    if (screen === 'chat') return <ChatListScreen apiError={apiError} goTo={goTo} onCreateRoom={handleCreateChatRoom} onOpenRoom={handleOpenChatRoom} rooms={chatRooms} />;
    if (screen === 'chatRoom') return <ChatRoomScreen goTo={goTo} goBack={goBack} messages={chatMessages} onCreateMediaUpload={handleCreateMediaUpload} onDeleteMessage={handleDeleteMessage} onReactMessage={handleReactMessage} room={selectedRoom} />;
    if (screen === 'friends') return <FriendsScreen apiError={apiError} friendRequests={friendRequests} friends={friends} goTo={goTo} onBlockFriend={handleBlockFriend} onDeleteFriend={handleDeleteFriend} onOpenFriend={handleOpenFriendProfile} onRequestAction={handleFriendRequestAction} onSendRequest={handleSendFriendRequest} />;
    if (screen === 'studyNote') return <StudyNoteScreen apiError={apiError} goBack={goBack} notes={studyNotes} onCreateNote={handleCreateStudyNote} onSummarizeNote={handleSummarizeStudyNote} schedule={selectedSchedule || visibleSchedules[0]} />;
    if (screen === 'notices') return <NotificationsScreen apiBusy={apiBusy} apiError={apiError} goBack={goBack} invitations={scheduleInvitations} onInvitationAction={handleScheduleInvitationAction} />;
    if (screen === 'admin') return <AdminScreen goBack={goBack} />;
    if (screen === 'profileEdit') return <ProfileEditScreen goBack={goBack} session={session} />;
    if (screen === 'notificationSettings') return <NotificationSettingsScreen goBack={goBack} />;
    if (screen === 'privacySettings') return <PrivacySettingsScreen goBack={goBack} />;
    if (screen === 'themeSettings') return <ThemeSettingsScreen goBack={goBack} />;
    if (screen === 'languageSettings') return <LanguageSettingsScreen goBack={goBack} />;
    if (screen === 'helpFaq') return <HelpFaqScreen goBack={goBack} />;
    if (screen === 'termsPrivacy') return <TermsPrivacyScreen goBack={goBack} />;
    if (screen === 'scheduleEdit') {
      return (
        <ScheduleEditScreen
          apiBusy={apiBusy}
          apiError={apiError}
          goBack={goBack}
          onCreate={selectedSchedule ? (body) => handleUpdateSchedule(selectedSchedule.scheduleId || selectedSchedule.id, body) : handleCreateManualSchedule}
          onSaved={() => switchTab('home')}
          schedule={selectedSchedule}
        />
      );
    }
    if (screen === 'friendProfile') return <FriendProfileScreen apiError={apiError} friend={selectedFriend} goBack={goBack} onChat={handleStartDirectChat} />;
    if (screen === 'chatSettings') return <ChatSettingsScreen goBack={goBack} />;
    if (screen === 'chatSearch') return <ChatSearchScreen goBack={goBack} />;
    return <ProfileScreen authError={authError} goTo={goTo} onLogout={handleLogout} onRefreshPlan={refreshPlan} plan={plan} session={session} />;
  }, [screen, history, session, plan, authError, authNotice, authBusy, apiError, schedules, visibleSchedules, friends, friendRequests, scheduleInvitations, pendingInvitationCount, parsedSchedule, parsedScheduleInput, selectedFriend, selectedSchedule, studyNotes, chatRooms, selectedRoom, chatMessages, apiBusy, fontsLoaded, runWithProtectedToken]);

  return (
    <AppFrame>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {content}
        </View>
        {tabScreens.has(screen) ? <BottomTabs active={screen} onChange={switchTab} /> : null}
      </View>
    </AppFrame>
  );
}
