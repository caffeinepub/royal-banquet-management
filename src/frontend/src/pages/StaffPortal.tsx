import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChefHat,
  Clock,
  Loader2,
  LogOut,
  Package,
  Send,
  UserCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCreateStockRequest,
  useGetAllBookings,
  useGetAllBranches,
  useGetAllHalls,
  useGetAllMenuItems,
  useGetAllStock,
  useGetAllStockRequests,
  useRecordStockUsage,
  useUpdateStock,
} from "../hooks/useQueries";

function formatDate(ts: bigint) {
  if (!ts) return "N/A";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    weekday: "short",
  });
}

// Rough material estimates per menu item (per 10 guests)
const MATERIAL_ESTIMATES: Record<
  string,
  Array<{ item: string; qty: string; unit: string }>
> = {
  biryani: [
    { item: "Basmati Rice", qty: "1", unit: "kg" },
    { item: "Chicken/Mutton", qty: "1.5", unit: "kg" },
  ],
  paneer: [
    { item: "Paneer", qty: "0.8", unit: "kg" },
    { item: "Tomatoes", qty: "0.5", unit: "kg" },
  ],
  default: [
    { item: "Oil", qty: "0.5", unit: "litre" },
    { item: "Spices Mix", qty: "0.1", unit: "kg" },
  ],
};

function getMaterialEstimate(menuItemName: string, guestCount: number) {
  const key = menuItemName.toLowerCase().includes("biryani")
    ? "biryani"
    : menuItemName.toLowerCase().includes("paneer")
      ? "paneer"
      : "default";
  const estimates = MATERIAL_ESTIMATES[key];
  const multiplier = Math.ceil(guestCount / 10);
  return estimates.map((e) => ({
    ...e,
    qty: `${(Number.parseFloat(e.qty) * multiplier).toFixed(1)}`,
  }));
}

