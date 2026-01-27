import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useFrameAttributes } from "@/hooks/admin/useFrameAttributes";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const frameAttributesSchema = z.object({
  model_code: z.string().optional(),
  frame_shape: z.string().optional(),
  lens_width: z.coerce.number().min(0).optional().or(z.literal("")),
  bridge_size: z.coerce.number().min(0).optional().or(z.literal("")),
  temple_length: z.coerce.number().min(0).optional().or(z.literal("")),
  frame_material: z.string().optional(),
  front_color: z.string().optional(),
  temple_color: z.string().optional(),
  has_clip_on: z.boolean().default(false),
});

type FrameAttributesFormValues = z.infer<typeof frameAttributesSchema>;

const FRAME_SHAPES = [
  "Aviator",
  "Cat Eye",
  "Oval",
  "Rectangle",
  "Round",
  "Square",
  "Wayfarer",
  "Wrap",
  "Geometric",
  "Browline",
  "Rimless",
  "Semi-Rimless",
];

const FRAME_MATERIALS = [
  "Acetate",
  "Metal",
  "Titanium",
  "TR-90",
  "Plastic",
  "Stainless Steel",
  "Aluminum",
  "Carbon Fiber",
  "Wood",
  "Mixed",
];

interface FrameAttributesFormProps {
  productId: string;
}

export const FrameAttributesForm = ({ productId }: FrameAttributesFormProps) => {
  const { frameAttributes, isLoading, upsertFrameAttributes } = useFrameAttributes(productId);

  const form = useForm<FrameAttributesFormValues>({
    resolver: zodResolver(frameAttributesSchema),
    defaultValues: {
      model_code: "",
      frame_shape: "",
      lens_width: "",
      bridge_size: "",
      temple_length: "",
      frame_material: "",
      front_color: "",
      temple_color: "",
      has_clip_on: false,
    },
  });

  useEffect(() => {
    if (frameAttributes) {
      form.reset({
        model_code: frameAttributes.model_code || "",
        frame_shape: frameAttributes.frame_shape || "",
        lens_width: frameAttributes.lens_width || "",
        bridge_size: frameAttributes.bridge_size || "",
        temple_length: frameAttributes.temple_length || "",
        frame_material: frameAttributes.frame_material || "",
        front_color: frameAttributes.front_color || "",
        temple_color: frameAttributes.temple_color || "",
        has_clip_on: frameAttributes.has_clip_on || false,
      });
    }
  }, [frameAttributes, form]);

  const onSubmit = (data: FrameAttributesFormValues) => {
    upsertFrameAttributes.mutate({
      product_id: productId,
      model_code: data.model_code || null,
      frame_shape: data.frame_shape || null,
      lens_width: data.lens_width ? Number(data.lens_width) : null,
      bridge_size: data.bridge_size ? Number(data.bridge_size) : null,
      temple_length: data.temple_length ? Number(data.temple_length) : null,
      frame_material: data.frame_material || null,
      front_color: data.front_color || null,
      temple_color: data.temple_color || null,
      has_clip_on: data.has_clip_on,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="model_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Model Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., VO5286" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="frame_shape"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Frame Shape</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shape" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FRAME_SHAPES.map((shape) => (
                      <SelectItem key={shape} value={shape}>
                        {shape}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="lens_width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lens Width (mm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="52" {...field} />
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
                <FormLabel>Bridge Size (mm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="18" {...field} />
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
                <FormLabel>Temple Length (mm)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="140" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="frame_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Frame Material</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FRAME_MATERIALS.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="front_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Front Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Black" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="temple_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Temple Color</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Gold" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="has_clip_on"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Has Clip-On Attachment</FormLabel>
                <p className="text-sm text-muted-foreground">
                  This frame comes with a clip-on sunglasses attachment
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={upsertFrameAttributes.isPending}
          className="w-full"
        >
          {upsertFrameAttributes.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Frame Attributes"
          )}
        </Button>
      </form>
    </Form>
  );
};
