import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageCircle, Search, Send } from 'lucide-react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen, ToggleRow } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function getEmailName(email) {
  return typeof email === 'string' && email.includes('@') ? email.split('@')[0] : '';
}

function getDisplayName(user) {
  return user.nickname || user.nickName || user.displayName || user.display_name || user.name || getUsername(user) || '사용자';
}

function getUsername(user) {
  return user.username || user.userName || user.preferred_username || user.handle || getEmailName(user.email) || user.userId || user.id || user.sub || 'user';
}

export function ProfileEditScreen({ goBack, session }) {
  const user = session?.user || {};
  const displayName = getDisplayName(user);
  const username = getUsername(user);
  const email = user.email || '-';
  const avatarLabel = displayName.slice(0, 2).toUpperCase();

  return (
    <Screen left="‹" onBack={goBack} title="프로필 편집" right="저장">
      <View style={styles.center}>
        <Avatar label={avatarLabel} color={BLUE} size={76} />
        <Text style={styles.camera}>▣</Text>
      </View>
      <Card style={styles.formCard}>
        <Field label="닉네임" value={displayName} />
        <Field label="아이디 (@핸들)" value={`@ ${username}`} caption="3-20자 · 영문/숫자/_" badge="사용 가능" />
        <Field label="상태 메시지" value="약속을 한 번에 끝내고 싶다" caption="0/40" />
      </Card>
      <Text style={styles.section}>계정 정보</Text>
      <Card style={styles.formCard}>
        <InfoRow label="이메일" value={email} />
        <InfoRow label="가입일" value="2026년 4월 23일" />
        <InfoRow label="로그인 방식" value="카카오" />
      </Card>
    </Screen>
  );
}

export function NotificationSettingsScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="알림 설정">
      <Text style={styles.section}>일정</Text>
      <Card style={styles.formCard}>
        <InfoRow label="일정 시작 전 알림" value="15분 전 ›" />
        <ToggleRow label="완료 확인 알림" enabled />
        <ToggleRow label="학습 정리 알림" enabled />
        <ToggleRow label="공동 일정 초대" enabled />
      </Card>
      <Text style={styles.section}>채팅</Text>
      <Card style={styles.formCard}>
        <ToggleRow label="새 메시지" enabled />
        <ToggleRow label="@멘션 강조" enabled />
      </Card>
      <Text style={styles.section}>시스템</Text>
      <Card style={styles.formCard}>
        <ToggleRow label="서비스 공지 안내" enabled />
        <ToggleRow label="마케팅 정보 수신" />
      </Card>
    </Screen>
  );
}

export function PrivacySettingsScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="공개 범위">
      <Text style={styles.section}>기본 공개 범위</Text>
      <Card style={styles.formCard}>
        <Radio label="나만 보기" desc="DB에 격리 저장 (Supabase RLS)" />
        <Radio label="친구 공개" desc="수락된 친구만 일정을 볼 수 있어요." selected />
        <Radio label="특정 그룹" desc="태그된 그룹 멤버에게만 공개" />
      </Card>
      <Text style={styles.helpText}>새 일정을 만들 때 처음 적용되는 값. 일정마다 따로 바꿀 수 있어요.</Text>
      <Text style={styles.section}>일정 공유 시 노출 정보</Text>
      <Card style={styles.formCard}>
        <ToggleRow label="제목" enabled />
        <ToggleRow label="시간" enabled />
        <ToggleRow label="장소" enabled />
        <ToggleRow label="메모" />
      </Card>
    </Screen>
  );
}

export function ThemeSettingsScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="테마">
      <View style={styles.themePreviewRow}>
        <ThemePreview tone="light" />
        <ThemePreview tone="dark" />
        <ThemePreview tone="system" selected />
      </View>
      <Card style={styles.formCard}>
        <Radio label="라이트" />
        <Radio label="다크" />
        <Radio label="시스템" desc="기기 다크 모드를 자동으로 따라가요." selected />
      </Card>
    </Screen>
  );
}

export function LanguageSettingsScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="언어">
      <Text style={styles.section}>앱 언어</Text>
      <Card style={styles.formCard}>
        <Radio label="한국어" selected />
        <Radio label="English" desc="베타 · 일부 화면이 영어로 표시돼요." />
        <Radio label="日本語" desc="준비 중" disabled />
      </Card>
      <Text style={styles.section}>AI 응답 언어</Text>
      <Card style={styles.formCard}>
        <Radio label="한국어" selected />
        <Radio label="English" />
      </Card>
      <Text style={styles.helpText}>자연어 입력은 어떤 언어로도 인식 가능. 학습 노트 요약과 시스템 메시지 언어를 설정해요.</Text>
    </Screen>
  );
}

