// import { Stack, useRouter } from 'expo-router';
// import React, { useState, memo, useEffect, useRef } from 'react';
// import {
//     Animated,
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     SafeAreaView,
//     StatusBar,
//     Keyboard,
//     Platform,
//     KeyboardEvent,
//     TextStyle,
//     KeyboardAvoidingView,
// } from 'react-native';

// import { useTheme } from '../../ThemeContext';

// interface TypewriterTextProps {
//     text: string;
//     delay?: number;
//     style?: TextStyle;
// }

// const TypewriterText: React.FC<TypewriterTextProps> = ({ text, delay = 100, style }) => {
//     const [displayedText, setDisplayedText] = useState('');
//     const [showCursor, setShowCursor] = useState(true);
//     const [isTypingComplete, setIsTypingComplete] = useState(false);
//     const cursorRef = useRef<NodeJS.Timeout | null>(null);

//     useEffect(() => {
//         let i = 0;
//         const typingEffect = setInterval(() => {
//             if (i < text.length) {
//                 setDisplayedText((prev) => prev + text.charAt(i));
//                 i++;
//             } else {
//                 clearInterval(typingEffect);
//                 setIsTypingComplete(true);
//             }
//         }, delay);

//         cursorRef.current = setInterval(() => {
//             setShowCursor((prev) => !prev);
//         }, 500);

//         return () => {
//             clearInterval(typingEffect);
//             if (cursorRef.current) clearInterval(cursorRef.current);
//         };
//     }, [text, delay]);

//     return (
//         <Text style={style}>
//             {displayedText}
//             {!isTypingComplete && <Text style={{ opacity: showCursor ? 1 : 0 }}>|</Text>}
//         </Text>
//     );
// };

// const CodeInput: React.FC<{ code: string; setCode: (code: string) => void; theme: any; fontFamily: string }> = ({ code, setCode, theme, fontFamily }) => {
//     const inputRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

//     const handleCodeChange = (index: number, value: string) => {
//         const newCode = code.split('');
//         newCode[index] = value;
//         setCode(newCode.join(''));

//         if (value && index < 3) {
//             inputRefs.current[index + 1]?.focus();
//         } else if (!value && index > 0) {
//             inputRefs.current[index - 1]?.focus();
//         }
//     };

//     return (
//         <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
//             {[0, 1, 2, 3].map((index) => (
//                 <TextInput
//                     key={index}
//                     ref={(ref) => (inputRefs.current[index] = ref)}
//                     className="w-16 h-16 bg-primary text-text rounded-xl text-2xl text-center mx-5"
//                     style={{
//                         color: theme.accent,
//                         backgroundColor: theme.primary,
//                         fontFamily,
//                     }}
//                     value={code[index] || ''}
//                     onChangeText={(value) => handleCodeChange(index, value)}
//                     keyboardType="number-pad"
//                     maxLength={1}
//                     keyboardAppearance="dark"
//                     onKeyPress={({ nativeEvent }) => {
//                         if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
//                             inputRefs.current[index - 1]?.focus();
//                         }
//                     }}
//                 />
//             ))}
//         </View>
//     );
// };

// const VerifyCode: React.FC = memo(() => {
//     const theme = useTheme();
//     const [code, setCode] = useState<string>('');
//     const router = useRouter();
//     const [animation] = useState(new Animated.Value(0));
//     const [keyboardOffset] = useState(new Animated.Value(0));

//     useEffect(() => {
//         Animated.timing(animation, {
//             toValue: 1,
//             duration: 900,
//             useNativeDriver: true,
//         }).start();

//         if (Platform.OS === 'ios') {
//             const keyboardWillShowListener = Keyboard.addListener(
//                 'keyboardWillShow',
//                 keyboardWillShow
//             );
//             const keyboardWillHideListener = Keyboard.addListener(
//                 'keyboardWillHide',
//                 keyboardWillHide
//             );

//             return () => {
//                 keyboardWillShowListener.remove();
//                 keyboardWillHideListener.remove();
//             };
//         }
//     }, []);

//     const keyboardWillShow = (event: KeyboardEvent) => {
//         const keyboardHeight = event.endCoordinates.height;
//         Animated.timing(keyboardOffset, {
//             duration: event.duration || 300,
//             toValue: -keyboardHeight / 2.5,
//             useNativeDriver: true,
//         }).start();
//     };

//     const keyboardWillHide = (event: KeyboardEvent) => {
//         Animated.timing(keyboardOffset, {
//             duration: event.duration || 300,
//             toValue: 0,
//             useNativeDriver: true,
//         }).start();
//     };

//     const backgroundStyle = {
//         transform: [
//             {
//                 translateX: animation.interpolate({
//                     inputRange: [0, 1],
//                     outputRange: [-1000, 0],
//                 }),
//             },
//         ],
//     };

//     const handleVerifyCode = () => {
//         // Implement code verification functionality
//         console.log('Verifying code:', code);
//         // Navigate to reset password screen or show success message
//     };

//     const renderContent = () => (
//         <View style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
//             <View className="flex-1 justify-center">
//                 <TypewriterText
//                     text="Verify Code"
//                     style={{
//                         color: theme.text,
//                         fontSize: 36,
//                         fontWeight: 'bold',
//                         marginBottom: 30,
//                         textAlign: 'center',
//                         fontFamily: 'PoppinsSemiBold'
//                     }}
//                 />
//                 <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.accent, fontSize: 14, marginBottom: 30, textAlign: 'center' }}>
//                     Code is sent to your email
//                 </Text>
//                 <CodeInput code={code} setCode={setCode} theme={theme} fontFamily="PoppinsSemiBold" />
//                 <TouchableOpacity
//                     style={{
//                         backgroundColor: theme.accent,
//                         padding: 15,
//                         borderRadius: 15,
//                         marginBottom: 20,
//                     }}
//                     onPress={handleVerifyCode}
//                 >
//                     <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, textAlign: 'center', fontSize: 18, fontWeight: 'bold' }}>
//                         Verify Code
//                     </Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity onPress={() => router.back()}>
//                     <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, textAlign: 'center', fontSize: 14 }}>
//                         Didn't receive the code? <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.accent }}>Resend</Text>
//                     </Text>
//                 </TouchableOpacity>
//             </View>
//         </View>
//     );

//     return (
//         <>
//             <Stack.Screen options={{ headerShown: false }} />
//             <StatusBar barStyle="light-content" backgroundColor={theme.primary} />
//             <SafeAreaView style={{ flex: 1, backgroundColor: theme.primary }}>
//                 <Animated.View
//                     style={[
//                         backgroundStyle,
//                         { position: 'absolute', top: -50, left: 0, right: 0, height: '125%', backgroundColor: theme.secondary },
//                     ]}
//                     className="rounded-b-[50px] md:rounded-b-[80px]"
//                 />
//                 {Platform.OS === 'ios' ? (
//                     <Animated.View
//                         style={{
//                             flex: 1,
//                             transform: [{ translateY: keyboardOffset }],
//                         }}
//                     >
//                         {renderContent()}
//                     </Animated.View>
//                 ) : (
//                     <KeyboardAvoidingView
//                         behavior="padding"
//                         className="flex-1 mt-16"
//                     >
//                         {renderContent()}
//                     </KeyboardAvoidingView>
//                 )}
//             </SafeAreaView>
//         </>
//     );
// });

// export default VerifyCode;
