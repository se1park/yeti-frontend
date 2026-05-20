import { useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export function useHiddenWebScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; overflow: hidden; background: #eef1f5; }
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

export function AppFrame({ children }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.phone}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    alignItems: 'center',
    backgroundColor: '#eef1f5',
    flex: 1,
    justifyContent: 'center',
  },
  phone: {
    backgroundColor: '#f6f7f9',
    borderRadius: Platform.OS === 'web' ? 34 : 0,
    flex: 1,
    maxHeight: Platform.OS === 'web' ? 900 : undefined,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { height: 22, width: 0 },
    shadowOpacity: Platform.OS === 'web' ? 0.12 : 0,
    shadowRadius: 42,
    width: '100%',
  },
});
