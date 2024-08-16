import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect } from 'react';
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
} from 'react-native';

import { useTheme } from '../../ThemeContext';

const Login: React.FC = memo(() => {
  const theme = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0)); // State for keyboard offset

  useEffect(() => {
    // Start the entry animation
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    // Add keyboard event listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    // Cleanup listeners on component unmount
    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  // Function to handle the keyboard showing event
  const keyboardWillShow = (event: KeyboardEvent) => {
    const keyboardHeight = event.endCoordinates.height;
    Animated.timing(keyboardOffset, {
      duration: event.duration || 300,
      toValue: -keyboardHeight / 2.5, // Adjust this value as needed
      useNativeDriver: true,
    }).start();
  };

  // Function to handle the keyboard hiding event
  const keyboardWillHide = (event: KeyboardEvent) => {
    Animated.timing(keyboardOffset, {
      duration: event.duration || 300,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  // Background animation style
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

  // Function to handle login button press
  const handleLogin = () => {
    // Implement login functionality
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { position: 'absolute', top: 0, left: 0, right: 0, height: '300%', backgroundColor: theme.secondary },
          ]}
          className="rounded-b-[50px] md:rounded-b-[80px]"
        />
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateY: keyboardOffset }], // Apply keyboard offset
          }}
        >
          <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
            <View className="flex-1 justify-center">
              <Text style={{ color: theme.text }} className="text-3xl md:text-2xl font-bold bottom-16 self-center">
                Welcome
              </Text>

              <View style={{ marginBottom: 20 }}>
                <TextInput
                  style={{
                    backgroundColor: theme.primary,
                    color: theme.text,
                    borderRadius: 15,
                    padding: 15,
                    fontSize: 16,
                  }}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Username Or Email"
                  placeholderTextColor="#6B7280"
                  keyboardAppearance="dark"
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
                    }}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Password"
                    placeholderTextColor="#6B7280"
                    keyboardAppearance="dark"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 15, top: 15 }}
                  >
                    <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.accent,
                  padding: 15,
                  borderRadius: 15,
                  marginBottom: 20,
                }}
                onPress={handleLogin}
              >
                <Text style={{ color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>Log In</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ marginBottom: 20 }}>
                <Text style={{ color: theme.accent, textAlign: 'center', fontSize: 16 }}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  padding: 15,
                  borderRadius: 15,
                  marginBottom: 30,
                }}
                onPress={() => router.push('../Screens/Signup')}
              >
                <Text style={{ color: theme.text, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                  Sign Up New Account
                </Text>
              </TouchableOpacity>

              <View>
                <Text style={{ color: theme.text, textAlign: 'center', fontSize: 14, marginBottom: 15 }}>
                  or sign up with
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  <TouchableOpacity style={{ backgroundColor: theme.primary, padding: 15, borderRadius: 30, marginRight: 20 }}>
                    <Ionicons name="logo-facebook" size={30} color={theme.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ backgroundColor: theme.primary, padding: 15, borderRadius: 30 }}>
                    <Ionicons name="logo-google" size={30} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </>
  );
});

export default Login;
