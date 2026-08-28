import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import api from '../services/api';
import dayjs from 'dayjs';

const COLORS = { primary: '#7C3AED', bg: '#F8F7FC', white: '#FFFFFF', text: '#1F2937', muted: '#6B7280', success: '#10B981', danger: '#EF4444', warning: '#F59E0B' };

const STATUS_COLORS = { pending: COLORS.warning, confirmed: COLORS.primary, completed: COLORS.success, cancelled: COLORS.danger };
const STATUS_LABELS = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' };

export default function BookingsScreen({ navigation }) {
  const [appointments, setAppointments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('upcoming');

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments', { params: { limit: 50 } });
      setAppointments(res.data.data.appointments || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const now = new Date();
  const filtered = tab === 'upcoming'
    ? appointments.filter(a => new Date(a.date) >= now && !['cancelled', 'completed'].includes(a.status))
    : tab === 'past'
    ? appointments.filter(a => a.status === 'completed')
    : appointments.filter(a => a.status === 'cancelled');

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BookingDetail', { id: item._id })}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardService}>{item.service?.name}</Text>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{STATUS_LABELS[item.status]}</Text>
        </View>
      </View>
      <Text style={styles.cardSalon}>{item.salon?.name}</Text>
      <View style={styles.cardMeta}>
        <Text style={styles.metaText}>📅 {dayjs(item.date).format('MMM D, YYYY')}</Text>
        <Text style={styles.metaText}>🕐 {item.startTime}</Text>
        <Text style={styles.metaText}>👤 {item.staff?.name}</Text>
      </View>
      <Text style={styles.cardPrice}>₹{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bookings</Text>

      <View style={styles.tabs}>
        {['upcoming', 'past', 'cancelled'].map(t => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await fetchAppointments(); setRefreshing(false); }} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.empty}>No {tab} bookings</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, fontStyle: 'italic', marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: '#E5E7EB' },
  tabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  tabTextActive: { color: COLORS.white },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardService: { fontSize: 16, fontWeight: '700', color: COLORS.text, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  cardSalon: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  metaText: { fontSize: 12, color: COLORS.muted },
  cardPrice: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 10 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 15 },
});
