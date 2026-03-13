import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DATABASE_FIELDS } from "@/modules/products";
import type { MappingStepProps } from "./types";

export const MappingStep = ({
  state,
  onMappingChange,
  requiredFieldsMapped,
}: MappingStepProps) => {
  const { file, rawData, headers, columnMappings } = state;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">{file?.name}</p>
          <p className="text-sm text-muted-foreground">{rawData.length} rows detected</p>
        </div>
        {!requiredFieldsMapped && (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Missing required mappings
          </Badge>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Column</TableHead>
            <TableHead>Maps To</TableHead>
            <TableHead>Sample Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {headers.map((header) => (
            <TableRow key={header}>
              <TableCell className="font-mono text-sm">{header}</TableCell>
              <TableCell>
                <Select
                  value={columnMappings[header] || "_skip"}
                  onValueChange={(val) => onMappingChange(header, val)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATABASE_FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                        {field.required && " *"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                {rawData[0]?.[header] || "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
