import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- MOCK DATA VÀ TYPES (GIỮ NGUYÊN) ---
interface Doctor { id: string; name: string; specialization: string; rating: number; }
interface User { id: string; name: string; }
interface Appointment { id: string; doctorId: string; userId: string; date: string; time: string; status: 'upcoming' | 'completed'; }
enum Specialization { PEDIATRICS = 'Nhi Khoa', DERMATOLOGY = 'Da Liễu', CARDIOLOGY = 'Tim Mạch', EYE = 'Mắt', GENERAL = 'Đa Khoa' }

const DOCTORS: Doctor[] = [
    { id: 'd1', name: 'Dr. Nguyễn Văn Aa', specialization: Specialization.PEDIATRICS, rating: 4.9 },
    { id: 'd2', name: 'Dr. Trần Thị B', specialization: Specialization.DERMATOLOGY, rating: 4.7 },
    { id: 'd3', name: 'Dr. Lê Hữu C', specialization: Specialization.CARDIOLOGY, rating: 4.8 },
    { id: 'd4', name: 'Dr. Huỳnh D', specialization: Specialization.PEDIATRICS, rating: 4.6 },
];
const TIME_SLOTS: string[] = ['09:00','09:30', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

// --- MOCK COMPONENTS (GIỮ NGUYÊN) ---
interface DoctorCardProps { doctor: Doctor; onPress?: () => void; }
const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, onPress }) => (
    <TouchableOpacity style={styles.doctorCardContainer} onPress={onPress}>
        <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>{doctor.name[0]}</Text></View>
        <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor.name}</Text>
            <Text style={styles.doctorSpec}>{doctor.specialization}</Text>
            <Text style={styles.doctorRating}><Ionicons name="star" size={12} color="#FBBF24" /> {doctor.rating}</Text>
        </View>
        {onPress && <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />}
    </TouchableOpacity>
);

interface ButtonProps { 
    children: React.ReactNode; 
    onPress: () => void; 
    disabled?: boolean; 
    variant?: 'primary' | 'secondary';
    style?: any;
}
const Button: React.FC<ButtonProps> = ({ children, onPress, disabled, variant = 'primary', style }) => {
    const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
    const textStyle = variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText;
    
    return (
        <TouchableOpacity 
            style={[buttonStyle, disabled && styles.disabledButton, style]} 
            onPress={onPress} 
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Text style={textStyle}>{children}</Text>
        </TouchableOpacity>
    );
};
// --- END MOCK COMPONENTS ---

// --- COMPONENT HEADER (GIỮ NGUYÊN) ---
const Header = ({ title, showBack = true, onBackAction = () => {}, backText }: { title: string; showBack?: boolean; onBackAction?: () => void; backText?: string }) => {
    return (
        <View style={[styles.headerContainer, { paddingTop: Platform.OS === 'ios' ? 45 : 30 }, { zIndex: 1000, elevation: 10 }]} pointerEvents="box-none">
            {showBack ? (
                <Pressable
                    onPress={onBackAction}
                    android_ripple={{ color: '#eee' }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                >
                    <Ionicons name="chevron-back" size={24} color="#1F2937" />
                </Pressable>
            ) : (<View style={styles.backButton} />)}
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.backButton} />
        </View>
    );
};
// --- END HEADER ---

// --- NEW SUB-COMPONENTS UI ---
// 2.1 Date Selector
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

interface DateSelectorProps { selectedDate: string; onSelectDate: (date: string) => void; }
const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onSelectDate }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>
            <Ionicons name="calendar-outline" size={18} color="#2563EB" /> <Text>Ngày khám</Text>
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datePickerScroll}>
            {dates.map((d, idx) => (
                <TouchableOpacity
                    key={idx}
                    onPress={() => onSelectDate(d.fullDate)}
                    style={[
                        styles.dateButton,
                        selectedDate === d.fullDate && styles.dateButtonActive
                    ]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.dateDayName, selectedDate === d.fullDate && styles.dateTextActive]}>{d.dayName}</Text>
                    <Text style={[styles.dateDate, selectedDate === d.fullDate && styles.dateTextActive]}>{d.date}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);

// 2.2 Time Slot Selector
interface TimeSlotSelectorProps { selectedDate: string; selectedTime: string; onSelectTime: (time: string) => void; }
const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ selectedDate, selectedTime, onSelectTime }) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>
            <Ionicons name="time-outline" size={18} color="#2563EB" /> <Text>Giờ khám</Text>
        </Text>
        <View style={styles.timeSlotsGrid}>
            {TIME_SLOTS.map((time) => (
                <TouchableOpacity
                    key={time}
                    onPress={() => onSelectTime(time)}
                    disabled={!selectedDate}
                    style={[
                        styles.timeButton,
                        selectedTime === time && styles.timeButtonActive,
                        !selectedDate && styles.disabledTimeButton
                    ]}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.timeText, selectedTime === time && styles.timeTextActive]}>{time}</Text>
                </TouchableOpacity>
            ))}
        </View>
    </View>
);

