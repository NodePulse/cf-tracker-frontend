import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { cfApi, Submission } from '../api/cfApi';
import { colors, spacing, typography } from '../theme/index';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import {
  CheckCircle2,
  XCircle,
  Code,
  Clock,
  BarChart4,
  Search,
} from 'lucide-react-native';

type SubmissionsStackParamList = {
  SubmissionsList: undefined;
  SubmissionDetail: { id: string; problem: string };
};

export function Submissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const navigation = useNavigation<NavigationProp<SubmissionsStackParamList>>();

  const fetchSubmissions = useCallback(async (newOffset = 0) => {
    try {
      const res = await cfApi.getSubmissions({ offset: newOffset, limit: 20 });
      if (newOffset === 0) {
        setSubmissions(res.data);
      } else {
        setSubmissions(prev => [...prev, ...res.data]);
      }
      setHasNext(res.pagination.hasNext);
      setOffset(newOffset);
    } catch (error) {
      console.error('Failed to fetch submissions', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const loadMore = () => {
    if (hasNext && !loadingMore) {
      setLoadingMore(true);
      fetchSubmissions(offset + 20);
    }
  };

  const filteredSubmissions = submissions.filter(s =>
    s.problem.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: Submission }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('SubmissionDetail', {
          id: item.id,
          problem: item.problem,
        })
      }
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.problemInfo}>
          <Text style={styles.problemName} numberOfLines={1}>
            {item.problem}
          </Text>
          <Text style={styles.submissionId}>#{item.id}</Text>
        </View>
        <VerdictBadge verdict={item.verdict} />
      </View>

      <View style={styles.cardFooter}>
        <FooterItem
          icon={<Code size={14} color={colors.textTertiary} />}
          text={item.language}
        />
        {item.difficulty && (
          <FooterItem
            icon={<BarChart4 size={14} color={colors.textTertiary} />}
            text={item.difficulty}
          />
        )}
        <View style={{ flex: 1 }} />
        <FooterItem
          icon={<Clock size={14} color={colors.textTertiary} />}
          text={item.date}
        />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        {/* <Text style={styles.pageTitle}>Submissions</Text> */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search
              size={20}
              color={colors.textTertiary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by problem name..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>
      </View>

      <FlatList
        data={filteredSubmissions}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.footerLoader}
            />
          ) : (
            <View style={{ height: 40 }} />
          )
        }
      />
    </View>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const isOk = verdict === 'OK';
  const color = isOk ? colors.accent : colors.error;
  const bgColor = isOk ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor: color + '40',
          borderWidth: 0.5,
        },
      ]}
    >
      {isOk ? (
        <CheckCircle2 size={12} color={color} />
      ) : (
        <XCircle size={12} color={color} />
      )}
      <Text style={[styles.badgeText, { color }]}>{verdict}</Text>
    </View>
  );
}

function FooterItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View style={styles.footerItem}>
      {icon}
      <Text style={styles.footerText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.md, paddingTop: spacing.sm },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerArea: {
    backgroundColor: colors.background,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  pageTitle: {
    ...typography.h1,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 20,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 54,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  problemInfo: { flex: 1, marginRight: spacing.sm },
  problemName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  submissionId: { fontSize: 13, color: colors.textTertiary, fontWeight: '600' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border + '30',
    paddingTop: spacing.sm,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '600',
  },
  footerLoader: { marginVertical: spacing.lg },
});
