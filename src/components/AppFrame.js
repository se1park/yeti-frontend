import { useEffect } from 'react';
import { Platform, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Bell, Search, Settings } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

export function useHiddenWebScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; overflow: hidden; background: #f6f7f9; }
      body {
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
        overscroll-behavior: none;
        touch-action: manipulation;
        user-select: none;
      }
      button, input, textarea, select, a, [role="button"] {
        -webkit-tap-highlight-color: transparent;
        outline: none !important;
      }
      input, textarea {
        user-select: text;
      }
      * {
        box-sizing: border-box;
      }
      * { scrollbar-width: none; -ms-overflow-style: none; }
      *::-webkit-scrollbar { display: none; width: 0; height: 0; }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
}

function getEmailName(email) {
  return typeof email === 'string' && email.includes('@') ? email.split('@')[0] : '';
}

function getUserLabel(user) {
  return user?.nickname
    || user?.displayName
    || user?.name
    || user?.username
    || getEmailName(user?.email)
    || 'Yeti';
}

export function AppFrame({ children, isAuthenticated = false, onLogoPress, pendingCount = 0, session }) {
  const userLabel = getUserLabel(session?.user);
  const avatarLabel = userLabel.slice(0, 1).toUpperCase();

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.desktopShell}>
          <View style={styles.desktopTopBar}>
            <Pressable onPress={onLogoPress} style={({ pressed }) => [styles.brandBlock, pressed && styles.pressed]}>
              <Text style={styles.brandMark}>Y</Text>
              <Text style={styles.brandText}>Yeti Desktop</Text>
            </Pressable>
            <View style={styles.searchBox}>
              <Search color="#98a2b3" size={15} strokeWidth={2.3} />
              <Text style={styles.searchText}>일정, 친구, 채팅 검색</Text>
            </View>
            <View style={styles.topActions}>
              {isAuthenticated ? (
                <>
                  <View style={styles.topIcon}>
                    <Bell color="#667085" size={17} strokeWidth={2.3} />
                    {pendingCount > 0 ? <View style={styles.notificationDot} /> : null}
                  </View>
                  <View style={styles.topIcon}><Settings color="#667085" size={17} strokeWidth={2.3} /></View>
                  <View style={styles.userPill}>
                    <Text style={styles.userAvatar}>{avatarLabel}</Text>
                    <Text numberOfLines={1} style={styles.userPillText}>{userLabel}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
          <View style={styles.desktopWorkspace}>
            <View style={styles.desktopMain}>{children}</View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.phone}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    alignItems: 'stretch',
    backgroundColor: '#f6f7f9',
    flex: 1,
    justifyContent: 'flex-start',
  },
  phone: {
    backgroundColor: '#f6f7f9',
    borderRadius: 0,
    flex: 1,
    height: '100%',
    maxHeight: undefined,
    maxWidth: undefined,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { height: 22, width: 0 },
    shadowOpacity: 0,
    shadowRadius: 42,
    width: '100%',
  },
  desktopShell: {
    backgroundColor: '#f6f7f9',
    flex: 1,
  },
  desktopTopBar: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomColor: '#e8ebf0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 18,
    height: 58,
    paddingHorizontal: 22,
  },
  brandBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    width: 220,
  },
  pressed: {
    opacity: 0.72,
  },
  brandMark: {
    backgroundColor: '#111827',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  brandText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderColor: '#e4e7ec',
    borderRadius: 9,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    height: 36,
    maxWidth: 520,
    paddingHorizontal: 12,
  },
  searchText: {
    color: '#98a2b3',
    fontSize: 12,
    fontWeight: '700',
  },
  topActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginLeft: 'auto',
  },
  topIcon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    position: 'relative',
    width: 32,
  },
  notificationDot: {
    backgroundColor: '#f04454',
    borderColor: '#ffffff',
    borderRadius: 5,
    borderWidth: 2,
    height: 10,
    position: 'absolute',
    right: 7,
    top: 6,
    width: 10,
  },
  userPill: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    height: 34,
    paddingHorizontal: 12,
    maxWidth: 184,
  },
  userAvatar: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  userPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  desktopWorkspace: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  desktopMain: {
    flex: 1,
    minWidth: 0,
  },
});
