import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Dashboard } from '../screens/Dashboard';
import { Submissions } from '../screens/Submissions';
import { SubmissionDetail } from '../screens/SubmissionDetail';
import { useTheme } from '../theme/ThemeContext';
import { LayoutDashboard, Code2, Palette, ListTodo } from 'lucide-react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeSettings } from '../screens/ThemeSettings';
import { Todos } from '../screens/Todos';
import { useFlags } from '@flagsmith/flagsmith/react';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SubmissionsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SubmissionsList" component={Submissions} />
      <Stack.Screen name="SubmissionDetail" component={SubmissionDetail} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const flags = useFlags(['todofeatures']);
  console.log(flags);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: Platform.OS === 'android',
        tabBarStyle: (route => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          if (routeName === 'SubmissionDetail') {
            return { display: 'none' };
          }
          return {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64 + Math.max(insets.bottom, 0),
            paddingBottom: Math.max(insets.bottom, 10),
            paddingTop: 8,
          };
        })(route),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size + 2} color={color} />
          ),
          headerShown: true,
        }}
      />
      <Tab.Screen
        name="Submissions"
        component={SubmissionsStack}
        options={({ route }) => ({
          tabBarLabel: 'Submissions',
          tabBarIcon: ({ color, size }) => (
            <Code2 size={size + 2} color={color} />
          ),
          headerShown:
            getFocusedRouteNameFromRoute(route) !== 'SubmissionDetail',
        })}
      />
      <Tab.Screen
        name="Theme"
        component={ThemeSettings}
        options={{
          tabBarLabel: 'Theme',
          tabBarIcon: ({ color, size }) => (
            <Palette size={size + 2} color={color} />
          ),
          headerShown: true,
        }}
      />
      {flags.todofeatures.value && (
        <Tab.Screen
          name="Todos"
          component={Todos}
          options={{
            tabBarLabel: 'Tasks',
            tabBarIcon: ({ color, size }) => (
              <ListTodo size={size + 2} color={color} />
            ),
            headerShown: true,
          }}
        />
      )}
    </Tab.Navigator>
  );
}
