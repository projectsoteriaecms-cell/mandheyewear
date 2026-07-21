import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/modules/branches";
import { useProducts } from "@/modules/products";
import { useStockAdjustments } from "@/modules/inventory";
import { Loader2 } from "lucide-react";

const adjustmentTypes = [
  { value: "count_correction", label: "Count Correction" },
  { value: "damage", label: "Damage" },
  { value: "expiry", label: "Expiry" },
  { value: "write_off", label: "Write Off" },
  { value: "other", label: "Other" },
] as const;

const formSchema = z.object({
  branch_id: z.string().min(1, "Branch is required"),
  product_id: z.string().min(1, "Product is required"),
  adjustment_type: z.enum(["count_correction", "damage", "expiry", "write_off", "other"]),
  quantity_change: z.number().refine((val) => val !== 0, "Quantity change cannot be zero"),
  reason: z.string().min(5, "Please provide a reason (min 5 characters)"),
});

type FormData = z.infer<typeof formSchema>;

interface CreateAdjustmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAdjustmentDialog = ({
  open,
  onOpenChange,
}: CreateAdjustmentDialogProps) => {
  const { data: branches = [] } = useBranches();
  const { data: products = [] } = useProducts();
  const { createAdjustment } = useStockAdjustments();
  const [isPositive, setIsPositive] = useState(true);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch_id: "",
      product_id: "",
      adjustment_type: "count_correction",
      quantity_change: 0,
      reason: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await createAdjustment.mutateAsync({
      branch_id: data.branch_id,
      product_id: data.product_id,
      adjustment_type: data.adjustment_type,
      quantity_change: isPositive ? Math.abs(data.quantity_change) : -Math.abs(data.quantity_change),
      reason: data.reason,
    });
    onOpenChange(false);
    form.reset();
    setIsPositive(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Stock Adjustment</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="branch_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
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
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
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

            <FormField
              control={form.control}
              name="adjustment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adjustment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adjustmentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Adjustment Direction</FormLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isPositive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsPositive(true)}
                >
                  + Increase
                </Button>
                <Button
                  type="button"
                  variant={!isPositive ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => setIsPositive(false)}
                >
                  − Decrease
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="quantity_change"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explain the reason for this adjustment..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createAdjustment.isPending}>
                {createAdjustment.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Adjustment
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
