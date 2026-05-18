import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BLUE, MUTED } from '../data/yetiData';

const tabs = [
  ['home', '홈', '⌂'],
  ['ai', 'AI', '+'],
  ['chat', '채팅', '○'],
  ['friends', '친구', '☺'],
  ['my', '마이', '•'],
];

export function BottomTabs({ active, onChange }) {
  return (
    <View style={styles.wrap}>
      {tabs.map(([key, label, icon]) => (
        <Pressable key={key} onPress={() => onChange(key)} style={styles.item}>
          <View style={[styles.iconBox, active === key && styles.activeIconBox]}>
            <Text style={[styles.icon, active === key && styles.activeIcon]}>{icon}</Text>
          </View>
          <Text style={[styles.label, active === key && styles.activeLabel]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderTopColor: '#edf0f4',
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    height: 74,
    justifyContent: 'space-around',
    left: 0,
    paddingBottom: 8,
    position: 'absolute',
    right: 0,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 20,
    height: 34,
    justifyContent: 'center',
    width: 46,
  },
  activeIconBox: {
    backgroundColor: BLUE,
  },
  icon: {
    color: MUTED,
    fontSize: 17,
    fontWeight: '900',
  },
  activeIcon: {
    color: '#ffffff',
  },
  label: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '800',
  },
  activeLabel: {
    color: BLUE,
  },
});
