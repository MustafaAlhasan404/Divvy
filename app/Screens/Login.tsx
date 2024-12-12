import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Firebase from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Platform,
  KeyboardEvent,
  KeyboardAvoidingView,
  TextStyle,
  Alert,
  Image,
  Switch,
} from 'react-native';

import { useTheme } from '../../ThemeContext';
import { db } from '../../firebaseConfig';

const TypewriterText: React.FC<{ text: string; delay?: number; style?: TextStyle }> = ({ text, delay = 100, style }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const cursorRef = useRef<NodeJS.Timeout | null>(null);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let i = 0;
    typingRef.current = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        if (typingRef.current) clearInterval(typingRef.current);
        setIsTypingComplete(true);
      }
    }, delay);

    cursorRef.current = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
      if (cursorRef.current) clearInterval(cursorRef.current);
    };
  }, [text, delay]);

  return (
    <Text style={style}>
      {displayedText}
      {!isTypingComplete && <Text style={{ opacity: showCursor ? 1 : 0 }}>|</Text>}
    </Text>
  );
};

const Login: React.FC = () => {
  const theme = useTheme();
  const [identifier, setIdentifier] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rememberPassword, setRememberPassword] = useState<boolean>(false);
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0));

  const checkSavedCredentials = async () => {
    const savedCredentials = await SecureStore.getItemAsync('userCredentials');
    if (savedCredentials) {
      const { identifier: savedIdentifier, password: savedPassword } = JSON.parse(savedCredentials);
      setIdentifier(savedIdentifier);
      setPassword(savedPassword);
      setRememberPassword(true);
    }
  };

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    if (Platform.OS === 'ios') {
      const keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
      const keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }

    checkSavedCredentials();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      checkSavedCredentials();
    }, [])
  );

  const keyboardWillShow = (event: KeyboardEvent) => {
    const keyboardHeight = event.endCoordinates.height;
    Animated.timing(keyboardOffset, {
      duration: event.duration || 300,
      toValue: -keyboardHeight / 2.5,
      useNativeDriver: true,
    }).start();
  };

  const keyboardWillHide = (event: KeyboardEvent) => {
    Animated.timing(keyboardOffset, {
      duration: event.duration || 300,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const backgroundStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-1000, 0],
        }),
      },
    ],
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const auth = Firebase.getAuth();
      let userCredential;

      if (identifier.includes('@')) {
        userCredential = await Firebase.signInWithEmailAndPassword(auth, identifier, password);
      } else {
        const usersQuery = query(collection(db, 'Users'), where('username', '==', identifier));
        const querySnapshot = await getDocs(usersQuery);
        if (querySnapshot.empty) {
          throw new Error('User not found');
        }
        const userDoc = querySnapshot.docs[0];
        const userEmail = userDoc.data().email;
        userCredential = await Firebase.signInWithEmailAndPassword(auth, userEmail, password);
      }

      if (!userCredential.user.emailVerified) {
        await Firebase.sendEmailVerification(userCredential.user);
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in. A new verification email has been sent.',
          [{ text: 'OK', onPress: () => Firebase.signOut(auth) }]
        );
      } else {
        if (rememberPassword) {
          await SecureStore.setItemAsync('userCredentials', JSON.stringify({ identifier, password }));
        } else {
          await SecureStore.deleteItemAsync('userCredentials');
        }
        router.replace('../(tabs)/MainScreen');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login Error', 'Invalid username/email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => (
    <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
      <View className="flex-1 justify-center">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <View className="px-2" style={{ flex: 1 }}>
            <TypewriterText
              text="Log In"
              style={{
                color: theme.text,
                fontSize: 36,
                fontWeight: 'bold',
                fontFamily: 'PoppinsSemiBold',
              }}
            />
          </View>
          <Image
            source={require('../../assets/app-logo-white.png')}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              backgroundColor: theme.primary,
              color: theme.text,
              borderRadius: 15,
              padding: 15,
              fontSize: 16,
              fontFamily: 'PoppinsSemiBold',
            }}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Username or Email"
            placeholderTextColor="#6B7280"
            keyboardAppearance="dark"
            accessibilityLabel="Username or Email Input"
            accessibilityRole="text"
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={{
                backgroundColor: theme.primary,
                color: theme.text,
                borderRadius: 15,
                padding: 15,
                fontSize: 16,
                paddingRight: 50,
                fontFamily: 'PoppinsSemiBold',
              }}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Password"
              placeholderTextColor="#6B7280"
              keyboardAppearance="dark"
              accessibilityLabel="Password Input"
              accessibilityRole="text"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 15, top: 15 }}
              accessibilityLabel={showPassword ? 'Hide Password' : 'Show Password'}
              accessibilityRole="button"
            >
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={24}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Switch
            value={rememberPassword}
            onValueChange={setRememberPassword}
            trackColor={{ false: "#767577", true: theme.accent }}
            thumbColor={rememberPassword ? theme.primary : "#f4f3f4"}
          />
          <Text style={{ marginLeft: 8, color: theme.text }}>Remember Password</Text>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            padding: 15,
            borderRadius: 15,
            marginBottom: 20,
          }}
          onPress={handleLogin}
          disabled={loading}
          accessibilityLabel="Log In"
          accessibilityRole="button"
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
            {loading ? 'Logging In...' : 'Log In'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ marginBottom: 20 }}
          onPress={() => router.push('../Screens/ForgotPassword')}
          accessibilityLabel="Forgot Password"
          accessibilityRole="link"
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.accent, textAlign: 'center', fontSize: 14 }}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            padding: 15,
            borderRadius: 15,
            marginBottom: 30,
          }}
          onPress={() => router.push('../Screens/Signup')}
          accessibilityLabel="Sign Up New Account"
          accessibilityRole="button"
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
            Sign Up New Account
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <>
      <Stack.Screen options={{
        headerShown: false,
        gestureEnabled: false,
      }} />
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.secondary },
          ]}
          className="rounded-b-[50px] md:rounded-b-[80px]"
        />
        {Platform.OS === 'ios' ? (
          <Animated.View
            style={{
              flex: 1,
              transform: [{ translateY: keyboardOffset }],
            }}
          >
            {renderContent()}
          </Animated.View>
        ) : (
          <KeyboardAvoidingView
            behavior="padding"
            className="flex-1 mt-16"
          >
            {renderContent()}
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </>
  );
};

export default Login;
