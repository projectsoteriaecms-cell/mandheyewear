import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useUserRole } from "@/modules/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { getInvitableRoles, getRoleLabel } from "@/shared/lib/permissions";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InviteUserDialog = ({ open, onOpenChange }: InviteUserDialogProps) => {
  const { user } = useAuth();
  const { data: currentUserRole } = useUserRole();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AppRole>("customer");

  // Get roles the current user can invite
  const invitableRoles = getInvitableRoles(currentUserRole ?? null);

  const inviteUser = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      // Get inviter's name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user?.id)
        .single();

      // Create the invitation record
      const { data: invitation, error: insertError } = await supabase
        .from("user_invitations")
        .insert({
          email,
          role,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          throw new Error("An invitation has already been sent to this email");
        }
        throw insertError;
      }

      // Send invitation email
      const signupUrl = `${window.location.origin}/signup?email=${encodeURIComponent(email)}`;
      
      const { data: emailResult, error: emailError } = await supabase.functions.invoke(
        "send-user-invitation",
        {
          body: {
            email,
            role,
            invitedByName: profile?.full_name || "Admin",
            signupUrl,
          },
        }
      );

      if (emailError) {
        console.error("Email sending error:", emailError);
        toast.warning("Invitation created but email could not be sent. User can still sign up.");
      } else if ((emailResult as { emailSent?: boolean; warning?: string } | null)?.emailSent === false) {
        toast.warning(
          (emailResult as { warning?: string } | null)?.warning ||
            "Invitation created. Email delivery is temporarily restricted.",
        );
      }

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast.success("Invitation sent successfully!");
      setEmail("");
      setRole("customer");
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send invitation");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    inviteUser.mutate({ email, role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an invitation email to a new user with a pre-assigned role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={inviteUser.isPending}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Assign Role</Label>
            <Select 
              value={role} 
              onValueChange={(v) => setRole(v as AppRole)}
              disabled={inviteUser.isPending}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {invitableRoles.map((roleValue) => (
                  <SelectItem key={roleValue} value={roleValue}>
                    {getRoleLabel(roleValue)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              The user will be assigned this role when they complete signup.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={inviteUser.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteUser.isPending}>
              {inviteUser.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
