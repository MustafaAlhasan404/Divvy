import { Stack, useRouter } from 'expo-router';
import React, { useCallback, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { Container } from '~/components/Container';

const Home = memo(() => {
  const router = useRouter();

  const handleLoginPress = useCallback(() => {
    router.push('../Screens/Login');
  }, [router]);

  const handleSignUpPress = useCallback(() => {
    router.push('../Screens/Signup');
  }, [router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Divvy.inc', headerShown: false }} />
      <Container>
        <View className="flex-1 items-center justify-center">
          <TouchableOpacity
            onPress={handleLoginPress}
            className="bg-blue-500 py-3 px-6 rounded-lg mb-4"
          >
            <Text className="text-white font-semibold text-lg">Go to Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignUpPress}
            className="bg-blue-500 py-3 px-6 rounded-lg"
          >
            <Text className="text-white font-semibold text-lg">Go to Signup</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </>
  );
});

export default Home;