export default function StaffPortal() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState("schedule");

  const { data: bookings = [], isLoading: bookingsLoading } =
    useGetAllBookings();
  const { data: halls = [] } = useGetAllHalls();
  const { data: menuItems = [] } = useGetAllMenuItems();
  const { data: stock = [], isLoading: stockLoading } = useGetAllStock();
  const { data: stockRequests = [] } = useGetAllStockRequests();
  const { data: branches = [] } = useGetAllBranches();

  const updateStock = useUpdateStock();
  const recordStockUsage = useRecordStockUsage();
  const createStockRequest = useCreateStockRequest();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const branchId = branches.length > 0 ? branches[0].id : 1n;

  // Request form
  const [requestForm, setRequestForm] = useState({
    itemName: "",
    quantityRequested: "",
    reason: "",
  });

  // Stock usage form
  const [usageForm, setUsageForm] = useState({
    bookingId: "",
    stockItemId: "",
    quantityUsed: "",
  });

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
                <ChefHat className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-display text-3xl text-maroon mb-2">
                Staff Portal
              </h1>
              <p className="text-muted-foreground mb-8 text-base">
                Kitchen & Operations staff access. Please sign in.
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
                  "Sign In to Continue"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const confirmedBookings = bookings
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .sort((a, b) => Number(a.eventDate - b.eventDate));

  const lowStockItems = stock.filter(
    (s) => s.quantityOnHand <= s.minimumThreshold,
  );

  const getHallName = (hallId: bigint) =>
    halls.find((h) => h.id === hallId)?.name || `Hall #${hallId}`;
  const getMenuItemsForBooking = (selections: bigint[]) =>
    menuItems.filter((m) => selections.includes(m.id));

  const handleSendRequest = async () => {
    if (!requestForm.itemName || !requestForm.quantityRequested) {
      return toast.error("Please fill item name and quantity");
    }
    try {
      await createStockRequest.mutateAsync({
        branchId,
        requestedBy: 0n,
        itemName: requestForm.itemName,
        quantityRequested: BigInt(requestForm.quantityRequested),
        reason: requestForm.reason,
      });
      setRequestForm({ itemName: "", quantityRequested: "", reason: "" });
      toast.success("Request sent to manager!");
    } catch {
      toast.error("Failed to send request");
    }
  };

  const handleRecordUsage = async () => {
    if (
      !usageForm.bookingId ||
      !usageForm.stockItemId ||
      !usageForm.quantityUsed
    ) {
      return toast.error("Please fill all fields");
    }
    try {
      const stockItem = stock.find(
        (s) => s.id === BigInt(usageForm.stockItemId),
      );
      if (stockItem) {
        const newQty =
          stockItem.quantityOnHand - BigInt(usageForm.quantityUsed);
        await updateStock.mutateAsync({
          ...stockItem,
          quantityOnHand: newQty < 0n ? 0n : newQty,
        });
      }
      await recordStockUsage.mutateAsync({
        bookingId: BigInt(usageForm.bookingId),
        stockItemId: BigInt(usageForm.stockItemId),
        quantityUsed: BigInt(usageForm.quantityUsed),
      });
      setUsageForm({ bookingId: "", stockItemId: "", quantityUsed: "" });
      toast.success("Stock usage recorded!");
    } catch {
      toast.error("Failed to record stock usage");
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
              Staff Portal
            </span>
          </div>
          <div className="flex items-center gap-4">
            {lowStockItems.length > 0 && (
              <div className="flex items-center gap-2 bg-red-500/20 text-white px-3 py-1 rounded-full text-sm">
                <AlertTriangle className="h-4 w-4 text-red-300" />
                <span className="hidden sm:inline">
                  {lowStockItems.length} low stock
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clear}
              className="text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Upcoming Events",
              value: confirmedBookings.length,
              icon: Calendar,
              color: "text-maroon",
            },
            {
              label: "Total Guests Today",
              value: confirmedBookings
                .filter((b) => {
                  const eventDay = new Date(
                    Number(b.eventDate) / 1_000_000,
                  ).toDateString();
                  return eventDay === new Date().toDateString();
                })
                .reduce((sum, b) => sum + Number(b.guestCount), 0),
              icon: Users,
              color: "text-blue-700",
            },
            {
              label: "Stock Items",
              value: stock.length,
              icon: Package,
              color: "text-green-700",
            },
            {
              label: "Low Stock Alerts",
              value: lowStockItems.length,
              icon: AlertTriangle,
              color: "text-red-600",
            },
          ].map((stat) => (
            <Card key={stat.label} className="shadow-royal">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className={`text-3xl font-display font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap h-auto gap-1 mb-6 bg-muted p-1 rounded-xl">
            {[
              { id: "schedule", label: "Event Schedule", icon: Calendar },
              { id: "guests", label: "Guest & Menu", icon: UtensilsCrossed },
              { id: "stock", label: "Stock Inventory", icon: Package },
              { id: "request", label: "Request Stock", icon: Send },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 text-sm py-2 px-4 data-[state=active]:bg-maroon data-[state=active]:text-white"
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* EVENT SCHEDULE */}
          <TabsContent value="schedule">
            <h2 className="font-display text-2xl text-maroon mb-5">
              Upcoming Event Schedule
            </h2>
            {bookingsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : confirmedBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16 text-muted-foreground text-lg">
                  <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  No upcoming events
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {confirmedBookings.map((b) => {
                  const today = new Date().toDateString();
                  const eventDay = new Date(
                    Number(b.eventDate) / 1_000_000,
                  ).toDateString();
                  const isToday = eventDay === today;
                  return (
                    <Card
                      key={b.id.toString()}
                      className={`shadow-royal overflow-hidden ${isToday ? "border-2 border-gold" : ""}`}
                    >
                      {isToday && (
                        <div className="bg-gold text-maroon text-center text-sm font-bold py-1">
                          🌟 TODAY'S EVENT
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="grid sm:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                className={
                                  b.status === "confirmed"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {b.status.toUpperCase()}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                #{b.id.toString()}
                              </span>
                            </div>
                            <p className="font-display text-xl font-semibold text-maroon capitalize">
                              {b.eventType}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {b.customerName}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-base">
                              <Calendar className="h-5 w-5 text-maroon shrink-0" />
                              <span className="font-semibold">
                                {formatDate(b.eventDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-base">
                              <Users className="h-5 w-5 text-maroon shrink-0" />
                              <span className="font-semibold">
                                {b.guestCount.toString()} Guests
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-2 text-base">
                              <Building className="h-5 w-5 text-maroon shrink-0" />
                              <span className="font-semibold">
                                {getHallName(b.hallId)}
                              </span>
                            </div>
                            {b.notes && (
                              <div className="mt-2 text-sm text-muted-foreground italic bg-muted/50 rounded px-3 py-2">
                                📝 {b.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* GUEST & MENU */}
          <TabsContent value="guests">
            <h2 className="font-display text-2xl text-maroon mb-5">
              Guest Count & Menu Details
            </h2>
            <div className="space-y-6">
              {confirmedBookings.map((b) => {
                const selectedMenu = getMenuItemsForBooking(b.menuSelections);
                const guestCount = Number(b.guestCount);
                return (
                  <Card
                    key={b.id.toString()}
                    className="shadow-royal overflow-hidden"
                  >
                    <div className="portal-header text-white px-5 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-display text-lg font-semibold capitalize">
                          {b.eventType} — {b.customerName}
                        </p>
                        <p className="text-sm text-white/70">
                          {formatDate(b.eventDate)} • {getHallName(b.hallId)}
                        </p>
                      </div>
                      <div className="text-center bg-white/10 rounded-lg px-4 py-2">
                        <p className="text-3xl font-bold">
                          {b.guestCount.toString()}
                        </p>
                        <p className="text-xs text-white/70">Guests</p>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      {selectedMenu.length > 0 ? (
                        <div>
                          <h4 className="font-semibold text-maroon mb-3 text-base">
                            Menu Items Ordered:
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {selectedMenu.map((item) => (
                              <div
                                key={item.id.toString()}
                                className="border rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold">
                                    {item.isVegetarian ? "🌿" : "🍖"}{" "}
                                    {item.name}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {item.category}
                                  </Badge>
                                </div>
                                {/* Raw material estimates */}
                                <div className="mt-2 bg-muted/50 rounded p-2">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                                    📦 Est. Raw Materials (for {guestCount}{" "}
                                    guests):
                                  </p>
                                  {getMaterialEstimate(
                                    item.name,
                                    guestCount,
                                  ).map((mat) => (
                                    <p
                                      key={mat.item}
                                      className="text-sm text-muted-foreground"
                                    >
                                      • {mat.item}:{" "}
                                      <strong>
                                        {mat.qty} {mat.unit}
                                      </strong>
                                    </p>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-6">
                          <UtensilsCrossed className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p>No menu items selected yet</p>
                          <p className="text-sm">
                            Standard menu will be served
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
              {confirmedBookings.length === 0 && (
                <Card>
                  <CardContent className="text-center py-16 text-muted-foreground text-lg">
                    No upcoming events to show
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* STOCK INVENTORY */}
          <TabsContent value="stock">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Stock Inventory
                </h2>
                {lowStockItems.length > 0 && (
                  <div className="flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-semibold">
                      {lowStockItems.length} items below minimum threshold
                    </span>
                  </div>
                )}
              </div>

              {stockLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <Card className="shadow-royal overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold text-base">
                            Item Name
                          </TableHead>
                          <TableHead className="font-semibold text-base">
                            Unit
                          </TableHead>
                          <TableHead className="font-semibold text-base">
                            Quantity on Hand
                          </TableHead>
                          <TableHead className="font-semibold text-base">
                            Minimum Required
                          </TableHead>
                          <TableHead className="font-semibold text-base">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stock.map((s) => {
                          const isLow = s.quantityOnHand <= s.minimumThreshold;
                          const isCritical =
                            s.quantityOnHand <= s.minimumThreshold / 2n;
                          return (
                            <TableRow
                              key={s.id.toString()}
                              className={
                                isCritical
                                  ? "bg-red-50"
                                  : isLow
                                    ? "bg-yellow-50"
                                    : ""
                              }
                            >
                              <TableCell className="font-semibold text-base">
                                {s.itemName}
                              </TableCell>
                              <TableCell className="text-base">
                                {s.unit}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`text-xl font-bold ${isCritical ? "text-red-600" : isLow ? "text-yellow-600" : "text-green-700"}`}
                                >
                                  {s.quantityOnHand.toString()}
                                </span>
                              </TableCell>
                              <TableCell className="text-base">
                                {s.minimumThreshold.toString()}
                              </TableCell>
                              <TableCell>
                                {isCritical ? (
                                  <Badge className="bg-red-100 text-red-700 text-sm">
                                    ⚠️ Critical
                                  </Badge>
                                ) : isLow ? (
                                  <Badge className="bg-yellow-100 text-yellow-700 text-sm">
                                    ⚡ Low
                                  </Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-700 text-sm">
                                    ✓ OK
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {stock.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-lg">
                      <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      No stock items found
                    </div>
                  )}
                </Card>
              )}

              {/* Record Stock Usage */}
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-lg text-maroon">
                    Record Stock Usage
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-base">Event / Booking</Label>
                      <Select
                        value={usageForm.bookingId}
                        onValueChange={(v) =>
                          setUsageForm((f) => ({ ...f, bookingId: v }))
                        }
                      >
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {confirmedBookings.map((b) => (
                            <SelectItem
                              key={b.id.toString()}
                              value={b.id.toString()}
                            >
                              #{b.id.toString()} - {b.customerName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base">Stock Item</Label>
                      <Select
                        value={usageForm.stockItemId}
                        onValueChange={(v) =>
                          setUsageForm((f) => ({ ...f, stockItemId: v }))
                        }
                      >
                        <SelectTrigger className="h-11 text-sm">
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {stock.map((s) => (
                            <SelectItem
                              key={s.id.toString()}
                              value={s.id.toString()}
                            >
                              {s.itemName} ({s.quantityOnHand.toString()}{" "}
                              {s.unit} left)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-base">Quantity Used</Label>
                      <Input
                        type="number"
                        className="h-11 text-base"
                        placeholder="e.g. 10"
                        value={usageForm.quantityUsed}
                        onChange={(e) =>
                          setUsageForm((f) => ({
                            ...f,
                            quantityUsed: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={handleRecordUsage}
                        disabled={recordStockUsage.isPending}
                        className="w-full h-11 bg-maroon text-white"
                      >
                        {recordStockUsage.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}
                        Record Usage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* REQUEST STOCK */}
          <TabsContent value="request">
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-maroon">
                Request Stock from Manager
              </h2>

              <Card className="shadow-royal">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-base font-semibold">
                          Item Name *
                        </Label>
                        <Input
                          className="h-12 text-base mt-1"
                          placeholder="e.g. Basmati Rice"
                          value={requestForm.itemName}
                          onChange={(e) =>
                            setRequestForm((f) => ({
                              ...f,
                              itemName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">
                          Quantity Needed *
                        </Label>
                        <Input
                          type="number"
                          className="h-12 text-base mt-1"
                          placeholder="e.g. 50"
                          value={requestForm.quantityRequested}
                          onChange={(e) =>
                            setRequestForm((f) => ({
                              ...f,
                              quantityRequested: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">
                        Reason for Request
                      </Label>
                      <Textarea
                        className="text-base mt-1 min-h-24"
                        placeholder="e.g. Running low for weekend wedding event, need restock urgently..."
                        value={requestForm.reason}
                        onChange={(e) =>
                          setRequestForm((f) => ({
                            ...f,
                            reason: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      onClick={handleSendRequest}
                      disabled={createStockRequest.isPending}
                      className="w-full h-14 bg-maroon text-white text-lg font-bold"
                    >
                      {createStockRequest.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                          Sending Request...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" /> Send Request to
                          Manager
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Request History */}
              <div>
                <h3 className="font-display text-xl text-maroon mb-4">
                  My Previous Requests
                </h3>
                <Card className="shadow-royal overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="text-base font-semibold">
                            Item
                          </TableHead>
                          <TableHead className="text-base font-semibold">
                            Qty
                          </TableHead>
                          <TableHead className="text-base font-semibold">
                            Reason
                          </TableHead>
                          <TableHead className="text-base font-semibold">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stockRequests.map((r) => (
                          <TableRow key={r.id.toString()}>
                            <TableCell className="font-semibold text-base">
                              {r.itemName}
                            </TableCell>
                            <TableCell className="text-base">
                              {r.quantityRequested.toString()}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {r.reason}
                            </TableCell>
                            <TableCell>
                              {r.status === "approved" ? (
                                <Badge className="bg-green-100 text-green-700 text-base py-1 px-3">
                                  <CheckCircle className="h-4 w-4 mr-1" />{" "}
                                  Approved
                                </Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-700 text-base py-1 px-3">
                                  <Clock className="h-4 w-4 mr-1" /> Pending
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {stockRequests.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-lg">
                      No requests sent yet
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper component for building icon
function Building({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <title>Building</title>
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}
