import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

import { useTheme } from '../../ThemeContext';

interface Balance {
  id: string;
  name: string;
  amount: number;
}

const SettleUp: React.FC = memo(() => {
  const theme = useTheme();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedBalances, setSelectedBalances] = useState<string[]>([]);

  const youOwe: Balance[] = [
    { id: '1', name: 'Sarah', amount: 15.00 },
    { id: '2', name: 'John', amount: 7.50 },
  ];

  const youAreOwed: Balance[] = [
    { id: '3', name: 'Alex', amount: 22.50 },
  ];

  const suggestedSettlements = [
    { id: '1', text: 'You should pay Sarah $15.00' },
    { id: '2', text: 'You should pay John $7.50' },
    { id: '3', text: 'Alex should pay you $22.50' },
  ];

  const toggleBalanceSelection = (id: string) => {
    setSelectedBalances(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const renderDropdown = (
    value: string,
    _setter: React.Dispatch<React.SetStateAction<string>>,
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
          shadowColor: theme.text,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          borderWidth: 1,
          borderColor: theme.accent,
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

  const renderBalanceSection = (title: string, balances: Balance[]) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>{title}</Text>
      {balances.map((balance) => (
        <TouchableOpacity
          key={balance.id}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            marginBottom: 10,
            backgroundColor: selectedBalances.includes(balance.id) ? theme.accent + '20' : 'transparent',
            padding: 10,
            borderRadius: 10,
          }}
          onPress={() => toggleBalanceSelection(balance.id)}
        >
          <Ionicons
            name={selectedBalances.includes(balance.id) ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={theme.accent}
            style={{ marginRight: 10 }}
          />
          <View>
            <Text style={{ color: theme.text, fontSize: 16, fontFamily: 'PoppinsSemiBold' }}>
              {balance.name}
            </Text>
            <Text style={{ color: theme.text, fontSize: 14 }}>
              ${Math.abs(balance.amount).toFixed(2)}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSuggestedSettlements = () => (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ color: theme.accent, fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Suggested settlements:</Text>
      {suggestedSettlements.map((item) => (
        <Text key={item.id} style={{ color: theme.text, fontSize: 16, marginBottom: 5 }}>{item.text}</Text>
      ))}
    </View>
  );

  const renderButton = (text: string, onPress: () => void) => (
    <TouchableOpacity
      style={{
        backgroundColor: theme.accent,
        padding: 15,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: theme.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={onPress}
    >
      <Text style={{ fontFamily: 'PoppinsSemiBold', color: theme.primary, textAlign: 'center', fontSize: 16 }}>
        {text}
      </Text>
    </TouchableOpacity>
  );

  const handleMarkAsSettled = () => {
    console.log('Marked as settled:', selectedBalances);
    // Implement logic to mark selected balances as settled
  };

  const handleRecordManualSettlement = () => {
    // Implement logic to record manual settlement
  };

  const renderContent = () => (
    <ScrollView style={{ flexGrow: 1 }} className="px-4 py-6 md:px-6 md:py-10">
      <View className="flex-1">
        {renderDropdown(selectedGroup, setSelectedGroup, 'Choose Group')}
        {renderBalanceSection('You owe:', youOwe)}
        {renderBalanceSection('You are owed:', youAreOwed)}
        {renderSuggestedSettlements()}
        {renderButton('Mark Selected Balances as Settled', handleMarkAsSettled)}
        {renderButton('Record Manual Settlement', handleRecordManualSettlement)}
      </View>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "Settle Up",
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
        }} 
      />
      <StatusBar barStyle="light-content" backgroundColor={theme.secondary} />
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.secondary }}>
        {renderContent()}
      </SafeAreaView>
    </>
  );
});

export default SettleUp;
