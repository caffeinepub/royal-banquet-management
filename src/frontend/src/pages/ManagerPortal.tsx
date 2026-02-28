import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
  BookOpen,
  Building,
  Check,
  ChevronDown,
  Eye,
  FileText,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Package,
  Phone,
  Plus,
  RefreshCw,
  ShoppingCart,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddBookingVendor,
  useApproveStockRequest,
  useConfirmBooking,
  useCreateChecklistItem,
  useCreateHall,
  useCreateInvoice,
  useCreateLead,
  useCreateVendor,
  useDeleteBooking,
  useDeleteLead,
  useGetAllBookings,
  useGetAllBranches,
  useGetAllChecklistItems,
  useGetAllHalls,
  useGetAllInvoices,
  useGetAllLeads,
  useGetAllMenuItems,
  useGetAllPayments,
  useGetAllStaff,
  useGetAllStockRequests,
  useGetAllVendors,
  useRecordPayment,
  useUpdateBooking,
  useUpdateChecklistItem,
  useUpdateHall,
  useUpdateLead,
} from "../hooks/useQueries";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700",
  new: "bg-purple-100 text-purple-700",
  contacted: "bg-orange-100 text-orange-700",
  visited: "bg-cyan-100 text-cyan-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

function formatDate(ts: bigint) {
  if (!ts) return "N/A";
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ManagerPortal() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: bookings = [], isLoading: bookingsLoading } =
    useGetAllBookings();
  const { data: halls = [], isLoading: hallsLoading } = useGetAllHalls();
  const { data: leads = [], isLoading: leadsLoading } = useGetAllLeads();
  const { data: vendors = [] } = useGetAllVendors();
  const { data: checklistItems = [] } = useGetAllChecklistItems();
  const { data: invoices = [] } = useGetAllInvoices();
  const { data: payments = [] } = useGetAllPayments();
  const { data: stockRequests = [], isLoading: requestsLoading } =
    useGetAllStockRequests();
  const { data: branches = [] } = useGetAllBranches();
  const { data: _menuItems = [] } = useGetAllMenuItems();
  const { data: _staff = [] } = useGetAllStaff();

  const confirmBooking = useConfirmBooking();
  const updateBooking = useUpdateBooking();
  const _deleteBooking = useDeleteBooking();
  const createHall = useCreateHall();
  const updateHall = useUpdateHall();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const _deleteLead = useDeleteLead();
  const createVendor = useCreateVendor();
  const addBookingVendor = useAddBookingVendor();
  const createChecklist = useCreateChecklistItem();
  const updateChecklist = useUpdateChecklistItem();
  const createInvoice = useCreateInvoice();
  const recordPayment = useRecordPayment();
  const approveRequest = useApproveStockRequest();

  const isLoggedIn = loginStatus === "success" && !!identity;
  const branchId = branches.length > 0 ? branches[0].id : 1n;

  // Form states
  const [newHallForm, setNewHallForm] = useState({
    name: "",
    capacity: "",
    availableSeats: "",
    description: "",
    pricePerHead: "",
  });
  const [newLeadForm, setNewLeadForm] = useState({
    name: "",
    phone: "",
    email: "",
    eventType: "",
    interestedHallId: "",
    visitDate: "",
    notes: "",
  });
  const [newVendorForm, setNewVendorForm] = useState({
    name: "",
    serviceType: "",
    phone: "",
    email: "",
  });
  const [checklistTask, setChecklistTask] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<bigint | null>(
    null,
  );
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [invoiceDesc, setInvoiceDesc] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentBookingId, setPaymentBookingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [vendorAssignBookingId, setVendorAssignBookingId] = useState("");
  const [vendorAssignVendorId, setVendorAssignVendorId] = useState("");

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <img
              src="/assets/generated/logo-transparent.dim_300x100.png"
              alt="Royal Banquet"
              className="h-12 mx-auto mb-4"
            />
          </div>
          <Card className="shadow-royal border-maroon/10">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-maroon flex items-center justify-center mx-auto mb-5">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-display text-2xl text-maroon mb-2">
                Manager Portal
              </h1>
              <p className="text-muted-foreground mb-7 text-base">
                Branch Manager access only. Please sign in to continue.
              </p>
              <Button
                onClick={login}
                disabled={loginStatus === "logging-in"}
                className="w-full bg-maroon text-white text-lg h-14 font-bold"
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

  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const confirmedBookings = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  const filteredBookings = bookings.filter(
    (b) =>
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      b.eventType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleConfirm = async (id: bigint) => {
    try {
      await confirmBooking.mutateAsync(id);
      toast.success("Booking confirmed!");
    } catch {
      toast.error("Failed to confirm booking");
    }
  };

  const handleCancel = async (booking: any) => {
    try {
      await updateBooking.mutateAsync({ ...booking, status: "cancelled" });
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const handleCreateHall = async () => {
    if (!newHallForm.name) return toast.error("Hall name required");
    try {
      await createHall.mutateAsync({
        branchId,
        name: newHallForm.name,
        capacity: BigInt(newHallForm.capacity || "100"),
        availableSeats: BigInt(
          newHallForm.availableSeats || newHallForm.capacity || "100",
        ),
        description: newHallForm.description,
        pricePerHead: BigInt(newHallForm.pricePerHead || "500"),
      });
      setNewHallForm({
        name: "",
        capacity: "",
        availableSeats: "",
        description: "",
        pricePerHead: "",
      });
      toast.success("Hall created!");
    } catch {
      toast.error("Failed to create hall");
    }
  };

  const handleCreateLead = async () => {
    if (!newLeadForm.name || !newLeadForm.phone)
      return toast.error("Name and phone required");
    try {
      await createLead.mutateAsync({
        name: newLeadForm.name,
        phone: newLeadForm.phone,
        email: newLeadForm.email,
        eventType: newLeadForm.eventType || "wedding",
        interestedHallId: BigInt(
          newLeadForm.interestedHallId || (halls[0]?.id ?? 1),
        ),
        visitDate:
          BigInt(new Date(newLeadForm.visitDate || Date.now()).getTime()) *
          1_000_000n,
        notes: newLeadForm.notes,
        assignedTo: 0n,
      });
      setNewLeadForm({
        name: "",
        phone: "",
        email: "",
        eventType: "",
        interestedHallId: "",
        visitDate: "",
        notes: "",
      });
      toast.success("Lead added!");
    } catch {
      toast.error("Failed to create lead");
    }
  };

  const handleUpdateLeadStatus = async (lead: any, status: string) => {
    try {
      await updateLead.mutateAsync({ ...lead, status });
      toast.success("Lead status updated");
    } catch {
      toast.error("Failed to update lead");
    }
  };

  const handleCreateVendor = async () => {
    if (!newVendorForm.name) return toast.error("Vendor name required");
    try {
      await createVendor.mutateAsync({ ...newVendorForm, branchId });
      setNewVendorForm({ name: "", serviceType: "", phone: "", email: "" });
      toast.success("Vendor added!");
    } catch {
      toast.error("Failed to create vendor");
    }
  };

  const handleAssignVendor = async () => {
    if (!vendorAssignBookingId || !vendorAssignVendorId)
      return toast.error("Select booking and vendor");
    try {
      await addBookingVendor.mutateAsync({
        bookingId: BigInt(vendorAssignBookingId),
        vendorId: BigInt(vendorAssignVendorId),
      });
      toast.success("Vendor assigned to booking!");
    } catch {
      toast.error("Failed to assign vendor");
    }
  };

  const handleCreateChecklist = async () => {
    if (!checklistTask || !selectedBookingId)
      return toast.error("Select a booking and enter task");
    try {
      await createChecklist.mutateAsync({
        bookingId: selectedBookingId,
        task: checklistTask,
        assignedTo: 0n,
      });
      setChecklistTask("");
      toast.success("Checklist item added!");
    } catch {
      toast.error("Failed to add checklist item");
    }
  };

  const handleCreateInvoice = async () => {
    if (!selectedBookingId || !invoiceAmount)
      return toast.error("Select a booking and enter amount");
    try {
      await createInvoice.mutateAsync({
        bookingId: selectedBookingId,
        items: [
          {
            description: invoiceDesc || "Event charges",
            amount: BigInt(invoiceAmount),
          },
        ],
        totalAmount: BigInt(invoiceAmount),
      });
      setInvoiceAmount("");
      setInvoiceDesc("");
      toast.success("Invoice generated!");
    } catch {
      toast.error("Failed to generate invoice");
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentBookingId || !paymentAmount)
      return toast.error("Fill booking ID and amount");
    try {
      await recordPayment.mutateAsync({
        bookingId: BigInt(paymentBookingId),
        amount: BigInt(paymentAmount),
        paymentType: "advance",
        method: paymentMethod,
        notes: "",
      });
      setPaymentAmount("");
      setPaymentBookingId("");
      toast.success("Payment recorded!");
    } catch {
      toast.error("Failed to record payment");
    }
  };

  const handleApproveRequest = async (id: bigint) => {
    try {
      await approveRequest.mutateAsync(id);
      toast.success("Stock request approved!");
    } catch {
      toast.error("Failed to approve request");
    }
  };

  const bookingChecklistItems = (bookingId: bigint) =>
    checklistItems.filter((c) => c.bookingId === bookingId);

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
              Manager Portal
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/70 text-sm hidden sm:block">
              {identity?.getPrincipal().toString().slice(0, 12)}...
            </span>
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

      <div className="max-w-7xl mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Horizontally scrollable tab bar */}
          <div className="overflow-x-auto -mx-4 px-4 mb-5">
            <TabsList className="flex h-auto w-max gap-1 bg-muted p-1 rounded-xl min-w-full sm:min-w-0">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "bookings", label: "Bookings", icon: BookOpen },
                { id: "leads", label: "Leads", icon: Users },
                { id: "halls", label: "Halls", icon: Building },
                { id: "vendors", label: "Vendors", icon: UserCheck },
                { id: "invoices", label: "Invoices", icon: FileText },
                { id: "requests", label: "Requests", icon: Package },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 text-sm py-2 px-3 whitespace-nowrap data-[state=active]:bg-maroon data-[state=active]:text-white shrink-0"
                >
                  <tab.icon className="h-4 w-4 shrink-0" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* DASHBOARD */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Total Bookings",
                  value: bookings.length,
                  color: "text-maroon",
                },
                {
                  label: "Confirmed",
                  value: confirmedBookings,
                  color: "text-green-700",
                },
                {
                  label: "Pending",
                  value: pendingBookings,
                  color: "text-yellow-700",
                },
                {
                  label: "Total Revenue",
                  value: `₹${totalRevenue.toLocaleString("en-IN")}`,
                  color: "text-blue-700",
                },
              ].map((stat) => (
                <Card key={stat.label} className="shadow-royal">
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p
                      className={`text-3xl font-display font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-maroon">
                    Recent Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookings.slice(0, 5).map((b) => (
                    <div
                      key={b.id.toString()}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <p className="font-semibold">{b.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {b.eventType} — {formatDate(b.eventDate)}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[b.status] || ""}>
                        {b.status}
                      </Badge>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <p className="text-muted-foreground text-center py-6">
                      No bookings yet
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-royal">
                <CardHeader>
                  <CardTitle className="font-display text-maroon">
                    Pending Staff Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stockRequests
                    .filter((r) => r.status === "pending")
                    .slice(0, 5)
                    .map((r) => (
                      <div
                        key={r.id.toString()}
                        className="flex items-center justify-between py-3 border-b last:border-0"
                      >
                        <div>
                          <p className="font-semibold">{r.itemName}</p>
                          <p className="text-sm text-muted-foreground">
                            Qty: {r.quantityRequested.toString()} — {r.reason}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 text-white hover:bg-green-700"
                          onClick={() => handleApproveRequest(r.id)}
                          disabled={approveRequest.isPending}
                        >
                          <Check className="h-3 w-3 mr-1" /> Approve
                        </Button>
                      </div>
                    ))}
                  {stockRequests.filter((r) => r.status === "pending")
                    .length === 0 && (
                    <p className="text-muted-foreground text-center py-6">
                      No pending requests
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* BOOKINGS */}
          <TabsContent value="bookings">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  All Bookings
                </h2>
                <Input
                  placeholder="Search by name, phone, event..."
                  className="max-w-xs h-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {bookingsLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((b) => (
                    <Card
                      key={b.id.toString()}
                      className="shadow-royal overflow-hidden"
                    >
                      <CardContent className="p-0">
                        <div className="bg-muted/40 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="font-display text-lg font-semibold text-maroon">
                              #{b.id.toString()}
                            </span>
                            <Badge className={STATUS_COLORS[b.status] || ""}>
                              {b.status}
                            </Badge>
                            <Badge variant="outline">
                              {b.paymentStatus.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {b.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                                onClick={() => handleConfirm(b.id)}
                                disabled={confirmBooking.isPending}
                              >
                                <Check className="h-3 w-3 mr-1" /> Confirm
                              </Button>
                            )}
                            {b.status !== "cancelled" &&
                              b.status !== "completed" && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleCancel(b)}
                                  disabled={updateBooking.isPending}
                                >
                                  <X className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                              )}
                          </div>
                        </div>
                        <div className="p-5 grid sm:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Customer
                            </p>
                            <p className="font-semibold text-base">
                              {b.customerName}
                            </p>
                            <p className="text-sm flex items-center gap-1 mt-1">
                              <Phone className="h-3 w-3" />
                              {b.customerPhone}
                            </p>
                            {b.customerEmail && (
                              <p className="text-sm flex items-center gap-1 mt-1">
                                <Mail className="h-3 w-3" />
                                {b.customerEmail}
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Event Details
                            </p>
                            <p className="font-semibold capitalize">
                              {b.eventType}
                            </p>
                            <p className="text-sm">{formatDate(b.eventDate)}</p>
                            <p className="text-sm">
                              {b.guestCount.toString()} guests
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Financial
                            </p>
                            {b.quotationAmount > 0n && (
                              <p className="text-sm">
                                Quotation:{" "}
                                <strong>₹{b.quotationAmount.toString()}</strong>
                              </p>
                            )}
                            {b.advancePaid > 0n && (
                              <p className="text-sm">
                                Advance:{" "}
                                <strong>₹{b.advancePaid.toString()}</strong>
                              </p>
                            )}
                            {b.notes && (
                              <p className="text-sm text-muted-foreground mt-1 italic">
                                "{b.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Checklist for this booking */}
                        <div className="px-5 pb-5 border-t">
                          <p className="text-sm font-semibold text-muted-foreground mt-3 mb-2">
                            Event Checklist
                          </p>
                          <div className="space-y-1">
                            {bookingChecklistItems(b.id).map((ci) => (
                              <div
                                key={ci.id.toString()}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={ci.isDone}
                                  onCheckedChange={(checked) =>
                                    updateChecklist.mutateAsync({
                                      id: ci.id,
                                      task: ci.task,
                                      isDone: !!checked,
                                      assignedTo: ci.assignedTo,
                                    })
                                  }
                                />
                                <span
                                  className={`text-sm ${ci.isDone ? "line-through text-muted-foreground" : ""}`}
                                >
                                  {ci.task}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Input
                              placeholder="Add checklist task..."
                              className="h-8 text-sm"
                              onFocus={() => setSelectedBookingId(b.id)}
                              value={
                                selectedBookingId === b.id ? checklistTask : ""
                              }
                              onChange={(e) => {
                                setSelectedBookingId(b.id);
                                setChecklistTask(e.target.value);
                              }}
                            />
                            <Button
                              size="sm"
                              onClick={handleCreateChecklist}
                              disabled={
                                createChecklist.isPending ||
                                selectedBookingId !== b.id
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredBookings.length === 0 && (
                    <Card>
                      <CardContent className="text-center py-12 text-muted-foreground text-lg">
                        No bookings found
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* LEADS */}
          <TabsContent value="leads">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Leads & Enquiries
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-maroon text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl text-maroon">
                        New Lead
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Name *</Label>
                          <Input
                            value={newLeadForm.name}
                            onChange={(e) =>
                              setNewLeadForm((f) => ({
                                ...f,
                                name: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={newLeadForm.phone}
                            onChange={(e) =>
                              setNewLeadForm((f) => ({
                                ...f,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={newLeadForm.email}
                          onChange={(e) =>
                            setNewLeadForm((f) => ({
                              ...f,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Event Type</Label>
                          <Select
                            value={newLeadForm.eventType}
                            onValueChange={(v) =>
                              setNewLeadForm((f) => ({ ...f, eventType: v }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "wedding",
                                "reception",
                                "birthday",
                                "corporate",
                                "social",
                              ].map((e) => (
                                <SelectItem
                                  key={e}
                                  value={e}
                                  className="capitalize"
                                >
                                  {e}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Interested Hall</Label>
                          <Select
                            value={newLeadForm.interestedHallId}
                            onValueChange={(v) =>
                              setNewLeadForm((f) => ({
                                ...f,
                                interestedHallId: v,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {halls.map((h) => (
                                <SelectItem
                                  key={h.id.toString()}
                                  value={h.id.toString()}
                                >
                                  {h.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>Visit Date</Label>
                        <Input
                          type="date"
                          value={newLeadForm.visitDate}
                          onChange={(e) =>
                            setNewLeadForm((f) => ({
                              ...f,
                              visitDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          value={newLeadForm.notes}
                          onChange={(e) =>
                            setNewLeadForm((f) => ({
                              ...f,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        onClick={handleCreateLead}
                        className="w-full bg-maroon text-white"
                        disabled={createLead.isPending}
                      >
                        {createLead.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : null}{" "}
                        Add Lead
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {leadsLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : leads.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    No leads yet. Add your first lead!
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Desktop table */}
                  <Card className="shadow-royal overflow-hidden hidden sm:block">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                              Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Phone
                            </TableHead>
                            <TableHead className="font-semibold">
                              Event Type
                            </TableHead>
                            <TableHead className="font-semibold">
                              Visit Date
                            </TableHead>
                            <TableHead className="font-semibold">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leads.map((lead) => (
                            <TableRow key={lead.id.toString()}>
                              <TableCell>
                                <div>
                                  <p className="font-semibold">{lead.name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {lead.email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{lead.phone}</TableCell>
                              <TableCell className="capitalize">
                                {lead.eventType}
                              </TableCell>
                              <TableCell>
                                {formatDate(lead.visitDate)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={STATUS_COLORS[lead.status] || ""}
                                >
                                  {lead.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Select
                                  value={lead.status}
                                  onValueChange={(v) =>
                                    handleUpdateLeadStatus(lead, v)
                                  }
                                >
                                  <SelectTrigger className="h-8 w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[
                                      "new",
                                      "contacted",
                                      "visited",
                                      "converted",
                                      "lost",
                                    ].map((s) => (
                                      <SelectItem
                                        key={s}
                                        value={s}
                                        className="capitalize"
                                      >
                                        {s}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                  {/* Mobile card view */}
                  <div className="space-y-3 sm:hidden">
                    {leads.map((lead) => (
                      <Card key={lead.id.toString()} className="shadow-royal">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="font-semibold text-base">
                                {lead.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {lead.email}
                              </p>
                              <p className="text-sm flex items-center gap-1 mt-1">
                                <Phone className="h-3 w-3" /> {lead.phone}
                              </p>
                            </div>
                            <Badge className={STATUS_COLORS[lead.status] || ""}>
                              {lead.status}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <div className="text-sm text-muted-foreground">
                              <span className="capitalize">
                                {lead.eventType}
                              </span>{" "}
                              · {formatDate(lead.visitDate)}
                            </div>
                            <Select
                              value={lead.status}
                              onValueChange={(v) =>
                                handleUpdateLeadStatus(lead, v)
                              }
                            >
                              <SelectTrigger className="h-9 w-28 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[
                                  "new",
                                  "contacted",
                                  "visited",
                                  "converted",
                                  "lost",
                                ].map((s) => (
                                  <SelectItem
                                    key={s}
                                    value={s}
                                    className="capitalize"
                                  >
                                    {s}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* HALLS */}
          <TabsContent value="halls">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Hall Management
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-maroon text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add Hall
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl text-maroon">
                        Add New Hall
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Hall Name *</Label>
                        <Input
                          value={newHallForm.name}
                          onChange={(e) =>
                            setNewHallForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Total Capacity</Label>
                          <Input
                            type="number"
                            value={newHallForm.capacity}
                            onChange={(e) =>
                              setNewHallForm((f) => ({
                                ...f,
                                capacity: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Available Seats</Label>
                          <Input
                            type="number"
                            value={newHallForm.availableSeats}
                            onChange={(e) =>
                              setNewHallForm((f) => ({
                                ...f,
                                availableSeats: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Price Per Head (₹)</Label>
                        <Input
                          type="number"
                          value={newHallForm.pricePerHead}
                          onChange={(e) =>
                            setNewHallForm((f) => ({
                              ...f,
                              pricePerHead: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newHallForm.description}
                          onChange={(e) =>
                            setNewHallForm((f) => ({
                              ...f,
                              description: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button
                        onClick={handleCreateHall}
                        className="w-full bg-maroon text-white"
                        disabled={createHall.isPending}
                      >
                        Create Hall
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {hallsLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {halls.map((hall) => {
                    const hallBookings = bookings.filter(
                      (b) => b.hallId === hall.id && b.status !== "cancelled",
                    );
                    const occupancyPct =
                      hall.capacity > 0n
                        ? Math.round(
                            (Number(hall.capacity - hall.availableSeats) /
                              Number(hall.capacity)) *
                              100,
                          )
                        : 0;
                    return (
                      <Card key={hall.id.toString()} className="shadow-royal">
                        <CardContent className="p-5">
                          <h3 className="font-display text-xl font-semibold text-maroon mb-3">
                            {hall.name}
                          </h3>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-muted rounded-lg p-3 text-center">
                              <p className="text-2xl font-bold text-maroon">
                                {hall.capacity.toString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Total Capacity
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-3 text-center">
                              <p
                                className={`text-2xl font-bold ${hall.availableSeats < 20n ? "text-red-600" : "text-green-600"}`}
                              >
                                {hall.availableSeats.toString()}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Available Seats
                              </p>
                            </div>
                          </div>
                          <div className="mb-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Occupancy</span>
                              <span>{occupancyPct}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${occupancyPct > 80 ? "bg-red-500" : occupancyPct > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                                style={{ width: `${occupancyPct}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Price/head
                            </span>
                            <span className="font-bold text-maroon">
                              ₹{hall.pricePerHead.toString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {hallBookings.length} active bookings
                          </p>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-3 w-full border-maroon text-maroon hover:bg-maroon hover:text-white"
                              >
                                Edit Seats
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>
                                  Update Hall: {hall.name}
                                </DialogTitle>
                              </DialogHeader>
                              <EditHallForm
                                hall={hall}
                                onSave={async (seats) => {
                                  await updateHall.mutateAsync({
                                    ...hall,
                                    availableSeats: BigInt(seats),
                                  });
                                  toast.success("Hall updated!");
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* VENDORS */}
          <TabsContent value="vendors">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl text-maroon">
                  Vendor Management
                </h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-maroon text-white">
                      <Plus className="h-4 w-4 mr-2" /> Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display text-xl text-maroon">
                        Add New Vendor
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-3">
                      <div>
                        <Label>Vendor Name *</Label>
                        <Input
                          value={newVendorForm.name}
                          onChange={(e) =>
                            setNewVendorForm((f) => ({
                              ...f,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label>Service Type</Label>
                        <Input
                          placeholder="e.g. Decorator, Photographer"
                          value={newVendorForm.serviceType}
                          onChange={(e) =>
                            setNewVendorForm((f) => ({
                              ...f,
                              serviceType: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Phone</Label>
                          <Input
                            value={newVendorForm.phone}
                            onChange={(e) =>
                              setNewVendorForm((f) => ({
                                ...f,
                                phone: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            value={newVendorForm.email}
                            onChange={(e) =>
                              setNewVendorForm((f) => ({
                                ...f,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handleCreateVendor}
                        className="w-full bg-maroon text-white"
                        disabled={createVendor.isPending}
                      >
                        Add Vendor
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="shadow-royal">
                <CardContent className="p-5">
                  <h3 className="font-semibold text-maroon mb-4">
                    Assign Vendor to Booking
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Select
                      value={vendorAssignBookingId}
                      onValueChange={setVendorAssignBookingId}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Select Booking" />
                      </SelectTrigger>
                      <SelectContent>
                        {bookings.map((b) => (
                          <SelectItem
                            key={b.id.toString()}
                            value={b.id.toString()}
                          >
                            #{b.id.toString()} - {b.customerName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={vendorAssignVendorId}
                      onValueChange={setVendorAssignVendorId}
                    >
                      <SelectTrigger className="w-52">
                        <SelectValue placeholder="Select Vendor" />
                      </SelectTrigger>
                      <SelectContent>
                        {vendors.map((v) => (
                          <SelectItem
                            key={v.id.toString()}
                            value={v.id.toString()}
                          >
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={handleAssignVendor}
                      className="bg-maroon text-white"
                      disabled={addBookingVendor.isPending}
                    >
                      Assign
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-royal overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Vendor Name</TableHead>
                        <TableHead>Service Type</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((v) => (
                        <TableRow key={v.id.toString()}>
                          <TableCell className="font-semibold">
                            {v.name}
                          </TableCell>
                          <TableCell>{v.serviceType}</TableCell>
                          <TableCell>{v.phone}</TableCell>
                          <TableCell>{v.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {vendors.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    No vendors added yet
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* INVOICES & PAYMENTS */}
          <TabsContent value="invoices">
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-maroon">
                Invoices & Payments
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="shadow-royal">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-maroon">
                      Generate Invoice
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Select Booking</Label>
                      <Select
                        value={selectedBookingId?.toString()}
                        onValueChange={(v) => setSelectedBookingId(BigInt(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a booking" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookings.map((b) => (
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
                      <Label>Description</Label>
                      <Input
                        placeholder="Event charges"
                        value={invoiceDesc}
                        onChange={(e) => setInvoiceDesc(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Total Amount (₹)</Label>
                      <Input
                        type="number"
                        value={invoiceAmount}
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      onClick={handleCreateInvoice}
                      className="w-full bg-maroon text-white"
                      disabled={createInvoice.isPending}
                    >
                      Generate Invoice
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-royal">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-maroon">
                      Record Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label>Booking ID</Label>
                      <Input
                        placeholder="Enter booking ID"
                        value={paymentBookingId}
                        onChange={(e) => setPaymentBookingId(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Amount (₹)</Label>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <Select
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            "cash",
                            "bank_transfer",
                            "upi",
                            "card",
                            "cheque",
                          ].map((m) => (
                            <SelectItem
                              key={m}
                              value={m}
                              className="capitalize"
                            >
                              {m.replace("_", " ")}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleRecordPayment}
                      className="w-full bg-maroon text-white"
                      disabled={recordPayment.isPending}
                    >
                      Record Payment
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <Card className="shadow-royal overflow-hidden">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-maroon">
                      All Invoices
                    </CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Invoice #</TableHead>
                          <TableHead>Booking</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoices.map((inv) => (
                          <TableRow key={inv.id.toString()}>
                            <TableCell>#{inv.id.toString()}</TableCell>
                            <TableCell>
                              Booking #{inv.bookingId.toString()}
                            </TableCell>
                            <TableCell className="font-bold">
                              ₹{inv.totalAmount.toString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  inv.isPaid
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                              >
                                {inv.isPaid ? "Paid" : "Pending"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {invoices.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      No invoices yet
                    </div>
                  )}
                </Card>

                <Card className="shadow-royal overflow-hidden">
                  <CardHeader>
                    <CardTitle className="font-display text-lg text-maroon">
                      Payment History
                    </CardTitle>
                  </CardHeader>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead>Booking</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id.toString()}>
                            <TableCell>#{p.bookingId.toString()}</TableCell>
                            <TableCell className="font-bold">
                              ₹{p.amount.toString()}
                            </TableCell>
                            <TableCell className="capitalize">
                              {p.method.replace("_", " ")}
                            </TableCell>
                            <TableCell>{formatDate(p.paymentDate)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {payments.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      No payments recorded
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* STAFF REQUESTS */}
          <TabsContent value="requests">
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-maroon">
                Stock Requests from Operations Staff
              </h2>
              {requestsLoading ? (
                <Skeleton className="h-64 rounded-xl" />
              ) : stockRequests.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    No stock requests yet. Staff will send requests when they
                    need supplies.
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Desktop table */}
                  <Card className="shadow-royal overflow-hidden hidden sm:block">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="font-semibold">
                              Item Name
                            </TableHead>
                            <TableHead className="font-semibold">
                              Qty Requested
                            </TableHead>
                            <TableHead className="font-semibold">
                              Reason
                            </TableHead>
                            <TableHead className="font-semibold">
                              Date
                            </TableHead>
                            <TableHead className="font-semibold">
                              Status
                            </TableHead>
                            <TableHead className="font-semibold">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stockRequests.map((r) => (
                            <TableRow key={r.id.toString()}>
                              <TableCell className="font-semibold">
                                {r.itemName}
                              </TableCell>
                              <TableCell>
                                {r.quantityRequested.toString()}
                              </TableCell>
                              <TableCell>{r.reason}</TableCell>
                              <TableCell>{formatDate(r.createdAt)}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    r.status === "approved"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {r.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {r.status === "pending" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    onClick={() => handleApproveRequest(r.id)}
                                    disabled={approveRequest.isPending}
                                  >
                                    <Check className="h-3 w-3 mr-1" /> Approve
                                  </Button>
                                )}
                                {r.status === "approved" && (
                                  <span className="text-green-600 font-medium text-sm">
                                    ✓ Approved
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </Card>
                  {/* Mobile card view */}
                  <div className="space-y-3 sm:hidden">
                    {stockRequests.map((r) => (
                      <Card key={r.id.toString()} className="shadow-royal">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-base">
                                {r.itemName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {r.quantityRequested.toString()}
                              </p>
                            </div>
                            <Badge
                              className={
                                r.status === "approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {r.status}
                            </Badge>
                          </div>
                          {r.reason && (
                            <p className="text-sm text-muted-foreground mb-3 italic">
                              "{r.reason}"
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(r.createdAt)}
                            </span>
                            {r.status === "pending" && (
                              <Button
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700 h-9"
                                onClick={() => handleApproveRequest(r.id)}
                                disabled={approveRequest.isPending}
                              >
                                <Check className="h-3 w-3 mr-1" /> Approve
                              </Button>
                            )}
                            {r.status === "approved" && (
                              <span className="text-green-600 font-medium text-sm">
                                ✓ Approved
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function EditHallForm({
  hall,
  onSave,
}: { hall: any; onSave: (seats: string) => void }) {
  const [seats, setSeats] = useState(hall.availableSeats.toString());
  return (
    <div className="space-y-3 mt-3">
      <div>
        <Label>
          Available Seats (Current: {hall.availableSeats.toString()})
        </Label>
        <Input
          type="number"
          value={seats}
          onChange={(e) => setSeats(e.target.value)}
        />
      </div>
      <Button
        onClick={() => onSave(seats)}
        className="w-full bg-maroon text-white"
      >
        Save Changes
      </Button>
    </div>
  );
}
