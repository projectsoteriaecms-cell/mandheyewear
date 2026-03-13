import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DuplicateHandling } from "@/modules/products";
import type { OptionsStepProps } from "./types";

export const OptionsStep = ({
  state,
  onBatchSizeChange,
  onDuplicateHandlingChange,
  onCreateFrameAttributesChange,
}: OptionsStepProps) => {
  const { parsedProducts, allErrors, batchSize, duplicateHandling, createFrameAttributes } = state;

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div>
          <Label className="text-base">Batch Size: {batchSize}</Label>
          <p className="text-sm text-muted-foreground mb-2">
            Number of products to process at a time
          </p>
          <Slider
            value={[batchSize]}
            onValueChange={([val]) => onBatchSizeChange(val)}
            min={25}
            max={100}
            step={25}
          />
        </div>

        <div>
          <Label className="text-base">Duplicate Handling</Label>
          <p className="text-sm text-muted-foreground mb-2">
            What to do when a product with the same SKU exists
          </p>
          <Select
            value={duplicateHandling}
            onValueChange={(v) => onDuplicateHandlingChange(v as DuplicateHandling)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="skip">Skip duplicates</SelectItem>
              <SelectItem value="update">Update existing products</SelectItem>
              <SelectItem value="fail">Report as error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base">Create Frame Attributes</Label>
            <p className="text-sm text-muted-foreground">
              Automatically create frame_attributes records for frame products
            </p>
          </div>
          <Switch
            checked={createFrameAttributes}
            onCheckedChange={onCreateFrameAttributesChange}
          />
        </div>
      </div>

      <div className="bg-muted rounded-lg p-4">
        <p className="font-medium mb-2">Import Summary</p>
        <ul className="text-sm space-y-1">
          <li>• {parsedProducts.length} products ready to import</li>
          <li>• {allErrors.length} rows with errors (will be skipped)</li>
          <li>• Batch size: {batchSize}</li>
          <li>• Duplicate handling: {duplicateHandling}</li>
        </ul>
      </div>
    </div>
  );
};
