import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  KeyboardEvent,
  Dimensions,
} from 'react-native';

import { useTheme } from '../../ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Create_join: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0));
  const [groupCode, setGroupCode] = useState('');

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();

    if (Platform.OS === 'ios') {
      const keyboardWillShowListener = Keyboard.addListener(
        'keyboardWillShow',
        keyboardWillShow
      );
      const keyboardWillHideListener = Keyboard.addListener(
        'keyboardWillHide',
        keyboardWillHide
      );

      return () => {
        keyboardWillShowListener.remove();
        keyboardWillHideListener.remove();
      };
    }
  }, []);

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
          outputRange: [1000, 0],
        }),
      },
    ],
  };

  const handleCreateGroup = () => {
    router.push('../Screens/CreateNewGroup');
  };

  const handleJoinGroup = () => {
    console.log('Joining group with code:', groupCode);
  };

  const renderContent = () => (
    <ScrollView 
      style={{ flexGrow: 1 }} 
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: SCREEN_HEIGHT * 0.1, paddingBottom: 36 }}
    >
      <View className="flex-1 mt-12">
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, fontSize: 28, flex: 1 }}>
            Join or Create a Group
          </Text>
          <Ionicons name="people-circle-outline" size={70} color={theme.text} />
        </View>
        <Text style={{ fontFamily: 'PoppinsRegular', color: theme.text, fontSize: 16, marginBottom: 20 }}>
          Connect with friends or start your own group adventure!
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            padding: 18,
            borderRadius: 20,
            width: '100%',
            elevation: 3,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
          onPress={handleCreateGroup}
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, textAlign: 'center', fontSize: 18 }}>
            Create a New Group
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 30 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.text }} />
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, textAlign: 'center', fontSize: 16, marginHorizontal: 10 }}>
            Or
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: theme.text }} />
        </View>

        <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, fontSize: 20, marginBottom: 15 }}>
          Join an Existing Group
        </Text>

        <View style={{ width: '100%', marginBottom: 25 }}>
          <TextInput
            style={{
              backgroundColor: theme.primary,
              color: theme.text,
              borderRadius: 15,
              padding: 15,
              fontSize: 16,
              fontFamily: 'PoppinsRegular',
              borderWidth: 1,
              borderColor: theme.accent,
            }}
            value={groupCode}
            onChangeText={setGroupCode}
            placeholder="Enter Group Code"
            placeholderTextColor="#6B7280"
          />
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            padding: 18,
            borderRadius: 20,
            width: '100%',
            elevation: 3,
            shadowColor: theme.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}
          onPress={handleJoinGroup}
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, textAlign: 'center', fontSize: 18 }}>
            Join Group
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerBackVisible: false,
          headerTitle: "",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: theme.text,
            fontSize: 20,
            fontFamily: 'PoppinsSemiBold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
              <Ionicons name="arrow-back" size={28} color={theme.text} />
            </TouchableOpacity>
          ),
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor={theme.secondary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.secondary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { position: 'absolute', top: 0, left: 0, right: 0, height: '100%', backgroundColor: theme.secondary },
          ]}
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
            className="flex-1"
          >
            {renderContent()}
          </KeyboardAvoidingView>
        )}
      </SafeAreaView>
    </>
  );
});

export default Create_join;