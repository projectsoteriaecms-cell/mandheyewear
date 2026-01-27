import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { useCategories, type Category } from "@/modules/categories";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  brand_line: z.enum(["soteria_medical", "m_and_h_fashion"]),
  parent_id: z.string().nullable(),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface EditCategoryDialogProps {
  category: Category | null;
  onClose: () => void;
}

export const EditCategoryDialog = ({ category, onClose }: EditCategoryDialogProps) => {
  const { updateCategory, categories } = useCategories();

  // Get all children of a category (recursively)
  const getDescendantIds = (parentId: string): string[] => {
    const children = categories.filter((c) => c.parent_id === parentId);
    return children.flatMap((child) => [child.id, ...getDescendantIds(child.id)]);
  };

  // Filter out the current category and its descendants from parent options
  const parentOptions = categories.filter((c) => {
    if (!category) return !c.parent_id;
    // Can't be its own parent
    if (c.id === category.id) return false;
    // Can't select a descendant as parent (would create circular reference)
    const descendantIds = getDescendantIds(category.id);
    if (descendantIds.includes(c.id)) return false;
    // Only show root categories or existing parents
    return !c.parent_id || c.parent_id === category.parent_id;
  });

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      brand_line: "soteria_medical",
      parent_id: null,
      description: "",
      image_url: "",
      is_active: true,
      display_order: 0,
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        slug: category.slug,
        brand_line: category.brand_line,
        parent_id: category.parent_id,
        description: category.description || "",
        image_url: category.image_url || "",
        is_active: category.is_active ?? true,
        display_order: category.display_order ?? 0,
      });
    }
  }, [category, form]);

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return;
    
    await updateCategory.mutateAsync({
      id: category.id,
      name: data.name,
      slug: data.slug,
      brand_line: data.brand_line,
      parent_id: data.parent_id,
      is_active: data.is_active,
      display_order: data.display_order,
      description: data.description || null,
      image_url: data.image_url || null,
    });
    onClose();
  };

  return (
    <Dialog open={!!category} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="category-slug" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="parent_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Category</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    value={field.value ?? "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="No parent (root category)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No parent (root category)</SelectItem>
                      {parentOptions.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
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
              name="brand_line"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Line</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="soteria_medical">Soteria Medical</SelectItem>
                      <SelectItem value="m_and_h_fashion">M&H Fashion</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input {...field} type="url" placeholder="https://..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel>Active</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateCategory.isPending}>
                {updateCategory.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
