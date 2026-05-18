import { useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export function useHiddenWebScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; overflow: hidden; background: #ffffff; }
      body {
        -webkit-font-smoothing: antialiased;
        -webkit-tap-highlight-color: transparent;
        overscroll-behavior: none;
        touch-action: manipulation;
        user-select: none;
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
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
  },
  phone: {
    backgroundColor: '#ffffff',
    borderRadius: Platform.OS === 'web' ? 0 : 28,
    borderWidth: 0,
    flex: 1,
    maxHeight: Platform.OS === 'web' ? 900 : undefined,
    maxWidth: Platform.OS === 'web' ? 430 : undefined,
    overflow: 'hidden',
    width: '100%',
  },
});
