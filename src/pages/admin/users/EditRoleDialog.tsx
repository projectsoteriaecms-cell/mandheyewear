import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getRoleLabel } from "@/shared/lib/permissions";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface EditRoleDialogProps {
  editingUser: { id: string; email: string; role: AppRole } | null;
  newRole: AppRole;
  onNewRoleChange: (role: AppRole) => void;
  assignableRoles: AppRole[];
  isPending: boolean;
  onSave: () => void;
  onClose: () => void;
}

export const EditRoleDialog = ({
  editingUser,
  newRole,
  onNewRoleChange,
  assignableRoles,
  isPending,
  onSave,
  onClose,
}: EditRoleDialogProps) => (
  <Dialog open={!!editingUser} onOpenChange={() => onClose()}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Change User Role</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 pt-4">
        <p className="text-sm text-muted-foreground">
          Changing role for: <strong>{editingUser?.email}</strong>
        </p>
        <Select value={newRole} onValueChange={(v) => onNewRoleChange(v as AppRole)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {assignableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {getRoleLabel(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
