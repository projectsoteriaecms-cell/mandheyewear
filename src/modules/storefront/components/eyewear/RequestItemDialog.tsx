import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bell } from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/modules/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface RequestItemDialogProps {
  productId: string;
  productName: string;
}

export const RequestItemDialog = ({ productId, productName }: RequestItemDialogProps) => {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRequest = async () => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("product_requests" as any).insert({
      product_id: productId,
      user_id: user.id,
      notes: notes || null,
    });

    if (error) {
      toast.error("Failed to submit request");
    } else {
      toast.success("Request submitted! We'll notify you when it's available.");
      setOpen(false);
      setNotes("");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm h-9 sm:h-10">
          <Bell className="h-3.5 w-3.5 mr-1" />
          Request
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request This Item</DialogTitle>
          <DialogDescription>
            "{productName}" is currently out of stock. Submit a request and we'll source it for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Any notes? (e.g., urgency, preferred color...)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleRequest} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
