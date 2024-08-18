import * as Font from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { Container } from '~/components/Container';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const Home = memo(() => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  const loadFonts = async () => {
    await Font.loadAsync({
      PoppinsSemiBold: require('../assets/fonts/PoppinsSemiBold.ttf'),
      PoppinsSemiBoldItalic: require('../assets/fonts/PoppinsSemiBoldItalic.ttf'),
      Montserrat:require ("../assets/fonts/Montserrat.ttf"),
    });
    setFontsLoaded(true);
    SplashScreen.hideAsync();
  };
  
  useEffect(() => {
    loadFonts();
  }, []);  

  const handleLoginPress = useCallback(() => {
    router.push('../Screens/Login');
  }, [router]);

  const handleSignUpPress = useCallback(() => {
    router.push('../Screens/Signup');
  }, [router]);

  const MainPress = useCallback(() => {
    router.push('../Screens/MainScreen');
  }, [router]);
  
  if (!fontsLoaded) {
    return null; // Prevent rendering until fonts are loaded
  }


  return (
    <>
      <Stack.Screen options={{ title: 'Divvy.inc', headerShown: false }} />
      <Container>
        <View className="flex-1 items-center justify-center">
          <TouchableOpacity
            onPress={handleLoginPress}
            className="bg-blue-500 py-3 px-6 rounded-lg mb-4"
          >
            <Text
              className="text-white font-semibold text-lg"
              style={{ fontFamily: 'PoppinsSemiBold' }}
            >
              Go to Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSignUpPress}
            className="bg-blue-500 py-3 px-6 rounded-lg mb-4"
          >
            <Text
              className="text-white font-semibold text-lg"
              style={{ fontFamily: 'PoppinsSemiBold' }}
            >
              Go to Signup
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={MainPress}
            className="bg-blue-500 py-3 px-6 rounded-lg"
          >
            <Text
              className="text-white font-semibold text-lg"
              style={{ fontFamily: 'PoppinsSemiBold' }}
            >
              Go to Main
            </Text>
          </TouchableOpacity>
        </View>
      </Container>
    </>
  );
});

export default Home;
