import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
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
} from 'react-native';

import { useTheme } from '../../ThemeContext';

interface TypewriterTextProps {
    text: string;
    delay?: number;
    style?: TextStyle;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay = 100, style }) => {
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
        <Text style={style}>
            {displayedText}
            {!isTypingComplete && <Text style={{ opacity: showCursor ? 1 : 0 }}>|</Text>}
        </Text>
    );
};

const ForgotPassword: React.FC = memo(() => {
    const theme = useTheme();
    const [email, setEmail] = useState<string>('');
    const router = useRouter();
    const [animation] = useState(new Animated.Value(0));
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
                translateX: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1000, 0],
                }),
            },
        ],
    };

    const handleResetPassword = () => {
        // Implement password reset functionality
        console.log('Reset password for:', email);
        router.push('../Screens/VerifyCode');
    };

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
                <Animated.View
                    style={[
                        backgroundStyle,
                        { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.secondary },
                    ]}
                    className="rounded-b-[50px] md:rounded-b-[80px]"
                />
                <Animated.View
                    style={{
                        flex: 1,
                        transform: [{ translateY: keyboardOffset }],
                    }}
                >
                    <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
                        <View className="flex-1 justify-center">
                            <TypewriterText
                                text="Forgot Password"
                                style={{
                                    color: theme.text,
                                    fontSize: 36,
                                    fontWeight: 'bold',
                                    marginBottom: 30,
                                    textAlign: 'center',
                                    fontFamily: 'PoppinsSemiBold'
                                }}
                            />
                            <View style={{ marginBottom: 20 }}>
                                <TextInput
                                    style={{
                                        backgroundColor: theme.primary,
                                        color: theme.text,
                                        borderRadius: 15,
                                        padding: 15,
                                        fontSize: 16,
                                        fontFamily: 'PoppinsSemiBold',
                                    }}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholder="Enter Email Address"
                                    placeholderTextColor="#6B7280"
                                    keyboardAppearance="dark"
                                />
                            </View>
                            <TouchableOpacity
                                style={{
                                    backgroundColor: theme.accent,
                                    padding: 15,
                                    borderRadius: 15,
                                    marginBottom: 20,
                                }}
                                onPress={handleResetPassword}
                            >
                                <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                                    Next Step
                                </Text>
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
                                <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
                                    Sign Up
                                </Text>
                            </TouchableOpacity>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 20 }}>
                                <TouchableOpacity style={{ marginRight: 20 }}>
                                    <Ionicons name="logo-facebook" size={30} color={theme.text} />
                                </TouchableOpacity>
                                <TouchableOpacity>
                                    <Ionicons name="logo-google" size={30} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => router.push('../Screens/Login')}>
                                <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, textAlign: 'center', fontSize: 16 }}>
                                    Don't have an account? <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.accent }}>Sign Up</Text>
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            </SafeAreaView>
        </>
    );
});

export default ForgotPassword;