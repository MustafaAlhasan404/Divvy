/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useRouter } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import Animated, {
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';
import { auth } from '../../firebaseConfig';
import { getUser, User } from '../../firestore';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingLogo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'PoppinsSemiBold',
  },
});

const LoadingOverlay: React.FC = () => {
  const opacity = useSharedValue(0.5);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    translateY.value = withRepeat(
      withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
      <View style={styles.loadingContainer}>
        <Animated.Image
          source={require('../../assets/app-logo-white.png')}
          style={[styles.loadingLogo, animatedStyle]}
        />
        <Animated.Text style={[styles.loadingText, animatedStyle]}>
          Sending password reset email...
        </Animated.Text>
      </View>
    </BlurView>
  );
};

const ProfileSettings: React.FC = () => {
  const theme = useTheme();
  const router = useRouter();
  const animation = useSharedValue(0);

  const [user, setUser] = useState<User | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    animation.value = withTiming(1, { duration: 900 });
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userData = await getUser(currentUser.uid);
      setUser(userData);
      setEmail(currentUser.email || '');
    }
  };

  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(animation.value, [0, 1], [1000, 0]) }],
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

  const handleChangePassword = async () => {
    if (!email) {
      Alert.alert('Error', 'No email address associated with this account');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        'Password Reset Email Sent',
        'Please check your email for instructions to reset your password.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Profile & Settings",
          headerTitleAlign: "center",
          gestureEnabled: false,
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
        className="rounded-b-[50px] md:rounded-b-[80px]"
      />
      <ScrollView className="flex-1 px-4 py-20 md:px-6 md:py-10">
        {renderSection("Profile Information", (
          <>
            {renderProfileInfo("person", user?.fullName || 'Loading...')}
            {renderProfileInfo("mail", user?.email || 'Loading...')}
            {user?.phoneNumber && renderProfileInfo("call", user.phoneNumber)}
          </>
        ), 100)}

        {renderSection("Security", (
          <>
            <TouchableOpacity
              style={{ backgroundColor: theme.accent, padding: 10, borderRadius: 10, marginTop: 10 }}
              onPress={handleChangePassword}
            >
              <Text style={[{ color: theme.primary, textAlign: 'center', fontSize: 16 }, textStyle]}>
                Change Password
              </Text>
            </TouchableOpacity>
          </>
        ), 200)}

        {/* {renderSection("App Settings", (
          <>
            {renderSwitchItem("Notifications", notificationsEnabled, setNotificationsEnabled)}
            {renderSwitchItem("Dark Mode", darkModeEnabled, setDarkModeEnabled)}
          </>
        ), 300)} */}

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
        ), 400)}

        <TouchableOpacity
          style={{ backgroundColor: theme.negative, padding: 14, borderRadius: 12, marginTop: 20, marginBottom: 16 }}
          onPress={() => {
            auth.signOut();
            router.push('../Screens/Login');
          }}
        >
          <Text style={[{ color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }, textStyle]}>
            Sign Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <LoadingOverlay />
        </View>
      )}
    </SafeAreaView>
  );
};

export default ProfileSettings;
