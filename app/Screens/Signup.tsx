import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardTypeOptions,
  SafeAreaView,
  Keyboard,
  Platform,
  KeyboardEvent,
} from 'react-native';

import { useTheme } from '../../ThemeContext';

const Signup: React.FC = memo(() => {
  const theme = useTheme();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [stage, setStage] = useState(1);
  const [keyboardOffset] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      keyboardWillShow
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      keyboardWillHide
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const keyboardWillShow = (event: KeyboardEvent) => {
    const keyboardHeight = event.endCoordinates.height;
    // Adjust the translation value as per your UI needs
    Animated.timing(keyboardOffset, {
      duration: event.duration,
      toValue: -keyboardHeight / 2.5, // Modify this value to control the view shift
      useNativeDriver: true,
    }).start();
  };

  const keyboardWillHide = (event: KeyboardEvent) => {
    Animated.timing(keyboardOffset, {
      duration: event.duration,
      toValue: 0,
      useNativeDriver: true,
    }).start();
  };

  const backgroundStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [1000, 0],
        }),
      },
    ],
  };

  const handleSignup = () => {
    // Implement signup functionality
  };

  const renderStageOne = () => (
    <>
      {[
        { label: 'Full Name', value: fullName, setter: setFullName, placeholder: 'John Doe' },
        {
          label: 'Email',
          value: email,
          setter: setEmail,
          placeholder: 'example@example.com',
          keyboardType: 'email-address' as KeyboardTypeOptions,
          autoCapitalize: 'none' as 'none',
        },
        {
          label: 'Mobile Number',
          value: mobileNumber,
          setter: setMobileNumber,
          placeholder: '+1 123 456 789',
          keyboardType: 'phone-pad' as KeyboardTypeOptions,
        },
        { label: 'Date Of Birth', value: dateOfBirth, setter: setDateOfBirth, placeholder: 'DD/MM/YYYY' },
      ].map((field, index) => (
        <View key={index} style={{ marginBottom: 20 }}>
          <TextInput
            style={{
              backgroundColor: theme.primary,
              color: theme.text,
              borderRadius: 15,
              padding: 15,
              fontSize: 16,
            }}
            value={field.value}
            onChangeText={field.setter}
            placeholder={field.placeholder}
            placeholderTextColor="#6B7280"
            keyboardType={field.keyboardType}
            autoCapitalize={field.autoCapitalize}
            keyboardAppearance="dark"
          />
        </View>
      ))}
      <TouchableOpacity
        style={{ backgroundColor: theme.accent }}
        className="py-3 md:py-4 rounded-2xl mb-4"
        onPress={() => setStage(2)}
      >
        <Text style={{ color: theme.primary }} className="text-center text-base md:text-lg font-semibold">
          Next
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderStageTwo = () => (
    <>
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
            secureTextEntry
            placeholder="Password"
            placeholderTextColor="#6B7280"
            keyboardAppearance="dark"
          />
          <Ionicons name="eye-off-outline" size={24} color="#6B7280" style={{ position: 'absolute', right: 12, top: 12 }} />
        </View>
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
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm Password"
            placeholderTextColor="#6B7280"
            keyboardAppearance="dark"
          />
          <Ionicons name="eye-off-outline" size={24} color="#6B7280" style={{ position: 'absolute', right: 12, top: 12 }} />
        </View>
      </View>

      <Text style={{ color: theme.text }} className="text-xs mb-4 text-center">
        By continuing, you agree to Terms of Use and Privacy Policy.
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: theme.accent }}
        className="py-3 md:py-4 rounded-2xl mb-4"
        onPress={handleSignup}
      >
        <Text style={{ color: theme.primary }} className="text-center text-base md:text-lg font-semibold">
          Sign Up
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { 
              position: 'absolute', 
              top:0,
              left: 0, 
              right: 0, 
              height: '200%', 
              backgroundColor: theme.secondary,
            },
          ]}
          className="rounded-t-[50px] md:rounded-t-[80px]"
        />
        <Animated.View 
          style={{
            flex: 1,
            transform: [{ translateY: keyboardOffset }],
          }}
        >
          <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
            <View className="flex-1 justify-center">
              <Text style={{ color: theme.text }} className="text-3xl md:text-2xl font-bold bottom-16 self-center">
                {stage === 1 ? 'Create Account' : 'Set Password'}
              </Text>
              {stage === 1 ? renderStageOne() : renderStageTwo()}

              <TouchableOpacity className="py-2" onPress={() => router.push('../Screens/Login')}>
                <Text style={{ color: theme.text }} className="text-center text-sm">
                  Already have an account?{' '}
                  <Text style={{ color: theme.accent }}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </>
  );
});

export default Signup;
