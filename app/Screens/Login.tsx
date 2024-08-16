import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo } from 'react';
import { Animated, View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';

import { useTheme } from '../../ThemeContext';

const Login: React.FC = memo(() => {
  const theme = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
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
            { position: 'absolute', bottom: 0, left: 0, right: 0, height: '110%', backgroundColor: theme.secondary }
          ]}
          className="rounded-t-[50px] md:rounded-t-[80px]"
        />
          <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
            <View className="flex-1 justify-center">
              <Text style={{ color: theme.text }} className="text-6xl md:text-4xl font-bold bottom-32 self-center">
                Welcome
              </Text>

              <View className="mb-6">
                <TextInput
                  style={{ backgroundColor: theme.secondary, color: theme.text }}
                  className="rounded-2xl p-3 md:p-4"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Username Or Email"
                  placeholderTextColor="#6B7280"
                />
              </View>

              <View className="mb-4">
                <View className="relative">
                  <TextInput
                    style={{ backgroundColor: theme.secondary, color: theme.text }}
                    className="rounded-2xl p-3 md:p-4 pr-12"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholder="Password"
                    placeholderTextColor="#6B7280"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 md:right-4 md:top-4"
                  >
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={24} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={{ backgroundColor: theme.accent }}
                className="py-3 md:py-4 rounded-2xl mb-4"
                onPress={handleLogin}
              >
                <Text style={{ color: theme.primary }} className="text-center text-base md:text-lg font-semibold">
                  Log In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="py-2 mb-4">
                <Text style={{ color: theme.accent }} className="text-center text-sm">
                  Forgot Password?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: theme.secondary }}
                className="py-3 md:py-4 rounded-2xl mb-6 md:mb-8"
                onPress={() => router.push('../Screens/Signup')}
              >
                <Text style={{ color: theme.text }} className="text-center text-base md:text-lg font-semibold">
                  Sign Up New Account
                </Text>
              </TouchableOpacity>

              <View>
                <Text style={{ color: theme.text }} className="text-center text-sm">or sign up with</Text>
                <View className="flex-row justify-center space-x-4">
                  <TouchableOpacity style={{ backgroundColor: theme.secondary }} className="p-3 rounded-full">
                    <Ionicons name="logo-facebook" size={24} color={theme.text} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ backgroundColor: theme.secondary }} className="p-3 rounded-full">
                    <Ionicons name="logo-google" size={24} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
      </SafeAreaView>
    </>
  );
});

export default Login;
