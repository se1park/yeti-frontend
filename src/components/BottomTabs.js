import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Home, MessageCircle, UserRound, UsersRound } from 'lucide-react-native';
import { BLUE, INK, MUTED } from '../data/yetiData';

const tabs = [
  { key: 'home', label: '홈', Icon: Home },
  { key: 'chat', label: '채팅', Icon: MessageCircle },
  { key: 'friends', label: '친구', Icon: UsersRound },
  { key: 'my', label: '마이', Icon: UserRound },
];

export function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.wrap}>
      {tabs.map(({ key, label, Icon }) => {
        const selected = active === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            <View style={[styles.iconBox, selected && styles.activeIconBox]}>
              <Icon color={selected ? '#ffffff' : MUTED} size={19} strokeWidth={2.35} />
            </View>
            <Text style={[styles.label, selected && styles.activeLabel]}>{label}</Text>
          </Pressable>
        );
      })}
      <View style={styles.homeIndicator} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRightColor: Platform.OS === 'web' ? '#edf0f4' : undefined,
    borderRightWidth: Platform.OS === 'web' ? 1 : 0,
    borderTopColor: Platform.OS === 'web' ? undefined : '#edf0f4',
    borderTopWidth: Platform.OS === 'web' ? 0 : 1,
    bottom: Platform.OS === 'web' ? 0 : 0,
    flexDirection: Platform.OS === 'web' ? 'column' : 'row',
    gap: Platform.OS === 'web' ? 8 : 0,
    height: Platform.OS === 'web' ? '100%' : 84,
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'space-around',
    left: 0,
    paddingBottom: Platform.OS === 'web' ? 18 : 15,
    paddingHorizontal: Platform.OS === 'web' ? 12 : 10,
    paddingTop: Platform.OS === 'web' ? 22 : 0,
    position: 'absolute',
    right: Platform.OS === 'web' ? undefined : 0,
    top: Platform.OS === 'web' ? 0 : undefined,
    width: Platform.OS === 'web' ? 92 : undefined,
  },
  item: {
    alignItems: 'center',
    borderRadius: Platform.OS === 'web' ? 16 : 0,
    flex: Platform.OS === 'web' ? 0 : 1,
    gap: 4,
    minHeight: Platform.OS === 'web' ? 68 : undefined,
    paddingVertical: Platform.OS === 'web' ? 8 : 0,
    width: '100%',
  },
  itemPressed: {
    opacity: 0.72,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 24,
    height: 36,
    justifyContent: 'center',
    width: 46,
  },
  activeIconBox: {
    backgroundColor: BLUE,
    width: 54,
  },
  label: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '900',
  },
  activeLabel: {
    color: INK,
  },
  homeIndicator: {
    backgroundColor: '#111827',
    borderRadius: 2,
    bottom: 5,
    height: 4,
    opacity: Platform.OS === 'web' ? 0 : 0.16,
    position: 'absolute',
    width: 112,
  },
});
