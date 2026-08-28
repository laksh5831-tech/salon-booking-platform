import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import dayjs from 'dayjs';
import api from '../services/api';

const COLORS = { primary: '#7C3AED', bg: '#F8F7FC', white: '#FFFFFF', text: '#1F2937', muted: '#6B7280', success: '#10B981', danger: '#EF4444', warning: '#F59E0B' };

const STATUS_COLORS = { pending: COLORS.warning, confirmed: COLORS.primary, completed: COLORS.success, cancelled: COLORS.danger };

export default function BookingDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/appointments/${id}`);
        setAppointment(res.data.data);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchAppointment();
  }, [id]);

  const handleCancel = () => {
    Alert.alert('Cancel Appointment', 'Are you sure you want to cancel this appointment?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post(`/appointments/${id}/cancel`);
            Alert.alert('Success', 'Appointment cancelled');
            setAppointment(prev => ({ ...prev, status: 'cancelled' }));
          } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel');
          }
        }
      }
    ]);
  };

  if (loading || !appointment) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.primary} /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[appointment.status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[appointment.status] }]}>
            {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Service</Text>
        <Text style={styles.value}>{appointment.service?.name}</Text>

        <View style={styles.divider} />
        <Text style={styles.label}>Salon</Text>
        <Text style={styles.value}>{appointment.salon?.name}</Text>

        <View style={styles.divider} />
        <Text style={styles.label}>Stylist</Text>
        <Text style={styles.value}>{appointment.staff?.name}</Text>

        <View style={styles.divider} />
        <Text style={styles.label}>Date & Time</Text>
        <Text style={styles.value}>{dayjs(appointment.date).format('MMMM D, YYYY')} at {appointment.startTime}</Text>

        <View style={styles.divider} />
        <Text style={styles.label}>Duration</Text>
        <Text style={styles.value}>{(appointment.duration || appointment.service?.duration)} minutes</Text>

        <View style={styles.divider} />
        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Total Price</Text>
          <Text style={styles.priceValue}>₹{appointment.price}</Text>
        </View>
      </View>

      {['pending', 'confirmed'].includes(appointment.status) && (
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel Appointment</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 60 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  statusHeader: { alignItems: 'center', marginBottom: 20 },
  statusBadge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  statusText: { fontSize: 14, fontWeight: '700' },
  card: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { fontSize: 12, color: COLORS.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginTop: 4 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  priceValue: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  cancelBtn: { backgroundColor: '#FEF2F2', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  cancelBtnText: { color: COLORS.danger, fontWeight: '700', fontSize: 15 },
});
