import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  ScrollView,
  Image,
} from 'react-native';
import CountryPicker, { Country, CountryCode } from 'react-native-country-picker-modal';

import { useTheme } from '../../ThemeContext';
import { db } from '../../firebaseConfig';
import { isUsernameAvailable } from '../../firestore';

const commonTextStyle: TextStyle = {
  fontFamily: 'PoppinsSemiBold',
};

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

const Signup: React.FC = memo(() => {
  const theme = useTheme();
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [countryCode, setCountryCode] = useState<CountryCode>('US');
  const [callingCode, setCallingCode] = useState<string>('+1');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [showCountryPicker, setShowCountryPicker] = useState<boolean>(false);
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0));
  const [stage, setStage] = useState<number>(1);
  const [suggestedUsernames, setSuggestedUsernames] = useState<string[]>([]);
  const [isUsernameValid, setIsUsernameValid] = useState<boolean | null>(null);

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
      const isAvailable = await isUsernameAvailable(username);
      if (!isAvailable) {
        Alert.alert('Error', 'Username is already taken');
        setLoading(false);
        return;
      }

      const auth = Firebase.getAuth();
      const userCredential = await Firebase.createUserWithEmailAndPassword(auth, email, password);
      await Firebase.updateProfile(userCredential.user, {
        displayName: fullName
      });

      await Firebase.sendEmailVerification(userCredential.user);

      const userDocRef = doc(db, 'Users', userCredential.user.uid);
      await setDoc(userDocRef, {
        fullName,
        email,
        username,
        phoneNumber: `${callingCode}${phoneNumber}`,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
        createdAt: serverTimestamp(),
        emailVerified: false,
      });

      Alert.alert(
        'Verification Email Sent',
        'Please check your email and verify your account before logging in.',
        [
          {
            text: 'OK',
            onPress: () => router.push('../Screens/Login')
          }
        ]
      );
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

  const renderPhoneInput = () => (
    <View style={{ marginBottom: 20, flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          borderRadius: 15,
          padding: 15,
          marginRight: 10,
          flexDirection: 'row',
          alignItems: 'center',
        }}
        onPress={() => setShowCountryPicker(true)}
      >
        <Text style={[commonTextStyle, { color: theme.text, fontSize: 16 }]}>{callingCode}</Text>
        <Ionicons name="chevron-down" size={20} color={theme.text} style={{ marginLeft: 5 }} />
      </TouchableOpacity>
      <TextInput
        style={[commonTextStyle, {
          backgroundColor: theme.primary,
          color: theme.text,
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          flex: 1,
        }]}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone Number"
        placeholderTextColor="#6B7280"
        keyboardType="phone-pad"
        keyboardAppearance="dark"
      />
      <CountryPicker
        visible={showCountryPicker}
        onClose={() => setShowCountryPicker(false)}
        onSelect={(country: Country) => {
          setCountryCode(country.cca2);
          setCallingCode(`+${country.callingCode[0]}`);
          setShowCountryPicker(false);
        }}
        countryCode={countryCode}
        withFilter
        withFlag
        withCallingCode
        withEmoji
        theme={{
          backgroundColor: theme.secondary,
          onBackgroundTextColor: theme.text,
          fontSize: 16,
          fontFamily: 'PoppinsSemiBold',
          filterPlaceholderTextColor: '#6B7280',
          activeOpacity: 0.7,
          itemHeight: 50,
          flagSize: 25,
        }}
        containerButtonStyle={{
          marginLeft: 5,
          borderRadius: 15,
        }}
      />
    </View>
  );

  const renderDatePicker = () => (
    <View style={{ marginBottom: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          borderRadius: 15,
          padding: 15,
        }}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={[commonTextStyle, { color: dateOfBirth ? theme.text : '#6B7280', fontSize: 16 }]}>
          {dateOfBirth ? dateOfBirth.toLocaleDateString() : 'Date of Birth'}
        </Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={dateOfBirth || new Date()}
          mode="date"
          display="spinner"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setDateOfBirth(selectedDate);
            }
          }}
          textColor={theme.text}
          style={{ backgroundColor: theme.primary }}
        />
      )}
      {showDatePicker && (
        <TouchableOpacity
          style={{
            backgroundColor: theme.accent,
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
            alignItems: 'center',
          }}
          onPress={() => setShowDatePicker(false)}
        >
          <Text style={[commonTextStyle, { color: theme.primary, fontSize: 16 }]}>Confirm Date</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const generateUsernameSuggestions = async (name: string) => {
    const suggestions = [
      name.toLowerCase().replace(/\s/g, ''),
      `${name.toLowerCase().replace(/\s/g, '')}${Math.floor(Math.random() * 1000)}`,
      `${name.toLowerCase().split(' ')[0]}${Math.floor(Math.random() * 1000)}`,
      `${name.toLowerCase().charAt(0)}${name.toLowerCase().split(' ')[1] || ''}${Math.floor(Math.random() * 1000)}`,
      `${name.toLowerCase().replace(/\s/g, '')}_${Math.floor(Math.random() * 1000)}`,
    ];

    const validSuggestions = await Promise.all(
      suggestions.map(async (suggestion) => {
        const isAvailable = await isUsernameAvailable(suggestion);
        return isAvailable ? suggestion : null;
      })
    );

    return validSuggestions.filter((suggestion): suggestion is string => suggestion !== null);
  };

  const handleUsernameChange = async (text: string) => {
    setUsername(text);
    if (text.length > 0) {
      const isAvailable = await isUsernameAvailable(text);
      setIsUsernameValid(isAvailable);
    } else {
      setIsUsernameValid(null);
    }
  };

  const renderUsernameInput = () => (
    <View>
      <View style={{ position: 'relative', marginBottom: 10 }}>
        <TextInput
          style={[commonTextStyle, {
            backgroundColor: theme.primary,
            color: theme.text,
            borderRadius: 15,
            padding: 15,
            fontSize: 16,
            paddingRight: 50,
          }]}
          value={username}
          onChangeText={handleUsernameChange}
          placeholder="Username"
          placeholderTextColor="#6B7280"
          keyboardAppearance="dark"
        />
        {isUsernameValid !== null && (
          <Ionicons
            name={isUsernameValid ? 'checkmark-circle' : 'close-circle'}
            size={24}
            color={isUsernameValid ? '#f7a600' : '#f7a600'}
            style={{ position: 'absolute', right: 15, top: 15 }}
          />
        )}
      </View>
      {suggestedUsernames.length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={[commonTextStyle, { color: theme.text, marginBottom: 5 }]}>Suggested usernames:</Text>
          {suggestedUsernames.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setUsername(suggestion)}
              style={{ padding: 5 }}
            >
              <Text style={[commonTextStyle, { color: theme.accent }]}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderStage = () => {
    switch (stage) {
      case 1:
        return renderInput(fullName, setFullName, "Full Name");
      case 2:
        return renderUsernameInput();
      case 3:
        return renderInput(email, setEmail, "Email");
      case 4:
        return (
          <>
            {renderPhoneInput()}
            {renderDatePicker()}
          </>
        );
      case 5:
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

  const handleNext = async () => {
    if (stage === 1) {
      const suggestions = await generateUsernameSuggestions(fullName);
      setSuggestedUsernames(suggestions);
    }
    if (stage < 5) setStage(stage + 1);
    else handleSignup();
  };

  const handleBack = () => {
    if (stage > 1) setStage(stage - 1);
  };

  const renderContent = () => (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
      <View className="flex-1 justify-center">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <View className="px-2" style={{ flex: 1 }}>
            <TypewriterText
              text="Create Account"
              style={{ color: theme.text, fontSize: 36, fontWeight: 'bold' }}
            />
          </View>
          <Image
            source={require('../../assets/app-logo-white.png')}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </View>
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
            style={{ backgroundColor: theme.accent, padding: 15, borderRadius: 15, flex: 1, marginLeft: stage > 1 ? 10 : 0 }}
            onPress={handleNext}
            disabled={loading}
          >
            <Text style={[commonTextStyle, { color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }]}>
              {stage === 5 ? (loading ? 'Signing Up...' : 'Sign Up') : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => router.push('../Screens/Login')}>
          <Text style={[commonTextStyle, { color: theme.text, textAlign: 'center', fontSize: 14, marginTop: 20 }]}>
            Already have an account? <Text style={{ color: theme.accent }}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

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
