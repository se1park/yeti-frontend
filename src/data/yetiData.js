export const BLUE = '#2f6cf6';
export const INK = '#111827';
export const MUTED = '#8a94a6';
export const LINE = '#e8ebf0';
export const SOFT = '#f5f6f8';

export const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);

export const schedules = [
  {
    title: '영어 회화 스터디',
    meta: '학습 · 카페 라운지',
    time: '09:00',
    end: '10:30',
    color: '#d946ef',
    icon: '□',
  },
  {
    title: '지민이와 회의',
    meta: '업무 · 강남 · 나, 김지민',
    time: '14:00',
    end: '15:00',
    color: BLUE,
    icon: '▣',
  },
  {
    title: '헬스 · 하체 데이',
    meta: '운동 · 강남 핏니스',
    time: '18:30',
    end: '19:30',
    color: '#0fbf73',
    icon: '↔',
  },
  {
    title: '저녁 러닝',
    meta: '운동 · 한강공원',
    time: '20:00',
    end: '21:00',
    color: '#fb923c',
    icon: '•',
  },
];

export const participants = [
  { name: '나', initial: '나', role: '주최자', status: '주최', color: INK },
  { name: '김지민', initial: '지', role: '수락 · 5월 18일 오전 10:24', status: '수락', color: BLUE },
  { name: '박수아', initial: '수', role: '수락 · 5월 18일 오전 11:02', status: '수락', color: '#0fbf73' },
  { name: '이현우', initial: '현', role: '시간 조율을 요청했어요', status: '시간 조율', color: '#f59e0b' },
];

export const chatRooms = [
  {
    title: '북한산 등산',
    preview: '시간 조율 제안 현우: 그날 오전은 어려울 것 같아요.',
    time: '오전 11:30',
    unread: '3',
    avatars: ['지', '수', '현'],
    chip: '5/23',
  },
  {
    title: '박수아',
    preview: '사진 오늘 카페 라운지서 봐!',
    time: '오전 10:24',
    unread: '1',
    avatars: ['수'],
  },
  {
    title: '팀 토익 스터디',
    preview: '지민: AI가 정리해준 학습 노트 봤어?',
    time: '오전 9:14',
    unread: '',
    avatars: ['진'],
    chip: '매주 화',
  },
  {
    title: '김지민',
    preview: '내일 회의 자료 미리 공유드릴게요.',
    time: '어제',
    unread: '',
    avatars: ['지'],
  },
  {
    title: '5월 가족 모임',
    preview: '일정 공유됨 엄마: 5월 25일 토요일',
    time: '월',
    unread: '12',
    avatars: ['동'],
    chip: '5/25',
  },
  {
    title: '이현우',
    preview: '그날 다른 일정이 생겨서요...',
    time: '월',
    unread: '',
    avatars: ['현'],
  },
  {
    title: '헬스 메이트',
    preview: '오늘 하체 가시는 거죠?',
    time: '5/15',
    unread: '',
    avatars: ['진'],
  },
];

export const friends = [
  ['강하늘', '@haneul', '독서 중'],
  ['김지민', '@jimin_k', '오늘도 좋은 하루!'],
  ['박수아', '@suaa', '스타벅스에서 작업 중'],
  ['송예나', '@yena', '북한산 등반 D-3'],
  ['신유나', '@yuna', '시험 기간'],
];

export const quickPrompts = [
  '매주 화요일 7시 영어 스터디',
  '다음주 월요일 점심 @지민',
  '내일 9시 헬스',
  '금요일 저녁 동아리 모임',
];
