import { useEffect, useMemo, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useFonts } from 'expo-font';
import { AppFrame, useHiddenWebScrollbars } from './src/components/AppFrame';
import { BottomTabs } from './src/components/BottomTabs';
import { IntroScreen, KakaoConsentScreen, LoginScreen } from './src/screens/OnboardingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
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
  loadSession,
  login,
  logout,
  oauthLogin,
  refresh,
  saveSession,
  signup,
} from './src/api/auth';
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

  useEffect(() => {
    loadSession().then((savedSession) => {
      if (!savedSession?.accessToken) return;
      setSession(savedSession);
      setScreen(savedSession.newUser ? 'onboardingSetup' : 'home');
    });
  }, []);

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

  const handleOAuth = (provider, token) => runAuth(() => oauthLogin(provider, token));

  const handleOnboarding = async (profile) => {
    if (!session?.accessToken) return;
    setAuthBusy(true);
    setAuthError('');
    setAuthNotice('');

    try {
      await completeOnboarding(profile, session.accessToken);
      const nextSession = {
        ...session,
        newUser: false,
        user: {
          ...(session.user || {}),
          ...profile,
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
      const payload = await getPlan(session.accessToken);
      setPlan(payload?.plan || payload?.data || payload);
    } catch (error) {
      if (!session.refreshToken) {
        setAuthError(error.message || '구독 플랜 조회에 실패했습니다.');
        return;
      }

      try {
        const refreshed = await refresh(session.refreshToken);
        const nextSession = {
          ...session,
          ...refreshed,
          refreshToken: refreshed.refreshToken || session.refreshToken,
        };
        await saveSession(nextSession);
        setSession(nextSession);
        const payload = await getPlan(nextSession.accessToken);
        setPlan(payload?.plan || payload?.data || payload);
      } catch (refreshError) {
        setAuthError(refreshError.message || '토큰 갱신에 실패했습니다.');
      }
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
          onKakao={() => goTo('kakaoConsent')}
          onOAuth={handleOAuth}
          onSignup={handleSignup}
        />
      );
    }
    if (screen === 'kakaoConsent') return <KakaoConsentScreen busy={authBusy} error={authError} onCancel={goBack} onContinue={(token) => handleOAuth('kakao', token)} />;
    if (screen === 'onboardingSetup') return <KakaoConsentScreen busy={authBusy} error={authError} onboardingOnly onCancel={handleLogout} onOnboarding={handleOnboarding} />;

    if (screen === 'home') return <HomeScreen goTo={goTo} />;
    if (screen === 'ai') return <AiInputScreen goTo={goTo} goBack={goBack} />;
    if (screen === 'aiReview') return <AiReviewScreen goTo={goTo} goBack={goBack} />;
    if (screen === 'schedule') return <ScheduleScreen goTo={goTo} goBack={goBack} />;
    if (screen === 'chat') return <ChatListScreen goTo={goTo} />;
    if (screen === 'chatRoom') return <ChatRoomScreen goTo={goTo} goBack={goBack} />;
    if (screen === 'friends') return <FriendsScreen goTo={goTo} />;
    if (screen === 'studyNote') return <StudyNoteScreen goBack={goBack} />;
    if (screen === 'notices') return <NotificationsScreen goBack={goBack} />;
    if (screen === 'admin') return <AdminScreen goBack={goBack} />;
    if (screen === 'profileEdit') return <ProfileEditScreen goBack={goBack} />;
    if (screen === 'notificationSettings') return <NotificationSettingsScreen goBack={goBack} />;
    if (screen === 'privacySettings') return <PrivacySettingsScreen goBack={goBack} />;
    if (screen === 'themeSettings') return <ThemeSettingsScreen goBack={goBack} />;
    if (screen === 'languageSettings') return <LanguageSettingsScreen goBack={goBack} />;
    if (screen === 'helpFaq') return <HelpFaqScreen goBack={goBack} />;
    if (screen === 'termsPrivacy') return <TermsPrivacyScreen goBack={goBack} />;
    if (screen === 'scheduleEdit') return <ScheduleEditScreen goBack={goBack} />;
    if (screen === 'friendProfile') return <FriendProfileScreen goBack={goBack} />;
    if (screen === 'chatSettings') return <ChatSettingsScreen goBack={goBack} />;
    if (screen === 'chatSearch') return <ChatSearchScreen goBack={goBack} />;
    return <ProfileScreen authError={authError} goTo={goTo} onLogout={handleLogout} onRefreshPlan={refreshPlan} plan={plan} session={session} />;
  }, [screen, history, session, plan, authError, authNotice, authBusy, fontsLoaded]);

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
