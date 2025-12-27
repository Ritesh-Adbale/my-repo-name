import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { ShoppingCart, Home, Briefcase, Film, Coffee, Car, Heart, Zap, AlertCircle } from "lucide-react";
import type { Category } from "@shared/schema";

const ICON_OPTIONS = [
  { key: "shopping-cart", label: "Shopping", icon: ShoppingCart },
  { key: "home", label: "Home", icon: Home },
  { key: "briefcase", label: "Work", icon: Briefcase },
  { key: "film", label: "Entertainment", icon: Film },
  { key: "coffee", label: "Dining", icon: Coffee },
  { key: "car", label: "Transport", icon: Car },
  { key: "heart", label: "Health", icon: Heart },
  { key: "zap", label: "Utilities", icon: Zap },
];

const COLOR_OPTIONS = [
  "#4ade80", "#60a5fa", "#f87171", "#fbbf24",
  "#a78bfa", "#06b6d4", "#ec4899", "#f97316",
];

interface CategoryFormData {
  name: string;
  type: "income" | "expense";
  icon: string;
  color: string;
  monthlyLimit: string;
}

export function CategoryManager() {
  const { data: categories, isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    type: "expense",
    icon: "shopping-cart",
    color: "#4ade80",
    monthlyLimit: "0",
  });

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        type: category.type as "income" | "expense",
        icon: category.icon || "shopping-cart",
        color: category.color || "#4ade80",
        monthlyLimit: category.monthlyLimit || "0",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        type: "expense",
        icon: "shopping-cart",
        color: "#4ade80",
        monthlyLimit: "0",
      });
    }
    setIsOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({ title: "Error", description: "Category name is required", variant: "destructive" });
      return;
    }

    const data = {
      ...formData,
      monthlyLimit: formData.monthlyLimit || "0",
    };

    if (editingId) {
      updateCategory(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast({ title: "Updated", description: "Category has been updated" });
            setIsOpen(false);
          },
        }
      );
    } else {
      createCategory(data as any, {
        onSuccess: () => {
          toast({ title: "Created", description: "Category has been created" });
          setIsOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategory(id, {
        onSuccess: () => {
          toast({ title: "Deleted", description: "Category has been deleted" });
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />)}
      </div>
    );
  }

  const expenseCategories = categories?.filter(c => c.type === "expense") || [];
  const incomeCategories = categories?.filter(c => c.type === "income") || [];

  return (
    <>
      <div className="space-y-6">
        {/* Expense Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80">Expense Categories</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFormData({ ...formData, type: "expense" });
                handleOpenDialog();
              }}
              className="h-8"
              data-testid="button-add-expense-category"
            >
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {expenseCategories.map(cat => {
              const iconOption = ICON_OPTIONS.find(o => o.key === cat.icon);
              const IconComponent = iconOption?.icon || AlertCircle;
              return (
                <Card
                  key={cat.id}
                  className="p-3 flex items-center justify-between bg-card border-white/5"
                  data-testid={`category-item-${cat.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color || "#4ade80" }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{cat.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Limit: ₹{Number(cat.monthlyLimit).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDialog(cat)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      data-testid={`button-edit-category-${cat.id}`}
                    >
                      <Edit2 size={14} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                      data-testid={`button-delete-category-${cat.id}`}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Income Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80">Income Categories</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFormData({ ...formData, type: "income" });
                handleOpenDialog();
              }}
              className="h-8"
              data-testid="button-add-income-category"
            >
              <Plus size={16} className="mr-1" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {incomeCategories.map(cat => {
              const iconOption = ICON_OPTIONS.find(o => o.key === cat.icon);
              const IconComponent = iconOption?.icon || AlertCircle;
              return (
                <Card
                  key={cat.id}
                  className="p-3 flex items-center justify-between bg-card border-white/5"
                  data-testid={`category-item-${cat.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color || "#4ade80" }}
                    >
                      <IconComponent size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{cat.name}</p>
                      <p className="text-xs text-muted-foreground text-primary">Income</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenDialog(cat)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      data-testid={`button-edit-category-${cat.id}`}
                    >
                      <Edit2 size={14} className="text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                      data-testid={`button-delete-category-${cat.id}`}
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[400px] border-white/10 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                className="bg-card border-white/5"
                data-testid="input-category-name"
              />
            </div>

            {/* Type */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Type</label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                <SelectTrigger className="bg-card border-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Icon */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Icon</label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map(option => {
                  const IconComp = option.icon;
                  return (
                    <button
                      key={option.key}
                      onClick={() => setFormData({ ...formData, icon: option.key })}
                      className={`p-2 rounded-lg border transition-all ${
                        formData.icon === option.key
                          ? "bg-primary/10 border-primary"
                          : "border-white/5 hover:border-white/10"
                      }`}
                      data-testid={`button-icon-${option.key}`}
                    >
                      <IconComp size={18} className="text-white" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="text-sm font-medium text-white/80 mb-2 block">Color</label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color ? "border-white" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    data-testid={`button-color-${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Monthly Limit */}
            {formData.type === "expense" && (
              <div>
                <label className="text-sm font-medium text-white/80 mb-2 block">Monthly Limit</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                  <Input
                    type="number"
                    value={formData.monthlyLimit}
                    onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                    placeholder="0"
                    className="pl-7 bg-card border-white/5"
                    data-testid="input-monthly-limit"
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating}
                className="flex-1"
                data-testid="button-save-category"
              >
                {isCreating || isUpdating ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
