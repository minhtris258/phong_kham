import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '../../components/Booking/SomeComponentFile';

export function SuccessScreen({ appointment, onClose }) {
  return (
    <View style={{flex:1, justifyContent:"center", alignItems:"center", padding:32}}>
      <Text style={{fontSize:22, fontWeight:"bold", marginBottom:16}}>🎉 Đặt lịch thành công!</Text>
      <Text style={{marginBottom:24, textAlign:"center"}}>
        Bạn đã đặt lịch với bác sĩ <Text style={{fontWeight: 'bold'}}>{appointment.doctorId}</Text>{"\n"}
        vào lúc <Text style={{fontWeight: 'bold'}}>{appointment.time}</Text> ngày <Text style={{fontWeight:"bold"}}>{appointment.date}</Text>
      </Text>
      <Button onPress={onClose}>Quay về danh sách bác sĩ</Button>
    </View>
  );
}