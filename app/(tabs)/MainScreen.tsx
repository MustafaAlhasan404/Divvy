import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { onSnapshot, query, collection, where, doc, DocumentSnapshot } from 'firebase/firestore';
import React, { useState, memo, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextStyle,
    FlatList,
    Dimensions,
    BackHandler,
    Platform,
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
import { auth, db } from '../../firebaseConfig';
import { Group, Expense, calculateSettlements } from '../../firestore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_HEIGHT < 700;

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

interface Activity {
    id: string;
    description: string;
    date: string;
    amount: number;
    icon: string;
    groupName: string;
}

const MainScreen: React.FC = memo(() => {
    const theme = useTheme();
    const router = useRouter();
    const animation = useSharedValue(0);
    const [userName, setUserName] = useState<string>('User');
    const [groups, setGroups] = useState<Group[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
    const [totalOwed, setTotalOwed] = useState(0);
    const [totalOwedToYou, setTotalOwedToYou] = useState(0);

    const androidPadding = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true;
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    useEffect(() => {
        animation.value = withTiming(1, { duration: 900 });
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, 'Users', user.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot: DocumentSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    setUserName(userData?.fullName || 'User');
                }
                setIsUserDataLoaded(true);
            });

            const groupsQuery = query(collection(db, 'Groups'), where('members', 'array-contains', user.uid));
            const unsubscribeGroups = onSnapshot(groupsQuery, (snapshot) => {
                const updatedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
                setGroups(updatedGroups);

                let allActivities: Activity[] = [];
                let totalOwedAmount = 0;
                let totalOwedToYouAmount = 0;

                const unsubscribeActivities: (() => void)[] = [];

                updatedGroups.forEach(group => {
                    const expensesQuery = query(collection(db, 'Expenses'), where('groupId', '==', group.id));
                    const unsubscribeExpenses = onSnapshot(expensesQuery, async (expensesSnapshot) => {
                        const expenses = expensesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));

                        const groupActivities = expenses.map(expense => ({
                            id: expense.id,
                            description: expense.description,
                            date: formatDate(expense.date),
                            amount: expense.totalAmount,
                            icon: getCategoryIcon(expense.category),
                            groupName: group.name,
                        }));

                        allActivities = [...allActivities, ...groupActivities];
                        allActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                        setRecentActivity(allActivities.slice(0, 3));

                        const settlements = await calculateSettlements(group.id);
                        const userSettlements = settlements.filter(s => s.fromUserId === user.uid);
                        const userOwedSettlements = settlements.filter(s => s.toUserId === user.uid);
                        totalOwedAmount += userSettlements.reduce((sum, s) => sum + s.amount, 0);
                        totalOwedToYouAmount += userOwedSettlements.reduce((sum, s) => sum + s.amount, 0);
                        setTotalOwed(totalOwedAmount);
                        setTotalOwedToYou(totalOwedToYouAmount);
                    });

                    unsubscribeActivities.push(unsubscribeExpenses);
                });

                return () => {
                    unsubscribeUser();
                    unsubscribeGroups();
                    unsubscribeActivities.forEach(unsubscribe => unsubscribe());
                };
            });
        }
    }, []);

    const formatDate = (date: any): string => {
        if (date && typeof date.toDate === 'function') {
            return date.toDate().toDateString();
        } else if (date && typeof date === 'object' && date.seconds) {
            return new Date(date.seconds * 1000).toDateString();
        } else if (date && !isNaN(Date.parse(date))) {
            return new Date(date).toDateString();
        }
        return 'Unknown Date';
    };

    const getCategoryIcon = (category?: string): string => {
        switch (category) {
            case 'food': return 'restaurant';
            case 'transport': return 'car';
            case 'entertainment': return 'film';
            case 'shopping': return 'cart';
            default: return 'cash';
        }
    };

    const backgroundStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: interpolate(animation.value, [0, 1], [-1000, 0]),
            },
        ],
    }));

    const renderGroupItem = ({ item, index }: { item: Group; index: number }) => (
        <Animated.View
            entering={FadeInRight.delay(index * 100)}
            className="bg-primary rounded-2xl p-3 mb-2 flex-row items-center"
            style={{ backgroundColor: theme.primary }}
        >
            <Ionicons name={item.type === 'Home' ? 'home' : item.type === 'Trip' ? 'airplane' : 'people'} size={20} color={theme.accent} style={{ marginRight: 8 }} />
            <View>
                <Text className="text-base font-semibold" style={{ color: theme.text }}>{item.name}</Text>
                <Text style={{ color: theme.text, fontSize: 12 }}>{item.members.length} members</Text>
            </View>
        </Animated.View>
    );

    const renderActivityItem = ({ item, index }: { item: Activity; index: number }) => (
        <Animated.View
            entering={FadeInLeft.delay(index * 100)}
            className="mb-2 flex-row items-center"
            style={{ backgroundColor: theme.primary, borderRadius: 10, padding: 8 }}
        >
            <Ionicons name={item.icon as any} size={18} color={theme.accent} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
                <Text className="text-xs" style={{ color: theme.text }}>
                    {item.description}
                </Text>
                <Text className="text-xs" style={{ color: theme.accent }}>
                    {item.groupName} • {item.date}
                </Text>
            </View>
            <Text style={{ color: theme.accent, fontSize: 12 }}>
                ${item.amount.toFixed(2)}
            </Text>
        </Animated.View>
    );

    return (
        <>
            <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
            <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary, paddingTop: androidPadding }}>
                <Animated.View
                    style={[
                        backgroundStyle,
                        { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.background },
                    ]}
                    className="rounded-b-[40px] md:rounded-b-[60px]"
                />
                <View className="flex-1 px-3 py-4 md:px-5 md:py-6">
                    <View className="mb-4">
                        {isUserDataLoaded && (
                            <TypewriterText
                                text={`Welcome back, ${userName}!`}
                                style={{
                                    color: theme.text,
                                    fontSize: IS_SMALL_DEVICE ? 20 : 24,
                                    fontWeight: 'bold',
                                    fontFamily: 'PoppinsSemiBold',
                                    marginBottom: 6
                                }}
                                className="text-xl md:text-2xl font-bold pt-5"
                            />
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }} className='mt-2'>
                            <View style={{ backgroundColor: theme.primary, borderRadius: 10, padding: 10, flex: 1, marginRight: 5 }}>
                                <Text style={{ color: theme.text, fontSize: 14, fontFamily: 'PoppinsSemiBold' }}>You owe:</Text>
                                <Text style={{ color: theme.accent, fontSize: IS_SMALL_DEVICE ? 16 : 18, fontFamily: 'PoppinsSemiBold' }}>
                                    ${totalOwed.toFixed(2)}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: theme.primary, borderRadius: 10, padding: 10, flex: 1, marginLeft: 5 }}>
                                <Text style={{ color: theme.text, fontSize: 14, fontFamily: 'PoppinsSemiBold' }}>You are owed:</Text>
                                <Text style={{ color: theme.accent, fontSize: IS_SMALL_DEVICE ? 16 : 18, fontFamily: 'PoppinsSemiBold' }}>
                                    ${totalOwedToYou.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-between mb-4">
                        <TouchableOpacity
                            className="bg-accent rounded-2xl flex-1 mr-2 p-3"
                            style={{ backgroundColor: theme.accent }}
                            onPress={() => router.push('../Screens/Expenses')}
                        >
                            <Text className="text-center text-sm font-semibold" style={{ color: theme.primary }}>
                                Add Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-primary rounded-2xl flex-1 ml-2 p-3"
                            style={{ backgroundColor: theme.primary }}
                            onPress={() => router.push('../Screens/SettleUp')}
                        >
                            <Text className="text-center text-sm font-semibold" style={{ color: theme.text }}>
                                Settle Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-base font-semibold mb-2" style={{ color: theme.accent }}>Your Groups</Text>
                    <FlatList
                        data={groups}
                        renderItem={renderGroupItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ListFooterComponent={() => (
                            <>
                                {groups.length > 0 && (
                                    <TouchableOpacity
                                        className="bg-primary rounded-2xl p-3 mb-2"
                                        style={{ backgroundColor: theme.primary }}
                                        onPress={() => router.push('/(tabs)/AllGroups')}
                                    >
                                        <Text className="text-center text-sm font-semibold" style={{ color: theme.text }}>
                                            VIEW ALL GROUPS
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    className="bg-primary rounded-2xl p-3 mb-4"
                                    style={{ backgroundColor: theme.primary }}
                                    onPress={() => router.push('../Screens/Create_join')}
                                >
                                    <Text className="text-center text-sm font-semibold" style={{ color: theme.text }}>
                                        Create or Join Group
                                    </Text>
                                </TouchableOpacity>
                                <Text className="text-base font-semibold mb-2" style={{ color: theme.accent }}>Recent Activity</Text>
                                <FlatList
                                    data={recentActivity}
                                    renderItem={renderActivityItem}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                    ListFooterComponent={() => (
                                        <TouchableOpacity
                                            className="bg-primary rounded-2xl p-3 mt-2"                                            style={{ backgroundColor: theme.primary }}
                                            onPress={() => router.push('/(tabs)/Activities')}
                                        >
                                            <Text className="text-center text-sm font-semibold" style={{ color: theme.text }}>
                                                VIEW ALL ACTIVITIES
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                />
                            </>
                        )}
                    />
                </View>
            </SafeAreaView>
        </>
    );
});

export default MainScreen;

