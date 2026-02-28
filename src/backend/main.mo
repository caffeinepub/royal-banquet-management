import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type UserProfile = {
    name : Text;
    role : Text; // "owner", "branch_manager", "operations_staff", "customer"
    branchId : ?Nat; // null for owner and customer
    phone : Text;
    email : Text;
  };

  type Branch = {
    id : Nat;
    name : Text;
    location : Text;
    managerName : Text;
    phone : Text;
  };

  type Hall = {
    id : Nat;
    branchId : Nat;
    name : Text;
    capacity : Nat;
    availableSeats : Nat;
    description : Text;
    pricePerHead : Nat;
  };

  type MenuCategory = {
    name : Text;
    description : Text;
  };

  type MenuItem = {
    id : Nat;
    category : Text;
    name : Text;
    description : Text;
    price : Nat;
    isVegetarian : Bool;
  };

  type Booking = {
    id : Nat;
    customerId : ?Principal; // null for guest bookings
    customerName : Text;
    customerPhone : Text;
    customerEmail : Text;
    eventType : Text;
    hallId : Nat;
    branchId : Nat;
    eventDate : Time.Time;
    guestCount : Nat;
    menuSelections : [Nat];
    status : Text;
    paymentStatus : Text;
    quotationAmount : Nat;
    advancePaid : Nat;
    balanceDue : Nat;
    notes : Text;
    createdAt : Time.Time;
  };

  type Lead = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    eventType : Text;
    interestedHallId : Nat;
    visitDate : Time.Time;
    status : Text;
    notes : Text;
    assignedTo : Nat;
  };

  type Vendor = {
    id : Nat;
    name : Text;
    serviceType : Text;
    phone : Text;
    email : Text;
    branchId : Nat;
  };

  type BookingVendor = {
    bookingId : Nat;
    vendorId : Nat;
  };

  type ChecklistItem = {
    id : Nat;
    bookingId : Nat;
    task : Text;
    isDone : Bool;
    assignedTo : Nat;
  };

  type Invoice = {
    id : Nat;
    bookingId : Nat;
    items : [InvoiceItem];
    totalAmount : Nat;
    generatedAt : Time.Time;
    isPaid : Bool;
  };

  type InvoiceItem = {
    description : Text;
    amount : Nat;
  };

  type Payment = {
    id : Nat;
    bookingId : Nat;
    amount : Nat;
    paymentType : Text;
    paymentDate : Time.Time;
    method : Text;
    notes : Text;
  };

  type Stock = {
    id : Nat;
    branchId : Nat;
    itemName : Text;
    unit : Text;
    quantityOnHand : Nat;
    minimumThreshold : Nat;
  };

  type StockRequest = {
    id : Nat;
    branchId : Nat;
    requestedBy : Nat;
    itemName : Text;
    quantityRequested : Nat;
    reason : Text;
    status : Text;
    createdAt : Time.Time;
    resolvedAt : ?Time.Time;
  };

  type StockUsage = {
    id : Nat;
    bookingId : Nat;
    stockItemId : Nat;
    quantityUsed : Nat;
    recordedAt : Time.Time;
  };

  type Staff = {
    id : Nat;
    name : Text;
    role : Text;
    branchId : Nat;
    phone : Text;
    email : Text;
    isActive : Bool;
  };

  type Feedback = {
    id : Nat;
    bookingId : Nat;
    customerName : Text;
    rating : Nat;
    comment : Text;
    submittedAt : Time.Time;
  };

  // Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let branches = Map.empty<Nat, Branch>();
  let halls = Map.empty<Nat, Hall>();
  let menuCategories = Map.empty<Text, MenuCategory>();
  let menuItems = Map.empty<Nat, MenuItem>();
  let bookings = Map.empty<Nat, Booking>();
  let leads = Map.empty<Nat, Lead>();
  let vendors = Map.empty<Nat, Vendor>();
  let bookingVendors = Map.empty<Nat, BookingVendor>();
  let checklistItems = Map.empty<Nat, ChecklistItem>();
  let invoices = Map.empty<Nat, Invoice>();
  let payments = Map.empty<Nat, Payment>();
  let stock = Map.empty<Nat, Stock>();
  let stockRequests = Map.empty<Nat, StockRequest>();
  let stockUsage = Map.empty<Nat, StockUsage>();
  let staff = Map.empty<Nat, Staff>();
  let feedback = Map.empty<Nat, Feedback>();

  var nextId = 0;

  func getNextId() : Nat {
    let currentId = nextId;
    nextId += 1;
    currentId;
  };

  // Helper functions for role-based authorization
  func isOwner(caller : Principal) : Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  func isBranchManager(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == "branch_manager" };
    };
  };

  func isOperationsStaff(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == "operations_staff" };
    };
  };

  func isCustomer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) { profile.role == "customer" };
    };
  };

  func getUserBranchId(caller : Principal) : ?Nat {
    switch (userProfiles.get(caller)) {
      case (null) { null };
      case (?profile) { profile.branchId };
    };
  };

  func canAccessBranch(caller : Principal, branchId : Nat) : Bool {
    if (isOwner(caller)) { return true };
    switch (getUserBranchId(caller)) {
      case (null) { false };
      case (?userBranchId) { userBranchId == branchId };
    };
  };

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Branch CRUD
  public shared ({ caller }) func createBranch(name : Text, location : Text, managerName : Text, phone : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create branches");
    };
    let id = getNextId();
    let branch : Branch = {
      id;
      name;
      location;
      managerName;
      phone;
    };
    branches.add(id, branch);
    id;
  };

  public query ({ caller }) func getBranch(id : Nat) : async Branch {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view branches");
    };
    switch (branches.get(id)) {
      case (null) { Runtime.trap("Branch does not exist") };
      case (?branch) { branch };
    };
  };

  public query ({ caller }) func getAllBranches() : async [Branch] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view branches");
    };
    branches.values().toArray();
  };

  public shared ({ caller }) func updateBranch(id : Nat, name : Text, location : Text, managerName : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update branches");
    };
    switch (branches.get(id)) {
      case (null) { Runtime.trap("Branch does not exist") };
      case (?_) {
        let branch : Branch = {
          id;
          name;
          location;
          managerName;
          phone;
        };
        branches.add(id, branch);
      };
    };
  };

  public shared ({ caller }) func deleteBranch(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete branches");
    };
    if (not branches.containsKey(id)) {
      Runtime.trap("Branch does not exist");
    };
    branches.remove(id);
  };

  // Hall CRUD
  public shared ({ caller }) func createHall(branchId : Nat, name : Text, capacity : Nat, availableSeats : Nat, description : Text, pricePerHead : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create halls");
    };
    if (not isOwner(caller) and not canAccessBranch(caller, branchId)) {
      Runtime.trap("Unauthorized: Can only create halls for your branch");
    };
    let id = getNextId();
    let hall : Hall = {
      id;
      branchId;
      name;
      capacity;
      availableSeats;
      description;
      pricePerHead;
    };
    halls.add(id, hall);
    id;
  };

  public query ({ caller }) func getHall(id : Nat) : async Hall {
    // Public info - guests can view
    switch (halls.get(id)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?hall) { hall };
    };
  };

  public query ({ caller }) func getAllHalls() : async [Hall] {
    // Public info - guests can view
    halls.values().toArray();
  };

  public shared ({ caller }) func updateHall(id : Nat, branchId : Nat, name : Text, capacity : Nat, availableSeats : Nat, description : Text, pricePerHead : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update halls");
    };
    if (not isOwner(caller) and not canAccessBranch(caller, branchId)) {
      Runtime.trap("Unauthorized: Can only update halls for your branch");
    };
    switch (halls.get(id)) {
      case (null) { Runtime.trap("Hall does not exist") };
      case (?_) {
        let hall : Hall = {
          id;
          branchId;
          name;
          capacity;
          availableSeats;
          description;
          pricePerHead;
        };
        halls.add(id, hall);
      };
    };
  };

  public shared ({ caller }) func deleteHall(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete halls");
    };
    if (not halls.containsKey(id)) {
      Runtime.trap("Hall does not exist");
    };
    halls.remove(id);
  };

  // Menu Category CRUD
  public shared ({ caller }) func createMenuCategory(name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create menu categories");
    };
    if (not isOwner(caller) and not isBranchManager(caller)) {
      Runtime.trap("Unauthorized: Only owners and branch managers can create menu categories");
    };
    let category : MenuCategory = {
      name;
      description;
    };
    menuCategories.add(name, category);
  };

  public query ({ caller }) func getMenuCategory(name : Text) : async MenuCategory {
    // Public info - guests can view
    switch (menuCategories.get(name)) {
      case (null) { Runtime.trap("Menu category does not exist") };
      case (?category) { category };
    };
  };

  public query ({ caller }) func getAllMenuCategories() : async [MenuCategory] {
    // Public info - guests can view
    menuCategories.values().toArray();
  };

  // Menu Item CRUD
  public shared ({ caller }) func createMenuItem(category : Text, name : Text, description : Text, price : Nat, isVegetarian : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create menu items");
    };
    if (not isOwner(caller) and not isBranchManager(caller)) {
      Runtime.trap("Unauthorized: Only owners and branch managers can create menu items");
    };
    let id = getNextId();
    let item : MenuItem = {
      id;
      category;
      name;
      description;
      price;
      isVegetarian;
    };
    menuItems.add(id, item);
    id;
  };

  public query ({ caller }) func getMenuItem(id : Nat) : async MenuItem {
    // Public info - guests can view
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item does not exist") };
      case (?item) { item };
    };
  };

  public query ({ caller }) func getAllMenuItems() : async [MenuItem] {
    // Public info - guests can view
    menuItems.values().toArray();
  };

  public shared ({ caller }) func updateMenuItem(id : Nat, category : Text, name : Text, description : Text, price : Nat, isVegetarian : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update menu items");
    };
    if (not isOwner(caller) and not isBranchManager(caller)) {
      Runtime.trap("Unauthorized: Only owners and branch managers can update menu items");
    };
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Menu item does not exist") };
      case (?_) {
        let item : MenuItem = {
          id;
          category;
          name;
          description;
          price;
          isVegetarian;
        };
        menuItems.add(id, item);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };
    if (not menuItems.containsKey(id)) {
      Runtime.trap("Menu item does not exist");
    };
    menuItems.remove(id);
  };

  // Booking Functions
  public shared ({ caller }) func createBooking(customerName : Text, customerPhone : Text, customerEmail : Text, eventType : Text, hallId : Nat, branchId : Nat, eventDate : Time.Time, guestCount : Nat, menuSelections : [Nat], notes : Text) : async Nat {
    // Anyone can create a booking (guest or authenticated user)
    let customerId = if (caller.isAnonymous()) { null } else { ?caller };
    let id = getNextId();
    let booking : Booking = {
      id;
      customerId;
      customerName;
      customerPhone;
      customerEmail;
      eventType;
      hallId;
      branchId;
      eventDate;
      guestCount;
      menuSelections;
      status = "pending";
      paymentStatus = "unpaid";
      quotationAmount = 0;
      advancePaid = 0;
      balanceDue = 0;
      notes;
      createdAt = Time.now();
    };
    bookings.add(id, booking);
    id;
  };

  public query ({ caller }) func getBooking(id : Nat) : async Booking {
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        // Owner can view all bookings
        if (isOwner(caller)) { return booking };
        
        // Branch staff can view bookings for their branch
        if (canAccessBranch(caller, booking.branchId)) { return booking };
        
        // Customer can view their own booking
        switch (booking.customerId) {
          case (null) { Runtime.trap("Unauthorized: Cannot view this booking") };
          case (?customerId) {
            if (caller == customerId) { return booking };
            Runtime.trap("Unauthorized: Cannot view this booking");
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view all bookings");
    };
    
    // Owner can view all bookings
    if (isOwner(caller)) {
      return bookings.values().toArray();
    };
    
    // Branch staff can view bookings for their branch
    switch (getUserBranchId(caller)) {
      case (null) {
        // Customer can only view their own bookings
        let customerBookings = bookings.values().filter(func(b : Booking) : Bool {
          switch (b.customerId) {
            case (null) { false };
            case (?customerId) { customerId == caller };
          };
        });
        customerBookings.toArray();
      };
      case (?branchId) {
        let branchBookings = bookings.values().filter(func(b : Booking) : Bool {
          b.branchId == branchId;
        });
        branchBookings.toArray();
      };
    };
  };

  public shared ({ caller }) func updateBooking(id : Nat, customerName : Text, customerPhone : Text, customerEmail : Text, eventType : Text, hallId : Nat, branchId : Nat, eventDate : Time.Time, guestCount : Nat, menuSelections : [Nat], status : Text, paymentStatus : Text, quotationAmount : Nat, advancePaid : Nat, balanceDue : Nat, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update bookings");
    };
    
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?existingBooking) {
        // Owner can update any booking
        if (not isOwner(caller) and not canAccessBranch(caller, branchId)) {
          Runtime.trap("Unauthorized: Can only update bookings for your branch");
        };
        
        let booking : Booking = {
          id;
          customerId = existingBooking.customerId;
          customerName;
          customerPhone;
          customerEmail;
          eventType;
          hallId;
          branchId;
          eventDate;
          guestCount;
          menuSelections;
          status;
          paymentStatus;
          quotationAmount;
          advancePaid;
          balanceDue;
          notes;
          createdAt = existingBooking.createdAt;
        };
        bookings.add(id, booking);
      };
    };
  };

  public shared ({ caller }) func deleteBooking(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete bookings");
    };
    if (not bookings.containsKey(id)) {
      Runtime.trap("Booking does not exist");
    };
    bookings.remove(id);
  };

  public shared ({ caller }) func confirmBooking(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can confirm bookings");
    };
    
    switch (bookings.get(id)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (not isOwner(caller) and not canAccessBranch(caller, booking.branchId)) {
          Runtime.trap("Unauthorized: Can only confirm bookings for your branch");
        };
        
        let updatedBooking : Booking = {
          id = booking.id;
          customerId = booking.customerId;
          customerName = booking.customerName;
          customerPhone = booking.customerPhone;
          customerEmail = booking.customerEmail;
          eventType = booking.eventType;
          hallId = booking.hallId;
          branchId = booking.branchId;
          eventDate = booking.eventDate;
          guestCount = booking.guestCount;
          menuSelections = booking.menuSelections;
          status = "confirmed";
          paymentStatus = booking.paymentStatus;
          quotationAmount = booking.quotationAmount;
          advancePaid = booking.advancePaid;
          balanceDue = booking.balanceDue;
          notes = booking.notes;
          createdAt = booking.createdAt;
        };
        bookings.add(id, updatedBooking);
      };
    };
  };

  // Lead CRUD
  public shared ({ caller }) func createLead(name : Text, phone : Text, email : Text, eventType : Text, interestedHallId : Nat, visitDate : Time.Time, notes : Text, assignedTo : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create leads");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can create leads");
    };
    
    let id = getNextId();
    let lead : Lead = {
      id;
      name;
      phone;
      email;
      eventType;
      interestedHallId;
      visitDate;
      status = "new";
      notes;
      assignedTo;
    };
    leads.add(id, lead);
    id;
  };

  public query ({ caller }) func getLead(id : Nat) : async Lead {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view leads");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view leads");
    };
    
    switch (leads.get(id)) {
      case (null) { Runtime.trap("Lead does not exist") };
      case (?lead) { lead };
    };
  };

  public query ({ caller }) func getAllLeads() : async [Lead] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view leads");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view leads");
    };
    
    leads.values().toArray();
  };

  public shared ({ caller }) func updateLead(id : Nat, name : Text, phone : Text, email : Text, eventType : Text, interestedHallId : Nat, visitDate : Time.Time, status : Text, notes : Text, assignedTo : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update leads");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can update leads");
    };
    
    switch (leads.get(id)) {
      case (null) { Runtime.trap("Lead does not exist") };
      case (?_) {
        let lead : Lead = {
          id;
          name;
          phone;
          email;
          eventType;
          interestedHallId;
          visitDate;
          status;
          notes;
          assignedTo;
        };
        leads.add(id, lead);
      };
    };
  };

  public shared ({ caller }) func deleteLead(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete leads");
    };
    if (not leads.containsKey(id)) {
      Runtime.trap("Lead does not exist");
    };
    leads.remove(id);
  };

  // Vendor CRUD
  public shared ({ caller }) func createVendor(name : Text, serviceType : Text, phone : Text, email : Text, branchId : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create vendors");
    };
    if (not isOwner(caller) and not canAccessBranch(caller, branchId)) {
      Runtime.trap("Unauthorized: Can only create vendors for your branch");
    };
    
    let id = getNextId();
    let vendor : Vendor = {
      id;
      name;
      serviceType;
      phone;
      email;
      branchId;
    };
    vendors.add(id, vendor);
    id;
  };

  public query ({ caller }) func getVendor(id : Nat) : async Vendor {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view vendors");
    };
    
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor does not exist") };
      case (?vendor) {
        if (not isOwner(caller) and not canAccessBranch(caller, vendor.branchId)) {
          Runtime.trap("Unauthorized: Can only view vendors for your branch");
        };
        vendor;
      };
    };
  };

  public query ({ caller }) func getAllVendors() : async [Vendor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view vendors");
    };
    
    if (isOwner(caller)) {
      return vendors.values().toArray();
    };
    
    switch (getUserBranchId(caller)) {
      case (null) { [] };
      case (?branchId) {
        let branchVendors = vendors.values().filter(func(v : Vendor) : Bool {
          v.branchId == branchId;
        });
        branchVendors.toArray();
      };
    };
  };

  public shared ({ caller }) func updateVendor(id : Nat, name : Text, serviceType : Text, phone : Text, email : Text, branchId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update vendors");
    };
    
    switch (vendors.get(id)) {
      case (null) { Runtime.trap("Vendor does not exist") };
      case (?vendor) {
        if (not isOwner(caller) and not canAccessBranch(caller, vendor.branchId)) {
          Runtime.trap("Unauthorized: Can only update vendors for your branch");
        };
        
        let updatedVendor : Vendor = {
          id;
          name;
          serviceType;
          phone;
          email;
          branchId;
        };
        vendors.add(id, updatedVendor);
      };
    };
  };

  public shared ({ caller }) func deleteVendor(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete vendors");
    };
    if (not vendors.containsKey(id)) {
      Runtime.trap("Vendor does not exist");
    };
    vendors.remove(id);
  };

  // Invoice CRUD
  public shared ({ caller }) func createInvoice(bookingId : Nat, items : [InvoiceItem], totalAmount : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create invoices");
    };
    
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (not isOwner(caller) and not canAccessBranch(caller, booking.branchId)) {
          Runtime.trap("Unauthorized: Can only create invoices for your branch");
        };
        
        let id = getNextId();
        let invoice : Invoice = {
          id;
          bookingId;
          items;
          totalAmount;
          generatedAt = Time.now();
          isPaid = false;
        };
        invoices.add(id, invoice);
        id;
      };
    };
  };

  public query ({ caller }) func getInvoice(id : Nat) : async Invoice {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };
    
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice does not exist") };
      case (?invoice) {
        switch (bookings.get(invoice.bookingId)) {
          case (null) { Runtime.trap("Associated booking does not exist") };
          case (?booking) {
            // Owner can view all invoices
            if (isOwner(caller)) { return invoice };
            
            // Branch staff can view invoices for their branch
            if (canAccessBranch(caller, booking.branchId)) { return invoice };
            
            // Customer can view their own invoice
            switch (booking.customerId) {
              case (null) { Runtime.trap("Unauthorized: Cannot view this invoice") };
              case (?customerId) {
                if (caller == customerId) { return invoice };
                Runtime.trap("Unauthorized: Cannot view this invoice");
              };
            };
          };
        };
      };
    };
  };

  public query ({ caller }) func getAllInvoices() : async [Invoice] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view invoices");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view all invoices");
    };
    
    invoices.values().toArray();
  };

  // Payment CRUD
  public shared ({ caller }) func recordPayment(bookingId : Nat, amount : Nat, paymentType : Text, method : Text, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record payments");
    };
    
    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking does not exist") };
      case (?booking) {
        if (not isOwner(caller) and not canAccessBranch(caller, booking.branchId)) {
          Runtime.trap("Unauthorized: Can only record payments for your branch");
        };
        
        let id = getNextId();
        let payment : Payment = {
          id;
          bookingId;
          amount;
          paymentType;
          paymentDate = Time.now();
          method;
          notes;
        };
        payments.add(id, payment);
        id;
      };
    };
  };

  public query ({ caller }) func getPayment(id : Nat) : async Payment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payments");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view payments");
    };
    
    switch (payments.get(id)) {
      case (null) { Runtime.trap("Payment does not exist") };
      case (?payment) { payment };
    };
  };

  public query ({ caller }) func getAllPayments() : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view payments");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view payments");
    };
    
    payments.values().toArray();
  };

  // Stock CRUD
  public shared ({ caller }) func createStock(branchId : Nat, itemName : Text, unit : Text, quantityOnHand : Nat, minimumThreshold : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stock");
    };
    if (not isOwner(caller) and not canAccessBranch(caller, branchId)) {
      Runtime.trap("Unauthorized: Can only create stock for your branch");
    };
    
    let id = getNextId();
    let stockItem : Stock = {
      id;
      branchId;
      itemName;
      unit;
      quantityOnHand;
      minimumThreshold;
    };
    stock.add(id, stockItem);
    id;
  };

  public query ({ caller }) func getStock(id : Nat) : async Stock {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock");
    };
    
    switch (stock.get(id)) {
      case (null) { Runtime.trap("Stock item does not exist") };
      case (?stockItem) {
        if (not isOwner(caller) and not canAccessBranch(caller, stockItem.branchId)) {
          Runtime.trap("Unauthorized: Can only view stock for your branch");
        };
        stockItem;
      };
    };
  };

  public query ({ caller }) func getAllStock() : async [Stock] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock");
    };
    
    if (isOwner(caller)) {
      return stock.values().toArray();
    };
    
    switch (getUserBranchId(caller)) {
      case (null) { [] };
      case (?branchId) {
        let branchStock = stock.values().filter(func(s : Stock) : Bool {
          s.branchId == branchId;
        });
        branchStock.toArray();
      };
    };
  };

  public shared ({ caller }) func updateStock(id : Nat, branchId : Nat, itemName : Text, unit : Text, quantityOnHand : Nat, minimumThreshold : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update stock");
    };
    
    switch (stock.get(id)) {
      case (null) { Runtime.trap("Stock item does not exist") };
      case (?stockItem) {
        if (not isOwner(caller) and not canAccessBranch(caller, stockItem.branchId)) {
          Runtime.trap("Unauthorized: Can only update stock for your branch");
        };
        
        let updatedStock : Stock = {
          id;
          branchId;
          itemName;
          unit;
          quantityOnHand;
          minimumThreshold;
        };
        stock.add(id, updatedStock);
      };
    };
  };

  public shared ({ caller }) func deleteStock(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete stock");
    };
    if (not stock.containsKey(id)) {
      Runtime.trap("Stock item does not exist");
    };
    stock.remove(id);
  };

  // Stock Request CRUD
  public shared ({ caller }) func createStockRequest(branchId : Nat, requestedBy : Nat, itemName : Text, quantityRequested : Nat, reason : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create stock requests");
    };
    if (not isOwner(caller) and not canAccessBranch(caller, branchId)) {
      Runtime.trap("Unauthorized: Can only create stock requests for your branch");
    };
    
    let id = getNextId();
    let request : StockRequest = {
      id;
      branchId;
      requestedBy;
      itemName;
      quantityRequested;
      reason;
      status = "pending";
      createdAt = Time.now();
      resolvedAt = null;
    };
    stockRequests.add(id, request);
    id;
  };

  public query ({ caller }) func getStockRequest(id : Nat) : async StockRequest {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock requests");
    };
    
    switch (stockRequests.get(id)) {
      case (null) { Runtime.trap("Stock request does not exist") };
      case (?request) {
        if (not isOwner(caller) and not canAccessBranch(caller, request.branchId)) {
          Runtime.trap("Unauthorized: Can only view stock requests for your branch");
        };
        request;
      };
    };
  };

  public query ({ caller }) func getAllStockRequests() : async [StockRequest] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock requests");
    };
    
    if (isOwner(caller)) {
      return stockRequests.values().toArray();
    };
    
    switch (getUserBranchId(caller)) {
      case (null) { [] };
      case (?branchId) {
        let branchRequests = stockRequests.values().filter(func(r : StockRequest) : Bool {
          r.branchId == branchId;
        });
        branchRequests.toArray();
      };
    };
  };

  public shared ({ caller }) func approveStockRequest(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can approve stock requests");
    };
    if (not isOwner(caller) and not isBranchManager(caller)) {
      Runtime.trap("Unauthorized: Only owners and branch managers can approve stock requests");
    };
    
    switch (stockRequests.get(id)) {
      case (null) { Runtime.trap("Stock request does not exist") };
      case (?request) {
        if (not isOwner(caller) and not canAccessBranch(caller, request.branchId)) {
          Runtime.trap("Unauthorized: Can only approve stock requests for your branch");
        };
        
        let updatedRequest : StockRequest = {
          id = request.id;
          branchId = request.branchId;
          requestedBy = request.requestedBy;
          itemName = request.itemName;
          quantityRequested = request.quantityRequested;
          reason = request.reason;
          status = "approved";
          createdAt = request.createdAt;
          resolvedAt = ?Time.now();
        };
        stockRequests.add(id, updatedRequest);
      };
    };
  };

  // Stock Usage CRUD
  public shared ({ caller }) func recordStockUsage(bookingId : Nat, stockItemId : Nat, quantityUsed : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can record stock usage");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can record stock usage");
    };
    
    let id = getNextId();
    let usage : StockUsage = {
      id;
      bookingId;
      stockItemId;
      quantityUsed;
      recordedAt = Time.now();
    };
    stockUsage.add(id, usage);
    id;
  };

  public query ({ caller }) func getStockUsage(id : Nat) : async StockUsage {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock usage");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view stock usage");
    };
    
    switch (stockUsage.get(id)) {
      case (null) { Runtime.trap("Stock usage record does not exist") };
      case (?usage) { usage };
    };
  };

  public query ({ caller }) func getAllStockUsage() : async [StockUsage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view stock usage");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view stock usage");
    };
    
    stockUsage.values().toArray();
  };

  // Staff CRUD
  public shared ({ caller }) func createStaff(name : Text, role : Text, branchId : Nat, phone : Text, email : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create staff");
    };
    
    let id = getNextId();
    let staffMember : Staff = {
      id;
      name;
      role;
      branchId;
      phone;
      email;
      isActive = true;
    };
    staff.add(id, staffMember);
    id;
  };

  public query ({ caller }) func getStaff(id : Nat) : async Staff {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view staff");
    };
    
    switch (staff.get(id)) {
      case (null) { Runtime.trap("Staff member does not exist") };
      case (?staffMember) { staffMember };
    };
  };

  public query ({ caller }) func getAllStaff() : async [Staff] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view staff");
    };
    
    staff.values().toArray();
  };

  public shared ({ caller }) func updateStaff(id : Nat, name : Text, role : Text, branchId : Nat, phone : Text, email : Text, isActive : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update staff");
    };
    
    switch (staff.get(id)) {
      case (null) { Runtime.trap("Staff member does not exist") };
      case (?_) {
        let staffMember : Staff = {
          id;
          name;
          role;
          branchId;
          phone;
          email;
          isActive;
        };
        staff.add(id, staffMember);
      };
    };
  };

  public shared ({ caller }) func deleteStaff(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete staff");
    };
    if (not staff.containsKey(id)) {
      Runtime.trap("Staff member does not exist");
    };
    staff.remove(id);
  };

  // Feedback Functions
  public shared ({ caller }) func submitFeedback(bookingId : Nat, customerName : Text, rating : Nat, comment : Text) : async Nat {
    // Anyone can submit feedback (guest or authenticated user)
    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };
    
    let id = getNextId();
    let feedbackEntry : Feedback = {
      id;
      bookingId;
      customerName;
      rating;
      comment;
      submittedAt = Time.now();
    };
    feedback.add(id, feedbackEntry);
    id;
  };

  public query ({ caller }) func getFeedback(id : Nat) : async Feedback {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view feedback");
    };
    if (not isOwner(caller) and not isBranchManager(caller)) {
      Runtime.trap("Unauthorized: Only owners and branch managers can view feedback");
    };
    
    switch (feedback.get(id)) {
      case (null) { Runtime.trap("Feedback does not exist") };
      case (?feedbackEntry) { feedbackEntry };
    };
  };

  public query ({ caller }) func getAllFeedback() : async [Feedback] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view feedback");
    };
    if (not isOwner(caller) and not isBranchManager(caller)) {
      Runtime.trap("Unauthorized: Only owners and branch managers can view feedback");
    };
    
    feedback.values().toArray();
  };

  // Checklist Item CRUD
  public shared ({ caller }) func createChecklistItem(bookingId : Nat, task : Text, assignedTo : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create checklist items");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can create checklist items");
    };
    
    let id = getNextId();
    let item : ChecklistItem = {
      id;
      bookingId;
      task;
      isDone = false;
      assignedTo;
    };
    checklistItems.add(id, item);
    id;
  };

  public query ({ caller }) func getChecklistItem(id : Nat) : async ChecklistItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view checklist items");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view checklist items");
    };
    
    switch (checklistItems.get(id)) {
      case (null) { Runtime.trap("Checklist item does not exist") };
      case (?item) { item };
    };
  };

  public query ({ caller }) func getAllChecklistItems() : async [ChecklistItem] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view checklist items");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can view checklist items");
    };
    
    checklistItems.values().toArray();
  };

  public shared ({ caller }) func updateChecklistItem(id : Nat, task : Text, isDone : Bool, assignedTo : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update checklist items");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can update checklist items");
    };
    
    switch (checklistItems.get(id)) {
      case (null) { Runtime.trap("Checklist item does not exist") };
      case (?existingItem) {
        let item : ChecklistItem = {
          id;
          bookingId = existingItem.bookingId;
          task;
          isDone;
          assignedTo;
        };
        checklistItems.add(id, item);
      };
    };
  };

  public shared ({ caller }) func deleteChecklistItem(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete checklist items");
    };
    if (not checklistItems.containsKey(id)) {
      Runtime.trap("Checklist item does not exist");
    };
    checklistItems.remove(id);
  };

  // Booking Vendor CRUD
  public shared ({ caller }) func addBookingVendor(bookingId : Nat, vendorId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can add booking vendors");
    };
    if (not isOwner(caller) and not isBranchManager(caller) and not isOperationsStaff(caller)) {
      Runtime.trap("Unauthorized: Only staff can add booking vendors");
    };
    
    let id = getNextId();
    let bookingVendor : BookingVendor = {
      bookingId;
      vendorId;
    };
    bookingVendors.add(id, bookingVendor);
  };

  public query ({ caller }) func getBookingVendors(bookingId : Nat) : async [BookingVendor] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view booking vendors");
    };
    
    let result = bookingVendors.values().filter(func(bv : BookingVendor) : Bool {
      bv.bookingId == bookingId;
    });
    result.toArray();
  };
};
