import { Button, Text, View } from "react-native";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 p-6">
      <Text className="text-center text-danger">{message}</Text>
      {onRetry && <Button title="Tentar novamente" onPress={onRetry} color="#7C3AED" />}
    </View>
  );
}
