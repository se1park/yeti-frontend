import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function Logo({ size = 64 }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size / 4 }]}>
      <Text style={[styles.logoText, { fontSize: size * 0.62 }]}>Y</Text>
    </View>
  );
}

export function IntroScreen({ onNext }) {
  return (
    <View style={styles.screen}>
      <View style={styles.introCenter}>
        <Logo />
        <Text style={styles.brand}>예티<Text style={styles.blue}>.</Text></Text>
        <Text style={styles.tagline}>AI 일정 비서</Text>
      </View>
      <View style={styles.bottomArea}>
        <Text style={styles.introCopy}>약속 잡고, 캘린더 옮기고, 또 공유하고.{'\n'}이제 한 번에 끝나요.</Text>
        <PrimaryButton onPress={onNext}>시작하기</PrimaryButton>
        <Text style={styles.loginHint}>이미 사용 중이신가요? 로그인</Text>
      </View>
    </View>
  );
}

export function LoginScreen({ onKakao, onStart }) {
  return (
    <View style={styles.screen}>
      <View style={styles.loginCenter}>
        <Logo size={58} />
        <Text style={styles.loginBrand}>예티</Text>
        <Text style={styles.loginSubtitle}>친구와 함께, 약속 한 번에.</Text>
      </View>
      <View style={styles.loginActions}>
        <Pressable onPress={onKakao} style={styles.kakaoButton}>
          <Text style={styles.kakaoText}>● 카카오로 시작하기</Text>
        </Pressable>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>다른 방법으로 시작</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.socialRow}>
          <SecondaryButton onPress={onStart}>Apple</SecondaryButton>
          <SecondaryButton onPress={onStart}>Google</SecondaryButton>
        </View>
        <Text style={styles.terms}>계속 진행하면 이용약관 및 개인정보처리방침에 동의한 것으로 간주됩니다.</Text>
      </View>
    </View>
  );
}

export function KakaoConsentScreen({ onCancel, onContinue }) {
  return (
    <View style={styles.kakaoScreen}>
      <View style={styles.kakaoHeader}>
        <Pressable onPress={onCancel}>
          <Text style={styles.close}>×</Text>
        </Pressable>
        <Text style={styles.kakaoTitle}>카카오 계정 로그인</Text>
        <Text style={styles.closePlaceholder}>×</Text>
      </View>
      <View style={styles.kakaoAppCard}>
        <Logo size={46} />
        <View>
          <Text style={styles.kakaoAppName}>예티</Text>
          <Text style={styles.kakaoAppUrl}>yeti.app</Text>
        </View>
      </View>
      <Text style={styles.permissionTitle}>예티 서비스에서{'\n'}아래 정보를 요청합니다</Text>
      <View style={styles.permissionCard}>
        <Permission checked label="프로필 정보 (닉네임/프로필 사진)" required />
        <Permission checked label="카카오계정 (이메일)" required />
        <Permission label="친구 목록 조회 (선택)" />
      </View>
      <View style={styles.kakaoBottom}>
        <Pressable onPress={onContinue} style={styles.kakaoContinue}>
          <Text style={styles.kakaoContinueText}>동의하고 계속하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Permission({ checked, label, required }) {
  return (
    <View style={styles.permissionRow}>
      <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
        {checked ? <Text style={styles.checkMark}>✓</Text> : null}
      </View>
      <Text style={styles.permissionLabel}>{label}</Text>
      <Text style={styles.required}>{required ? '필수' : '선택'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  introCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 28,
  },
  logo: {
    alignItems: 'center',
    backgroundColor: BLUE,
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '500',
  },
  brand: {
    color: INK,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0,
    marginTop: 18,
  },
  blue: {
    color: BLUE,
  },
  tagline: {
    color: '#9aa4b5',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  bottomArea: {
    gap: 12,
    paddingBottom: 18,
    paddingHorizontal: 24,
  },
  introCopy: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  loginHint: {
    color: '#a8b0bd',
    fontSize: 12,
    textAlign: 'center',
  },
  loginCenter: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loginBrand: {
    color: INK,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 14,
  },
  loginSubtitle: {
    color: '#98a2b3',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  loginActions: {
    gap: 14,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  kakaoButton: {
    alignItems: 'center',
    backgroundColor: '#fee500',
    borderRadius: 9,
    height: 48,
    justifyContent: 'center',
  },
  kakaoText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '900',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  divider: {
    backgroundColor: LINE,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: '#b0b8c5',
    fontSize: 10,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
  },
  terms: {
    color: '#a8b0bd',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
  },
  kakaoScreen: {
    backgroundColor: '#fee500',
    flex: 1,
  },
  kakaoHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  close: {
    color: '#111111',
    fontSize: 22,
    fontWeight: '300',
  },
  closePlaceholder: {
    color: 'transparent',
    fontSize: 22,
  },
  kakaoTitle: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
  kakaoAppCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 28,
    marginTop: 42,
    padding: 14,
  },
  kakaoAppName: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '900',
  },
  kakaoAppUrl: {
    color: '#8a7f00',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  permissionTitle: {
    color: '#111111',
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 28,
    marginHorizontal: 28,
    marginTop: 28,
  },
  permissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 28,
    marginTop: 18,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  permissionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  checkBox: {
    borderColor: '#d0d5dd',
    borderRadius: 3,
    borderWidth: 1,
    height: 16,
    width: 16,
  },
  checkBoxOn: {
    alignItems: 'center',
    backgroundColor: '#3c3210',
    borderColor: '#3c3210',
    justifyContent: 'center',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  permissionLabel: {
    color: '#111111',
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
  },
  required: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
  },
  kakaoBottom: {
    bottom: 20,
    left: 28,
    position: 'absolute',
    right: 28,
  },
  kakaoContinue: {
    alignItems: 'center',
    backgroundColor: '#17130a',
    borderRadius: 8,
    height: 52,
    justifyContent: 'center',
  },
  kakaoContinueText: {
    color: '#fee500',
    fontSize: 15,
    fontWeight: '900',
  },
});
