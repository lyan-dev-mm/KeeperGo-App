import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function TabsLayout() {
  return (
     <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[200],
          height: 60,
          paddingBottom: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="bitacora"
        options={{
          title: 'Bitácora',
          tabBarIcon: ({ color }) => <Feather name="book-open" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="mascota"
        options={{
          title: 'Rahca',
          tabBarIcon: ({ color }) => <Feather name="heart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="comunidad"
        options={{
          title: 'Comunidad',
          tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}