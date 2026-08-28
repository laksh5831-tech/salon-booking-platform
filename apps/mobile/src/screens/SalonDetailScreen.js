import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#7C3AED', bg: '#F8F7FC', white: '#FFFFFF', text: '#1F2937', muted: '#6B7280', secondary: '#EC4899' };

export default function SalonDetailScreen({ route, navigation }) {
  const { slug } = route.params;
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const salonRes = await api.get(`/salons/slug/${slug}`);
        const salonData = salonRes.data.data;
        setSalon(salonData);
        const [servicesRes, staffRes] = await Promise.all([
          api.get('/services', { params: { salon: salonData._id, limit: 20 } }),
          api.get(`/salons/${salonData._id}/staff`, { params: { limit: 20 } })
        ]);
        setServices(servicesRes.data.data.services || []);
        setStaff(staffRes.data.data.staff || []);
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    fetchData();
  }, [slug]);

  const handleBookService = (serviceId) => {
    if (!user) { navigation.navigate('Login'); return; }
    navigation.navigate('Booking', { salonId: salon._id, salonSlug: slug, serviceId });
  };

  if (loading || !salon) return <View style={styles.loading}><Text style={styles.loadingText}>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: salon.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800' }} style={styles.coverImage} />

      <View style={styles.content}>
        <Text style={styles.name}>{salon.name}</Text>
        <Text style={styles.rating}>★ {salon.rating?.toFixed(1)} ({salon.reviewCount} reviews)</Text>
        <Text style={styles.location}>📍 {salon.address}, {salon.city}</Text>
        <Text style={styles.description}>{salon.description}</Text>

        <Text style={styles.sectionTitle}>Services</Text>
        {services.map(service => (
          <View key={service._id} style={styles.serviceCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDesc}>{service.description}</Text>
              <Text style={styles.serviceMeta}>{service.duration} min · ₹{service.price}</Text>
            </View>
            <TouchableOpacity style={styles.bookBtn} onPress={() => handleBookService(service._id)}>
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        ))}

        {services.length === 0 && <Text style={styles.empty}>No services available yet.</Text>}

        <Text style={styles.sectionTitle}>Our Team</Text>
        {staff.map(member => (
          <View key={member._id} style={styles.staffCard}>
            <View style={styles.staffAvatar}>
              <Text style={styles.staffInitials}>{member.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.staffName}>{member.name}</Text>
              <Text style={styles.staffRole}>{member.specialization || 'Stylist'}</Text>
              <Text style={styles.staffExp}>{member.experience} years experience</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  loadingText: { color: COLORS.muted, fontSize: 16 },
  coverImage: { width: '100%', height: 220, resizeMode: 'cover' },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: '700', color: COLORS.text, fontStyle: 'italic' },
  rating: { fontSize: 15, color: '#F59E0B', fontWeight: '600', marginTop: 8 },
  location: { fontSize: 14, color: COLORS.muted, marginTop: 6 },
  description: { fontSize: 14, color: COLORS.muted, marginTop: 12, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 12 },
  serviceCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  serviceName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  serviceDesc: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  serviceMeta: { fontSize: 13, color: COLORS.primary, fontWeight: '600', marginTop: 6 },
  bookBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10 },
  bookBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 13 },
  staffCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', gap: 14 },
  staffAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  staffInitials: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  staffName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  staffRole: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  staffExp: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
  empty: { textAlign: 'center', color: COLORS.muted, fontSize: 14, paddingVertical: 20 },
});
