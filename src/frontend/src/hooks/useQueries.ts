import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Booking,
  Branch,
  ChecklistItem,
  Feedback,
  Hall,
  Invoice,
  InvoiceItem,
  Lead,
  MenuCategory,
  MenuItem,
  Payment,
  Staff,
  Stock,
  StockRequest,
  StockUsage,
  UserProfile,
  Vendor,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Branches ────────────────────────────────────────────────────────────────
export function useGetAllBranches() {
  const { actor, isFetching } = useActor();
  return useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBranches();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBranch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: {
      name: string;
      location: string;
      managerName: string;
      phone: string;
    }) => {
      return actor!.createBranch(b.name, b.location, b.managerName, b.phone);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
}

export function useUpdateBranch() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: {
      id: bigint;
      name: string;
      location: string;
      managerName: string;
      phone: string;
    }) => {
      return actor!.updateBranch(
        b.id,
        b.name,
        b.location,
        b.managerName,
        b.phone,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["branches"] }),
  });
}

// ── Halls ─────────────────────────────────────────────────────────────────
export function useGetAllHalls() {
  const { actor, isFetching } = useActor();
  return useQuery<Hall[]>({
    queryKey: ["halls"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllHalls();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateHall() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      branchId: bigint;
      name: string;
      capacity: bigint;
      availableSeats: bigint;
      description: string;
      pricePerHead: bigint;
    }) => {
      return actor!.createHall(
        h.branchId,
        h.name,
        h.capacity,
        h.availableSeats,
        h.description,
        h.pricePerHead,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["halls"] }),
  });
}

export function useUpdateHall() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (h: {
      id: bigint;
      branchId: bigint;
      name: string;
      capacity: bigint;
      availableSeats: bigint;
      description: string;
      pricePerHead: bigint;
    }) => {
      return actor!.updateHall(
        h.id,
        h.branchId,
        h.name,
        h.capacity,
        h.availableSeats,
        h.description,
        h.pricePerHead,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["halls"] }),
  });
}

