import { useEffect } from 'react';
import { Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export function useHiddenWebScrollbars() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.textContent = `
      html, body, #root { height: 100%; margin: 0; overflow: hidden; background: #f4f5f7; }
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
    backgroundColor: '#f4f5f7',
    flex: 1,
    justifyContent: 'center',
  },
  phone: {
    backgroundColor: '#ffffff',
    borderColor: '#dde1e7',
    borderRadius: 28,
    borderWidth: Platform.OS === 'web' ? 1 : 0,
    flex: 1,
    maxHeight: Platform.OS === 'web' ? 844 : undefined,
    maxWidth: 390,
    overflow: 'hidden',
    shadowColor: '#1f2937',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    width: '100%',
  },
});
