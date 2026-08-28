import { Stack } from 'expo-router';
import { AuthProvider } from '../src/presentation/contexts/AuthContext';
import { PetActivityProvider } from '../src/presentation/contexts/PetActivityContext';
import { HabitsProvider } from '../src/presentation/contexts/HabitsContext';  

export default function RootLayout() {
  return (
     <AuthProvider>
        <PetActivityProvider>
          <HabitsProvider>    
          <Stack screenOptions={{ headerShown: false }}> 
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="terms" options={{ headerShown: true, title: 'Términos' }} />
            <Stack.Screen name='zona-relajacion' options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="(modals)/RegisterEmotion" options={{ presentation: 'modal', headerShown: false, }} />
            <Stack.Screen name="(modals)/EmotionDetail" options={{ presentation: 'modal', headerShown: false, }}  />
            <Stack.Screen name="(modals)/EjercicioRespiracion" options={{ presentation: 'modal', headerShown: false, }} />
            <Stack.Screen name="kii-chat" options={{ headerShown: false }} />
            <Stack.Screen name="admin" options={{ headerShown: false }} />
            <Stack.Screen name="admin-messages" options={{ headerShown: false }} />
            <Stack.Screen name="admin-milestones" options={{ headerShown: false }} />
            <Stack.Screen name="admin-users" options={{ headerShown: false }} />
            <Stack.Screen name="ask-location" options={{ headerShown: false }} />
          </Stack>
        </HabitsProvider>
      </PetActivityProvider>
    </AuthProvider>
  );
}