"use client";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "react-query";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

// Create a client
const queryClient = new QueryClient();

interface Props {
  children: React.ReactNode;
}

const Providers = ({ children }: Props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider
        appearance={{
          baseTheme: dark,
        }}
      >
        {children}
      </ClerkProvider>
    </QueryClientProvider>
  );
};

export default Providers;
