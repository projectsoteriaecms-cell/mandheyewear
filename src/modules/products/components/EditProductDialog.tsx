import { useEffect, useState, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminProducts, useProductImageUpload } from "@/modules/products";
import { useSuppliers } from "@/modules/suppliers";
import { ProductImageUpload } from "./ProductImageUpload";
import { FrameAttributesForm } from "./FrameAttributesForm";
import { LensAttributesForm } from "./LensAttributesForm";
import { Loader2, Sparkles } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const brandLines = [
  { value: "soteria_medical", label: "M&H Medical" },
  { value: "m_and_h_fashion", label: "M&H Lifestyle" },
] as const;

const itemTypes = [
  { value: "frames", label: "Frames" },
  { value: "lenses", label: "Lenses" },
  { value: "contact_lenses", label: "Contact Lenses" },
  { value: "solutions", label: "Solutions" },
  { value: "medications", label: "Medications" },
  { value: "accessories", label: "Accessories" },
  { value: "cleanser", label: "Cleanser" },
  { value: "packaging", label: "Packaging" },
  { value: "other", label: "Other" },
] as const;

const genders = [
  { value: "unisex", label: "Unisex" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
] as const;

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  brand_line: z.enum(["soteria_medical", "m_and_h_fashion"]),
  item_type: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  cost_price: z.number().min(0).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  material: z.string().optional(),
  style: z.string().optional(),
  gender: z.string().optional(),
  frame_width: z.string().optional(),
  bridge_size: z.string().optional(),
  temple_length: z.string().optional(),
  supplier_id: z.string().optional(),
  is_prescription_compatible: z.boolean().default(true),
  is_active: z.boolean().default(true),
  reorder_level: z.number().min(0).optional(),
  reorder_quantity: z.number().min(0).optional(),
  lead_time_days: z.number().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export const EditProductDialog = ({
  open,
  onOpenChange,
  product,
}: EditProductDialogProps) => {
  const { updateProduct } = useAdminProducts();
  const { data: suppliers = [] } = useSuppliers();
  const { uploadProductImage, uploadMultipleImages, deleteProductImage } = useProductImageUpload();
  
  const [primaryImage, setPrimaryImage] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sku: "",
      brand_line: "soteria_medical",
      item_type: "frames",
      price: 0,
      cost_price: 0,
      description: "",
      color: "",
      material: "",
      style: "",
      gender: "unisex",
      is_prescription_compatible: true,
      is_active: true,
      reorder_level: 10,
      reorder_quantity: 20,
      lead_time_days: 7,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        sku: product.sku,
        brand_line: product.brand_line,
        item_type: product.item_type || "frames",
        price: product.price,
        cost_price: product.cost_price || 0,
        description: product.description || "",
        color: product.color || "",
        material: product.material || "",
        style: product.style || "",
        gender: product.gender || "unisex",
        frame_width: product.frame_width || "",
        bridge_size: product.bridge_size || "",
        temple_length: product.temple_length || "",
        supplier_id: product.supplier_id || "",
        is_prescription_compatible: product.is_prescription_compatible ?? true,
        is_active: product.is_active ?? true,
        reorder_level: product.reorder_level || 10,
        reorder_quantity: product.reorder_quantity || 20,
        lead_time_days: product.lead_time_days || 7,
      });
      setPrimaryImage(product.image_url);
      setAdditionalImages(product.additional_images || []);
    }
  }, [product, form]);

  const handleImageUpload = async (files: File[]) => {
    if (!product) return;
    
    setIsUploading(true);
    try {
      if (!primaryImage && files.length > 0) {
        const url = await uploadProductImage(product.id, files[0], true);
        if (url) {
          setPrimaryImage(url);
          files = files.slice(1);
        }
      }
      
      if (files.length > 0) {
        const urls = await uploadMultipleImages(product.id, files);
        setAdditionalImages((prev) => [...prev, ...urls]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string, isPrimary: boolean) => {
    if (!product) return;
    
    setIsUploading(true);
    try {
      await deleteProductImage(product.id, imageUrl, isPrimary);
      if (isPrimary) {
        setPrimaryImage(null);
      } else {
        setAdditionalImages((prev) => prev.filter((url) => url !== imageUrl));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!product) return;
    
    await updateProduct.mutateAsync({
      id: product.id,
      name: data.name,
      sku: data.sku,
      brand_line: data.brand_line,
      item_type: data.item_type as any,
      price: data.price,
      cost_price: data.cost_price || null,
      description: data.description || null,
      color: data.color || null,
      material: data.material || null,
      style: data.style || null,
      gender: data.gender || null,
      frame_width: data.frame_width || null,
      bridge_size: data.bridge_size || null,
      temple_length: data.temple_length || null,
      supplier_id: data.supplier_id || null,
      is_prescription_compatible: data.is_prescription_compatible,
      is_active: data.is_active,
      reorder_level: data.reorder_level,
      reorder_quantity: data.reorder_quantity,
      lead_time_days: data.lead_time_days,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="frames" disabled={form.watch("item_type") !== "frames"}>
              Frame Specs
            </TabsTrigger>
            <TabsTrigger value="lenses" disabled={form.watch("item_type") !== "lenses"}>
              Lens Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <ScrollArea className="max-h-[60vh] pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ray-Ban Aviator" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU *</FormLabel>
                          <FormControl>
                            <Input placeholder="RB-AV-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="brand_line"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Line *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select brand" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {brandLines.map((brand) => (
                                <SelectItem key={brand.value} value={brand.value}>
                                  {brand.label}
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
                      name="item_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Item Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {itemTypes.map((type) => (
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
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Selling Price (₦) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cost_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cost Price (₦)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Product description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Specifications */}
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="color"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color</FormLabel>
                          <FormControl>
                            <Input placeholder="Gold" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="material"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Material</FormLabel>
                          <FormControl>
                            <Input placeholder="Metal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="style"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Style</FormLabel>
                          <FormControl>
                            <Input placeholder="Aviator" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {genders.map((g) => (
                                <SelectItem key={g.value} value={g.value}>
                                  {g.label}
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
                      name="frame_width"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frame Width</FormLabel>
                          <FormControl>
                            <Input placeholder="140mm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bridge_size"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bridge Size</FormLabel>
                          <FormControl>
                            <Input placeholder="14mm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="temple_length"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Temple Length</FormLabel>
                          <FormControl>
                            <Input placeholder="145mm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Supplier & Inventory */}
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
                              {suppliers.map((supplier) => (
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
                      name="lead_time_days"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lead Time (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="reorder_level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
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
                      name="reorder_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="flex gap-8">
                    <FormField
                      control={form.control}
                      name="is_prescription_compatible"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Prescription Compatible</FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="is_active"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Active</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updateProduct.isPending}>
                      {updateProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="images">
            <div className="py-4">
              <ProductImageUpload
                images={additionalImages}
                onImagesChange={setAdditionalImages}
                onUpload={handleImageUpload}
                onDelete={handleImageDelete}
                maxImages={4}
                isUploading={isUploading}
                primaryImage={primaryImage}
                onPrimaryChange={setPrimaryImage}
              />
            </div>
          </TabsContent>

          <TabsContent value="frames">
            <div className="py-4">
              {product && form.watch("item_type") === "frames" && (
                <FrameAttributesForm productId={product.id} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="lenses">
            <div className="py-4">
              {product && form.watch("item_type") === "lenses" && (
                <LensAttributesForm productId={product.id} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
