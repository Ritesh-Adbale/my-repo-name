import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertTransaction, type UpdateTransactionRequest } from "@shared/schema";
import { db } from "@/lib/storage";

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => db.getTransactions(),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertTransaction) => db.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      // Invalidate categories too if limits depend on spending
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & UpdateTransactionRequest) => 
      db.updateTransaction(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => db.deleteTransaction(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['transactions'] }),
  });
}
