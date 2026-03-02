import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  getCreditTransactions,
  formatTransactionType,
  formatTransactionStatus,
  formatCurrency,
  formatTransactionDate,
  type CreditTransaction,
} from '../services/creditService';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';

const CreditHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const GoBack = () => {
    navigation.goBack();
  };

  // Load transactions
  const loadTransactions = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const type = selectedFilter === 'all' ? undefined : selectedFilter;
        const txns = await getCreditTransactions(type, 100);
        setTransactions(txns);
      } else {
        setTransactions([]);
      }
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      toast.showToast('Failed to load transactions', 'error');
      setTransactions([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [selectedFilter])
  );

  // Handle refresh
  const handleRefresh = () => {
    loadTransactions(false);
  };

  // Get transaction icon/color based on type
  const getTransactionStyle = (type: string) => {
    switch (type) {
      case 'topup':
        return {color: Colors.green[700], icon: '+'};
      case 'transfer':
        return {color: Colors.blue[500], icon: '→'};
      case 'consume':
        return {color: Colors.red[500], icon: '-'};
      case 'refund':
        return {color: Colors.primary, icon: '↩'};
      default:
        return {color: Colors.gray[600], icon: '•'};
    }
  };

  // Render transaction item
  const renderTransaction = ({item}: {item: CreditTransaction}) => {
    const style = getTransactionStyle(item.type);
    const isPositive = item.type === 'topup' || item.type === 'refund';

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIconContainer}>
            <View style={[styles.transactionIcon, {backgroundColor: style.color + '20'}]}>
              <Text style={[styles.transactionIconText, {color: style.color}]}>
                {style.icon}
              </Text>
            </View>
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionType}>
              {formatTransactionType(item.type)}
            </Text>
            <Text style={styles.transactionDescription} numberOfLines={1}>
              {item.description}
            </Text>
            <Text style={styles.transactionDate}>
              {formatTransactionDate(item.createdAt)}
            </Text>
          </View>
          <View style={styles.transactionAmountContainer}>
            <Text
              style={[
                styles.transactionAmount,
                {color: isPositive ? Colors.green[700] : Colors.red[500]},
              ]}>
              {isPositive ? '+' : '-'}
              {formatCurrency(Math.abs(item.amount), 'SAR')}
            </Text>
            <Text style={styles.transactionStatus}>
              {formatTransactionStatus(item.status)}
            </Text>
          </View>
        </View>
        {item.note && (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>{item.note}</Text>
          </View>
        )}
      </View>
    );
  };

  const filters = [
    {key: 'all', label: 'All'},
    {key: 'topup', label: 'Top-up'},
    {key: 'transfer', label: 'Transfer'},
    {key: 'consume', label: 'Purchase'},
    {key: 'refund', label: 'Refund'},
  ];

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Transaction History"
        onBackPress={GoBack}
        showBorder={true}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Please login to view transaction history
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
            contentContainerStyle={styles.filtersContent}>
            {filters.map(filter => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.key && styles.filterButtonActive,
                ]}
                onPress={() => setSelectedFilter(filter.key)}>
                <Text
                  style={[
                    styles.filterText,
                    selectedFilter === filter.key && styles.filterTextActive,
                  ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <View style={styles.emptyListContainer}>
              <Text style={styles.emptyListText}>No transactions found</Text>
            </View>
          ) : (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={item => item._id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  colors={[Colors.primary]}
                />
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing[4],
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderRadius: r(8),
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
  },
  content: {
    flex: 1,
  },
  filtersContainer: {
    backgroundColor: Colors.white,
    borderBottomWidth: r(1),
    borderBottomColor: Colors.gray[200],
  },
  filtersContent: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    gap: Spacing[3],
  },
  filterButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: r(20),
    backgroundColor: Colors.gray[100],
    marginRight: Spacing[2],
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
  },
  filterTextActive: {
    color: Colors.white,
    fontFamily: FontFamilies.mbold,
  },
  listContent: {
    padding: Spacing[5],
  },
  transactionCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[3],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIconContainer: {
    marginRight: Spacing[3],
  },
  transactionIcon: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[1],
  },
  transactionDescription: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[1],
  },
  transactionDate: {
    fontSize: FontSizes.xs,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[1],
  },
  transactionStatus: {
    fontSize: FontSizes.xs,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
  noteContainer: {
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200],
  },
  noteText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    fontStyle: 'italic',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  emptyListText: {
    fontSize: FontSizes.base,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
});

export default CreditHistoryScreen;
