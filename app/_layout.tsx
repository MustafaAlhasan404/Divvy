import '../global.css';
import { NavigationContainer } from '@react-navigation/native';
import { Stack } from 'expo-router';

import { ThemeProvider } from '../ThemeContext';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <NavigationContainer>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </NavigationContainer>
  );
}
