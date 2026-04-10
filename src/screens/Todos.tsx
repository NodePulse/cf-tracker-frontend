import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import {
  Trash2,
  Plus,
  CheckCircle,
  Circle,
  Flag,
  Repeat,
  Calendar,
} from 'lucide-react-native';
import * as MMKVLib from 'react-native-mmkv';

const storage = MMKVLib.createMMKV({
  id: 'todos-storage',
});

type Priority = 'low' | 'normal' | 'high';
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: Priority;
  repeat: RepeatType;
  lastCompletedDate?: number;
}

export function Todos() {
  const { colors, spacing, typography } = useTheme();
  const styles = createStyles(colors, spacing, typography);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('normal');
  const [selectedRepeat, setSelectedRepeat] = useState<RepeatType>('none');
  const [showOptions, setShowOptions] = useState(false);
  const [androidKbHeight, setAndroidKbHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS === 'android') {
      const showSub = Keyboard.addListener('keyboardDidShow', e => {
        setAndroidKbHeight(e.endCoordinates.height);
      });
      const hideSub = Keyboard.addListener('keyboardDidHide', () => {
        setAndroidKbHeight(0);
      });
      return () => {
        showSub.remove();
        hideSub.remove();
      };
    }
  }, []);

  useEffect(() => {
    const saved = storage.getString('todos');
    if (saved) {
      try {
        let loadedTodos: Todo[] = JSON.parse(saved);
        let updated = false;
        const now = Date.now();

        // Handle auto-resetting for repeating tasks
        loadedTodos = loadedTodos.map(todo => {
          if (
            todo.completed &&
            todo.repeat !== 'none' &&
            todo.lastCompletedDate
          ) {
            const hoursSince =
              (now - todo.lastCompletedDate) / (1000 * 60 * 60);
            let shouldReset = false;
            if (todo.repeat === 'daily' && hoursSince > 24) shouldReset = true;
            if (todo.repeat === 'weekly' && hoursSince > 24 * 7)
              shouldReset = true;
            if (todo.repeat === 'monthly' && hoursSince > 24 * 30)
              shouldReset = true;

            if (shouldReset) {
              updated = true;
              return {
                ...todo,
                completed: false,
                lastCompletedDate: undefined,
              };
            }
          }
          // Ensure they have default priorities (for backward compatibility before this update)
          if (!todo.priority) todo.priority = 'normal';
          if (!todo.repeat) todo.repeat = 'none';

          return todo;
        });

        setTodos(loadedTodos);
        if (updated) {
          storage.set('todos', JSON.stringify(loadedTodos));
        }
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  const saveTodos = useCallback((newTodos: Todo[]) => {
    setTodos(newTodos);
    storage.set('todos', JSON.stringify(newTodos));
  }, []);

  const cyclePriority = () => {
    const order: Priority[] = ['low', 'normal', 'high'];
    setSelectedPriority(
      prev => order[(order.indexOf(prev) + 1) % order.length],
    );
  };

  const cycleRepeat = () => {
    const order: RepeatType[] = ['none', 'daily', 'weekly', 'monthly'];
    setSelectedRepeat(prev => order[(order.indexOf(prev) + 1) % order.length]);
  };

  const addTodo = () => {
    if (!inputText.trim()) return;
    const newTodo: Todo = {
      id: Math.random().toString(36).substring(7) + Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      createdAt: Date.now(),
      priority: selectedPriority,
      repeat: selectedRepeat,
    };
    saveTodos([newTodo, ...todos]);
    setInputText('');
    setSelectedPriority('normal');
    setSelectedRepeat('none');
    setShowOptions(false);
  };

  const toggleTodo = (id: string) => {
    const newTodos = todos.map(t => {
      if (t.id === id) {
        const completed = !t.completed;
        return {
          ...t,
          completed,
          lastCompletedDate: completed ? Date.now() : undefined,
        };
      }
      return t;
    });
    saveTodos(newTodos);
  };

  const deleteTodo = (id: string) => {
    const newTodos = todos.filter(t => t.id !== id);
    saveTodos(newTodos);
  };

  const getPriorityColor = (p: Priority) => {
    if (p === 'low') return colors.accent;
    if (p === 'high') return colors.error;
    return colors.textSecondary;
  };

  const renderItem = ({ item }: { item: Todo }) => (
    <View style={styles.todoItem}>
      <TouchableOpacity
        style={styles.todoCheck}
        onPress={() => toggleTodo(item.id)}
      >
        {item.completed ? (
          <CheckCircle size={24} color={colors.primary} />
        ) : (
          <Circle size={24} color={colors.textTertiary} />
        )}
      </TouchableOpacity>

      <View style={styles.todoContent}>
        <Text
          style={[styles.todoText, item.completed && styles.todoTextCompleted]}
        >
          {item.text}
        </Text>

        {/* Badges */}
        <View style={styles.badgesRow}>
          {item.priority && item.priority !== 'normal' && (
            <View
              style={[
                styles.badge,
                { borderColor: getPriorityColor(item.priority) },
              ]}
            >
              <Flag
                size={10}
                color={getPriorityColor(item.priority)}
                style={{ marginRight: 4 }}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: getPriorityColor(item.priority) },
                ]}
              >
                {item.priority}
              </Text>
            </View>
          )}
          {item.repeat && item.repeat !== 'none' && (
            <View style={styles.badge}>
              <Repeat
                size={10}
                color={colors.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.badgeText}>{item.repeat}</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTodo(item.id)}
      >
        <Trash2 size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        data={todos}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Calendar
              size={48}
              color={colors.border}
              style={{ marginBottom: spacing.md }}
            />
            <Text style={styles.emptyText}>No tasks yet. Add one below!</Text>
          </View>
        }
      />

      <View
        style={[
          styles.creationArea,
          Platform.OS === 'android' && androidKbHeight > 0
            ? { paddingBottom: androidKbHeight - 64 }
            : {},
        ]}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={text => {
              setInputText(text);
              if (text.length > 0) setShowOptions(true);
              else if (
                selectedPriority === 'normal' &&
                selectedRepeat === 'none'
              )
                setShowOptions(false);
            }}
            onFocus={() => setShowOptions(true)}
            placeholder="Add a new task..."
            placeholderTextColor={colors.textTertiary}
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity style={styles.addButton} onPress={addTodo}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {showOptions && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity onPress={cyclePriority} style={styles.optionChip}>
              <Flag size={14} color={getPriorityColor(selectedPriority)} />
              <Text
                style={[
                  styles.optionChipText,
                  { color: getPriorityColor(selectedPriority) },
                ]}
              >
                Priority: {selectedPriority}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={cycleRepeat} style={styles.optionChip}>
              <Repeat size={14} color={colors.textSecondary} />
              <Text style={styles.optionChipText}>
                Repeat: {selectedRepeat}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: any, spacing: any, typography: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      padding: spacing.md,
      paddingTop: spacing.lg,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: { ...typography.h1, color: colors.text },
    listContent: { padding: spacing.md, paddingBottom: spacing.xxl },
    todoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 16,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    todoCheck: { marginRight: spacing.md },
    todoContent: { flex: 1, justifyContent: 'center' },
    todoText: { ...typography.body1, color: colors.text },
    todoTextCompleted: {
      textDecorationLine: 'line-through',
      color: colors.textSecondary,
    },
    badgesRow: {
      flexDirection: 'row',
      marginTop: 4,
      flexWrap: 'wrap',
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 6,
      paddingVertical: 2,
      marginRight: 6,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    deleteButton: { padding: spacing.xs, marginLeft: spacing.sm },
    creationArea: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.md,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      color: colors.text,
      borderRadius: 24,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
      marginRight: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      fontSize: 16,
    },
    addButton: {
      backgroundColor: colors.primary,
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionsContainer: {
      flexDirection: 'row',
      marginTop: spacing.md,
      paddingHorizontal: spacing.xs,
    },
    optionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginRight: spacing.sm,
    },
    optionChipText: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    emptyContainer: {
      padding: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: { ...typography.body1, color: colors.textTertiary },
  });
}
