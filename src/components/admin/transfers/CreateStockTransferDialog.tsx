import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useBranches } from "@/modules/branches";
import { useProducts } from "@/hooks/useProducts";
import { useCreateStockTransfer } from "@/modules/inventory";
import { Plus, Trash2, ArrowRight } from "lucide-react";

const lineItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity_requested: z.number().min(1, "Quantity must be at least 1"),
});

const formSchema = z.object({
  from_branch_id: z.string().min(1, "Source branch is required"),
  to_branch_id: z.string().min(1, "Destination branch is required"),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
}).refine((data) => data.from_branch_id !== data.to_branch_id, {
  message: "Source and destination branches must be different",
  path: ["to_branch_id"],
});

type FormData = z.infer<typeof formSchema>;

interface CreateStockTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateStockTransferDialog = ({
  open,
  onOpenChange,
}: CreateStockTransferDialogProps) => {
  const { data: branches } = useBranches();
  const { data: products } = useProducts();
  const createTransfer = useCreateStockTransfer();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      from_branch_id: "",
      to_branch_id: "",
      notes: "",
      items: [{ product_id: "", quantity_requested: 1 }],
    },
  });

  const items = form.watch("items");
  const fromBranchId = form.watch("from_branch_id");

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { product_id: "", quantity_requested: 1 },
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      form.setValue(
        "items",
        currentItems.filter((_, i) => i !== index)
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createTransfer.mutateAsync({
        from_branch_id: data.from_branch_id,
        to_branch_id: data.to_branch_id,
        notes: data.notes,
        items: data.items.map((item) => ({
          product_id: item.product_id,
          quantity_requested: item.quantity_requested,
        })),
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const availableToBranches = branches?.filter(
    (b) => b.id !== fromBranchId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Stock Transfer</DialogTitle>
          <DialogDescription>
            Move inventory from one branch to another
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Branch Selection */}
            <div className="flex items-center gap-4">
              <FormField
                control={form.control}
                name="from_branch_id"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>From Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {branches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />

              <FormField
                control={form.control}
                name="to_branch_id"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>To Branch</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!fromBranchId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableToBranches?.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Transfer Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>

              {items.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-start p-4 border rounded-lg"
                >
                  <div className="col-span-8">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Product</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products?.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} ({product.sku})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity_requested`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseInt(e.target.value) || 1)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-1 flex items-end pb-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes for this transfer..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTransfer.isPending}>
                {createTransfer.isPending ? "Creating..." : "Create Transfer"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
