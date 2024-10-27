import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { onSnapshot, query, collection, where, doc, DocumentSnapshot } from 'firebase/firestore';
import React, { useState, memo, useCallback } from 'react';
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
    StyleSheet,
} from 'react-native';
import Animated, {
    FadeInRight,
    FadeInLeft,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    withRepeat,
    Easing,
} from 'react-native-reanimated';

import { useTheme } from '../../ThemeContext';
import { auth, db } from '../../firebaseConfig';
import { Group, Expense, calculateSettlements } from '../../firestore';

const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const scale = (size: number) => (width / guidelineBaseWidth) * size * 0.95;
const verticalScale = (size: number) => (height / guidelineBaseHeight) * size * 0.95;
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingText: {
        color: 'white',
        fontSize: moderateScale(16),
        marginTop: verticalScale(10),
        fontFamily: 'PoppinsSemiBold',
    },    
    content: {
        flex: 1,
        padding: moderateScale(15),
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingLogo: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
});

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
    const cursorRef = React.useRef<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
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

const LoadingOverlay: React.FC = () => {
    const opacity = useSharedValue(0.5);
    const translateY = useSharedValue(0);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );

        translateY.value = withRepeat(
            withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <BlurView intensity={95} tint="dark" style={StyleSheet.absoluteFill}>
            <View style={styles.loadingContainer}>
                <Animated.Image
                    source={require('../../assets/app-logo-white.png')}
                    style={[styles.loadingLogo, animatedStyle]}
                />
                <Animated.Text style={[styles.loadingText, animatedStyle]}>
                    Divvying up...
                </Animated.Text>
            </View>
        </BlurView>
    );
};

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
    const [, setIsLoading] = useState(true);
    const [showBlur, setShowBlur] = useState(true);
    const [showWelcomeText, setShowWelcomeText] = useState(false);

    const androidPadding = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => true;
            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            setShowBlur(true);
            setShowWelcomeText(false);
            fetchData();
            return () => subscription.remove();
        }, [])
    );

    const fetchData = useCallback(async () => {
        animation.value = withTiming(1, { duration: 900 });
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, 'Users', user.uid);
            const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot: DocumentSnapshot) => {
                if (docSnapshot.exists()) {
                    const userData = docSnapshot.data();
                    setUserName(userData?.username || 'User');  // Changed from fullName to username
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
                        setRecentActivity(allActivities.slice(0, 2));

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

                setIsLoading(false);
                
                setTimeout(() => {
                    setShowBlur(false);
                    setTimeout(() => setShowWelcomeText(true), 100);
                }, 500);

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
            className="bg-primary rounded-2xl flex-row items-center"
            style={{ backgroundColor: theme.primary, padding: moderateScale(11), marginBottom: verticalScale(9) }}
        >
            <Ionicons name={item.type === 'Home' ? 'home' : item.type === 'Trip' ? 'airplane' : 'people'} size={moderateScale(21)} color={theme.accent} style={{ marginRight: scale(9) }} />
            <View>
                <Text className="font-semibold" style={{ color: theme.text, fontSize: moderateScale(15) }}>{item.name}</Text>
                <Text style={{ color: theme.text, fontSize: moderateScale(12) }}>{item.members.length} members</Text>
            </View>
        </Animated.View>
    );

    const renderActivityItem = ({ item, index }: { item: Activity; index: number }) => (
        <Animated.View
            entering={FadeInLeft.delay(index * 100)}
            className="flex-row items-center"
            style={{ backgroundColor: theme.primary, borderRadius: moderateScale(11), padding: moderateScale(9), marginBottom: verticalScale(9) }}
        >
            <Ionicons name={item.icon as any} size={moderateScale(19)} color={theme.accent} style={{ marginRight: scale(9) }} />
            <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontSize: moderateScale(13) }}>
                    {item.description}
                </Text>
                <Text style={{ color: theme.accent, fontSize: moderateScale(11) }}>
                    {item.groupName} • {item.date}
                </Text>
            </View>
            <Text style={{ color: theme.accent, fontSize: moderateScale(13) }}>
                ${item.amount.toFixed(2)}
            </Text>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
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
                <View style={styles.content}>
                    <View style={{ marginBottom: verticalScale(15) }}>
                        {showWelcomeText && isUserDataLoaded && (
                            <TypewriterText
                                text={`Welcome back, ${userName}!`}
                                style={{
                                    color: theme.text,
                                    fontSize: moderateScale(23),
                                    fontWeight: 'bold',
                                    fontFamily: 'PoppinsSemiBold',
                                    marginBottom: verticalScale(7)
                                }}
                                className="font-bold"
                            />
                        )}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: verticalScale(7) }}>
                            <View style={{ backgroundColor: theme.primary, borderRadius: moderateScale(11), padding: moderateScale(11), flex: 1, marginRight: scale(5) }}>
                                <Text style={{ color: theme.text, fontSize: moderateScale(14), fontFamily: 'PoppinsSemiBold' }}>You owe:</Text>
                                <Text style={{ color: theme.accent, fontSize: moderateScale(17), fontFamily: 'PoppinsSemiBold' }}>
                                    ${totalOwed.toFixed(2)}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: theme.primary, borderRadius: moderateScale(11), padding: moderateScale(11), flex: 1, marginLeft: scale(5) }}>
                                <Text style={{ color: theme.text, fontSize: moderateScale(14), fontFamily: 'PoppinsSemiBold' }}>You are owed:</Text>
                                <Text style={{ color: theme.accent, fontSize: moderateScale(17), fontFamily: 'PoppinsSemiBold' }}>
                                    ${totalOwedToYou.toFixed(2)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: verticalScale(15) }}>
                        <TouchableOpacity
                            className="bg-accent rounded-2xl flex-1 mr-2"
                            style={{ backgroundColor: theme.accent, padding: moderateScale(11) }}
                            onPress={() => router.push('../Screens/Expenses')}
                        >
                            <Text className="text-center font-semibold" style={{ color: theme.primary, fontSize: moderateScale(15) }}>
                                Add Expense
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-primary rounded-2xl flex-1 ml-2"
                            style={{ backgroundColor: theme.primary, padding: moderateScale(11) }}
                            onPress={() => router.push('../Screens/SettleUp')}
                        >
                            <Text className="text-center font-semibold" style={{ color: theme.text, fontSize: moderateScale(15) }}>
                                Settle Up
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="font-semibold mb-2" style={{ color: theme.accent, fontSize: moderateScale(17) }}>Your Groups</Text>
                    <FlatList
                        data={groups}
                        renderItem={renderGroupItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        ListFooterComponent={() => (
                            <>
                                {groups.length > 0 && (
                                    <TouchableOpacity
                                        className="bg-primary rounded-2xl"
                                        style={{ backgroundColor: theme.primary, padding: moderateScale(11), marginBottom: verticalScale(11) }}
                                        onPress={() => router.push('/(tabs)/AllGroups')}
                                    >
                                        <Text className="text-center font-semibold" style={{ color: theme.text, fontSize: moderateScale(15) }}>
                                            VIEW ALL GROUPS
                                        </Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    className="bg-primary rounded-2xl"
                                    style={{ backgroundColor: theme.primary, padding: moderateScale(11), marginBottom: verticalScale(19) }}
                                    onPress={() => router.push('../Screens/Create_join')}
                                >
                                    <Text className="text-center font-semibold" style={{ color: theme.text, fontSize: moderateScale(15) }}>
                                        Create or Join Group
                                    </Text>
                                </TouchableOpacity>
                                <Text className="font-semibold mb-4" style={{ color: theme.accent, fontSize: moderateScale(17) }}>Recent Activity</Text>
                                <FlatList
                                    data={recentActivity}
                                    renderItem={renderActivityItem}
                                    keyExtractor={(item) => item.id}
                                    scrollEnabled={false}
                                    ListFooterComponent={() => (
                                        <TouchableOpacity
                                            className="bg-primary rounded-2xl"
                                            style={{ backgroundColor: theme.primary, padding: moderateScale(11), marginTop: verticalScale(11) }}
                                            onPress={() => router.push('/(tabs)/Activities')}
                                        >
                                            <Text className="text-center font-semibold" style={{ color: theme.text, fontSize: moderateScale(15) }}>
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
            {showBlur && <LoadingOverlay />}
        </View>
    );
});

export default MainScreen;
// comment