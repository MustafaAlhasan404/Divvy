
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';

import { useTheme } from '../../ThemeContext';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.text,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 0,
          borderRadius: 15,
          height: 60,
          backgroundColor: 'transparent',
        },
        tabBarBackground: () => (
          <BlurView tint={theme.isDark ? 'dark' : 'light'} intensity={100} style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            borderRadius: 15,
          }}/>
        ),
        tabBarItemStyle: {
          padding: 5,
        },
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="MainScreen"
        options={{
          title: 'Main',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
          headerShown: true,
        }}
      />
    </Tabs>
  );
}
