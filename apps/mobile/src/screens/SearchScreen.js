import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from 'react-native';
import api from '../services/api';

const COLORS = { primary: '#7C3AED', bg: '#F8F7FC', white: '#FFFFFF', text: '#1F2937', muted: '#6B7280' };

export default function SearchScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchSalons = async (query) => {
    if (!query.trim()) { setSalons([]); return; }
    setLoading(true);
    try {
      const res = await api.get('/salons', { params: { search: query, limit: 20 } });
      setSalons(res.data.data.salons || []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchSalons(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const renderSalon = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('SalonDetail', { slug: item.slug })}>
      <Image source={{ uri: item.coverImage || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' }} style={styles.cardImage} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardLocation}>{item.city}</Text>
        <Text style={styles.cardRating}>★ {item.rating?.toFixed(1)} ({item.reviewCount})</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.input}
        placeholder="Search salons by name or city..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor={COLORS.muted}
      />
      <FlatList
        data={salons}
        keyExtractor={(item) => item._id}
        renderItem={renderSalon}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          search.length > 0 && !loading ? (
            <Text style={styles.empty}>No salons found for "{search}"</Text>
          ) : !search ? (
            <Text style={styles.empty}>Type to search salons...</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, padding: 16, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, fontStyle: 'italic', marginBottom: 16 },
  input: { backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1.5, borderColor: '#E5E7EB', fontSize: 15, color: COLORS.text },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardImage: { width: 90, height: 90, resizeMode: 'cover' },
  cardInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  cardName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  cardLocation: { fontSize: 12, color: COLORS.muted, marginTop: 4 },
  cardRating: { fontSize: 12, color: '#F59E0B', fontWeight: '600', marginTop: 4 },
  empty: { textAlign: 'center', color: COLORS.muted, marginTop: 40, fontSize: 15 },
});
