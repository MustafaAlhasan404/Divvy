/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { onSnapshot, query, collection, where, doc, DocumentSnapshot } from 'firebase/firestore';
import React, { useState, memo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextStyle,
    FlatList,
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
import { Group, Expense, getUserGroups, getGroupExpenses, getExpenseShares, getUser } from '../../firestore';

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

const MainScreen: React.FC = memo(() => {
    const theme = useTheme();
    const router = useRouter();
    const animation = useSharedValue(0);
    const [userName, setUserName] = useState<string>('User');
    const [groups, setGroups] = useState<Group[]>([]);
    const [recentActivity, setRecentActivity] = useState<Expense[]>([]);
    const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);

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
            const unsubscribeGroups = onSnapshot(groupsQuery, async (snapshot) => {
                const updatedGroups = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group));
                setGroups(updatedGroups);

                let totalOwed = 0;
                let maxGroupOwed = { amount: 0, groupName: '', personName: '' };

                for (const group of updatedGroups) {
                    const expenses = await getGroupExpenses(group.id);
                    const shares = await Promise.all(expenses.map(expense => getExpenseShares(expense.id)));
                    const flatShares = shares.flat();

                    const groupBalances: { [userId: string]: number } = {};

                    expenses.forEach(expense => {
                        Object.entries(expense.paidBy).forEach(([userId, amount]) => {
                            if (userId === user.uid) {
                                // Current user paid, others owe them
                                Object.keys(expense.paidBy).forEach(memberId => {
                                    if (memberId !== user.uid) {
                                        groupBalances[memberId] = (groupBalances[memberId] || 0) - amount / Object.keys(expense.paidBy).length;
                                    }
                                });
                            } else {
                                // Someone else paid, current user owes them
                                groupBalances[userId] = (groupBalances[userId] || 0) + amount / Object.keys(expense.paidBy).length;
                            }
                        });
                    });

                    const groupOwed = Object.values(groupBalances).reduce((sum, amount) => sum + (amount > 0 ? amount : 0), 0);

                    totalOwed += groupOwed;

                    if (groupOwed > maxGroupOwed.amount) {
                        const maxOwedUserId = Object.entries(groupBalances)
                            .reduce((max, [userId, amount]) => amount > max[1] ? [userId, amount] : max, ['', 0])[0];
                        const personData = await getUser(maxOwedUserId);
                        maxGroupOwed = {
                            amount: groupOwed,
                            groupName: group.name,
                            personName: personData?.fullName || 'Unknown'
                        };
                    }
                }
            });

            return () => {
                unsubscribeUser();
                unsubscribeGroups();
            };
        }
    }, []);

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
            className="bg-primary rounded-2xl p-4 mb-2 flex-row items-center"
            style={{ backgroundColor: theme.primary }}
        >
            <Ionicons name={item.type === 'Home' ? 'home' : item.type === 'Trip' ? 'airplane' : 'people'} size={24} color={theme.accent} style={{ marginRight: 10 }} />
            <View>
                <Text className="text-lg font-semibold" style={{ color: theme.text }}>{item.name}</Text>
                <Text style={{ color: theme.text }}>{item.members.length} members</Text>
            </View>
        </Animated.View>
    );

    const renderActivityItem = ({ item, index }: { item: Expense; index: number }) => (
        <Animated.View
            entering={FadeInLeft.delay(index * 100)}
            className="mb-2 flex-row items-center"
            style={{ backgroundColor: theme.primary, borderRadius: 10, padding: 10 }}
        >
            <Ionicons name="cash" size={20} color={theme.accent} style={{ marginRight: 10 }} />
            <Text className="text-sm" style={{ color: theme.text }}>
                {`${item.description} - ${item.totalAmount}`}
            </Text>
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
                        {isUserDataLoaded && (
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
                        )}
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
                    <FlatList
                        data={groups}
                        renderItem={renderGroupItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ListFooterComponent={() => (
                            <>
                                {groups.length > 0 && (
                                    <TouchableOpacity
                                        className="bg-primary rounded-2xl p-4 mb-2"
                                        style={{ backgroundColor: theme.primary }}
                                        onPress={() => router.push('/(tabs)/AllGroups')}
                                    >
                                        <Text className="text-center text-base font-semibold" style={{ color: theme.text }}>
                                            VIEW ALL GROUPS
                                        </Text>
                                    </TouchableOpacity>
                                )}
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
                                <FlatList
                                    data={recentActivity}
                                    renderItem={renderActivityItem}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
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
