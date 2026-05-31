import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoot from './src/app/AppRoot';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoot />
    </QueryClientProvider>
  );
}
