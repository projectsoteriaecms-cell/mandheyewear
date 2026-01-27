import { useState, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { AdminLayout } from "@/components/admin/AdminLayout";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { useCategories, type Category } from "@/hooks/admin/useCategories";
import { SortableCategoryRow } from "@/components/admin/categories/SortableCategoryRow";
import { CreateCategoryDialog } from "@/components/admin/categories/CreateCategoryDialog";
import { EditCategoryDialog } from "@/components/admin/categories/EditCategoryDialog";
import { Loader2 } from "lucide-react";

const Categories = () => {
  const { categories, isLoading, deleteCategory, reorderCategories } = useCategories();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  }, [categories]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex((c) => c.id === active.id);
      const newIndex = sortedCategories.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);
      const orderedIds = newOrder.map((c) => c.id);
      reorderCategories.mutate(orderedIds);
    }
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteCategory.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground">
              Manage product categories. Drag rows to reorder.
            </p>
          </div>
          <CreateCategoryDialog />
        </div>

        <div className="rounded-md border">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Brand Line</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={sortedCategories.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {sortedCategories.map((category) => (
                    <SortableCategoryRow
                      key={category.id}
                      category={category}
                      onEdit={setEditingCategory}
                      onDelete={setDeletingId}
                    />
                  ))}
                </SortableContext>
              </TableBody>
            </Table>
          </DndContext>

          {sortedCategories.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No categories yet. Create your first category to get started.
            </div>
          )}
        </div>
      </div>

      <EditCategoryDialog
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? Products using this
              category will be unlinked.
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
  );
};

export default Categories;
