import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<{ id: string; createdAt: Date }[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });

    return unsubscribe;
  }, []);

  const handleAnonLogin = async () => {
    await signInAnonymously(auth);
  };

  const handleAddItem = async () => {
    const itemsRef = collection(db, 'items');
    await addDoc(itemsRef, { createdAt: Timestamp.now() });
    const snap = await getDocs(itemsRef);
    const nextItems: { id: string; createdAt: Date }[] = [];

    snap.forEach((doc) => {
      const data = doc.data() as { createdAt?: Timestamp };
      if (data.createdAt instanceof Timestamp) {
        nextItems.push({
          id: doc.id,
          createdAt: data.createdAt.toDate(),
        });
      }
    });

    setItems(nextItems);
  };

  return (
    <View style={styles.container}>
      <Text>User: {user ? user.uid : 'Not signed in'}</Text>
      <Button title="Sign in anonymously" onPress={handleAnonLogin} />
      <Button title="Add Firestore item" onPress={handleAddItem} />
      {items.map((item) => (
        <Text key={item.id}>{item.createdAt.toLocaleString()}</Text>
      ))}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffe65',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
