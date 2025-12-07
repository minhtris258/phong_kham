import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface CategoryItemProps {
  name: string;
  icon: string;
  color: string;
  onPress?: () => void;
}

export const CategoryItem: React.FC<CategoryItemProps> = ({ name, icon, color, onPress }) => (
  <TouchableOpacity style={styles.categoryItem} activeOpacity={0.7} onPress={onPress}>
    <View style={[styles.categoryIconCircle, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons 
        name={icon as any} 
        size={30} 
        color={color} 
      />
    </View>
    <Text style={styles.categoryName}>{name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    width: '23%', 
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#4B5563', // gray-600
  },
});