export function HelpFaqScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="도움말">
      <View style={styles.searchBox}>
        <Search color="#98a2b3" size={15} strokeWidth={2.4} />
        <Text style={styles.searchPlaceholder}>궁금한 점을 검색해보세요</Text>
      </View>
      <Text style={styles.section}>자주 묻는 질문</Text>
      <Card style={styles.formCard}>
        <Faq title="자연어 입력이 잘 안 인식돼요." open>
          시간·장소·친구를 한 문장 안에 적으면 인식률이 높아져요. 모호한 표현은 신뢰도가 0.7 미만일 때 확인 화면이 따로 떠요.
        </Faq>
        <Faq title="예티는 어떻게 시작하나요?" />
        <Faq title="친구 일정이 자동 등록되지 않아요." />
        <Faq title="학습 노트 AI 요약 사용법" />
        <Faq title="계정을 삭제하면 데이터가 사라지나요?" />
      </Card>
      <PrimaryButton>
        <View style={styles.buttonLabel}>
          <Send color="#ffffff" size={15} strokeWidth={2.4} />
          <Text style={styles.buttonLabelText}>문의 보내기</Text>
        </View>
      </PrimaryButton>
    </Screen>
  );
}

export function TermsPrivacyScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="이용약관 · 개인정보">
      <View style={styles.safeBox}>
        <Text style={styles.safeIcon}>⊙</Text>
        <View>
          <Text style={styles.safeTitle}>회원님의 데이터는 안전하게 보관돼요</Text>
          <Text style={styles.safeText}>이메일·IP는 단방향 암호화. AI 입력 전 개인정보 마스킹.</Text>
        </View>
      </View>
      <Text style={styles.section}>문서</Text>
      <Card style={styles.formCard}>
        <InfoRow label="이용약관" value="v3.0 · 26.04.01 ›" />
        <InfoRow label="개인정보 처리방침" value="v3.0 · 26.04.01 ›" />
        <InfoRow label="위치기반서비스 약관" value="v1.2 · 25.10.12 ›" />
        <InfoRow label="오픈소스 라이선스" value="231개 ›" />
        <InfoRow label="청소년 보호정책" value="›" />
      </Card>
      <Text style={styles.section}>데이터 관리</Text>
      <Card style={styles.formCard}>
        <InfoRow label="내 데이터 다운로드" value="›" />
        <InfoRow label="계정 영구 삭제" value="›" danger />
      </Card>
    </Screen>
  );
}

