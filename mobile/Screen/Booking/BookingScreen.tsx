import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from '../../components/Booking/SomeComponentFile'; // sử dụng lại Button bạn đã có

const TIME_SLOTS = ['09:00', '09:30', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export function BookingScreen({ doctor, user, onBack, onBook }) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // giả lập tạo danh sách ngày
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push({
        dayName: d.toLocaleDateString('vi-VN', { weekday: 'short' }),
        date: d.getDate(),
        fullDate: d.toISOString().split('T')[0],
      });
    }
    return days;
  };
  const dates = getNext7Days();

  return (
    <View style={{flex:1, padding:16}}>
      <Button onPress={onBack} variant="secondary" style={{marginBottom:10, width:60}}>Quay lại</Button>
      <Text style={{fontSize:20, fontWeight:"bold", marginBottom:10}}>{doctor.name}</Text>
      <Text style={{fontSize:16, marginBottom:10}}>Chọn ngày & giờ khám:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
        {dates.map((d) => (
          <Button
            key={d.fullDate}
            variant={selectedDate === d.fullDate ? "primary" : "secondary"}
            onPress={() => setSelectedDate(d.fullDate)}
            style={{marginRight:6, minWidth:60}}
          >{d.date + " " + d.dayName}</Button>
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom:10}}>
        {TIME_SLOTS.map((t) => (
          <Button
            key={t}
            variant={selectedTime === t ? "primary" : "secondary"}
            disabled={!selectedDate}
            onPress={() => setSelectedTime(t)}
            style={{marginRight:6, minWidth:60}}
          >{t}</Button>
        ))}
      </ScrollView>
      <Button
        onPress={() => {
          onBook({
            id: Math.random().toString(36).substr(2, 9),
            doctorId: doctor.id,
            userId: user.id,
            date: selectedDate,
            time: selectedTime,
            status: 'upcoming'
          });
        }}
        disabled={!selectedDate || !selectedTime}
        style={{marginTop:24}}
      >Xác nhận đặt lịch</Button>
    </View>
  );
}