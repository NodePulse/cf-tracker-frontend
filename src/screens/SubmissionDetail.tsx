import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
  Platform,
  RefreshControl,
} from 'react-native';
import { cfApi } from '../api/cfApi';
import { useTheme } from '../theme/ThemeContext';
import { XCircle, Share2, Copy, Check, ChevronLeft } from 'lucide-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CodeHighlighter from 'react-native-code-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

export function SubmissionDetail({ route }: any) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, spacing } = useTheme();
  const styles = createStyles(colors, spacing, insets);
  const { id, problem } = route.params;
  const [source, setSource] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadSource = useCallback(async () => {
    try {
      const res = await cfApi.getSource(id);
      setSource(res.source);
    } catch (error) {
      console.error('Failed to load source', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadSource();
  }, [loadSource]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSource();
  }, [loadSource]);

  const handleShare = async () => {
    if (source) {
      try {
        await Share.share({
          message: `Source code for ${problem} (#${id}):\n\n${source}`,
        });
      } catch (error) {
        console.error('Sharing failed', error);
      }
    }
  };

  const handleCopy = () => {
    if (source) {
      Clipboard.setString(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.problemTitle} numberOfLines={1}>
            {problem}
          </Text>
          <Text style={styles.submissionId}>Submission #{id}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleCopy} style={styles.actionButton}>
            {copied ? (
              <Check size={22} color={colors.accent} />
            ) : (
              <Copy size={22} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Share2 size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.sourceScroll}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {source ? (
          <View style={styles.codeContainer}>
            <CodeHighlighter
              hljsStyle={atomOneDark}
              language="cpp"
              textStyle={styles.codeText}
              scrollViewProps={{
                horizontal: true,
                showsHorizontalScrollIndicator: false,
              }}
            >
              {source}
            </CodeHighlighter>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <XCircle
              size={48}
              color={colors.error}
              style={{ marginBottom: spacing.md }}
            />
            <Text style={styles.errorText}>
              Failed to load source code. Ensure CF API keys are configured on
              the backend.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: any, spacing: any, insets: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: Math.max(insets.top, spacing.xxl),
      paddingBottom: spacing.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    backButton: {
      padding: spacing.sm,
      marginRight: spacing.xs,
    },
    problemTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    submissionId: {
      fontSize: 13,
      color: colors.textTertiary,
      fontWeight: '600',
    },
    actions: { flexDirection: 'row' },
    actionButton: { padding: spacing.sm, marginLeft: spacing.sm },
    sourceScroll: { flex: 1 },
    codeContainer: {
      backgroundColor: '#1E1E1E',
      margin: spacing.md,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
    },
    codeText: {
      fontFamily: Platform.select({
        ios: 'CourierNewPSMT',
        android: 'monospace',
      }),
      fontSize: 13,
      color: '#D4D4D4',
      lineHeight: 20,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      marginTop: 100,
    },
    errorText: {
      color: colors.textSecondary,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 24,
    },
  });
}
