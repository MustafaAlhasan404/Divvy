import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Firebase from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import React, { useState, memo, useEffect, useRef } from 'react';
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
  TextStyle,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';

import { useTheme } from '../../ThemeContext';
import { db } from '../../firebaseConfig';


const commonTextStyle: TextStyle = {
  fontFamily: 'PoppinsSemiBold',
};

const TypewriterText: React.FC<{ text: string; delay?: number; style?: TextStyle }> = ({ text, delay = 100, style }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const cursorRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let i = 0;
    const typingEffect = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingEffect);
        setIsTypingComplete(true);
      }
    }, delay);

    cursorRef.current = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => {
      clearInterval(typingEffect);
      if (cursorRef.current) clearInterval(cursorRef.current);
    };
  }, [text, delay]);

  return (
    <Text style={[commonTextStyle, style]}>
      {displayedText}
      {!isTypingComplete && <Text style={{ opacity: showCursor ? 1 : 0 }}>|</Text>}
    </Text>
  );
};

const Signup: React.FC = memo(() => {
  const theme = useTheme();
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0));
  const [stage, setStage] = useState<number>(1);

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

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const auth = Firebase.getAuth();
      const userCredential = await Firebase.createUserWithEmailAndPassword(auth, email, password);
      await Firebase.updateProfile(userCredential.user, {
        displayName: fullName
      });

      const userDocRef = doc(db, 'Users', userCredential.user.uid);
      await setDoc(userDocRef, {
        fullName,
        email,
        mobileNumber,
        dateOfBirth,
        createdAt: serverTimestamp(),
      });

      router.push('../(tabs)/MainScreen');
    } catch (error) {
      console.error(error);
      Alert.alert('Signup Error', 'An error occurred during signup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string,
    secureTextEntry: boolean = false,
    showPasswordState?: boolean,
    setShowPasswordState?: React.Dispatch<React.SetStateAction<boolean>>
  ) => (
    <View style={{ marginBottom: 20 }}>
      <View style={{ position: 'relative' }}>
        <TextInput
          style={[commonTextStyle, {
            backgroundColor: theme.primary,
            color: theme.text,
            borderRadius: 15,
            padding: 15,
            fontSize: 16,
            paddingRight: secureTextEntry ? 50 : 15,
          }]}
          value={value}
          onChangeText={setter}
          secureTextEntry={secureTextEntry && !showPasswordState}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          keyboardAppearance="dark"
        />
        {secureTextEntry && setShowPasswordState && (
          <TouchableOpacity
            onPress={() => setShowPasswordState(!showPasswordState)}
            style={{ position: 'absolute', right: 15, top: 15 }}
          >
            <Ionicons
              name={showPasswordState ? 'eye-outline' : 'eye-off-outline'}
              size={24}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <>
            {renderInput(fullName, setFullName, "Full Name")}
            {renderInput(email, setEmail, "Email")}
          </>
        );
      case 2:
        return (
          <>
            {renderInput(mobileNumber, setMobileNumber, "Mobile Number")}
            {renderInput(dateOfBirth, setDateOfBirth, "Date of Birth")}
          </>
        );
      case 3:
        return (
          <>
            {renderInput(password, setPassword, "Password", true, showPassword, setShowPassword)}
            {renderInput(confirmPassword, setConfirmPassword, "Confirm Password", true, showConfirmPassword, setShowConfirmPassword)}
          </>
        );
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (stage < 3) setStage(stage + 1);
    else handleSignup();
  };

  const handleBack = () => {
    if (stage > 1) setStage(stage - 1);
  };

  const renderContent = () => (
    <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
      <View className="flex-1 justify-center">
        <TypewriterText
          text="Create Account"
          style={{ color: theme.text, fontSize: 36, fontWeight: 'bold', marginBottom: 30, textAlign: 'center' }}
        />
        {renderStage()}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
          {stage > 1 && (
            <TouchableOpacity
              style={{ backgroundColor: theme.secondary, padding: 15, borderRadius: 15 }}
              onPress={handleBack}
            >
              <Text style={[commonTextStyle, { color: theme.text, textAlign: 'center', fontSize: 18 }]}>
                Back
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ backgroundColor: theme.accent, padding: 15, borderRadius: 15 }}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={[commonTextStyle, { color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]}>
              {stage === 3 ? (loading ? 'Signing Up...' : 'Sign Up') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View>
          <Text style={[commonTextStyle, { color: theme.text, textAlign: 'center', fontSize: 14, marginBottom: 15 }]}>
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
        
        <TouchableOpacity onPress={() => router.push('../Screens/Login')}>
          <Text style={[commonTextStyle, { color: theme.text, textAlign: 'center', fontSize: 14, marginTop: 20 }]}>
            Already have an account? <Text style={{ color: theme.accent }}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
        <Animated.View
          style={[
            backgroundStyle,
            { position: 'absolute', top:-50, left: 0, right: 0, height: '125%', backgroundColor: theme.secondary },
          ]}
          className="rounded-t-[50px] md:rounded-t-[80px]"
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
});

export default Signup;
