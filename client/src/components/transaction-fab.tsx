import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategories } from "@/hooks/use-categories";
import { useCreateTransaction, useUpdateTransaction } from "@/hooks/use-transactions";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertTransactionSchema } from "@shared/schema";
import type { Transaction } from "@shared/schema";

const formSchema = insertTransactionSchema.extend({
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  date: z.coerce.date(),
});

type FormValues = z.infer<typeof formSchema>;

interface TransactionFabProps {
  editingTransaction?: Transaction | null;
  onEditingChange?: (transaction: Transaction | null) => void;
}

export function TransactionFab({ editingTransaction, onEditingChange }: TransactionFabProps) {
  const [open, setOpen] = useState(false);
  const { data: categories } = useCategories();
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } = useUpdateTransaction();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "" as unknown as number,
      date: new Date(),
      type: "expense",
      note: "",
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      onEditingChange?.(null);
    }
  };

  function onSubmit(data: FormValues) {
    if (editingTransaction) {
      updateTransaction(
        { id: editingTransaction.id, ...data, amount: data.amount.toString() },
        {
          onSuccess: () => {
            handleOpenChange(false);
            toast({ title: "Updated", description: "Your transaction has been updated." });
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to update transaction.", variant: "destructive" });
          }
        }
      );
    } else {
      createTransaction(
        { 
          ...data, 
          amount: data.amount.toString(), 
        },
        {
          onSuccess: () => {
            handleOpenChange(false);
            toast({ title: "Transaction added", description: "Your transaction has been saved." });
          },
          onError: () => {
            toast({ title: "Error", description: "Failed to save transaction.", variant: "destructive" });
          }
        }
      );
    }
  }

  return (
    <>
      <button
        onClick={() => {
          setOpen(true);
          if (editingTransaction) {
            form.reset({
              amount: Number(editingTransaction.amount),
              date: new Date(editingTransaction.date),
              type: editingTransaction.type as any,
              categoryId: editingTransaction.categoryId,
              note: editingTransaction.note || "",
            });
          }
        }}
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background md:right-8 md:bottom-24"
        data-testid="button-add-transaction"
      >
        <Plus size={28} />
      </button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[425px] border-white/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-display">
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </DialogTitle>
            {editingTransaction && (
              <button
                onClick={() => handleOpenChange(false)}
                className="p-1 hover:bg-white/10 rounded-lg"
              >
                <X size={20} />
              </button>
            )}
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="expense">Expense</SelectItem>
                          <SelectItem value="income">Income</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                          <Input className="pl-7 text-lg font-mono" placeholder="0.00" type="number" step="0.01" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.filter(c => c.type === form.watch('type')).map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color || '#ccc' }} />
                              {c.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                       <Input 
                        type="date" 
                        {...field} 
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="What was this for?" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-12 text-lg font-medium shadow-lg shadow-primary/20"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating ? "Saving..." : editingTransaction ? "Update Transaction" : "Save Transaction"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
