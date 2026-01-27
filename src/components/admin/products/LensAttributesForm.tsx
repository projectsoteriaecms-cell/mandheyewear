import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLensAttributes } from "@/hooks/admin/useLensAttributes";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

const lensAttributesSchema = z.object({
  sph: z.coerce.number().min(-20).max(20).optional().or(z.literal("")),
  cyl: z.coerce.number().min(-10).max(10).optional().or(z.literal("")),
  axis: z.coerce.number().min(0).max(180).optional().or(z.literal("")),
  lens_type: z.string().optional(),
  lens_material: z.string().optional(),
  coating: z.string().optional(),
});

type LensAttributesFormValues = z.infer<typeof lensAttributesSchema>;

const LENS_TYPES = [
  "Single Vision",
  "Bifocal",
  "Progressive",
  "Reading",
  "Distance",
  "Computer/Intermediate",
  "Occupational",
];

const LENS_MATERIALS = [
  "CR-39 (Plastic)",
  "Polycarbonate",
  "Trivex",
  "High-Index 1.67",
  "High-Index 1.74",
  "Glass",
];

const COATINGS = [
  "Anti-Reflective",
  "Blue Light Blocking",
  "Photochromic (Transitions)",
  "Polarized",
  "Scratch Resistant",
  "UV Protection",
  "Hydrophobic",
  "Oleophobic",
];

interface LensAttributesFormProps {
  productId: string;
}

export const LensAttributesForm = ({ productId }: LensAttributesFormProps) => {
  const { lensAttributes, isLoading, upsertLensAttributes } = useLensAttributes(productId);

  const form = useForm<LensAttributesFormValues>({
    resolver: zodResolver(lensAttributesSchema),
    defaultValues: {
      sph: "",
      cyl: "",
      axis: "",
      lens_type: "",
      lens_material: "",
      coating: "",
    },
  });

  useEffect(() => {
    if (lensAttributes) {
      form.reset({
        sph: lensAttributes.sph ?? "",
        cyl: lensAttributes.cyl ?? "",
        axis: lensAttributes.axis ?? "",
        lens_type: lensAttributes.lens_type || "",
        lens_material: lensAttributes.lens_material || "",
        coating: lensAttributes.coating || "",
      });
    }
  }, [lensAttributes, form]);

  const onSubmit = (data: LensAttributesFormValues) => {
    upsertLensAttributes.mutate({
      product_id: productId,
      sph: data.sph ? Number(data.sph) : null,
      cyl: data.cyl ? Number(data.cyl) : null,
      axis: data.axis ? Number(data.axis) : null,
      lens_type: data.lens_type || null,
      lens_material: data.lens_material || null,
      coating: data.coating || null,
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
        <div className="rounded-lg border p-4 bg-muted/50">
          <h4 className="text-sm font-medium mb-3">Prescription Values (Optional)</h4>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="sph"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sphere (SPH)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.25"
                      placeholder="-2.00" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Range: -20 to +20
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cyl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cylinder (CYL)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.25"
                      placeholder="-0.50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Range: -10 to +10
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="axis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Axis</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="90" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Range: 0° to 180°
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="lens_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lens Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select lens type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LENS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="lens_material"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lens Material</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {LENS_MATERIALS.map((material) => (
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

        <FormField
          control={form.control}
          name="coating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coating</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select coating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COATINGS.map((coating) => (
                    <SelectItem key={coating} value={coating}>
                      {coating}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={upsertLensAttributes.isPending}
          className="w-full"
        >
          {upsertLensAttributes.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Lens Attributes"
          )}
        </Button>
      </form>
    </Form>
  );
};
