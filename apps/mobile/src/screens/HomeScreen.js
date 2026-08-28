import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput, RefreshControl } from 'react-native';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const COLORS = { primary: '#7C3AED', bg: '#F8F7FC', white: '#FFFFFF', text: '#1F2937', muted: '#6B7280', secondary: '#EC4899' };

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [salons, setSalons] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSalons = async () => {
    try {
      const res = await api.get('/salons', { params: { limit: 5, sort: '-rating' } });
      setSalons(res.data.data.salons || []);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchSalons(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalons();
    setRefreshing(false);
  };

  const renderSalon = ({ item }) => (
    <TouchableOpacity style={styles.salonCard} onPress={() => navigation.navigate('SalonDetail', { slug: item.slug })}>
      <Image source={{ uri: item.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=500&fit=crop' }} style={styles.salonImage} />
      <View style={styles.salonInfo}>
        <Text style={styles.salonName}>{item.name}</Text>
        <Text style={styles.salonLocation}>{item.city}, {item.state || item.country}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.rating}>★ {item.rating?.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({item.reviewCount} reviews)</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.firstName} 👋</Text>
          <Text style={styles.title}>Find Your Perfect Salon</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search')}>
        <Text style={styles.searchPlaceholder}>🔍  Search salons, services...</Text>
      </TouchableOpacity>

      <FlatList
        data={salons}
        keyExtractor={(item) => item._id}
        renderItem={renderSalon}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Top Rated Salons</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No salons found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { fontSize: 14, color: COLORS.muted },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, fontStyle: 'italic', marginTop: 4 },
  searchBar: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  searchPlaceholder: { color: COLORS.muted, fontSize: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  salonCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  salonImage: { width: '100%', height: 160, resizeMode: 'cover' },
  salonInfo: { padding: 14 },
  salonName: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  salonLocation: { fontSize: 13, color: COLORS.muted, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  rating: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
  reviewCount: { fontSize: 12, color: COLORS.muted },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { color: COLORS.muted, fontSize: 15 },
});
