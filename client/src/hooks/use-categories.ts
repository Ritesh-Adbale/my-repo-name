import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type InsertCategory, type UpdateCategoryRequest } from "@shared/schema";
import { db } from "@/lib/storage";

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => db.getCategories(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertCategory) => db.createCategory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: number } & UpdateCategoryRequest) => 
      db.updateCategory(id, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => db.deleteCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}
