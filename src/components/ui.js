import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BLUE, INK, LINE, MUTED, SOFT } from '../data/yetiData';

const pressedStyle = ({ pressed }) => [
  pressed && {
    opacity: 0.72,
  },
];

export function Screen({ children, title, subtitle, left, right, onBack, onRight, bottom, noHeader = false }) {
  return (
    <View style={styles.screen}>
      {!noHeader ? (
        <View style={styles.topBar}>
          <HeaderSlot content={left} onPress={onBack} align="left" />
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          <HeaderSlot content={right} onPress={onRight} align="right" />
        </View>
      ) : null}
      <ScrollView
        style={styles.scroller}
        contentContainerStyle={[styles.scrollerContent, bottom && styles.withBottom]}
        bounces
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

  if (!content) {
    return <View style={slotStyle} />;
  }

  const inner = typeof content === 'string'
    ? <Text style={styles.topIcon}>{content}</Text>
    : content;

  if (!onPress) {
    return <View style={slotStyle}>{inner}</View>;
  }

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
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.secondaryButton, style, pressedStyle({ pressed })]}>
      <Text style={styles.secondaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function Pill({ children, tone = 'blue', style }) {
  return <Text style={[styles.pill, styles[`pill_${tone}`], style]}>{children}</Text>;
}

export function Avatar({ label, color = BLUE, size = 32 }) {
  return (
    <View style={[styles.avatar, { backgroundColor: color, height: size, width: size, borderRadius: size / 2 }]}>
      <Text style={styles.avatarText}>{label}</Text>
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
    backgroundColor: '#ffffff',
    flex: 1,
  },
  topBar: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.98)',
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'web' ? 8 : 4,
    shadowColor: '#111827',
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    zIndex: 2,
  },
  topIcon: {
    color: INK,
    fontSize: 21,
    fontWeight: '700',
    minWidth: 22,
  },
  topSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 40,
  },
  topSlotLeft: {
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: INK,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 28,
  },
  subtitle: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    marginTop: 5,
  },
  scroller: {
    flex: 1,
  },
  scrollerContent: {
    paddingHorizontal: 22,
    paddingBottom: 28,
    paddingTop: 4,
  },
  withBottom: {
    paddingBottom: 112,
  },
  bottomAction: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    bottom: 0,
    left: 0,
    paddingBottom: 14,
    paddingHorizontal: 22,
    paddingTop: 10,
    position: 'absolute',
    right: 0,
    shadowColor: '#111827',
    shadowOffset: { height: -8, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 15,
    shadowColor: '#111827',
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 9,
    height: 48,
    justifyContent: 'center',
    shadowColor: BLUE,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#eef1f5',
    borderRadius: 8,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: INK,
    fontSize: 14,
    fontWeight: '800',
  },
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
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
    color: '#f59e0b',
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
    fontSize: 13,
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
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: INK,
    fontSize: 16,
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
    paddingVertical: 13,
  },
  toggleLabel: {
    color: INK,
    fontSize: 14,
    fontWeight: '700',
  },
  switchTrack: {
    backgroundColor: '#d1d5db',
    borderRadius: 16,
    height: 28,
    padding: 3,
    width: 48,
  },
  switchTrackOn: {
    backgroundColor: BLUE,
  },
  switchThumb: {
    backgroundColor: '#ffffff',
    borderRadius: 11,
    height: 22,
    width: 22,
  },
  switchThumbOn: {
    transform: [{ translateX: 20 }],
  },
  pressed: {
    opacity: 0.62,
  },
});

export const ui = styles;
