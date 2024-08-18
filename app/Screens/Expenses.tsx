import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo, useEffect, useMemo } from 'react';
import {
  Animated,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';

import { useTheme } from '../../ThemeContext';


const Expenses: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const [animation] = useState(new Animated.Value(0));
  const [keyboardOffset] = useState(new Animated.Value(0));

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [group, setGroup] = useState('');
  const [splitMethod, setSplitMethod] = useState('equal');
  const [payers, setPayers] = useState<{ [key: string]: boolean }>({});
  const [isPayerModalVisible, setPayerModalVisible] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: 1,
      duration: 900,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const handleDone = () => {
    console.log('Expense saved:', { amount, description, category, group, splitMethod, payers, date });
    router.back();
  };

  const renderInput = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string,
    keyboardType: 'default' | 'numeric' = 'default'
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>{placeholder}:</Text>
      <TextInput
        style={{
          backgroundColor: theme.primary,
          color: theme.text,
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          fontFamily: 'PoppinsSemiBold',
        }}
        value={value}
        onChangeText={setter}
        placeholder={placeholder}
        placeholderTextColor="#6B7280"
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderDropdown = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    placeholder: string
  ) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>{placeholder}:</Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          borderRadius: 15,
          padding: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={() => {/* Implement dropdown logic */}}
      >
        <Text style={{ color: value ? theme.text : '#6B7280', fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>
          {value || `Select ${placeholder}`}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const renderPaidBy = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>Paid by:</Text>
      <TouchableOpacity
        style={{
          backgroundColor: theme.primary,
          borderRadius: 15,
          padding: 15,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        onPress={() => setPayerModalVisible(true)}
      >
        <Text style={{ color: Object.keys(payers).length ? theme.text : '#6B7280', fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>
          {Object.keys(payers).filter(k => payers[k]).join(', ') || 'Select Payers'}
        </Text>
        <Ionicons name="chevron-down" size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );

  const renderSplitOptions = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.text, marginBottom: 5, fontFamily: 'PoppinsSemiBold' }}>Split:</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {['Equal', 'Percentage', 'Custom'].map((option) => (
          <TouchableOpacity
            key={option}
            style={{
              backgroundColor: splitMethod === option.toLowerCase() ? theme.accent : theme.primary,
              borderRadius: 15,
              padding: 10,
              flex: 1,
              marginHorizontal: 5,
            }}
            onPress={() => setSplitMethod(option.toLowerCase())}
          >
            <Text style={{
              color: splitMethod === option.toLowerCase() ? theme.primary : theme.text,
              textAlign: 'center',
              fontFamily: 'PoppinsSemiBold',
            }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const PayerModal = () => {
    const [modalPayers, setModalPayers] = useState<{ [key: string]: boolean }>(payers);

    const toggleModalPayer = (payer: string) => {
      setModalPayers(prev => ({
        ...prev,
        [payer]: !prev[payer]
      }));
    };

    const handleModalDone = () => {
      setPayers(modalPayers);
      setPayerModalVisible(false);
    };

    const payerList = useMemo(() => ['You', 'John', 'Sarah', 'Mike'], []);

    return (
      <Modal
        isVisible={isPayerModalVisible}
        onBackdropPress={() => setPayerModalVisible(false)}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={{ backgroundColor: theme.primary, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
          <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 15 }}>Select Payers</Text>
          {payerList.map(payer => (
            <TouchableOpacity
              key={payer}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10 }}
              onPress={() => toggleModalPayer(payer)}
            >
              <Ionicons
                name={modalPayers[payer] ? 'checkbox-outline' : 'square-outline'}
                size={24}
                color={theme.accent}
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: theme.text, fontSize: 16 }}>{payer}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={{ backgroundColor: theme.accent, padding: 15, borderRadius: 15, marginTop: 20 }}
            onPress={handleModalDone}
          >
            <Text style={{ color: theme.primary, textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  const renderContent = () => (
    <ScrollView style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
      <View className="flex-1">
        {renderInput(amount, setAmount, 'Amount', 'numeric')}
        {renderInput(description, setDescription, 'Description')}
        {renderDropdown(category, setCategory, 'Category')}
        {renderDropdown(group, setGroup, 'Group')}
        {renderSplitOptions()}
        {renderPaidBy()}
        {renderDropdown(date, setDate, 'Date')}

        <TouchableOpacity
          style={{
            backgroundColor: theme.primary,
            padding: 15,
            borderRadius: 15,
            marginBottom: 20,
          }}
          onPress={() => {/* Handle photo upload */}}
        >
          <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.text, textAlign: 'center', fontSize: 16 }}>
            Add Receipt Photo (optional)
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
          headerTitle: "Add Expense",
          headerTitleAlign: "center",
          headerTitleStyle: {
            color: theme.text,
            fontSize: 20,
            fontFamily: 'PoppinsSemiBold',
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={theme.text} style={{ marginLeft: 15 }} />
            </TouchableOpacity>
          ),
          headerBackVisible: false,
          headerRight: () => (
            <TouchableOpacity onPress={handleDone}>
              <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginRight: 15 }}>Done</Text>
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
        <PayerModal />
      </SafeAreaView>
    </>
  );
});

export default Expenses;