function toLocalInputValue(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toIsoFromLocalInput(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString();
}

function parseParticipants(value) {
  return value
    .split(',')
    .map((item) => item.trim().replace(/^@/, ''))
    .filter(Boolean);
}

export function ScheduleEditScreen({ apiBusy, apiError, goBack, onCreate, onSaved, schedule }) {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000);
  const [title, setTitle] = useState(schedule?.title || '');
  const [description, setDescription] = useState(schedule?.description || '');
  const [category, setCategory] = useState(schedule?.category || '약속');
  const [startAt, setStartAt] = useState(schedule?.startAt ? toLocalInputValue(new Date(schedule.startAt)) : toLocalInputValue(defaultStart));
  const [endAt, setEndAt] = useState(schedule?.endAt ? toLocalInputValue(new Date(schedule.endAt)) : toLocalInputValue(defaultEnd));
  const [allDay, setAllDay] = useState(Boolean(schedule?.allDay));
  const [location, setLocation] = useState(schedule?.location || '');
  const [recurring, setRecurring] = useState(Boolean(schedule?.recurring));
  const [recurrenceRule, setRecurrenceRule] = useState(schedule?.recurrenceRule || '');
  const [visibility, setVisibility] = useState(schedule?.visibility || 'PRIVATE');
  const [participants, setParticipants] = useState((schedule?.participants || [])
    .map((person) => person?.username || person?.handle?.replace(/^@/, '') || '')
    .filter(Boolean)
    .join(', '));
  const [localError, setLocalError] = useState('');

  const submit = async () => {
    const startIso = toIsoFromLocalInput(startAt);
    const endIso = toIsoFromLocalInput(endAt);

    if (!title.trim()) {
      setLocalError('일정 제목을 입력해주세요.');
      return;
    }
    if (!startIso || !endIso) {
      setLocalError('시작/종료 시간을 확인해주세요.');
      return;
    }
    if (new Date(startIso).getTime() > new Date(endIso).getTime()) {
      setLocalError('종료 시간은 시작 시간 이후여야 합니다.');
      return;
    }

    setLocalError('');
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        category,
        startAt: startIso,
        endAt: endIso,
        allDay,
        location: location.trim(),
        recurring,
        recurrenceRule: recurring ? recurrenceRule.trim() : '',
        visibility,
      };

      if (!schedule) {
        body.participantUsernames = parseParticipants(participants);
      }

      await onCreate?.(body);
      onSaved?.();
    } catch (error) {
      setLocalError(error.message || '일정 생성에 실패했습니다.');
    }
  };

  return (
    <Screen
      left="‹"
      onBack={goBack}
      onRight={submit}
      right={<Text style={styles.saveText}>{apiBusy ? '저장 중' : '저장'}</Text>}
      title={schedule ? '일정 수정' : '일정 만들기'}
      bottom={<PrimaryButton onPress={submit}>{apiBusy ? '저장 중...' : '일정 저장'}</PrimaryButton>}
    >
      {localError || apiError ? <Text style={styles.errorText}>{localError || apiError}</Text> : null}
      <Text style={styles.section}>기본 정보</Text>
      <Card style={styles.formCard}>
        <EditField label="제목" value={title} onChangeText={setTitle} placeholder="예: 지민이와 회의" />
        <EditField label="메모" value={description} onChangeText={setDescription} multiline placeholder="일정 설명을 입력하세요" />
        <Text style={styles.fieldLabel}>카테고리</Text>
        <View style={styles.chips}>
          {['약속', '업무', '학습', '이동'].map((item) => (
            <Pressable key={item} onPress={() => setCategory(item)}>
              <Pill tone={category === item ? 'blue' : 'gray'}>{item}</Pill>
            </Pressable>
          ))}
        </View>
      </Card>

      <Text style={styles.section}>시간</Text>
      <Card style={styles.formCard}>
        <ToggleRow label="종일 일정" enabled={allDay} onChange={setAllDay} />
        <EditField label="시작" value={startAt} onChangeText={setStartAt} placeholder="2026-05-20T14:00" />
        <EditField label="종료" value={endAt} onChangeText={setEndAt} placeholder="2026-05-20T15:00" />
        <ToggleRow label="반복 일정" enabled={recurring} onChange={setRecurring} />
        {recurring ? <EditField label="반복 규칙" value={recurrenceRule} onChangeText={setRecurrenceRule} placeholder="예: FREQ=WEEKLY;INTERVAL=1" /> : null}
      </Card>

      <Text style={styles.section}>장소와 공개 범위</Text>
      <Card style={styles.formCard}>
        <EditField label="장소" value={location} onChangeText={setLocation} placeholder="예: 강남역" />
        <Text style={styles.fieldLabel}>공개 범위</Text>
        <View style={styles.chips}>
          {[
            ['PRIVATE', '나만 보기'],
            ['FRIENDS', '친구 공개'],
            ['PUBLIC', '전체 공개'],
          ].map(([value, label]) => (
            <Pressable key={value} onPress={() => setVisibility(value)}>
              <Pill tone={visibility === value ? 'blue' : 'gray'}>{label}</Pill>
            </Pressable>
          ))}
        </View>
      </Card>

      <Text style={styles.section}>참여자</Text>
      <Card style={styles.formCard}>
        <EditField
          label="사용자명"
          value={participants}
          onChangeText={setParticipants}
          placeholder="예: swon7150, yujin"
          caption="여러 명이면 쉼표로 구분하세요."
        />
      </Card>
    </Screen>
  );
}

