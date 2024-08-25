import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextStyle,
} from 'react-native';
import Animated, {
    FadeInRight,
    FadeInLeft,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';
import { auth } from '../../firebaseConfig';

interface TypewriterTextProps {
    text: string;
    delay?: number;
    style?: TextStyle;
    className?: string;
}

const TypewriterText: React.FC<TypewriterTextProps> = memo(({ text, delay = 100, style, className }) => {
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
        <Text style={style} className={className}>
            {displayedText}
            {!isTypingComplete && <Text style={{ opacity: showCursor ? 1 : 0 }}>|</Text>}
        </Text>
    );
});

interface Group {
    id: string;
    name: string;
    balance: number;
    icon: string;
}

interface Activity {
    id: string;
    description: string;
    icon: string;
}

const MainScreen: React.FC = memo(() => {
    const theme = useTheme();
    const router = useRouter();
    const animation = useSharedValue(0);
    const [userName, setUserName] = useState<string>('User');

    useEffect(() => {
        animation.value = withTiming(1, { duration: 900 });
        const user = auth.currentUser;
        if (user) {
            setUserName(user.displayName || 'User');
        }
    }, []);

    const backgroundStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(animation.value, [0, 1], [-1000, 0]),
            },
        ],
    }));

    const groups: Group[] = [
        { id: '1', name: 'Roommates', balance: 50, icon: 'home' },
        { id: '2', name: 'Trip to Paris', balance: -30, icon: 'airplane' },
        { id: '3', name: 'Office Lunch', balance: 0, icon: 'restaurant' },
    ];

    const recentActivity: Activity[] = [
        { id: '1', description: 'John added "Dinner" $30 to Roommates', icon: 'fast-food' },
        { id: '2', description: 'You settled $20 with Sarah in Trip to Paris', icon: 'cash' },
        { id: '3', description: 'Alex invited you to "Beach Trip"', icon: 'umbrella' },
    ];

    const getBalanceColor = (balance: number) => {
        if (balance > 0) return theme.positive;
        if (balance < 0) return theme.negative;
        return theme.neutral;
    };

    const renderGroupItem = (item: Group, index: number) => (
        <Animated.View
            key={item.id}
            entering={FadeInRight.delay(index * 100)}
            className="bg-primary rounded-2xl p-4 mb-2 flex-row items-center"
            style={{ backgroundColor: theme.primary }}
        >
            <Ionicons name={item.icon as any} size={24} color={theme.accent} style={{ marginRight: 10 }} />
            <View>
                <Text className="text-lg font-semibold" style={{ color: theme.text }}>{item.name}</Text>
                <Text className="text-base font-semibold" style={{ color: getBalanceColor(item.balance) }}>
                    Balance: ${item.balance}
                </Text>
            </View>
        </Animated.View>
    );

    const renderActivityItem = (item: Activity, index: number) => (
        <Animated.View
            key={item.id}
            entering={FadeInLeft.delay(index * 100)}
            className="mb-2 flex-row items-center"
            style={{ backgroundColor: theme.primary, borderRadius: 10, padding: 10 }}
        >
            <Ionicons name={item.icon as any} size={20} color={theme.accent} style={{ marginRight: 10 }} />
            <Text className="text-sm" style={{ color: theme.text }}>{item.description}</Text>
        </Animated.View>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
                <Animated.View
                    style={[
                        backgroundStyle,
                        { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.background },
                    ]}
                    className="rounded-b-[50px] md:rounded-b-[80px]"
                />
                <View className="flex-1 px-4 py-6 md:px-6 md:py-10 mt-2">
                    <View className="mb-5">
                        <TypewriterText
                            text={`Welcome back, ${userName}!`}
                            style={{
                                color: theme.text,
                                fontSize: 26,
                                fontWeight: 'bold',
                                fontFamily: 'PoppinsSemiBold',
                                marginBottom: 10
                            }}
                            className="text-2xl md:text-3xl font-bold"
                        />
                        <Text className="text-2xl font-bold" style={{ color: theme.accent }}>$20 you are owed</Text>
                    </View>

                    <View className="flex-row justify-between mb-5">
                        <TouchableOpacity
                            className="bg-accent rounded-2xl flex-1 mr-2 p-4"
                            style={{ backgroundColor: theme.accent }}
                            onPress={() => router.push('../Screens/Expenses')}
                        >
                            <Text className="text-center text-base font-semibold" style={{ color: theme.primary }}>
                                Add Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-primary rounded-2xl flex-1 ml-2 p-4"
                            style={{ backgroundColor: theme.primary }}
                            onPress={() => router.push('../Screens/SettleUp')}
                        >
                            <Text className="text-center text-base font-semibold" style={{ color: theme.text }}>
                                Settle Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-lg font-semibold mb-2" style={{ color: theme.accent }}>Your Groups</Text>
                    <View className="mb-5">
                        {groups.map((group, index) => renderGroupItem(group, index))}
                    </View>

                    <TouchableOpacity
                        className="bg-primary rounded-2xl p-4 mb-5"
                        style={{ backgroundColor: theme.primary }}
                        onPress={() => router.push('../Screens/Create_join')}
                    >
                        <Text className="text-center text-base font-semibold" style={{ color: theme.text }}>
                            Create or Join Group
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-lg font-semibold mb-2" style={{ color: theme.accent }}>Recent Activity</Text>
                    <View>
                        {recentActivity.map((activity, index) => renderActivityItem(activity, index))}
                    </View>
                </View>
            </SafeAreaView>
        </>
    );
});

export default MainScreen;
