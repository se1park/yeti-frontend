import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BLUE, INK, LINE, MUTED, SOFT } from '../data/yetiData';

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
    <Pressable hitSlop={10} onPress={onPress} style={slotStyle}>
      {inner}
    </Pressable>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ children, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.primaryButton, style]}>
      <Text style={styles.primaryButtonText}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.secondaryButton, style]}>
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

export function ToggleRow({ label, enabled }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.switchTrack, enabled && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, enabled && styles.switchThumbOn]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
    flex: 1,
  },
  topBar: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 22,
    paddingTop: 4,
  },
  topIcon: {
    color: INK,
    fontSize: 22,
    fontWeight: '400',
    minWidth: 22,
    paddingTop: 2,
  },
  topSlot: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
  },
  topSlotLeft: {
    alignItems: 'flex-start',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: INK,
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 30,
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
  },
  card: {
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    padding: 15,
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 9,
    height: 48,
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: SOFT,
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
});

export const ui = styles;