export function FriendProfileScreen({ apiError, friend, goBack, onChat }) {
  const username = friend?.username || friend?.handle?.replace(/^@/, '') || 'user';
  const displayName = friend?.nickname || friend?.name || username;
  const statusMessage = friend?.statusMessage || friend?.message || '상태 메시지가 없습니다.';
  const avatarLabel = displayName.slice(0, 1).toUpperCase();
  const profileImageUrl = friend?.profileImageUrl || friend?.profile_image_url || '';

  return (
    <Screen left="‹" onBack={goBack} right="···">
      <View style={styles.profileCenter}>
        <Avatar label="지" color={BLUE} size={76} />
        <Text style={styles.profileName}>김지민</Text>
        <Text style={styles.profileMeta}>@jimin_k · 활동 중</Text>
        <Text style={styles.quote}>"오늘도 좋은 하루!"</Text>
      </View>
      <View style={styles.statsRow}>
        <MiniStat value="14" label="함께한 약속" />
        <MiniStat value="23일" label="친구된 지" />
        <MiniStat value="5" label="함께 한 채팅방" />
      </View>
      <View style={styles.actionRow}>
        <PrimaryButton style={styles.actionButton}>
          <View style={styles.buttonLabel}>
            <MessageCircle color="#ffffff" size={15} strokeWidth={2.4} />
            <Text style={styles.buttonLabelText}>채팅</Text>
          </View>
        </PrimaryButton>
        <PrimaryButton style={styles.actionButton}>✦ 함께 일정</PrimaryButton>
      </View>
      <Text style={styles.section}>함께 예정된 일정</Text>
      <Card style={styles.formCard}><InfoRow label="지민이와 회의" value="5월 19일(화) · 오후 2:00 ›" /></Card>
      <Text style={styles.section}>더보기</Text>
      <Card style={styles.formCard}>
        <InfoRow label="알림 끄기" value="" />
        <InfoRow label="차단하기" value="" danger />
        <InfoRow label="신고하기" value="" danger />
      </Card>
    </Screen>
  );
}

export function ChatSettingsScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="채팅방 설정">
      <View style={styles.profileCenter}>
        <Avatar label="ㅎ" color="#fff3d9" size={66} />
        <Text style={styles.profileName}>북한산 등산</Text>
        <Text style={styles.profileMeta}>그룹 채팅 · 멤버 4명</Text>
      </View>
      <Text style={styles.section}>고정된 일정</Text>
      <Card style={styles.formCard}><InfoRow label="북한산 등산" value="5월 23일(토) · 오전 9시 ›" /></Card>
      <Text style={styles.section}>멤버 4</Text>
      <Card style={styles.formCard}>
        {['나 · 소유자', '김지민 · 관리자', '박수아 · 멤버', '이현우 · 멤버'].map((item) => <InfoRow key={item} label={item} value="" />)}
        <InfoRow label="+ 멤버 초대" value="" />
      </Card>
      <Text style={styles.section}>알림</Text>
      <Card style={styles.formCard}><ToggleRow label="알림 켜기" enabled /></Card>
    </Screen>
  );
}

export function ChatSearchScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="등산">
      <View style={styles.chips}>
        {['전체 18', '채팅 8', '메시지 6', '일정 3', '친구 1'].map((item, index) => <Pill key={item} tone={index === 0 ? 'gray' : 'blue'}>{item}</Pill>)}
      </View>
      <Text style={styles.section}>채팅방</Text>
      <Card style={styles.formCard}><InfoRow label="북한산 등산" value="그룹 채팅 · 4명 ›" /></Card>
      <Text style={styles.section}>메시지 6개</Text>
      <Card style={styles.formCard}>
        <InfoRow label="이현우 · 북한산 등산" value="그날 오전 9시는 좀 어려울 것 같아요. 등산 코스 바꿔도 될까요?" />
        <InfoRow label="박수아 · 북한산 등산" value="등산화 빌릴 수 있는데 알아보고 있어요." />
        <InfoRow label="김지민 · 헬스 메이트" value="이번 주 토요일 등산 같이 갈 사람?" />
      </Card>
      <Text style={styles.section}>일정 3개</Text>
      <Card style={styles.formCard}><InfoRow label="북한산 등산" value="5월 23일(토) · 오전 9시 · 우이동" /></Card>
    </Screen>
  );
}

function EditField({ label, value, onChangeText, placeholder, caption, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#b8c0cc"
        style={[styles.fieldInput, multiline && styles.multilineInput]}
        textAlignVertical={multiline ? 'top' : 'center'}
        value={value}
      />
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

function Field({ label, value, caption, badge }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldRow}>
        <TextInput value={value} editable={false} style={styles.fieldInput} />
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

function InfoRow({ label, value, danger }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, danger && styles.danger]}>{label}</Text>
      <Text style={[styles.infoValue, danger && styles.danger]}>{value}</Text>
    </View>
  );
}

function Radio({ label, desc, selected, disabled }) {
  return (
    <View style={styles.radioRow}>
      <View>
        <Text style={[styles.infoLabel, disabled && styles.disabled]}>{label}</Text>
        {desc ? <Text style={styles.caption}>{desc}</Text> : null}
      </View>
      <View style={[styles.radio, selected && styles.radioSelected]} />
    </View>
  );
}

function ThemePreview({ tone, selected }) {
  return (
    <View style={[styles.themePreview, tone !== 'light' && styles.themeDark, selected && styles.themeSelected]}>
      <View style={styles.previewLine} />
      <View style={styles.previewShortLine} />
      <View style={styles.previewButton} />
    </View>
  );
}

