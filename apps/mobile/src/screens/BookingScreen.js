import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput, ActivityIndicator } from 'react-native';
import dayjs from 'dayjs';
import api from '../services/api';

const COLORS = { primary: '#7C3AED', bg: '#F8F7FC', white: '#FFFFFF', text: '#1F2937', muted: '#6B7280', success: '#10B981' };

export default function BookingScreen({ route, navigation }) {
  const { salonId, serviceId } = route.params;
  const [step, setStep] = useState(1);
  const [service, setService] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serviceRes, staffRes] = await Promise.all([
          api.get(`/services/${serviceId}`),
          api.get(`/salons/${salonId}/staff`, { params: { available: 'true' } })
        ]);
        setService(serviceRes.data.data);
        setStaffList(staffRes.data.data.staff || []);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchData();
  }, [salonId, serviceId]);

  useEffect(() => {
    if (!selectedDate || !service) return;
    const fetchAvailability = async () => {
      try {
        const params = { serviceId: service._id, date: dayjs(selectedDate).format('YYYY-MM-DD') };
        if (selectedStaff) params.staffId = selectedStaff._id;
        const res = await api.get(`/salons/${salonId}/availability`, { params });
        setAvailability(res.data.data.availableSlots || []);
      } catch (error) { console.error(error); }
    };
    fetchAvailability();
  }, [selectedDate, selectedStaff, service, salonId]);

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const date = dayjs().add(i, 'day');
      if (date.day() !== 0) dates.push(date);
    }
    return dates;
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await api.post('/appointments', {
        salon: salonId,
        service: service._id,
        ...(selectedStaff ? { staff: selectedStaff._id } : {}),
        date: dayjs(selectedDate).format('YYYY-MM-DD'),
        startTime: selectedSlot.startTime
      });
      Alert.alert('Success!', 'Your appointment has been booked.', [
        { text: 'View Bookings', onPress: () => navigation.navigate('Bookings') }
      ]);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to book appointment');
    }
    setSubmitting(false);
  };

  if (loading) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  const stepLabels = ['Service', 'Stylist', 'Date', 'Time', 'Confirm'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Book Appointment</Text>

      {/* Step Indicator */}
      <View style={styles.steps}>
        {stepLabels.map((label, idx) => (
          <View key={idx} style={[styles.step, step === idx + 1 && styles.stepActive, step > idx + 1 && styles.stepDone]}>
            <Text style={[styles.stepNum, (step === idx + 1 || step > idx + 1) && styles.stepNumActive]}>
              {step > idx + 1 ? '✓' : idx + 1}
            </Text>
            <Text style={[styles.stepLabel, step === idx + 1 && styles.stepLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Step 1: Service Info */}
      {step === 1 && service && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected Service</Text>
          <Text style={styles.serviceName}>{service.name}</Text>
          <Text style={styles.serviceDesc}>{service.description}</Text>
          <Text style={styles.serviceMeta}>{service.duration} min · ₹{service.price}</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)}>
            <Text style={styles.nextBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Stylist */}
      {step === 2 && (
        <View>
          <TouchableOpacity style={[styles.option, !selectedStaff && styles.optionActive]} onPress={() => { setSelectedStaff(null); setStep(3); }}>
            <Text style={styles.optionIcon}>🎲</Text>
            <Text style={styles.optionTitle}>Any Available Stylist</Text>
          </TouchableOpacity>
          {staffList.map(member => (
            <TouchableOpacity
              key={member._id}
              style={[styles.option, selectedStaff?._id === member._id && styles.optionActive]}
              onPress={() => { setSelectedStaff(member); setStep(3); }}
            >
              <View style={styles.staffAvatar}><Text style={styles.staffInitials}>{member.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>{member.name}</Text>
                <Text style={styles.optionSub}>{member.specialization} · {member.experience} yrs</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Step 3: Date */}
      {step === 3 && (
        <View>
          <Text style={styles.label}>Select a Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateRow}>
              {getDates().map((date, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.dateBtn, selectedDate && dayjs(selectedDate).isSame(date, 'day') && styles.dateBtnActive]}
                  onPress={() => { setSelectedDate(date); setSelectedSlot(null); setStep(4); }}
                >
                  <Text style={[styles.dateDay, selectedDate && dayjs(selectedDate).isSame(date, 'day') && styles.dateTextActive]}>{date.format('ddd')}</Text>
                  <Text style={[styles.dateNum, selectedDate && dayjs(selectedDate).isSame(date, 'day') && styles.dateTextActive]}>{date.format('D')}</Text>
                  <Text style={[styles.dateMonth, selectedDate && dayjs(selectedDate).isSame(date, 'day') && styles.dateTextActive]}>{date.format('MMM')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Step 4: Time */}
      {step === 4 && (
        <View>
          <Text style={styles.label}>Select a Time</Text>
          {availability.length === 0 ? (
            <Text style={styles.empty}>No available slots. Try another date.</Text>
          ) : (
            <View style={styles.timeGrid}>
              {availability.map((slot, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.timeSlot, selectedSlot?.startTime === slot.startTime && styles.timeSlotActive]}
                  onPress={() => { setSelectedSlot(slot); setStep(5); }}
                >
                  <Text style={[styles.timeText, selectedSlot?.startTime === slot.startTime && styles.timeTextActive]}>
                    {slot.startTime}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Step 5: Confirm */}
      {step === 5 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confirm Booking</Text>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Service</Text><Text style={styles.summaryValue}>{service?.name}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Stylist</Text><Text style={styles.summaryValue}>{selectedStaff?.name || 'Any Available'}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Date</Text><Text style={styles.summaryValue}>{dayjs(selectedDate).format('MMM D, YYYY')}</Text></View>
          <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Time</Text><Text style={styles.summaryValue}>{selectedSlot?.startTime}</Text></View>
          <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}><Text style={styles.summaryTotal}>Total</Text><Text style={styles.summaryPrice}>₹{service?.price}</Text></View>

          <TouchableOpacity style={[styles.confirmBtn, submitting && { opacity: 0.6 }]} onPress={handleConfirm} disabled={submitting}>
            <Text style={styles.confirmBtnText}>{submitting ? 'Booking...' : 'Confirm Booking'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step > 1 && (
        <TouchableOpacity style={styles.backBtn} onPress={() => setStep(step - 1)}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 60 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.text, fontStyle: 'italic', marginBottom: 20 },
  steps: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  step: { alignItems: 'center', flex: 1 },
  stepActive: {},
  stepDone: {},
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E5E7EB', textAlign: 'center', lineHeight: 28, fontSize: 12, fontWeight: '700', color: COLORS.muted },
  stepNumActive: { backgroundColor: COLORS.primary, color: COLORS.white },
  stepLabel: { fontSize: 10, color: COLORS.muted, marginTop: 4, fontWeight: '500' },
  stepLabelActive: { color: COLORS.primary, fontWeight: '700' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  serviceName: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  serviceDesc: { fontSize: 13, color: COLORS.muted, marginTop: 6 },
  serviceMeta: { fontSize: 15, color: COLORS.primary, fontWeight: '700', marginTop: 10 },
  nextBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  nextBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  option: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1.5, borderColor: '#E5E7EB', gap: 12 },
  optionActive: { borderColor: COLORS.primary, backgroundColor: 'rgba(124,58,237,0.04)' },
  optionIcon: { fontSize: 24 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  optionSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  staffAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  staffInitials: { color: COLORS.white, fontWeight: '700', fontSize: 14 },
  label: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  dateRow: { flexDirection: 'row', gap: 10, paddingRight: 20 },
  dateBtn: { width: 68, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1.5, borderColor: '#E5E7EB' },
  dateBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDay: { fontSize: 11, color: COLORS.muted, fontWeight: '500' },
  dateNum: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  dateMonth: { fontSize: 11, color: COLORS.muted },
  dateTextActive: { color: COLORS.white },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeSlot: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: COLORS.white },
  timeSlotActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  timeTextActive: { color: COLORS.white },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  summaryLabel: { fontSize: 14, color: COLORS.muted },
  summaryValue: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  summaryTotal: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  summaryPrice: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  confirmBtn: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16 },
  confirmBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  backBtn: { paddingVertical: 16, alignItems: 'center' },
  backBtnText: { color: COLORS.primary, fontWeight: '600', fontSize: 15 },
  empty: { textAlign: 'center', color: COLORS.muted, paddingVertical: 30, fontSize: 15 },
});
