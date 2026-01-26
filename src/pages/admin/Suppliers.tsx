import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { RoleGuard } from "@/components/admin/RoleGuard";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  type Supplier,
  type SupplierInput,
} from "@/hooks/admin/useSuppliers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  Truck,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const SupplierForm = ({
  supplier,
  onSubmit,
  onCancel,
  isPending,
}: {
  supplier?: Supplier;
  onSubmit: (data: SupplierInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) => {
  const [formData, setFormData] = useState<SupplierInput>({
    name: supplier?.name || "",
    contact_person: supplier?.contact_person || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    city: supplier?.city || "",
    state: supplier?.state || "",
    country: supplier?.country || "Nigeria",
    payment_terms: supplier?.payment_terms || "",
    tax_id: supplier?.tax_id || "",
    notes: supplier?.notes || "",
    is_active: supplier?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person || ""}
            onChange={(e) =>
              setFormData({ ...formData, contact_person: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email || ""}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="tax_id">Tax ID</Label>
          <Input
            id="tax_id"
            value={formData.tax_id || ""}
            onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state || ""}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input
            id="payment_terms"
            placeholder="e.g., Net 30, COD"
            value={formData.payment_terms || ""}
            onChange={(e) =>
              setFormData({ ...formData, payment_terms: e.target.value })
            }
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ""}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : supplier ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
};

const Suppliers = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>();
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | undefined>();

  const { data: suppliers, isLoading } = useSuppliers(false);
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();
  const deleteSupplier = useDeleteSupplier();

  const handleCreate = async (data: SupplierInput) => {
    await createSupplier.mutateAsync(data);
    setShowDialog(false);
  };

  const handleUpdate = async (data: SupplierInput) => {
    if (editingSupplier) {
      await updateSupplier.mutateAsync({ id: editingSupplier.id, ...data });
      setEditingSupplier(undefined);
    }
  };

  const handleDelete = async () => {
    if (deletingSupplier) {
      await deleteSupplier.mutateAsync(deletingSupplier.id);
      setDeletingSupplier(undefined);
    }
  };

  return (
    <RoleGuard allowedRoles={["branch_manager", "super_admin"]}>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
              <p className="text-muted-foreground">
                Manage your product suppliers and vendors
              </p>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>

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
                              <p className="text-sm text-muted-foreground">
                                {supplier.contact_person}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {supplier.email && (
                              <div className="flex items-center gap-1 text-sm">
                                <Mail className="h-3 w-3" />
                                {supplier.email}
                              </div>
                            )}
                            {supplier.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3" />
                                {supplier.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {supplier.city || supplier.state ? (
                            <div className="flex items-center gap-1 text-sm">
                              <MapPin className="h-3 w-3" />
                              {[supplier.city, supplier.state]
                                .filter(Boolean)
                                .join(", ")}
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{supplier.payment_terms || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={supplier.is_active ? "default" : "secondary"}
                          >
                            {supplier.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingSupplier(supplier)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingSupplier(supplier)}
                            >
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
                  <p className="text-muted-foreground mb-4">
                    Add your first supplier to start creating purchase orders
                  </p>
                  <Button onClick={() => setShowDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Supplier
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Add a new supplier to your vendor list
              </DialogDescription>
            </DialogHeader>
            <SupplierForm
              onSubmit={handleCreate}
              onCancel={() => setShowDialog(false)}
              isPending={createSupplier.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={!!editingSupplier}
          onOpenChange={() => setEditingSupplier(undefined)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
              <DialogDescription>
                Update supplier information
              </DialogDescription>
            </DialogHeader>
            {editingSupplier && (
              <SupplierForm
                supplier={editingSupplier}
                onSubmit={handleUpdate}
                onCancel={() => setEditingSupplier(undefined)}
                isPending={updateSupplier.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog
          open={!!deletingSupplier}
          onOpenChange={() => setDeletingSupplier(undefined)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingSupplier?.name}"? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </RoleGuard>
  );
};

export default Suppliers;
