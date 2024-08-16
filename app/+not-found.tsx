import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

import { Container } from '~/components/Container';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '404 - Not Found', headerShown: false }} />
      <Container>
        <View className={styles.content}>
          <Text className={styles.errorCode}>404</Text>
          <Text className={styles.title}>Page Not Found</Text>
          <Text className={styles.message}>The page you're looking for doesn't exist or has been moved.</Text>
          <Link href="/" className={styles.link}>
            <Text className={styles.linkText}>Go back to home</Text>
          </Link>
        </View>
      </Container>
    </>
  );
}

const styles = {
  content: `flex items-center justify-center h-full`,
  errorCode: `text-6xl font-bold text-gray-300 mb-4`,
  title: `text-2xl font-bold mb-2`,
  message: `text-center text-gray-600 mb-6`,
  link: `mt-4 py-2 px-4 bg-blue-500 rounded`,
  linkText: `text-white font-semibold`,
};
