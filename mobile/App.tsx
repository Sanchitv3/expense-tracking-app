import { StatusBar } from 'expo-status-bar';
import ExpenseTrackerScreen from './src/screens/ExpenseTrackerScreen';

export default function App() {
  return (
    <>
      <ExpenseTrackerScreen />
      <StatusBar style="light" />
    </>
  );
}
