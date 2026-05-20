import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bot, Home, MessageCircle, UserRound, UsersRound } from 'lucide-react-native';
import { BLUE, INK, MUTED } from '../data/yetiData';

const tabs = [
  { key: 'home', label: '홈', Icon: Home },
  { key: 'ai', label: 'AI', Icon: Bot },
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
    borderTopColor: '#edf0f4',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 84,
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 15,
    paddingHorizontal: 10,
    position: 'absolute',
    right: 0,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 4,
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
    opacity: 0.16,
    position: 'absolute',
    width: 112,
  },
});
