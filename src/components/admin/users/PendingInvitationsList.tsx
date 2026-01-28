import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/shared/hooks/useAuth";
import { useUserInvitations } from "@/modules/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Mail, RefreshCw, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<AppRole, string> = {
  user: "User (Unverified)",
  customer: "Customer",
  branch_staff: "Branch Staff",
  branch_manager: "Branch Manager",
  super_admin: "Super Admin",
};

type InvitationStatus = "pending" | "accepted" | "expired";

const getInvitationStatus = (invitation: {
  accepted_at: string | null;
  expires_at: string;
}): InvitationStatus => {
  if (invitation.accepted_at) return "accepted";
  if (new Date(invitation.expires_at) < new Date()) return "expired";
  return "pending";
};

const statusConfig: Record<InvitationStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  pending: { label: "Pending", variant: "outline", icon: Clock },
  accepted: { label: "Accepted", variant: "default", icon: CheckCircle },
  expired: { label: "Expired", variant: "destructive", icon: XCircle },
};

export const PendingInvitationsList = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: invitations = [], isLoading } = useUserInvitations();

  const resendInvitation = useMutation({
    mutationFn: async (invitation: { id: string; email: string; role: AppRole }) => {
      // Get inviter's name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user?.id)
        .single();

      // Update expires_at to extend the invitation
      const { error: updateError } = await supabase
        .from("user_invitations")
        .update({ 
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() 
        })
        .eq("id", invitation.id);

      if (updateError) throw updateError;

      // Resend invitation email
      const signupUrl = `${window.location.origin}/signup?email=${encodeURIComponent(invitation.email)}`;
      
      const { error: emailError } = await supabase.functions.invoke(
        "send-user-invitation",
        {
          body: {
            email: invitation.email,
            role: invitation.role,
            invitedByName: profile?.full_name || "Admin",
            signupUrl,
          },
        }
      );

      if (emailError) {
        console.error("Email sending error:", emailError);
        toast.warning("Invitation extended but email could not be sent.");
      }

      return invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast.success("Invitation resent successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to resend invitation");
    },
  });

  const revokeInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("user_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
      toast.success("Invitation revoked successfully!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to revoke invitation");
    },
  });

  const pendingCount = invitations.filter(
    (inv) => getInvitationStatus(inv) === "pending"
  ).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations ({pendingCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No invitations sent yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const status = getInvitationStatus(invitation);
                  const StatusIcon = statusConfig[status].icon;
                  const canResend = status === "pending" || status === "expired";
                  const canRevoke = status !== "accepted";

                  return (
                    <TableRow key={invitation.id}>
                      <TableCell className="font-medium">
                        {invitation.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {roleLabels[invitation.role]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[status].variant}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(invitation.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {status === "accepted"
                          ? "—"
                          : formatDistanceToNow(new Date(invitation.expires_at), {
                              addSuffix: true,
                            })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {canResend && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                resendInvitation.mutate({
                                  id: invitation.id,
                                  email: invitation.email,
                                  role: invitation.role,
                                })
                              }
                              disabled={resendInvitation.isPending}
                              title="Resend invitation"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {canRevoke && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  title="Revoke invitation"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Revoke Invitation
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to revoke the invitation
                                    for {invitation.email}? They will no longer be
                                    able to sign up with the pre-assigned role.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      revokeInvitation.mutate(invitation.id)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Revoke
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