// --- 1. Step 1: Select Doctor Component ---
interface Step1Props { 
    onBack: () => void; 
    onDoctorSelect: (doc: Doctor) => void;
}
const Step1_SelectDoctor: React.FC<Step1Props> = ({ onBack, onDoctorSelect }) => {
    const [filterSpec, setFilterSpec] = useState<string>('All');
    const filteredDoctors = filterSpec === 'All' ? DOCTORS : DOCTORS.filter(d => d.specialization === filterSpec);

    return (
        <View style={styles.step1Container}>
            <Header title="Đặt lịch khám" showBack={true} onBackAction={onBack} />
            <View style={styles.filterContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollView}>
                    <TouchableOpacity 
                        onPress={() => setFilterSpec('All')}
                        style={[styles.filterButton, filterSpec === 'All' && styles.filterButtonActive]}
                    >
                        <Text style={[styles.filterText, filterSpec === 'All' && styles.filterTextActive]}>Tất cả</Text>
                    </TouchableOpacity>
                    {Object.values(Specialization).map(s => (
                        <TouchableOpacity 
                            key={s}
                            onPress={() => setFilterSpec(s)}
                            style={[styles.filterButton, filterSpec === s && styles.filterButtonActive]}
                        >
                            <Text style={[styles.filterText, filterSpec === s && styles.filterTextActive]}>{s}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <ScrollView contentContainerStyle={styles.doctorListContainer}>
                {filteredDoctors.map(doc => (
                    <DoctorCard key={doc.id} doctor={doc} onPress={() => onDoctorSelect(doc)} />
                ))}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
};

// --- 2. Step 2: Select Date & Time Component ---
interface Step2Props { 
    selectedDoctor: Doctor; 
    onBack: () => void; 
    onConfirm: () => void;
    selectedDate: string;
    setSelectedDate: (date: string) => void;
    selectedTime: string;
    setSelectedTime: (time: string) => void;
    preSelectedDoctor: Doctor | null;
}
const Step2_SelectTime: React.FC<Step2Props> = ({ 
    selectedDoctor, onBack, onConfirm, 
    selectedDate, setSelectedDate, 
    selectedTime, setSelectedTime,
    preSelectedDoctor,
}) => {
    // Điều chỉnh hành động back: Quay lại Step 1 nếu không phải bác sĩ được chọn trước, ngược lại gọi onBack (về trang chủ)
    const handleBackAction = preSelectedDoctor ? onBack : () => onBack();

    return (
        <View style={styles.step2Container}>
            <Header title="Chọn thời gian" onBackAction={handleBackAction} />
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={{ marginHorizontal: 20, marginBottom: 0 }}>
                    <DoctorCard doctor={selectedDoctor} />
                </View>

                <DateSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
                <TimeSlotSelector selectedDate={selectedDate} selectedTime={selectedTime} onSelectTime={setSelectedTime} />
                
                <View style={{ height: 120 }} /> 
            </ScrollView>

            <View style={styles.bottomActionBar}>
                <Button 
                    onPress={onConfirm}
                    disabled={!selectedDate || !selectedTime}
                    style={styles.fullWidthButton}
                >
                    <Text>Xác nhận đặt lịch</Text>
                </Button>
            </View>
        </View>
    );
};


// --- 3. Step 3: Success Component ---
interface Step3Props { 
    selectedDoctor: Doctor; 
    selectedDate: string; 
    selectedTime: string; 
    onBackToHome: () => void; 
}
const Step3_Success: React.FC<Step3Props> = ({ selectedDoctor, selectedDate, selectedTime, onBackToHome }) => (
    <View style={styles.successContainer}>
        <View style={styles.successIconWrapper}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
        </View>
        <Text style={styles.successTitle}>Đặt lịch thành công!</Text>
        <Text style={styles.successMessage}>
            <Text>Bạn đã đặt lịch khám với</Text>
            <Text style={styles.boldText}> {selectedDoctor.name}</Text>
            <Text> vào lúc</Text>
            <Text style={styles.boldText}> {selectedTime}</Text>
            <Text> ngày</Text>
            <Text style={styles.boldText}> {selectedDate}</Text>
        </Text>
        <Button onPress={onBackToHome} style={styles.backToHomeButton}>
            <Text>Quay về trang chủ</Text>
        </Button>
    </View>
);


// --- MAIN VIEW (CONTAINER) ---
interface BookingViewProps {
    preSelectedDoctor: Doctor | null;
    user: User;
    onBack: () => void;
    onBook: (appt: Appointment) => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ preSelectedDoctor, user, onBack, onBook }) => {
    const [step, setStep] = useState<number>(preSelectedDoctor ? 2 : 1);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(preSelectedDoctor);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    
    const handleDoctorSelect = (doc: Doctor) => {
        setSelectedDoctor(doc);
        setStep(2);
    };

    const handleConfirm = () => {
        if (!selectedDoctor || !selectedDate || !selectedTime) return;
        
        const newAppointment: Appointment = {
            id: Math.random().toString(36).substr(2, 9),
            doctorId: selectedDoctor.id,
            userId: user.id,
            date: selectedDate,
            time: selectedTime,
            status: 'upcoming'
        };
        
        onBook(newAppointment);
        setStep(3);
    };

    if (step === 1) {
        return <Step1_SelectDoctor 
            onBack={onBack} 
            onDoctorSelect={handleDoctorSelect} 
        />;
    }

    if (step === 2 && selectedDoctor) {
        return <Step2_SelectTime
            selectedDoctor={selectedDoctor}
            preSelectedDoctor={preSelectedDoctor}
            onBack={() => setStep(1)} // Quay lại Step 1
            onConfirm={handleConfirm}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
        />;
    }

    if (step === 3 && selectedDoctor) {
        return <Step3_Success 
            selectedDoctor={selectedDoctor} 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onBackToHome={onBack} 
        />;
    }

    // Fallback/Loading state
    return <View style={styles.step1Container}><Text style={{ textAlign: 'center', marginTop: 50 }}>Đang tải...</Text></View>
};


// --- STYLESHEET (GIỮ NGUYÊN) ---
const styles = StyleSheet.create({
    // --- LAYOUTS ---
    step1Container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    step2Container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollViewContent: {
        paddingBottom: 20,
        marginTop: 10,
    },
    doctorListContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    bottomActionBar: {
        position: 'absolute',
        bottom: 70,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    },
    fullWidthButton: {
        width: '100%',
    },
    // --- HEADER ---
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    backButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
        flex: 1,
        textAlign: 'center',
        marginLeft: -30,
    },
    // --- STEP 1 FILTERS ---
    filterContainer: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    filterScrollView: {
        paddingHorizontal: 16,
    },
    filterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterButtonActive: {
        backgroundColor: '#2563EB',
    },
    filterText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '600',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    // --- STEP 2 SECTIONS ---
    section: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 15,
    },
    // Date Picker
    datePickerScroll: {
        paddingVertical: 5,
    },
    dateButton: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 60,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        marginRight: 10,
    },
    dateButtonActive: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    dateDayName: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
    },
    dateDate: {
        fontSize: 18,
        fontWeight: '800',
        marginTop: 4,
        color: '#1F2937',
    },
    dateTextActive: {
        color: '#2563EB',
    },
    // Time Picker
    timeSlotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeButton: {
        width: '23%',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: '#FFFFFF',
        marginBottom: 12,
        alignItems: 'center',
    },
    timeButtonActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    timeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    timeTextActive: {
        color: '#FFFFFF',
    },
    disabledTimeButton: {
        opacity: 0.5,
        backgroundColor: '#F3F4F6',
    },
    // --- STEP 3 SUCCESS ---
    successContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
        paddingBottom: 100,
    },
    successIconWrapper: {
        width: 80,
        height: 80,
        backgroundColor: '#D1FAE5',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 8,
    },
    successMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 40,
    },
    boldText: {
        fontWeight: '700',
        color: '#1F2937',
    },
    backToHomeButton: {
        width: '100%',
        maxWidth: 250,
    },
    // --- MOCK COMPONENTS STYLES ---
    doctorCardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    avatarPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#A5B4FC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '700',
    },
    doctorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    doctorSpec: {
        fontSize: 14,
        color: '#4F46E5',
        marginTop: 2,
    },
    doctorRating: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 4,
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    secondaryButton: {
        backgroundColor: '#E5E7EB',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.6,
    }
});