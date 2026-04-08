import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { cfApi, DashboardData } from '../api/cfApi';
import { useTheme } from '../theme/ThemeContext';
import { LineChart, ContributionGraph, PieChart } from 'react-native-chart-kit';
import { Award, Target, Zap, TrendingUp } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export function Dashboard() {
  const { colors, spacing, typography } = useTheme();
  const styles = createStyles(colors, spacing, typography);
  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await cfApi.getDashboard();
      setData(res);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data) return null;

  const { user, stats, ratingGraph } = data;

  // Prepare rating chart data
  const ratingData = {
    labels: ratingGraph
      .slice(-5)
      .map(r => r.date.split('-')[1] + '/' + r.date.split('-')[2]),
    datasets: [
      {
        data: ratingGraph.slice(-5).map(r => r.rating),
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const verdictData = Object.entries(stats.verdictDistribution).map(
    ([label, value], index) => ({
      name: label.length > 10 ? label.split('_')[0] : label, // Shorten labels
      population: value,
      color: ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#6366f1'][index % 5],
      legendFontColor: colors.textSecondary,
      legendFontSize: 10,
    }),
  );

  const heatmapValues = Object.entries(stats.activityHeatmap).map(
    ([date, count]) => ({
      date,
      count,
    }),
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {user.avatar && (
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.handle}>@{user.handle}</Text>
          <Text style={[styles.rank, { color: colors.primary }]}>
            {user.rank}
          </Text>
          <View style={styles.ratingRow}>
            <TrendingUp
              size={16}
              color={colors.accent}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.ratingText}>
              {user.rating} (max: {user.maxRating})
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          icon={<Award size={24} color="#f59e0b" />}
          label="Solved"
          value={stats.solvedCount}
          backgroundColor="rgba(245, 158, 11, 0.1)"
          borderColor="rgba(245, 158, 11, 0.3)"
        />
        <StatCard
          icon={<Target size={24} color="#3b82f6" />}
          label="Total"
          value={stats.totalSubmissions}
          backgroundColor="rgba(59, 130, 246, 0.1)"
          borderColor="rgba(59, 130, 246, 0.3)"
        />
        <StatCard
          icon={<Zap size={24} color="#ef4444" />}
          label="Streak"
          value={`${stats.currentStreak}d`}
          backgroundColor="rgba(239, 68, 68, 0.1)"
          borderColor="rgba(239, 68, 68, 0.3)"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rating History</Text>
        <LineChart
          data={ratingData}
          width={screenWidth - 64}
          height={180}
          chartConfig={{
            ...chartConfig,
            propsForVerticalLabels: { fontSize: 10 } as any,
            propsForHorizontalLabels: { fontSize: 10 } as any,
          }}
          bezier
          fromZero
          style={styles.chart}
          withInnerLines={false}
          withOuterLines={false}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Verdict Distribution</Text>
        <View style={{ alignItems: 'center' }}>
          <PieChart
            data={verdictData}
            width={screenWidth - 64}
            height={180}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="0"
            center={[0, 0]}
            absolute
            hasLegend={true}
          />
        </View>
      </View>

      <View style={[styles.section, { marginBottom: 0 }]}>
        <Text style={styles.sectionTitle}>Activity</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <ContributionGraph
            values={heatmapValues}
            endDate={new Date()}
            numDays={105}
            width={screenWidth * 1.5}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            style={styles.chart}
            tooltipDataAttrs={(_v: any) => ({})}
          />
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  backgroundColor,
  borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  backgroundColor?: string;
  borderColor?: string;
}) {
  const { colors, spacing } = useTheme();
  const statStyles = StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 20,
      width: (screenWidth - spacing.md * 3) / 3,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    icon: { marginBottom: 12 },
    valueText: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    labelText: {
      fontSize: 11,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      fontWeight: '600',
    },
  });
  return (
    <View
      style={[
        statStyles.card,
        backgroundColor ? { backgroundColor } : null,
        borderColor ? { borderColor } : null,
      ]}
    >
      <View style={statStyles.icon}>{icon}</View>
      <Text style={statStyles.valueText}>{value}</Text>
      <Text style={statStyles.labelText}>{label}</Text>
    </View>
  );
}

function createStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      padding: spacing.xl,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      marginBottom: spacing.md,
      borderWidth: 3,
      borderColor: colors.primary,
    },
    headerInfo: { alignItems: 'center' },
    handle: {
      ...typography.h1,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    rank: {
      fontSize: 18,
      fontWeight: '700',
      textTransform: 'capitalize',
      marginBottom: 8,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    ratingText: { color: colors.text, fontSize: 14, fontWeight: '700' },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    sectionTitle: {
      ...typography.h3,
      color: colors.text,
      marginBottom: spacing.md,
      fontSize: 20,
    },
    chart: { marginVertical: 8, borderRadius: 16 },
  });
}
