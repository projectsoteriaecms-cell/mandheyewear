import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, UserCheck, UserX } from "lucide-react";

interface UserStatsCardsProps {
  staffCount: number;
  customerCount: number;
  unverifiedCount: number;
}

export const UserStatsCards = ({ staffCount, customerCount, unverifiedCount }: UserStatsCardsProps) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Staff Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{staffCount}</p>
        <p className="text-xs text-muted-foreground">Managers & Staff</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Verified Customers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{customerCount}</p>
        <p className="text-xs text-muted-foreground">Can purchase & book</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <UserX className="h-4 w-4" />
          Unverified Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{unverifiedCount}</p>
        <p className="text-xs text-muted-foreground">Browse only</p>
      </CardContent>
    </Card>
  </div>
);
