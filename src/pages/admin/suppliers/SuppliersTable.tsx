import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2, Truck, Mail, Phone, MapPin } from "lucide-react";
import type { Supplier } from "@/modules/suppliers";

interface SuppliersTableProps {
  suppliers: Supplier[] | undefined;
  isLoading: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onAdd: () => void;
}

export const SuppliersTable = ({ suppliers, isLoading, onEdit, onDelete, onAdd }: SuppliersTableProps) => (
  <Card>
    <CardContent className="p-0">
      {isLoading ? (
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : suppliers && suppliers.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Payment Terms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{supplier.name}</p>
                    {supplier.contact_person && (
                      <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {supplier.email && (
                      <div className="flex items-center gap-1 text-sm"><Mail className="h-3 w-3" />{supplier.email}</div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-1 text-sm"><Phone className="h-3 w-3" />{supplier.phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {supplier.city || supplier.state ? (
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      {[supplier.city, supplier.state].filter(Boolean).join(", ")}
                    </div>
                  ) : "-"}
                </TableCell>
                <TableCell>{supplier.payment_terms || "-"}</TableCell>
                <TableCell>
                  <Badge variant={supplier.is_active ? "default" : "secondary"}>
                    {supplier.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(supplier)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(supplier)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-12 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No suppliers yet</h3>
          <p className="text-muted-foreground mb-4">Add your first supplier to start creating purchase orders</p>
          <Button onClick={onAdd}><Plus className="mr-2 h-4 w-4" />Add Supplier</Button>
        </div>
      )}
    </CardContent>
  </Card>
);
