import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/shared/hooks/use-toast";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MapPin, Pencil, Trash2, Star, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/modules/storefront/components/shared";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  postal_code?: string;
  country: string;
  is_default: boolean;
}

// For now, we'll store addresses in localStorage until DB table is added
const useAddresses = () => {
  const { user } = useAuth();
  const storageKey = `addresses_${user?.id}`;

  const query = useQuery({
    queryKey: ["addresses", user?.id],
    queryFn: () => {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as Address[]) : [];
    },
    enabled: !!user,
  });

  const saveAddresses = (addresses: Address[]) => {
    localStorage.setItem(storageKey, JSON.stringify(addresses));
  };

  return { ...query, saveAddresses };
};

export const AddressesSection = () => {
  const { data: addresses = [], saveAddresses, refetch } = useAddresses();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Nigeria",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newAddress: Address = {
      id: editingAddress?.id || crypto.randomUUID(),
      ...formData,
      is_default: addresses.length === 0,
    };

    let updated: Address[];
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? newAddress : a);
    } else {
      updated = [...addresses, newAddress];
    }

    saveAddresses(updated);
    refetch();
    setIsOpen(false);
    setEditingAddress(null);
    setFormData({ label: "", street: "", city: "", state: "", postal_code: "", country: "Nigeria" });
    
    toast({
      title: editingAddress ? "Address updated" : "Address added",
      description: "Your address has been saved.",
    });
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code || "",
      country: address.country,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    saveAddresses(updated);
    refetch();
    toast({
      title: "Address deleted",
      description: "Your address has been removed.",
    });
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map(a => ({
      ...a,
      is_default: a.id === id,
    }));
    saveAddresses(updated);
    refetch();
    toast({
      title: "Default address updated",
    });
  };

  if (addresses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            type="orders"
            title="No saved addresses"
            description="Add a shipping address to speed up checkout"
            actionLabel="Add Address"
            onAction={() => setIsOpen(true)}
          />
          <AddressDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            isEditing={false}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Addresses</CardTitle>
        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingAddress(null);
            setFormData({ label: "", street: "", city: "", state: "", postal_code: "", country: "Nigeria" });
          }
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  placeholder="e.g., Home, Work"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  placeholder="Street address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingAddress ? "Update Address" : "Save Address"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between p-4 border rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{address.label}</p>
                  {address.is_default && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{address.street}</p>
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.state}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!address.is_default && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(address.id)}
                >
                  Set Default
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(address)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive"
                onClick={() => handleDelete(address.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const AddressDialog = ({
  isOpen,
  setIsOpen,
  formData,
  setFormData,
  onSubmit,
  isEditing,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  formData: { label: string; street: string; city: string; state: string; postal_code: string; country: string };
  setFormData: (data: typeof formData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}) => (
  <Dialog open={isOpen} onOpenChange={setIsOpen}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Address" : "Add New Address"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            placeholder="e.g., Home, Work"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            placeholder="Street address"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full">
          {isEditing ? "Update Address" : "Save Address"}
        </Button>
      </form>
    </DialogContent>
  </Dialog>
);
