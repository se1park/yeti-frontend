import { useMemo, useState } from 'react';
import { View } from 'react-native';
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

export default function App() {
  useHiddenWebScrollbars();

  const [screen, setScreen] = useState('intro');
  const [history, setHistory] = useState([]);

  const goTo = (nextScreen) => {
    if (nextScreen === screen) return;
    setHistory((previous) => [...previous, screen]);
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

  const content = useMemo(() => {
    if (screen === 'intro') return <IntroScreen onNext={() => goTo('login')} />;
    if (screen === 'login') return <LoginScreen onKakao={() => goTo('kakaoConsent')} onStart={() => goTo('home')} />;
    if (screen === 'kakaoConsent') return <KakaoConsentScreen onCancel={goBack} onContinue={() => goTo('home')} />;

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
    return <ProfileScreen goTo={goTo} />;
  }, [screen, history]);

  return (
    <AppFrame>
      <View style={{ flex: 1 }}>
        {content}
        {tabScreens.has(screen) ? <BottomTabs active={screen} onChange={goTo} /> : null}
      </View>
    </AppFrame>
  );
}
