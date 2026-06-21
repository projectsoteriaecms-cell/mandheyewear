import { useState } from "react";
import { AdminLayout } from "@/shared/layouts/admin";
import { RoleGuard } from "@/modules/auth/components/RoleGuard";
import {
  useSuppliers,
  useCreateSupplier,
  useUpdateSupplier,
  useDeleteSupplier,
  type Supplier,
  type SupplierInput,
} from "@/modules/suppliers";
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
import { Plus } from "lucide-react";
import { SupplierForm, SuppliersTable } from "./suppliers/index";

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
              <p className="text-muted-foreground">Manage your product suppliers and vendors</p>
            </div>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          </div>

          <SuppliersTable
            suppliers={suppliers}
            isLoading={isLoading}
            onEdit={setEditingSupplier}
            onDelete={setDeletingSupplier}
            onAdd={() => setShowDialog(true)}
          />
        </div>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>Add a new supplier to your vendor list</DialogDescription>
            </DialogHeader>
            <SupplierForm onSubmit={handleCreate} onCancel={() => setShowDialog(false)} isPending={createSupplier.isPending} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingSupplier} onOpenChange={() => setEditingSupplier(undefined)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
              <DialogDescription>Update supplier information</DialogDescription>
            </DialogHeader>
            {editingSupplier && (
              <SupplierForm supplier={editingSupplier} onSubmit={handleUpdate} onCancel={() => setEditingSupplier(undefined)} isPending={updateSupplier.isPending} />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(undefined)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingSupplier?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
