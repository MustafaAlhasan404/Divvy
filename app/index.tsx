import * as Font from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, memo } from 'react';

import { app } from '../firebaseConfig';

import { Container } from '~/components/Container';

SplashScreen.preventAutoHideAsync();

const Home = memo(() => {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const router = useRouter();

  const loadFonts = async () => {
    await Font.loadAsync({
      PoppinsSemiBold: require('~/assets/fonts/PoppinsSemiBold.ttf'),
      PoppinsSemiBoldItalic: require('~/assets/fonts/PoppinsSemiBoldItalic.ttf'),
      Montserrat: require("~/assets/fonts/Montserrat.ttf"),
    });
    setFontsLoaded(true);
    SplashScreen.hideAsync();
  };

  useEffect(() => {
    loadFonts();
    // Firebase is now initialized here
    console.log('Firebase initialized:', app);
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      router.replace('../Screens/Login');
    }
  }, [fontsLoaded, router]);

  return (
    <>
      <Stack.Screen options={{
        title: 'Divvy.inc',
        gestureEnabled: false,
        headerShown: false
      }} />
      <Container children={undefined} />
    </>
  );
});

export default Home;
