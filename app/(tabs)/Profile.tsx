import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
} from 'react-native';
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';

const ProfileSettings: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const animation = useSharedValue(0);

  const [name] = useState('John Doe');
  const [email] = useState('john.doe@example.com');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

  useEffect(() => {
    animation.value = withTiming(1, { duration: 900 });
  }, []);

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(animation.value, [0, 1], [-1000, 0]) }],
  }));

  const textStyle = { fontFamily: 'PoppinsSemiBold' };

  const renderSection = (title: string, children: React.ReactNode, delay: number) => (
    <Animated.View 
      entering={FadeInRight.delay(delay)}
      style={{ backgroundColor: theme.secondary }} 
      className="rounded-xl p-4 mb-3 shadow-md"
    >
      <Text style={[{ color: theme.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 15 }, textStyle]}>{title}</Text>
      {children}
    </Animated.View>
  );

  const renderProfileInfo = (icon: keyof typeof Ionicons.glyphMap, value: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
      <Ionicons name={icon} size={24} color={theme.accent} style={{ marginRight: 10 }} />
      <Text style={[{ color: theme.text, fontSize: 16 }, textStyle]}>{value}</Text>
    </View>
  );

  const renderSwitchItem = (label: string, value: boolean, onValueChange: (value: boolean) => void) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
      <Text style={[{ color: theme.text, fontSize: 16 }, textStyle]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.primary, true: theme.switchActive }}
        thumbColor={value ? theme.text : theme.neutral}
      />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Profile & Settings",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: theme.text,
            fontSize: 20,
            fontFamily: 'PoppinsSemiBold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} style={{ marginLeft: 12 }} />
            </TouchableOpacity>
          ),
        }} 
      />
      <Animated.View
        style={[
          backgroundStyle,
          { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.background },
        ]}
        className="rounded-b-[40px] md:rounded-b-[60px]"
      />
      <ScrollView className="flex-1 px-3 py-16 md:px-4 md:py-8">
        {renderSection("Profile Information", (
          <>
            {renderProfileInfo("person", name)}
            {renderProfileInfo("mail", email)}
          </>
        ), 100)}

        {renderSection("App Settings", (
          <>
            {renderSwitchItem("Notifications", notificationsEnabled, setNotificationsEnabled)}
            {renderSwitchItem("Dark Mode", darkModeEnabled, setDarkModeEnabled)}
          </>
        ), 200)}

        {renderSection("Help & Support", (
          <>
            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[{ color: theme.text, fontSize: 16 }, textStyle]}>FAQ / Help Center</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
              <Text style={[{ color: theme.text, fontSize: 16 }, textStyle]}>Contact Support</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.accent} />
            </TouchableOpacity>
          </>
        ), 300)}

        <TouchableOpacity
          style={{ backgroundColor: theme.negative, padding: 14, borderRadius: 12, marginTop: 20, marginBottom: 16 }}
          onPress={() => router.push('../Screens/Login')}
        >
          <Text style={[{ color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }, textStyle]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileSettings;
