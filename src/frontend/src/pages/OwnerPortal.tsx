import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Building2,
  Check,
  CreditCard,
  Crown,
  Edit,
  Loader2,
  LogOut,
  Plus,
  Settings,
  Shield,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateBranch,
  useCreateStaff,
  useDeleteStaff,
  useGetAllBookings,
  useGetAllBranches,
  useGetAllHalls,
  useGetAllMenuItems,
  useGetAllPayments,
  useGetAllStaff,
  useIsCallerAdmin,
  useUpdateBranch,
  useUpdateHall,
  useUpdateMenuItem,
  useUpdateStaff,
} from "../hooks/useQueries";

function formatDate(ts: bigint) {
  if (!ts) return "N/A";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OwnerPortal() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState("revenue");

  const { data: branches = [], isLoading: branchesLoading } =
    useGetAllBranches();
  const { data: halls = [] } = useGetAllHalls();
  const { data: bookings = [] } = useGetAllBookings();
  const { data: payments = [], isLoading: paymentsLoading } =
    useGetAllPayments();
  const { data: staff = [], isLoading: staffLoading } = useGetAllStaff();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const { data: isAdmin } = useIsCallerAdmin();

  const createBranch = useCreateBranch();
  const _updateBranch = useUpdateBranch();
  const createStaff = useCreateStaff();
  const updateStaff = useUpdateStaff();
  const deleteStaff = useDeleteStaff();
  const updateHall = useUpdateHall();
  const updateMenuItem = useUpdateMenuItem();

  const isLoggedIn = loginStatus === "success" && !!identity;

  // Form states
  const [branchForm, setBranchForm] = useState({
    name: "",
    location: "",
    managerName: "",
    phone: "",
  });
  const [staffForm, setStaffForm] = useState({
    name: "",
    role: "manager",
    branchId: "",
    phone: "",
    email: "",
  });
  const [editingHallId, setEditingHallId] = useState<bigint | null>(null);
  const [editingHallPrice, setEditingHallPrice] = useState("");
  const [editingMenuId, setEditingMenuId] = useState<bigint | null>(null);
  const [editingMenuPrice, setEditingMenuPrice] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-royal border-maroon/10">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-maroon flex items-center justify-center mx-auto mb-6">
                <Crown className="h-8 w-8 text-gold" />
              </div>
              <h1 className="font-display text-3xl text-maroon mb-2">
                Owner Portal
              </h1>
              <p className="text-muted-foreground mb-3 text-base">
                Super Admin access only.
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                This portal is restricted to the owner/super admin of Royal
                Banquet.
              </p>
              <Button
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="w-full bg-maroon text-white text-lg h-12 font-bold"
              >
                {loginStatus === "logging-in" ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing
                    In...
                  </>
                ) : (
                  "Sign In as Owner"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Analytics
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const revenueByEventType = bookings.reduce(
    (acc, b) => {
      acc[b.eventType] = (acc[b.eventType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const revenueByBranch = branches.map((branch) => {
    const branchBookings = bookings.filter((b) => b.branchId === branch.id);
    const branchPayments = payments.filter((p) => {
      return branchBookings.some((b) => b.id === p.bookingId);
    });
    return {
      ...branch,
      bookingCount: branchBookings.length,
      revenue: branchPayments.reduce((sum, p) => sum + Number(p.amount), 0),
    };
  });

  // Monthly bookings
  const monthlyBookings = bookings.reduce(
    (acc, b) => {
      const month = new Date(
        Number(b.createdAt) / 1_000_000,
      ).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const avgBookingValue =
    payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0;

  const handleCreateBranch = async () => {
    if (!branchForm.name) return toast.error("Branch name required");
    try {
      await createBranch.mutateAsync(branchForm);
      setBranchForm({ name: "", location: "", managerName: "", phone: "" });
      toast.success("Branch created!");
    } catch {
      toast.error("Failed to create branch");
    }
  };

  const handleCreateStaff = async () => {
    if (!staffForm.name || !staffForm.email)
      return toast.error("Name and email required");
    try {
      await createStaff.mutateAsync({
        ...staffForm,
        branchId: BigInt(
          staffForm.branchId || (branches[0]?.id ?? 1n).toString(),
        ),
      });
      setStaffForm({
        name: "",
        role: "manager",
        branchId: "",
        phone: "",
        email: "",
      });
      toast.success("Staff member added!");
    } catch {
      toast.error("Failed to create staff");
    }
  };

  const handleToggleStaff = async (s: (typeof staff)[0]) => {
    try {
      await updateStaff.mutateAsync({ ...s, isActive: !s.isActive });
      toast.success(`Staff ${s.isActive ? "deactivated" : "activated"}`);
    } catch {
      toast.error("Failed to update staff");
    }
  };

  const handleDeleteStaff = async (id: bigint) => {
    try {
      await deleteStaff.mutateAsync(id);
      toast.success("Staff removed");
    } catch {
      toast.error("Failed to remove staff");
    }
  };

  const handleSaveHallPrice = async (hall: (typeof halls)[0]) => {
    try {
      await updateHall.mutateAsync({
        ...hall,
        pricePerHead: BigInt(editingHallPrice),
      });
      setEditingHallId(null);
      toast.success("Hall price updated!");
    } catch {
      toast.error("Failed to update price");
    }
  };

  const handleSaveMenuPrice = async (item: (typeof menuItems)[0]) => {
    try {
      await updateMenuItem.mutateAsync({
        ...item,
        price: BigInt(editingMenuPrice),
      });
      setEditingMenuId(null);
      toast.success("Menu price updated!");
    } catch {
      toast.error("Failed to update price");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* HEADER */}
      <header className="portal-header sticky top-0 z-50 shadow-royal">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/logo-transparent.dim_300x100.png"
              alt="Royal Banquet"
              className="h-8 w-auto"
            />
            <span className="text-white font-semibold text-lg hidden sm:block">
              Owner Dashboard
            </span>
            {isAdmin && (
              <Badge className="bg-gold/20 text-gold border-gold/30 text-xs">
                <Shield className="h-3 w-3 mr-1" /> Super Admin
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-white hover:bg-white/10"
          >
            <LogOut className="h-4 w-4 mr-1" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString("en-IN")}`,
              icon: TrendingUp,
              color: "text-maroon",
            },
            {
              label: "Total Bookings",
              value: bookings.length,
              icon: BarChart3,
              color: "text-blue-700",
            },
            {
              label: "Branches",
              value: branches.length,
              icon: Building2,
              color: "text-green-700",
            },
            {
              label: "Avg. Booking Value",
              value: `₹${avgBookingValue.toLocaleString("en-IN")}`,
              icon: CreditCard,
              color: "text-purple-700",
            },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-royal">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className={`text-2xl font-display font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted p-1 rounded-xl">
            {[
              { id: "revenue", label: "Revenue Analytics", icon: BarChart3 },
              { id: "performance", label: "Performance", icon: TrendingUp },
              { id: "payments", label: "Payment Reports", icon: CreditCard },
              { id: "branches", label: "Branches", icon: Building2 },
              { id: "staff", label: "Staff Mgmt", icon: Users },
              { id: "pricing", label: "Pricing Control", icon: Settings },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 text-sm py-2 px-3 data-[state=active]:bg-maroon data-[state=active]:text-white"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* REVENUE ANALYTICS */}
          <TabsContent value="revenue">
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-maroon">
                Revenue Analytics
              </h2>

              {/* Revenue by Branch */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Revenue by Branch
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueByBranch.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      No branch data yet
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {revenueByBranch.map((branch) => {
                        const maxRevenue = Math.max(
                          ...revenueByBranch.map((b) => b.revenue),
                          1,
                        );
                        const pct = Math.round(
                          (branch.revenue / maxRevenue) * 100,
                        );
                        return (
                          <div key={branch.id.toString()}>
                            <div className="flex justify-between mb-2">
                              <div>
                                <p className="font-semibold text-base">
                                  {branch.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {branch.location} • {branch.bookingCount}{" "}
                                  bookings
                                </p>
                              </div>
                              <p className="font-bold text-maroon text-lg">
                                ₹{branch.revenue.toLocaleString("en-IN")}
                              </p>
                            </div>
                            <div className="w-full bg-muted rounded-full h-3">
                              <div
                                className="h-3 rounded-full royal-gradient transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Events by Type */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Bookings by Event Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(revenueByEventType).length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      No bookings yet
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(revenueByEventType).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="bg-muted/50 rounded-xl p-4 text-center"
                          >
                            <p className="text-3xl font-display font-bold text-maroon">
                              {count}
                            </p>
                            <p className="text-muted-foreground capitalize mt-1">
                              {type}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Monthly bookings */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Monthly Booking Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(monthlyBookings).length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">
                      No data yet
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Month</TableHead>
                            <TableHead>Bookings</TableHead>
                            <TableHead>Visual</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(monthlyBookings).map(
                            ([month, count]) => {
                              const maxCount = Math.max(
                                ...Object.values(monthlyBookings),
                                1,
                              );
                              const pct = Math.round((count / maxCount) * 100);
                              return (
                                <TableRow key={month}>
                                  <TableCell className="font-semibold">
                                    {month}
                                  </TableCell>
                                  <TableCell className="font-bold text-maroon">
                                    {count}
                                  </TableCell>
                                  <TableCell className="w-40">
                                    <div className="w-full bg-muted rounded-full h-2">
                                      <div
                                        className="h-2 rounded-full bg-maroon"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            },
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* PERFORMANCE DASHBOARD */}
          <TabsContent value="performance">
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-maroon">
                Performance Dashboard
              </h2>

              {/* Hall Occupancy */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Hall Occupancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    {halls.map((hall) => {
                      const hallBookings = bookings.filter(
                        (b) => b.hallId === hall.id && b.status === "confirmed",
                      ).length;
                      const totalCapacity = Number(hall.capacity);
                      const _occupancyPct =
                        totalCapacity > 0
                          ? Math.min(
                              Math.round(
                                (hallBookings / totalCapacity) * 100 * 50,
                              ),
                              100,
                            )
                          : 0;
                      const seatsBooked = Number(
                        hall.capacity - hall.availableSeats,
                      );
                      const seatPct =
                        totalCapacity > 0
                          ? Math.round((seatsBooked / totalCapacity) * 100)
                          : 0;
                      return (
                        <div
                          key={hall.id.toString()}
                          className="bg-muted/30 rounded-xl p-4"
                        >
                          <div className="flex justify-between mb-3">
                            <h4 className="font-semibold text-maroon">
                              {hall.name}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {hall.capacity.toString()} seats
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-maroon">
                                {hall.availableSeats.toString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Available
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-orange-600">
                                {seatsBooked}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Booked
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-700">
                                {hallBookings}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Events
                              </p>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span>Seats used</span>
                              <span>{seatPct}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full transition-all ${seatPct > 80 ? "bg-red-500" : seatPct > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${seatPct}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {halls.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">
                      No halls added yet
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Summary Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Guests Served",
                    value: bookings
                      .filter((b) => b.status === "completed")
                      .reduce((sum, b) => sum + Number(b.guestCount), 0)
                      .toLocaleString("en-IN"),
                  },
                  {
                    label: "Conversion Rate",
                    value:
                      bookings.length > 0
                        ? `${Math.round((bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length / bookings.length) * 100)}%`
                        : "N/A",
                  },
                  {
                    label: "Avg. Guest Count",
                    value:
                      bookings.length > 0
                        ? Math.round(
                            bookings.reduce(
                              (sum, b) => sum + Number(b.guestCount),
                              0,
                            ) / bookings.length,
                          ).toString()
                        : "N/A",
                  },
                ].map((stat) => (
                  <Card key={stat.label} className="shadow-royal text-center">
                    <CardContent className="p-6">
                      <p className="text-4xl font-display font-bold text-maroon">
                        {stat.value}
                      </p>
                      <p className="text-muted-foreground mt-2">{stat.label}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* PAYMENT REPORTS */}
          <TabsContent value="payments">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Payment Reports
                </h2>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Total Collected
                  </p>
                  <p className="text-2xl font-bold text-maroon">
                    ₹{totalRevenue.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {paymentsLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <Card className="shadow-royal overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">
                            Payment #
                          </TableHead>
                          <TableHead className="font-semibold">
                            Booking ID
                          </TableHead>
                          <TableHead className="font-semibold">
                            Amount
                          </TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">
                            Method
                          </TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id.toString()}>
                            <TableCell>#{p.id.toString()}</TableCell>
                            <TableCell>
                              Booking #{p.bookingId.toString()}
                            </TableCell>
                            <TableCell className="font-bold text-maroon text-lg">
                              ₹{p.amount.toString()}
                            </TableCell>
                            <TableCell className="capitalize">
                              {p.paymentType.replace("_", " ")}
                            </TableCell>
                            <TableCell className="capitalize">
                              {p.method.replace("_", " ")}
                            </TableCell>
                            <TableCell>{formatDate(p.paymentDate)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {p.notes || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {payments.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No payments recorded yet
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>

          {/* BRANCHES */}
          <TabsContent value="branches">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Branch Management
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-maroon text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add Branch
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl text-maroon">
                        Add New Branch
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Branch Name *</Label>
                        <Input
                          value={branchForm.name}
                          onChange={(e) =>
                            setBranchForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Input
                          value={branchForm.location}
                          onChange={(e) =>
                            setBranchForm((f) => ({
                              ...f,
                              location: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Manager Name</Label>
                        <Input
                          value={branchForm.managerName}
                          onChange={(e) =>
                            setBranchForm((f) => ({
                              ...f,
                              managerName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={branchForm.phone}
                          onChange={(e) =>
                            setBranchForm((f) => ({
                              ...f,
                              phone: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        onClick={handleCreateBranch}
                        className="w-full bg-maroon text-white"
                        disabled={createBranch.isPending}
                      >
                        Create Branch
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {branchesLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {branches.map((branch) => {
                    const branchBookings = bookings.filter(
                      (b) => b.branchId === branch.id,
                    );
                    const branchHalls = halls.filter(
                      (h) => h.branchId === branch.id,
                    );
                    return (
                      <Card key={branch.id.toString()} className="shadow-royal">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-display text-xl font-semibold text-maroon">
                                {branch.name}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {branch.location}
                              </p>
                            </div>
                            <Badge className="bg-maroon/10 text-maroon">
                              Branch #{branch.id.toString()}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center bg-muted/50 rounded-lg p-2">
                              <p className="text-2xl font-bold text-maroon">
                                {branchBookings.length}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Bookings
                              </p>
                            </div>
                            <div className="text-center bg-muted/50 rounded-lg p-2">
                              <p className="text-2xl font-bold text-maroon">
                                {branchHalls.length}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Halls
                              </p>
                            </div>
                            <div className="text-center bg-muted/50 rounded-lg p-2">
                              <p className="text-xl font-bold text-maroon">
                                {branch.phone || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Phone
                              </p>
                            </div>
                          </div>
                          <div className="text-sm">
                            <p className="text-muted-foreground">
                              Manager:{" "}
                              <span className="font-semibold text-foreground">
                                {branch.managerName}
                              </span>
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {branches.length === 0 && (
                    <div className="col-span-2 text-center py-12 text-muted-foreground">
                      No branches yet
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* STAFF MANAGEMENT */}
          <TabsContent value="staff">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Staff Management
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-maroon text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add Staff
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl text-maroon">
                        Add Staff Member
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Full Name *</Label>
                        <Input
                          value={staffForm.name}
                          onChange={(e) =>
                            setStaffForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Role</Label>
                        <Select
                          value={staffForm.role}
                          onValueChange={(v) =>
                            setStaffForm((f) => ({ ...f, role: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[
                              "manager",
                              "branch_manager",
                              "kitchen_staff",
                              "operations_staff",
                              "receptionist",
                            ].map((r) => (
                              <SelectItem
                                key={r}
                                value={r}
                                className="capitalize"
                              >
                                {r.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Branch</Label>
                        <Select
                          value={staffForm.branchId}
                          onValueChange={(v) =>
                            setStaffForm((f) => ({ ...f, branchId: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((b) => (
                              <SelectItem
                                key={b.id.toString()}
                                value={b.id.toString()}
                              >
                                {b.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={staffForm.phone}
                            onChange={(e) =>
                              setStaffForm((f) => ({
                                ...f,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={staffForm.email}
                            onChange={(e) =>
                              setStaffForm((f) => ({
                                ...f,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateStaff}
                        className="w-full bg-maroon text-white"
                        disabled={createStaff.isPending}
                      >
                        Add Staff Member
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {staffLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <Card className="shadow-royal overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Name</TableHead>
                          <TableHead className="font-semibold">Role</TableHead>
                          <TableHead className="font-semibold">
                            Branch
                          </TableHead>
                          <TableHead className="font-semibold">Phone</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staff.map((s) => {
                          const branch = branches.find(
                            (b) => b.id === s.branchId,
                          );
                          return (
                            <TableRow key={s.id.toString()}>
                              <TableCell className="font-semibold">
                                {s.name}
                              </TableCell>
                              <TableCell className="capitalize">
                                {s.role.replace("_", " ")}
                              </TableCell>
                              <TableCell>
                                {branch?.name || `Branch #${s.branchId}`}
                              </TableCell>
                              <TableCell>{s.phone}</TableCell>
                              <TableCell>{s.email}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Switch
                                    checked={s.isActive}
                                    onCheckedChange={() => handleToggleStaff(s)}
                                  />
                                  <Badge
                                    className={
                                      s.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                    }
                                  >
                                    {s.isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteStaff(s.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {staff.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No staff members added yet
                    </div>
                  )}
                </Card>
              )}
            </div>
          </TabsContent>

          {/* PRICING CONTROL */}
          <TabsContent value="pricing">
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-maroon">
                Pricing Control
              </h2>

              {/* Hall Pricing */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Hall Pricing (Per Head)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">
                            Hall Name
                          </TableHead>
                          <TableHead className="font-semibold">
                            Capacity
                          </TableHead>
                          <TableHead className="font-semibold">
                            Price Per Head (₹)
                          </TableHead>
                          <TableHead className="font-semibold">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {halls.map((hall) => (
                          <TableRow key={hall.id.toString()}>
                            <TableCell className="font-semibold">
                              {hall.name}
                            </TableCell>
                            <TableCell>{hall.capacity.toString()}</TableCell>
                            <TableCell>
                              {editingHallId === hall.id ? (
                                <Input
                                  type="number"
                                  value={editingHallPrice}
                                  onChange={(e) =>
                                    setEditingHallPrice(e.target.value)
                                  }
                                  className="w-28 h-8"
                                />
                              ) : (
                                <span className="font-bold text-maroon text-lg">
                                  ₹{hall.pricePerHead.toString()}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingHallId === hall.id ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 text-white"
                                    onClick={() => handleSaveHallPrice(hall)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingHallId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-maroon text-maroon"
                                  onClick={() => {
                                    setEditingHallId(hall.id);
                                    setEditingHallPrice(
                                      hall.pricePerHead.toString(),
                                    );
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {halls.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">
                      No halls to price
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Menu Pricing */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Menu Item Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">
                            Item Name
                          </TableHead>
                          <TableHead className="font-semibold">
                            Category
                          </TableHead>
                          <TableHead className="font-semibold">Type</TableHead>
                          <TableHead className="font-semibold">
                            Price (₹)
                          </TableHead>
                          <TableHead className="font-semibold">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {menuItems.map((item) => (
                          <TableRow key={item.id.toString()}>
                            <TableCell className="font-semibold">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  item.isVegetarian
                                    ? "bg-green-100 text-green-700"
                                    : ""
                                }
                              >
                                {item.isVegetarian ? "🌿 Veg" : "🍖 Non-Veg"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {editingMenuId === item.id ? (
                                <Input
                                  type="number"
                                  value={editingMenuPrice}
                                  onChange={(e) =>
                                    setEditingMenuPrice(e.target.value)
                                  }
                                  className="w-28 h-8"
                                />
                              ) : (
                                <span className="font-bold text-maroon text-lg">
                                  ₹{item.price.toString()}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingMenuId === item.id ? (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-green-600 text-white"
                                    onClick={() => handleSaveMenuPrice(item)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingMenuId(null)}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-maroon text-maroon"
                                  onClick={() => {
                                    setEditingMenuId(item.id);
                                    setEditingMenuPrice(item.price.toString());
                                  }}
                                >
                                  <Edit className="h-3 w-3 mr-1" /> Edit
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {menuItems.length === 0 && (
                    <p className="text-center text-muted-foreground py-6">
                      No menu items to price
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <footer className="text-center py-8 text-muted-foreground text-sm border-t mt-10">
        © {new Date().getFullYear()}. Built with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="text-maroon hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          ❤️ caffeine.ai
        </a>
      </footer>
    </div>
  );
}
