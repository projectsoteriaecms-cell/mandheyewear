import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
};

export const SalesChart = ({ data }: { data: { month: string; sales: number }[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Sales Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(value: number) => [`₦${value.toLocaleString()}`, "Sales"]} contentStyle={tooltipStyle} />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export const InventoryTrendChart = ({ data }: { data: { month: string; stock: number }[] }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Inventory Trends</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip formatter={(value: number) => [value.toLocaleString(), "Stock Units"]} contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="stock" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export const CategoryPieChart = ({ data }: { data: { name: string; value: number }[] }) => (
  <Card>
    <CardHeader><CardTitle>Product Category Distribution</CardTitle></CardHeader>
    <CardContent>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
              {data.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

export const QuickInsights = ({ stats }: { stats: { totalOrders: number; totalRevenue: number; totalProducts: number; totalStock: number; totalUsers: number } | undefined }) => (
  <Card>
    <CardHeader><CardTitle>Quick Insights</CardTitle></CardHeader>
    <CardContent>
      <div className="grid gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Average Order Value</p>
          <p className="text-xl font-bold mt-1">₦{stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Stock per Product</p>
          <p className="text-xl font-bold mt-1">{stats?.totalProducts ? Math.round(stats.totalStock / stats.totalProducts) : 0} units</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Orders per User</p>
          <p className="text-xl font-bold mt-1">{stats?.totalUsers ? (stats.totalOrders / stats.totalUsers).toFixed(1) : 0}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);
