import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {CustomHeader, CustomButton} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {getMyVendorProducts} from '../services/productService';
import {useAppSelector} from '../store';

const VendorProductsScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAppSelector(state => state.auth.user);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await getMyVendorProducts();
      setProducts(data);
    } catch (error: any) {
      Alert.alert(
        'Unable to load products',
        error?.response?.data?.error || error?.message || 'Please try again',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.role === 'vendor') {
        setLoading(true);
        load();
      } else {
        setLoading(false);
      }
    }, [user?.role]),
  );

  if (user?.role !== 'vendor') {
    return (
      <View style={styles.container}>
        <CustomHeader title="My Products" onBackPress={() => navigation.goBack()} showBorder />
        <View style={styles.center}>
          <Text style={styles.empty}>Vendor access only</Text>
        </View>
      </View>
    );
  }

  if (user.vendorStatus !== 'approved') {
    return (
      <View style={styles.container}>
        <CustomHeader title="My Products" onBackPress={() => navigation.goBack()} showBorder />
        <View style={styles.center}>
          <Text style={styles.empty}>
            Your vendor account is pending admin approval.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader
        title="My Products"
        onBackPress={() => navigation.goBack()}
        showBorder
      />
      <View style={styles.actions}>
        <CustomButton
          title="Add Product"
          handlePress={() => navigation.navigate('VendorAddProduct')}
          containerStyle={styles.addBtn}
        />
      </View>
      {loading ? (
        <ActivityIndicator style={{marginTop: 40}} color={Colors.primary} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={item => String(item._id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
            />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>No products yet. Tap Add Product.</Text>
          }
          renderItem={({item}) => (
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <FastImage
                source={{uri: item.image?.[0] || ''}}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
              />
              <View style={styles.meta}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.price}>SAR {item.price}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  actions: {paddingHorizontal: Spacing[5], paddingVertical: Spacing[3]},
  addBtn: {marginBottom: 0},
  list: {paddingHorizontal: Spacing[5], paddingBottom: Spacing[10]},
  card: {
    flexDirection: 'row',
    marginBottom: Spacing[4],
    backgroundColor: Colors.white,
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: 'hidden',
  },
  image: {width: r(88), height: r(88)},
  meta: {flex: 1, padding: Spacing[3], justifyContent: 'center'},
  title: {
    fontFamily: FontFamilies.msemibold,
    fontSize: FontSizes.base,
    color: Colors.black[100],
  },
  price: {
    marginTop: Spacing[1],
    fontFamily: FontFamilies.mbold,
    color: Colors.primary,
  },
  center: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  empty: {
    textAlign: 'center',
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
    marginTop: Spacing[8],
  },
});

export default VendorProductsScreen;
