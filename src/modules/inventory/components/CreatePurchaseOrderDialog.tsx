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
import { useSuppliers } from "@/modules/suppliers";
import { useBranches } from "@/modules/branches";
import { useProducts } from "@/modules/products/hooks/useProducts";
import { useCreatePurchaseOrder } from "@/modules/inventory";
import { Plus, Trash2 } from "lucide-react";

const lineItemSchema = z.object({
  product_id: z.string().min(1, "Product is required"),
  quantity_ordered: z.number().min(1, "Quantity must be at least 1"),
  unit_cost: z.number().min(0, "Cost must be positive"),
});

const formSchema = z.object({
  supplier_id: z.string().min(1, "Supplier is required"),
  branch_id: z.string().min(1, "Branch is required"),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "At least one item is required"),
});

type FormData = z.infer<typeof formSchema>;

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePurchaseOrderDialog = ({
  open,
  onOpenChange,
}: CreatePurchaseOrderDialogProps) => {
  const { data: suppliers } = useSuppliers();
  const { data: branches } = useBranches();
  const { data: products } = useProducts();
  const createPO = useCreatePurchaseOrder();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_id: "",
      branch_id: "",
      expected_delivery_date: "",
      notes: "",
      items: [{ product_id: "", quantity_ordered: 1, unit_cost: 0 }],
    },
  });

  const items = form.watch("items");

  const addItem = () => {
    const currentItems = form.getValues("items");
    form.setValue("items", [
      ...currentItems,
      { product_id: "", quantity_ordered: 1, unit_cost: 0 },
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

  const handleProductChange = (index: number, productId: string) => {
    const product = products?.find((p) => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.product_id`, productId);
      // Use cost_price if available, otherwise use price
      const cost = (product as any).cost_price || product.price * 0.6; // Assume 40% margin if no cost
      form.setValue(`items.${index}.unit_cost`, cost);
    }
  };

  const calculateTotal = () => {
    return items.reduce(
      (sum, item) => sum + (item.quantity_ordered || 0) * (item.unit_cost || 0),
      0
    );
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createPO.mutateAsync({
        supplier_id: data.supplier_id,
        branch_id: data.branch_id,
        expected_delivery_date: data.expected_delivery_date,
        notes: data.notes,
        items: data.items.map((item) => ({
          product_id: item.product_id,
          quantity_ordered: item.quantity_ordered,
          unit_cost: item.unit_cost,
        })),
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Order products from a supplier for a specific branch
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers?.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
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
                name="branch_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination Branch</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
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
            </div>

            <FormField
              control={form.control}
              name="expected_delivery_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Delivery Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Line Items */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Order Items</h3>
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
                  <div className="col-span-5">
                    <FormField
                      control={form.control}
                      name={`items.${index}.product_id`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Product</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              handleProductChange(index, value)
                            }
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

                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity_ordered`}
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

                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unit_cost`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Unit Cost (₦)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-2 flex items-end">
                    <div className="flex items-center gap-2 pb-2">
                      <span className="text-sm font-mono">
                        ₦
                        {(
                          (items[index]?.quantity_ordered || 0) *
                          (items[index]?.unit_cost || 0)
                        ).toLocaleString()}
                      </span>
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
                </div>
              ))}

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">
                    ₦{calculateTotal().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes for this order..."
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
              <Button type="submit" disabled={createPO.isPending}>
                {createPO.isPending ? "Creating..." : "Create Purchase Order"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
