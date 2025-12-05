import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { DoctorCard } from '../../components/Booking/SomeComponentFile'; // Đảm bảo DoctorCard nhận prop doctor và onPress
// Mock data
const DOCTORS = [
  { id: 'd1', name: 'Dr. Nguyễn Văn Aa', specialization: 'Nhi Khoa', rating: 4.9 },
  { id: 'd2', name: 'Dr. Trần Thị B', specialization: 'Da Liễu', rating: 4.7 },
  //...
];

export function DoctorListScreen({ onSelectDoctor }) {
  return (
    <View style={{flex:1}}>
      <Text style={{fontSize:22, fontWeight:"bold", margin:16}}>Chọn bác sĩ</Text>
      <ScrollView style={{padding:16}}>
        {DOCTORS.map(doc => (
          <DoctorCard key={doc.id} doctor={doc} onPress={() => onSelectDoctor(doc)} />
        ))}
      </ScrollView>
    </View>
  );
}