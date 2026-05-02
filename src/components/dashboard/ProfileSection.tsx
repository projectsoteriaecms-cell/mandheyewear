import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile, useUpdateProfile } from "@/modules/personalization/hooks/useProfile";
import { useToast } from "@/shared/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, User, ShieldCheck, ShieldAlert } from "lucide-react";
import { useEmailVerification } from "@/modules/auth/hooks/useEmailVerification";
import { EmailVerificationStatusDialog } from "./EmailVerificationStatusDialog";

interface ProfileSectionProps {
  userId: string;
}

export const ProfileSection = ({ userId }: ProfileSectionProps) => {
  const { data: profile, isLoading } = useProfile(userId);
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const { isVerified } = useEmailVerification();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  const handleEdit = () => {
    setFullName(profile?.full_name || "");
    setPhoneNumber(profile?.phone_number || "");
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        userId,
        updates: {
          full_name: fullName,
          phone_number: phoneNumber,
        },
      });
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Manage your personal details</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+234 xxx xxx xxxx"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={updateProfile.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium">{profile?.full_name || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{profile?.email || "Not set"}</p>
                <button
                  type="button"
                  onClick={() => setStatusDialogOpen(true)}
                  className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
                    isVerified
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                  }`}
                  aria-label="View email verification status"
                >
                  {isVerified ? (
                    <>
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="h-3.5 w-3.5" />
                      Not verified — view details
                    </>
                  )}
                </button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">{profile?.phone_number || "Not set"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prescription on File</p>
                <p className="font-medium">
                  {profile?.prescription_on_file ? "Yes" : "No"}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleEdit}>
              Edit Profile
            </Button>
          </>
        )}
        </CardContent>
      </Card>
      <EmailVerificationStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
      />
    </>
  );
};
