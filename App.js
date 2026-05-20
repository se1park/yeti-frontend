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
  FriendProfileScreen,
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

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.result)) return value.result;
  if (Array.isArray(value?.content)) return value.content;
  return [];
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
  const [parsedSchedule, setParsedSchedule] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [studyNotes, setStudyNotes] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [apiBusy, setApiBusy] = useState(false);

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

  useEffect(() => {
    if (!session?.accessToken || session.newUser) return;

    let cancelled = false;
    setApiError('');

    getProtectedToken().then((token) => Promise.allSettled([
      getSchedules(token),
      getFriends(token),
      getFriendRequests(token),
      getChatRooms(token),
    ])).then(([scheduleResult, friendResult, requestResult, roomResult]) => {
      if (cancelled) return;

      if (scheduleResult.status === 'fulfilled') {
        setSchedules(toArray(scheduleResult.value));
      }
      if (friendResult.status === 'fulfilled') {
        setFriends(toArray(friendResult.value));
      }
      if (requestResult.status === 'fulfilled') {
        setFriendRequests(toArray(requestResult.value));
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
  }, [getProtectedToken, session?.accessToken, session?.newUser]);

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
      setParsedSchedule(payload);
      setHistory((previous) => [...previous, screen]);
      setScreen('aiReview');
      return payload;
    } catch (error) {
      setApiError(error.message || 'AI 일정 파싱에 실패했습니다.');
      throw error;
    } finally {
      setApiBusy(false);
    }
  };

  const handleCreateParsedSchedule = async () => {
    if (!session?.accessToken || !parsedSchedule) return;

    const body = {
      title: parsedSchedule.title,
      description: parsedSchedule.description || '',
      category: parsedSchedule.category || '약속',
      startAt: parsedSchedule.startAt,
      endAt: parsedSchedule.endAt,
      allDay: Boolean(parsedSchedule.allDay),
      location: parsedSchedule.location || '',
      recurring: false,
      visibility: 'FRIENDS',
      participantUsernames: parsedSchedule.participants || [],
    };

    setApiBusy(true);
    setApiError('');
    try {
      const token = await getProtectedToken();
      const created = await createSchedule(body, token);
      setSchedules((previous) => [created, ...previous]);
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
      const token = await getProtectedToken();
      const created = await createSchedule(body, token);
      setSchedules((previous) => [created, ...previous]);
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

    setSelectedSchedule(schedule);
    setApiError('');
    try {
      const token = await getProtectedToken();
      const detail = await getSchedule(scheduleId, token);
      setSelectedSchedule(detail);
    } catch (error) {
      setApiError(error.message || '일정 상세 조회에 실패했습니다.');
    } finally {
      goTo('schedule');
    }
  };

  const handleUpdateSchedule = async (scheduleId, body) => {
    if (!session?.accessToken || !scheduleId) throw new Error('수정할 일정을 찾을 수 없습니다.');
    setApiBusy(true);
    setApiError('');
    try {
      const token = await getProtectedToken();
      const updated = await updateSchedule(scheduleId, body, token);
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
    const updated = await respondToInvitation(scheduleId, userId, body, token);
    setSelectedSchedule(updated);
    return updated;
  };

  const handleProposeAdjust = async (scheduleId, userId, body) => {
    const token = await getProtectedToken();
    return proposeScheduleAdjust(scheduleId, userId, body, token);
  };

  const handleFriendRequestAction = async (friendshipId, action) => {
    if (!session?.accessToken || !friendshipId) return;

    setApiError('');
    try {
      const token = await getProtectedToken();
      if (action === 'accept') {
        await acceptFriendRequest(friendshipId, token);
      } else {
        await rejectFriendRequest(friendshipId, token);
      }
      setFriendRequests((previous) => previous.filter((item) => item.friendshipId !== friendshipId));
      if (action === 'accept') {
        const nextFriends = await getFriends(token);
        setFriends(toArray(nextFriends));
      }
    } catch (error) {
      setApiError(error.message || '친구 요청 처리에 실패했습니다.');
    }
  };

  const handleSendFriendRequest = async (username) => {
    if (!session?.accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const token = await getProtectedToken();
    const sent = await sendFriendRequest(username, token);
    return sent;
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

    if (screen === 'home') return <HomeScreen apiError={apiError} goTo={goTo} schedules={schedules} />;
    if (screen === 'ai') return <AiInputScreen apiBusy={apiBusy} apiError={apiError} goTo={goTo} goBack={goBack} onParse={handleParseSchedule} />;
    if (screen === 'aiReview') return <AiReviewScreen apiBusy={apiBusy} apiError={apiError} goTo={goTo} goBack={goBack} onCreate={handleCreateParsedSchedule} parsedSchedule={parsedSchedule} />;
    if (screen === 'schedule') return <ScheduleScreen apiError={apiError} goTo={goTo} goBack={goBack} onComplete={handleCompleteSchedule} schedule={schedules[0]} />;
    if (screen === 'chat') return <ChatListScreen goTo={goTo} />;
    if (screen === 'chatRoom') return <ChatRoomScreen goTo={goTo} goBack={goBack} />;
    if (screen === 'friends') return <FriendsScreen apiError={apiError} friendRequests={friendRequests} friends={friends} goTo={goTo} onRequestAction={handleFriendRequestAction} onSendRequest={handleSendFriendRequest} />;
    if (screen === 'studyNote') return <StudyNoteScreen goBack={goBack} />;
    if (screen === 'notices') return <NotificationsScreen goBack={goBack} />;
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
          onCreate={handleCreateManualSchedule}
          onSaved={() => switchTab('home')}
        />
      );
    }
    if (screen === 'friendProfile') return <FriendProfileScreen goBack={goBack} />;
    if (screen === 'chatSettings') return <ChatSettingsScreen goBack={goBack} />;
    if (screen === 'chatSearch') return <ChatSearchScreen goBack={goBack} />;
    return <ProfileScreen authError={authError} goTo={goTo} onLogout={handleLogout} onRefreshPlan={refreshPlan} plan={plan} session={session} />;
  }, [screen, history, session, plan, authError, authNotice, authBusy, apiError, schedules, friends, friendRequests, parsedSchedule, apiBusy, fontsLoaded]);

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
