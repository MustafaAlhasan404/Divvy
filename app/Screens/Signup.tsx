import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo } from 'react';
import { Animated, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, StatusBar, KeyboardTypeOptions } from 'react-native';

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

  const backgroundStyle = {
    transform: [
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [300, 0],
        }),
      },
    ],
  };

  const handleSignup = () => {
    // Implement signup functionality
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { position: 'absolute', bottom: 0, left: 0, right: 0, height: '125%', backgroundColor: theme.secondary }
          ]}
          className="rounded-t-[50px] md:rounded-t-[80px]"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
            <View className="flex-1 justify-center">
              <Text style={{ color: theme.text }} className="text-3xl md:text-2xl font-bold bottom-16 self-center">
                Create Account
              </Text>

              {[
                { label: "Full Name", value: fullName, setter: setFullName, placeholder: "John Doe" },
                { label: "Email", value: email, setter: setEmail, placeholder: "example@example.com", keyboardType: "email-address" as KeyboardTypeOptions, autoCapitalize: "none" as "none" },
                { label: "Mobile Number", value: mobileNumber, setter: setMobileNumber, placeholder: "+ 123 456 789", keyboardType: "phone-pad" as KeyboardTypeOptions },
                { label: "Date Of Birth", value: dateOfBirth, setter: setDateOfBirth, placeholder: "DD / MM / YYYY" },
              ].map((field, index) => (
                <View key={index} className="mb-4">
                  <Text style={{ color: theme.text }} className="mb-2">{field.label}</Text>
                  <TextInput
                    style={{ backgroundColor: theme.secondary, color: theme.text }}
                    className="rounded-2xl p-3 md:p-4"
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

              {["Password", "Confirm Password"].map((label, index) => (
                <View key={index} className="mb-4">
                  <Text style={{ color: theme.text }} className="mb-2">{label}</Text>
                  <View className="relative">
                    <TextInput
                      style={{ backgroundColor: theme.secondary, color: theme.text }}
                      className="rounded-2xl p-3 md:p-4 pr-12"
                      value={index === 0 ? password : confirmPassword}
                      onChangeText={index === 0 ? setPassword : setConfirmPassword}
                      secureTextEntry
                      placeholder="••••••••"
                      placeholderTextColor="#6B7280"
                      keyboardAppearance="dark"
                    />
                    <Ionicons name="eye-off-outline" size={24} color="#6B7280" style={{ position: 'absolute', right: 12, top: 12 }} />
                  </View>
                </View>
              ))}

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

              <TouchableOpacity
                className="py-2"
                onPress={() => router.push('../Screens/Login')}
              >
                <Text style={{ color: theme.text }} className="text-center text-sm">
                  Already have an account? <Text style={{ color: theme.accent }}>Log In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
});

export default Signup;
