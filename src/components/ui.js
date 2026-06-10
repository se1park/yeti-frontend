import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BLUE, INK, LINE, MUTED, SOFT } from '../data/yetiData';

const pressedStyle = ({ pressed }) => [
  pressed && {
    opacity: 0.88,
  },
];

export function Screen({ children, title, subtitle, left, right, onBack, onRight, bottom, tabInset = false, noHeader = false }) {
  return (
    <View style={styles.screen}>
      {!noHeader ? (
        <View style={styles.topBar}>
          <HeaderSlot content={left} onPress={onBack} align="left" />
          <View style={styles.headerText}>
            {title ? <Text numberOfLines={1} style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text numberOfLines={2} style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <HeaderSlot content={right} onPress={onRight} align="right" />
        </View>
      ) : null}
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[styles.scrollerContent, (bottom || tabInset) && styles.withBottom]}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      {bottom ? <View style={styles.bottomAction}>{bottom}</View> : null}
    </View>
  );
}

function HeaderSlot({ content, onPress, align }) {
  const slotStyle = [styles.topSlot, align === 'left' && styles.topSlotLeft];

  if (!content) return <View style={slotStyle} />;

  const inner = typeof content === 'string'
    ? <Text style={styles.topIcon}>{content}</Text>
    : content;

  if (!onPress) return <View style={slotStyle}>{inner}</View>;

  return (
    <Pressable hitSlop={10} onPress={onPress} style={({ pressed }) => [...slotStyle, pressed && styles.pressed]}>
      {inner}
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ children, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, style, pressedStyle({ pressed })]}>
      {typeof children === 'string' ? <Text style={styles.primaryButtonText}>{children}</Text> : children}
    </Pressable>
  );
}

export function SecondaryButton({ children, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, style, pressedStyle({ pressed })]}>
      {typeof children === 'string' ? <Text style={styles.secondaryButtonText}>{children}</Text> : children}
    </Pressable>
  );
}

export function Pill({ children, tone = 'blue', style }) {
  return <Text style={[styles.pill, styles[`pill_${tone}`], style]}>{children}</Text>;
}

export function Avatar({ label, color = BLUE, size = 32 }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color, height: size, width: size, borderRadius: size / 2 }]}>
      <Text style={[styles.avatarText, { fontSize: Math.max(12, size * 0.24) }]}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function SectionTitle({ children, right }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{children}</Text>
      {right ? <Text style={styles.sectionRight}>{right}</Text> : null}
    </View>
  );
}

export function ToggleRow({ label, enabled, onChange }) {
  const [isEnabled, setIsEnabled] = useState(Boolean(enabled));

  const toggle = () => {
    setIsEnabled((previous) => {
      const next = !previous;
      onChange?.(next);
      return next;
    });
  };

  return (
    <Pressable onPress={toggle} style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.switchTrack, isEnabled && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, isEnabled && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#f6f7f9',
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: '#f6f7f9',
    flexDirection: 'row',
    maxWidth: Platform.OS === 'web' ? 1180 : undefined,
    minHeight: 56,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 8 : 4,
    width: Platform.OS === 'web' ? '100%' : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    zIndex: 2,
  },
  topIcon: {
    color: INK,
    fontSize: 20,
    fontWeight: '800',
    minWidth: 22,
  },
  topSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 42,
    minWidth: 42,
  },
  topSlotLeft: {
    alignItems: 'flex-start',
  },
  headerText: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: INK,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 23,
    textAlign: 'center',
  },
  subtitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 3,
    textAlign: 'center',
  },
  scroller: {
    flex: 1,
  },
  scrollerContent: {
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    flexGrow: 1,
    maxWidth: Platform.OS === 'web' ? 1180 : undefined,
    paddingBottom: 118,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 20,
    paddingTop: 6,
    width: '100%',
  },
  withBottom: {
    paddingBottom: 148,
  },
  bottomAction: {
    backgroundColor: 'rgba(246,247,249,0.96)',
    bottom: 0,
    left: 0,
    paddingBottom: 16,
    paddingHorizontal: Platform.OS === 'web' ? 32 : 20,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#eef1f5',
    borderRadius: 12,
    flex: 1,
    height: 46,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: INK,
    fontSize: 14,
    fontWeight: '800',
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pill_blue: {
    backgroundColor: '#e8f1ff',
    color: BLUE,
  },
  pill_green: {
    backgroundColor: '#dcfce7',
    color: '#16a34a',
  },
  pill_yellow: {
    backgroundColor: '#fef3c7',
    color: '#d97706',
  },
  pill_gray: {
    backgroundColor: SOFT,
    color: MUTED,
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '900',
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '900',
  },
  sectionRight: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800',
  },
  toggleRow: {
    alignItems: 'center',
    borderBottomColor: LINE,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  toggleLabel: {
    color: INK,
    fontSize: 15,
    fontWeight: '800',
  },
  switchTrack: {
    backgroundColor: '#cbd1da',
    borderRadius: 16,
    height: 30,
    padding: 3,
    width: 50,
  },
  switchTrackOn: {
    backgroundColor: BLUE,
  },
  switchThumb: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    height: 24,
    width: 24,
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  pressed: {
    opacity: 0.88,
  },
});

export const ui = styles;