function Faq({ title, children, open }) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.infoLabel}>{title}  ›</Text>
      {open ? <Text style={styles.faqBody}>{children}</Text> : null}
    </View>
  );
}

function MiniStat({ value, label }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.caption}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', marginBottom: 20 },
  camera: { backgroundColor: INK, borderRadius: 12, color: '#ffffff', marginTop: -20, overflow: 'hidden', padding: 6 },
  section: { color: MUTED, fontSize: 12, fontWeight: '900', marginBottom: 8, marginTop: 10 },
  formCard: { backgroundColor: '#ffffff', shadowOpacity: 0 },
  field: { borderBottomColor: LINE, borderBottomWidth: 1, paddingVertical: 12 },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '900', marginBottom: 6 },
  fieldRow: { alignItems: 'center', flexDirection: 'row' },
  fieldInput: { color: INK, flex: 1, fontSize: 15, fontWeight: '900', padding: 0 },
  multilineInput: { lineHeight: 21, minHeight: 72, paddingTop: 4 },
  saveText: { color: BLUE, fontSize: 14, fontWeight: '900' },
  errorText: { color: '#f04454', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  badge: { backgroundColor: '#dcfce7', borderRadius: 16, color: '#16a34a', fontSize: 11, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 8, paddingVertical: 5 },
  caption: { color: MUTED, fontSize: 11, fontWeight: '700', marginTop: 4 },
  infoRow: { alignItems: 'center', borderBottomColor: LINE, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  infoLabel: { color: INK, fontSize: 14, fontWeight: '800' },
  infoValue: { color: MUTED, flex: 1, fontSize: 12, fontWeight: '700', marginLeft: 12, textAlign: 'right' },
  danger: { color: '#f04454' },
  helpText: { color: MUTED, fontSize: 12, fontWeight: '700', lineHeight: 18, marginBottom: 8 },
  radioRow: { alignItems: 'center', borderBottomColor: LINE, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  radio: { borderColor: '#cbd5e1', borderRadius: 10, borderWidth: 1.5, height: 20, width: 20 },
  radioSelected: { borderColor: BLUE, borderWidth: 5 },
  disabled: { color: '#cbd5e1' },
  themePreviewRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  themePreview: { backgroundColor: '#ffffff', borderColor: LINE, borderRadius: 10, borderWidth: 1, flex: 1, height: 124, padding: 10 },
  themeDark: { backgroundColor: INK },
  themeSelected: { borderColor: BLUE, borderWidth: 2 },
  previewLine: { backgroundColor: '#111827', borderRadius: 2, height: 4, width: 24 },
  previewShortLine: { backgroundColor: '#d0d5dd', borderRadius: 2, height: 4, marginTop: 8, width: 42 },
  previewButton: { backgroundColor: BLUE, borderRadius: 3, height: 12, marginTop: 'auto' },
  searchBox: { alignItems: 'center', backgroundColor: '#f4f6f8', borderRadius: 10, flexDirection: 'row', gap: 7, marginBottom: 14, padding: 12 },
  searchPlaceholder: { color: '#a0a8b5', fontSize: 13, fontWeight: '700' },
  buttonLabel: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  buttonLabelText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  faqItem: { borderBottomColor: LINE, borderBottomWidth: 1, paddingVertical: 13 },
  faqBody: { backgroundColor: '#f4f6f8', borderRadius: 8, color: MUTED, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 10, padding: 12 },
  safeBox: { alignItems: 'center', backgroundColor: '#f4f6f8', borderRadius: 12, flexDirection: 'row', gap: 12, marginBottom: 18, padding: 14 },
  safeIcon: { color: BLUE, fontSize: 20 },
  safeTitle: { color: INK, fontSize: 14, fontWeight: '900' },
  safeText: { color: MUTED, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  profileCenter: { alignItems: 'center', marginBottom: 18 },
  profileName: { color: INK, fontSize: 22, fontWeight: '900', marginTop: 12 },
  profileMeta: { color: MUTED, fontSize: 12, fontWeight: '800', marginTop: 4 },
  quote: { backgroundColor: '#ffffff', borderRadius: 14, color: MUTED, fontSize: 12, fontWeight: '800', marginTop: 10, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 8 },
  statsRow: { flexDirection: 'row', marginBottom: 12 },
  miniStat: { alignItems: 'center', backgroundColor: '#ffffff', borderRightColor: LINE, borderRightWidth: 1, flex: 1, padding: 13 },
  miniValue: { color: INK, fontSize: 18, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  actionButton: { flex: 1 },
});
