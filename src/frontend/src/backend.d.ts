import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StockUsage {
    id: bigint;
    bookingId: bigint;
    stockItemId: bigint;
    recordedAt: Time;
    quantityUsed: bigint;
}
export interface InvoiceItem {
    description: string;
    amount: bigint;
}
export interface Hall {
    id: bigint;
    name: string;
    pricePerHead: bigint;
    description: string;
    availableSeats: bigint;
    capacity: bigint;
    branchId: bigint;
}
export type Time = bigint;
export interface MenuCategory {
    name: string;
    description: string;
}
export interface Feedback {
    id: bigint;
    customerName: string;
    bookingId: bigint;
    submittedAt: Time;
    comment: string;
    rating: bigint;
}
export interface BookingVendor {
    bookingId: bigint;
    vendorId: bigint;
}
export interface Payment {
    id: bigint;
    method: string;
    bookingId: bigint;
    notes: string;
    paymentDate: Time;
    paymentType: string;
    amount: bigint;
}
export interface Invoice {
    id: bigint;
    bookingId: bigint;
    generatedAt: Time;
    isPaid: boolean;
    totalAmount: bigint;
    items: Array<InvoiceItem>;
}
export interface Lead {
    id: bigint;
    status: string;
    assignedTo: bigint;
    interestedHallId: bigint;
    name: string;
    visitDate: Time;
    email: string;
    notes: string;
    phone: string;
    eventType: string;
}
export interface MenuItem {
    id: bigint;
    name: string;
    description: string;
    isVegetarian: boolean;
    category: string;
    price: bigint;
}
export interface StockRequest {
    id: bigint;
    status: string;
    createdAt: Time;
    quantityRequested: bigint;
    itemName: string;
    branchId: bigint;
    requestedBy: bigint;
    resolvedAt?: Time;
    reason: string;
}
export interface Staff {
    id: bigint;
    name: string;
    role: string;
    isActive: boolean;
    email: string;
    phone: string;
    branchId: bigint;
}
export interface Stock {
    id: bigint;
    unit: string;
    quantityOnHand: bigint;
    itemName: string;
    minimumThreshold: bigint;
    branchId: bigint;
}
export interface ChecklistItem {
    id: bigint;
    bookingId: bigint;
    assignedTo: bigint;
    task: string;
    isDone: boolean;
}
export interface Branch {
    id: bigint;
    name: string;
    phone: string;
    location: string;
    managerName: string;
}
export interface Booking {
    id: bigint;
    customerName: string;
    status: string;
    paymentStatus: string;
    customerPhone: string;
    guestCount: bigint;
    createdAt: Time;
    menuSelections: Array<bigint>;
    notes: string;
    advancePaid: bigint;
    balanceDue: bigint;
    customerId?: Principal;
    hallId: bigint;
    branchId: bigint;
    customerEmail: string;
    eventDate: Time;
    quotationAmount: bigint;
    eventType: string;
}
export interface Vendor {
    id: bigint;
    serviceType: string;
    name: string;
    email: string;
    phone: string;
    branchId: bigint;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
    phone: string;
    branchId?: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBookingVendor(bookingId: bigint, vendorId: bigint): Promise<void>;
    approveStockRequest(id: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    confirmBooking(id: bigint): Promise<void>;
    createBooking(customerName: string, customerPhone: string, customerEmail: string, eventType: string, hallId: bigint, branchId: bigint, eventDate: Time, guestCount: bigint, menuSelections: Array<bigint>, notes: string): Promise<bigint>;
    createBranch(name: string, location: string, managerName: string, phone: string): Promise<bigint>;
    createChecklistItem(bookingId: bigint, task: string, assignedTo: bigint): Promise<bigint>;
    createHall(branchId: bigint, name: string, capacity: bigint, availableSeats: bigint, description: string, pricePerHead: bigint): Promise<bigint>;
    createInvoice(bookingId: bigint, items: Array<InvoiceItem>, totalAmount: bigint): Promise<bigint>;
    createLead(name: string, phone: string, email: string, eventType: string, interestedHallId: bigint, visitDate: Time, notes: string, assignedTo: bigint): Promise<bigint>;
    createMenuCategory(name: string, description: string): Promise<void>;
    createMenuItem(category: string, name: string, description: string, price: bigint, isVegetarian: boolean): Promise<bigint>;
    createStaff(name: string, role: string, branchId: bigint, phone: string, email: string): Promise<bigint>;
    createStock(branchId: bigint, itemName: string, unit: string, quantityOnHand: bigint, minimumThreshold: bigint): Promise<bigint>;
    createStockRequest(branchId: bigint, requestedBy: bigint, itemName: string, quantityRequested: bigint, reason: string): Promise<bigint>;
    createVendor(name: string, serviceType: string, phone: string, email: string, branchId: bigint): Promise<bigint>;
    deleteBooking(id: bigint): Promise<void>;
    deleteBranch(id: bigint): Promise<void>;
    deleteChecklistItem(id: bigint): Promise<void>;
    deleteHall(id: bigint): Promise<void>;
    deleteLead(id: bigint): Promise<void>;
    deleteMenuItem(id: bigint): Promise<void>;
    deleteStaff(id: bigint): Promise<void>;
    deleteStock(id: bigint): Promise<void>;
    deleteVendor(id: bigint): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllBranches(): Promise<Array<Branch>>;
    getAllChecklistItems(): Promise<Array<ChecklistItem>>;
    getAllFeedback(): Promise<Array<Feedback>>;
    getAllHalls(): Promise<Array<Hall>>;
    getAllInvoices(): Promise<Array<Invoice>>;
    getAllLeads(): Promise<Array<Lead>>;
    getAllMenuCategories(): Promise<Array<MenuCategory>>;
    getAllMenuItems(): Promise<Array<MenuItem>>;
    getAllPayments(): Promise<Array<Payment>>;
    getAllStaff(): Promise<Array<Staff>>;
    getAllStock(): Promise<Array<Stock>>;
    getAllStockRequests(): Promise<Array<StockRequest>>;
    getAllStockUsage(): Promise<Array<StockUsage>>;
    getAllVendors(): Promise<Array<Vendor>>;
    getBooking(id: bigint): Promise<Booking>;
    getBookingVendors(bookingId: bigint): Promise<Array<BookingVendor>>;
    getBranch(id: bigint): Promise<Branch>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getChecklistItem(id: bigint): Promise<ChecklistItem>;
    getFeedback(id: bigint): Promise<Feedback>;
    getHall(id: bigint): Promise<Hall>;
    getInvoice(id: bigint): Promise<Invoice>;
    getLead(id: bigint): Promise<Lead>;
    getMenuCategory(name: string): Promise<MenuCategory>;
    getMenuItem(id: bigint): Promise<MenuItem>;
    getPayment(id: bigint): Promise<Payment>;
    getStaff(id: bigint): Promise<Staff>;
    getStock(id: bigint): Promise<Stock>;
    getStockRequest(id: bigint): Promise<StockRequest>;
    getStockUsage(id: bigint): Promise<StockUsage>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVendor(id: bigint): Promise<Vendor>;
    isCallerAdmin(): Promise<boolean>;
    recordPayment(bookingId: bigint, amount: bigint, paymentType: string, method: string, notes: string): Promise<bigint>;
    recordStockUsage(bookingId: bigint, stockItemId: bigint, quantityUsed: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitFeedback(bookingId: bigint, customerName: string, rating: bigint, comment: string): Promise<bigint>;
    updateBooking(id: bigint, customerName: string, customerPhone: string, customerEmail: string, eventType: string, hallId: bigint, branchId: bigint, eventDate: Time, guestCount: bigint, menuSelections: Array<bigint>, status: string, paymentStatus: string, quotationAmount: bigint, advancePaid: bigint, balanceDue: bigint, notes: string): Promise<void>;
    updateBranch(id: bigint, name: string, location: string, managerName: string, phone: string): Promise<void>;
    updateChecklistItem(id: bigint, task: string, isDone: boolean, assignedTo: bigint): Promise<void>;
    updateHall(id: bigint, branchId: bigint, name: string, capacity: bigint, availableSeats: bigint, description: string, pricePerHead: bigint): Promise<void>;
    updateLead(id: bigint, name: string, phone: string, email: string, eventType: string, interestedHallId: bigint, visitDate: Time, status: string, notes: string, assignedTo: bigint): Promise<void>;
    updateMenuItem(id: bigint, category: string, name: string, description: string, price: bigint, isVegetarian: boolean): Promise<void>;
    updateStaff(id: bigint, name: string, role: string, branchId: bigint, phone: string, email: string, isActive: boolean): Promise<void>;
    updateStock(id: bigint, branchId: bigint, itemName: string, unit: string, quantityOnHand: bigint, minimumThreshold: bigint): Promise<void>;
    updateVendor(id: bigint, name: string, serviceType: string, phone: string, email: string, branchId: bigint): Promise<void>;
}