// ── Menu ─────────────────────────────────────────────────────────────────
export function useGetAllMenuItems() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ["menuItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllMenuCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuCategory[]>({
    queryKey: ["menuCategories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMenuCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: {
      category: string;
      name: string;
      description: string;
      price: bigint;
      isVegetarian: boolean;
    }) => {
      return actor!.createMenuItem(
        m.category,
        m.name,
        m.description,
        m.price,
        m.isVegetarian,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menuItems"] }),
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (m: {
      id: bigint;
      category: string;
      name: string;
      description: string;
      price: bigint;
      isVegetarian: boolean;
    }) => {
      return actor!.updateMenuItem(
        m.id,
        m.category,
        m.name,
        m.description,
        m.price,
        m.isVegetarian,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menuItems"] }),
  });
}

// ── Bookings ──────────────────────────────────────────────────────────────
export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: {
      customerName: string;
      customerPhone: string;
      customerEmail: string;
      eventType: string;
      hallId: bigint;
      branchId: bigint;
      eventDate: bigint;
      guestCount: bigint;
      menuSelections: bigint[];
      notes: string;
    }) => {
      return actor!.createBooking(
        b.customerName,
        b.customerPhone,
        b.customerEmail,
        b.eventType,
        b.hallId,
        b.branchId,
        b.eventDate,
        b.guestCount,
        b.menuSelections,
        b.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useConfirmBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => actor!.confirmBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useUpdateBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (b: {
      id: bigint;
      customerName: string;
      customerPhone: string;
      customerEmail: string;
      eventType: string;
      hallId: bigint;
      branchId: bigint;
      eventDate: bigint;
      guestCount: bigint;
      menuSelections: bigint[];
      status: string;
      paymentStatus: string;
      quotationAmount: bigint;
      advancePaid: bigint;
      balanceDue: bigint;
      notes: string;
    }) => {
      return actor!.updateBooking(
        b.id,
        b.customerName,
        b.customerPhone,
        b.customerEmail,
        b.eventType,
        b.hallId,
        b.branchId,
        b.eventDate,
        b.guestCount,
        b.menuSelections,
        b.status,
        b.paymentStatus,
        b.quotationAmount,
        b.advancePaid,
        b.balanceDue,
        b.notes,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useDeleteBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => actor!.deleteBooking(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

// ── Leads ─────────────────────────────────────────────────────────────────
export function useGetAllLeads() {
  const { actor, isFetching } = useActor();
  return useQuery<Lead[]>({
    queryKey: ["leads"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllLeads();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (l: {
      name: string;
      phone: string;
      email: string;
      eventType: string;
      interestedHallId: bigint;
      visitDate: bigint;
      notes: string;
      assignedTo: bigint;
    }) => {
      return actor!.createLead(
        l.name,
        l.phone,
        l.email,
        l.eventType,
        l.interestedHallId,
        l.visitDate,
        l.notes,
        l.assignedTo,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (l: {
      id: bigint;
      name: string;
      phone: string;
      email: string;
      eventType: string;
      interestedHallId: bigint;
      visitDate: bigint;
      status: string;
      notes: string;
      assignedTo: bigint;
    }) => {
      return actor!.updateLead(
        l.id,
        l.name,
        l.phone,
        l.email,
        l.eventType,
        l.interestedHallId,
        l.visitDate,
        l.status,
        l.notes,
        l.assignedTo,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => actor!.deleteLead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

// ── Vendors ────────────────────────────────────────────────────────────────
export function useGetAllVendors() {
  const { actor, isFetching } = useActor();
  return useQuery<Vendor[]>({
    queryKey: ["vendors"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVendors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateVendor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      name: string;
      serviceType: string;
      phone: string;
      email: string;
      branchId: bigint;
    }) => {
      return actor!.createVendor(
        v.name,
        v.serviceType,
        v.phone,
        v.email,
        v.branchId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useUpdateVendor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      id: bigint;
      name: string;
      serviceType: string;
      phone: string;
      email: string;
      branchId: bigint;
    }) => {
      return actor!.updateVendor(
        v.id,
        v.name,
        v.serviceType,
        v.phone,
        v.email,
        v.branchId,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vendors"] }),
  });
}

export function useAddBookingVendor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bookingId,
      vendorId,
    }: { bookingId: bigint; vendorId: bigint }) => {
      return actor!.addBookingVendor(bookingId, vendorId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookingVendors"] }),
  });
}

// ── Checklist ──────────────────────────────────────────────────────────────
export function useGetAllChecklistItems() {
  const { actor, isFetching } = useActor();
  return useQuery<ChecklistItem[]>({
    queryKey: ["checklistItems"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllChecklistItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateChecklistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: {
      bookingId: bigint;
      task: string;
      assignedTo: bigint;
    }) => {
      return actor!.createChecklistItem(c.bookingId, c.task, c.assignedTo);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklistItems"] }),
  });
}

export function useUpdateChecklistItem() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: {
      id: bigint;
      task: string;
      isDone: boolean;
      assignedTo: bigint;
    }) => {
      return actor!.updateChecklistItem(c.id, c.task, c.isDone, c.assignedTo);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["checklistItems"] }),
  });
}

// ── Invoices & Payments ───────────────────────────────────────────────────
export function useGetAllInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery<Invoice[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllInvoices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inv: {
      bookingId: bigint;
      items: InvoiceItem[];
      totalAmount: bigint;
    }) => {
      return actor!.createInvoice(inv.bookingId, inv.items, inv.totalAmount);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useGetAllPayments() {
  const { actor, isFetching } = useActor();
  return useQuery<Payment[]>({
    queryKey: ["payments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPayments();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordPayment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: {
      bookingId: bigint;
      amount: bigint;
      paymentType: string;
      method: string;
      notes: string;
    }) => {
      return actor!.recordPayment(
        p.bookingId,
        p.amount,
        p.paymentType,
        p.method,
        p.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}

// ── Stock ──────────────────────────────────────────────────────────────────
export function useGetAllStock() {
  const { actor, isFetching } = useActor();
  return useQuery<Stock[]>({
    queryKey: ["stock"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStock();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStock() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: {
      branchId: bigint;
      itemName: string;
      unit: string;
      quantityOnHand: bigint;
      minimumThreshold: bigint;
    }) => {
      return actor!.createStock(
        s.branchId,
        s.itemName,
        s.unit,
        s.quantityOnHand,
        s.minimumThreshold,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stock"] }),
  });
}

export function useUpdateStock() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: {
      id: bigint;
      branchId: bigint;
      itemName: string;
      unit: string;
      quantityOnHand: bigint;
      minimumThreshold: bigint;
    }) => {
      return actor!.updateStock(
        s.id,
        s.branchId,
        s.itemName,
        s.unit,
        s.quantityOnHand,
        s.minimumThreshold,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stock"] }),
  });
}

export function useRecordStockUsage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (u: {
      bookingId: bigint;
      stockItemId: bigint;
      quantityUsed: bigint;
    }) => {
      return actor!.recordStockUsage(
        u.bookingId,
        u.stockItemId,
        u.quantityUsed,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stock"] });
      qc.invalidateQueries({ queryKey: ["stockUsage"] });
    },
  });
}

export function useGetAllStockUsage() {
  const { actor, isFetching } = useActor();
  return useQuery<StockUsage[]>({
    queryKey: ["stockUsage"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStockUsage();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Stock Requests ─────────────────────────────────────────────────────────
export function useGetAllStockRequests() {
  const { actor, isFetching } = useActor();
  return useQuery<StockRequest[]>({
    queryKey: ["stockRequests"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStockRequests();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStockRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: {
      branchId: bigint;
      requestedBy: bigint;
      itemName: string;
      quantityRequested: bigint;
      reason: string;
    }) => {
      return actor!.createStockRequest(
        r.branchId,
        r.requestedBy,
        r.itemName,
        r.quantityRequested,
        r.reason,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockRequests"] }),
  });
}

export function useApproveStockRequest() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => actor!.approveStockRequest(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["stockRequests"] }),
  });
}

// ── Staff ──────────────────────────────────────────────────────────────────
export function useGetAllStaff() {
  const { actor, isFetching } = useActor();
  return useQuery<Staff[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllStaff();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: {
      name: string;
      role: string;
      branchId: bigint;
      phone: string;
      email: string;
    }) => {
      return actor!.createStaff(s.name, s.role, s.branchId, s.phone, s.email);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useUpdateStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: {
      id: bigint;
      name: string;
      role: string;
      branchId: bigint;
      phone: string;
      email: string;
      isActive: boolean;
    }) => {
      return actor!.updateStaff(
        s.id,
        s.name,
        s.role,
        s.branchId,
        s.phone,
        s.email,
        s.isActive,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

export function useDeleteStaff() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => actor!.deleteStaff(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["staff"] }),
  });
}

// ── Feedback ──────────────────────────────────────────────────────────────
export function useGetAllFeedback() {
  const { actor, isFetching } = useActor();
  return useQuery<Feedback[]>({
    queryKey: ["feedback"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllFeedback();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (f: {
      bookingId: bigint;
      customerName: string;
      rating: bigint;
      comment: string;
    }) => {
      return actor!.submitFeedback(
        f.bookingId,
        f.customerName,
        f.rating,
        f.comment,
      );
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["feedback"] }),
  });
}

// ── User Profile ──────────────────────────────────────────────────────────
export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) =>
      actor!.saveCallerUserProfile(profile),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["userProfile"] }),
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ── Create Menu Category ──────────────────────────────────────────────────
export function useCreateMenuCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (c: { name: string; description: string }) => {
      return actor!.createMenuCategory(c.name, c.description);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["menuCategories"] }),
  });
}
