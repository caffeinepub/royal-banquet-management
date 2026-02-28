import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Crown,
  Heart,
  Mail,
  MapPin,
  PartyPopper,
  Phone,
  Search,
  Star,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateBooking,
  useGetAllBookings,
  useGetAllBranches,
  useGetAllHalls,
  useGetAllMenuCategories,
  useGetAllMenuItems,
  useSubmitFeedback,
} from "../hooks/useQueries";

const EVENT_TYPES = [
  {
    value: "wedding",
    label: "Wedding",
    icon: Heart,
    color: "text-rose-500",
    desc: "Grand ceremonies for your special day",
  },
  {
    value: "reception",
    label: "Reception",
    icon: Crown,
    color: "text-yellow-600",
    desc: "Elegant post-wedding celebrations",
  },
  {
    value: "birthday",
    label: "Birthday Party",
    icon: PartyPopper,
    color: "text-purple-500",
    desc: "Memorable birthday celebrations",
  },
  {
    value: "corporate",
    label: "Corporate Event",
    icon: Briefcase,
    color: "text-blue-500",
    desc: "Professional business gatherings",
  },
  {
    value: "social",
    label: "Social Gathering",
    icon: Users,
    color: "text-green-500",
    desc: "Community events & get-togethers",
  },
];

const HALL_IMAGES: Record<string, string> = {
  "Grand Ballroom": "/assets/generated/hall-grand.dim_1200x700.jpg",
  "Corporate Suite": "/assets/generated/hall-corporate.dim_1200x700.jpg",
  "Celebration Hall": "/assets/generated/hall-celebration.dim_1200x700.jpg",
  "Wedding Pavilion": "/assets/generated/hall-wedding.dim_1200x700.jpg",
};

function getHallImage(name: string): string {
  return HALL_IMAGES[name] || "/assets/generated/hall-grand.dim_1200x700.jpg";
}

export default function CustomerPortal() {
  const [activeTab, setActiveTab] = useState("home");
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<bigint | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [foundBooking, setFoundBooking] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [selectedMenuItems, setSelectedMenuItems] = useState<bigint[]>([]);

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    eventType: "",
    hallId: "",
    eventDate: "",
    guestCount: "",
    notes: "",
  });

  const { data: halls = [], isLoading: hallsLoading } = useGetAllHalls();
  const { data: menuItems = [], isLoading: menuLoading } = useGetAllMenuItems();
  const { data: menuCategories = [] } = useGetAllMenuCategories();
  const { data: branches = [] } = useGetAllBranches();
  const { data: bookings = [] } = useGetAllBookings();

  const createBooking = useCreateBooking();
  const submitFeedback = useSubmitFeedback();

  const branchId = branches.length > 0 ? branches[0].id : 1n;

  const handleMenuToggle = (id: bigint) => {
    setSelectedMenuItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.customerName ||
      !form.customerPhone ||
      !form.eventType ||
      !form.hallId ||
      !form.eventDate
    ) {
      toast.error("Please fill all required fields");
      return;
    }
    try {
      const eventDateMs =
        BigInt(new Date(form.eventDate).getTime()) * 1_000_000n;
      const id = await createBooking.mutateAsync({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        eventType: form.eventType,
        hallId: BigInt(form.hallId),
        branchId,
        eventDate: eventDateMs,
        guestCount: BigInt(form.guestCount || "1"),
        menuSelections: selectedMenuItems,
        notes: form.notes,
      });
      setBookingId(id);
      setBookingConfirmed(true);
      setForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        eventType: "",
        hallId: "",
        eventDate: "",
        guestCount: "",
        notes: "",
      });
      setSelectedMenuItems([]);
    } catch {
      toast.error("Booking failed. Please try again.");
    }
  };

  const handleLookup = () => {
    const id = BigInt(lookupId);
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      setFoundBooking(booking);
    } else {
      toast.error("Booking not found. Please check your booking ID.");
    }
  };

  const handleFeedback = async () => {
    if (!foundBooking) return;
    try {
      await submitFeedback.mutateAsync({
        bookingId: foundBooking.id,
        customerName: foundBooking.customerName,
        rating: BigInt(feedbackRating),
        comment: feedbackComment,
      });
      toast.success("Thank you for your feedback!");
      setFeedbackComment("");
    } catch {
      toast.error("Could not submit feedback.");
    }
  };

  const categorizedMenu = menuCategories.reduce(
    (acc, cat) => {
      acc[cat.name] = menuItems.filter((item) => item.category === cat.name);
      return acc;
    },
    {} as Record<string, typeof menuItems>,
  );

  return (
    <div className="min-h-screen bg-background font-body">
      {/* HEADER */}
      <header className="sticky top-0 z-50 portal-header shadow-royal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/logo-transparent.dim_300x100.png"
              alt="Royal Banquet"
              className="h-10 w-auto"
            />
          </div>
          <nav className="flex gap-1">
            {[
              { id: "home", label: "Home" },
              { id: "halls", label: "Our Halls" },
              { id: "events", label: "Events" },
              { id: "menu", label: "Menu" },
              { id: "booking", label: "Book Now" },
              { id: "mybooking", label: "My Booking" },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-gold/20 text-white font-semibold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* HOME / HERO */}
      {activeTab === "home" && (
        <div>
          {/* Hero Section */}
          <section className="relative h-[80vh] min-h-[500px] overflow-hidden">
            <img
              src="/assets/generated/hall-grand.dim_1200x700.jpg"
              alt="Grand Banquet Hall"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 hero-overlay" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <p className="text-gold font-accent text-lg mb-3 tracking-widest uppercase">
                  Welcome to
                </p>
                <h1 className="font-display text-5xl sm:text-7xl text-white font-bold leading-tight mb-4">
                  Royal Banquet
                </h1>
                <p className="text-white/90 text-xl sm:text-2xl max-w-2xl mx-auto mb-8 font-body">
                  Where every celebration becomes a cherished memory
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gold text-maroon font-bold text-lg px-8 py-6 hover:opacity-90 shadow-gold"
                    onClick={() => setActiveTab("booking")}
                  >
                    <Calendar className="mr-2 h-5 w-5" /> Book Your Event
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/60 text-white bg-white/10 hover:bg-white/20 text-lg px-8 py-6"
                    onClick={() => setActiveTab("halls")}
                  >
                    View Our Halls
                  </Button>
                </div>
              </motion.div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce">
              <ChevronDown className="h-8 w-8" />
            </div>
          </section>

          {/* Quick Stats */}
          <section className="bg-maroon py-10">
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: "Events Hosted", value: "5,000+" },
                { label: "Happy Families", value: "4,800+" },
                { label: "Seating Capacity", value: "2,000+" },
                { label: "Years of Excellence", value: "15+" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-gold font-display text-4xl font-bold">
                    {stat.value}
                  </p>
                  <p className="text-white/80 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Us */}
          <section className="py-16 px-4 max-w-6xl mx-auto">
            <h2 className="font-display text-4xl text-center text-maroon mb-12">
              Why Choose <span className="text-gold">Royal Banquet?</span>
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  icon: Crown,
                  title: "World-Class Hospitality",
                  desc: "Our dedicated team ensures every moment of your event is flawless and memorable.",
                },
                {
                  icon: UtensilsCrossed,
                  title: "Exquisite Cuisine",
                  desc: "A wide variety of authentic cuisines prepared by expert chefs for every palate.",
                },
                {
                  icon: Star,
                  title: "Premium Facilities",
                  desc: "State-of-the-art sound, lighting, and décor to make your event shine.",
                },
              ].map((item) => (
                <Card
                  key={item.title}
                  className="text-center p-6 shadow-royal hover:shadow-xl transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full bg-maroon/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-8 w-8 text-maroon" />
                  </div>
                  <h3 className="font-display text-xl text-maroon font-semibold mb-2">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.desc}</p>
                </Card>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* HALLS */}
      {activeTab === "halls" && (
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl text-maroon mb-3">
              Our Magnificent Halls
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose the perfect venue for your celebration
            </p>
          </div>
          {hallsLoading ? (
            <div className="grid sm:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-80 rounded-xl" />
              ))}
            </div>
          ) : halls.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-lg">
              Halls being updated. Please check back shortly.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-8">
              {halls.map((hall) => (
                <motion.div
                  key={hall.id.toString()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group"
                >
                  <Card className="overflow-hidden shadow-royal hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-56 overflow-hidden">
                      <img
                        src={getHallImage(hall.name)}
                        alt={hall.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-gold text-maroon font-bold text-base px-3 py-1">
                          ₹{hall.pricePerHead.toString()}/head
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-display text-2xl text-maroon font-semibold mb-2">
                        {hall.name}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {hall.description}
                      </p>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-5 w-5 text-maroon" />
                          <span>
                            <strong>{hall.capacity.toString()}</strong> Total
                            Capacity
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>
                            <strong>{hall.availableSeats.toString()}</strong>{" "}
                            Available
                          </span>
                        </div>
                      </div>
                      <Button
                        className="mt-4 w-full bg-maroon text-white hover:bg-maroon/90"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            hallId: hall.id.toString(),
                          }));
                          setActiveTab("booking");
                        }}
                      >
                        Book This Hall
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* EVENTS */}
      {activeTab === "events" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl text-maroon mb-3">
              Events We Host
            </h2>
            <p className="text-muted-foreground text-lg">
              From intimate gatherings to grand celebrations
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENT_TYPES.map((event) => (
              <motion.div key={event.value} whileHover={{ y: -4 }}>
                <Card
                  className="p-6 shadow-royal hover:shadow-xl transition-all cursor-pointer border-2 hover:border-gold/50"
                  onClick={() => {
                    setForm((f) => ({ ...f, eventType: event.value }));
                    setActiveTab("booking");
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <event.icon className={`h-6 w-6 ${event.color}`} />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-maroon">
                      {event.label}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">{event.desc}</p>
                  <p className="mt-3 text-sm text-gold font-medium">
                    Click to book →
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Wedding section with image */}
          <div className="mt-16 relative rounded-2xl overflow-hidden shadow-royal">
            <img
              src="/assets/generated/hall-wedding.dim_1200x700.jpg"
              alt="Wedding at Royal Banquet"
              className="w-full h-80 object-cover"
            />
            <div className="absolute inset-0 hero-overlay flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-gold font-accent text-lg mb-2">
                  Make Your Dream Come True
                </p>
                <h3 className="font-display text-4xl font-bold mb-4">
                  Your Perfect Wedding Awaits
                </h3>
                <Button
                  size="lg"
                  className="bg-gold text-maroon font-bold"
                  onClick={() => setActiveTab("booking")}
                >
                  Plan Your Wedding
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENU */}
      {activeTab === "menu" && (
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-4xl text-maroon mb-3">
              Our Culinary Offerings
            </h2>
            <p className="text-muted-foreground text-lg">
              Authentic flavours crafted with love
            </p>
          </div>

          {/* Hero food image */}
          <div className="rounded-2xl overflow-hidden mb-10 shadow-royal">
            <img
              src="/assets/generated/food-spread.dim_800x500.jpg"
              alt="Our Food"
              className="w-full h-72 object-cover"
            />
          </div>

          {menuLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(categorizedMenu).map(([category, items]) => (
                <div key={category}>
                  <h3 className="font-display text-2xl text-maroon font-semibold mb-4 border-b border-gold/30 pb-2">
                    {category}
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {items.map((item) => (
                      <Card
                        key={item.id.toString()}
                        className="p-4 flex items-start gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg text-foreground">
                              {item.name}
                            </p>
                            <Badge
                              variant={
                                item.isVegetarian ? "secondary" : "outline"
                              }
                              className={
                                item.isVegetarian
                                  ? "bg-green-100 text-green-700 text-xs"
                                  : "text-xs"
                              }
                            >
                              {item.isVegetarian ? "🌿 Veg" : "🍖 Non-Veg"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <p className="font-bold text-maroon text-lg shrink-0">
                          ₹{item.price.toString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(categorizedMenu).length === 0 &&
                menuItems.length > 0 && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {menuItems.map((item) => (
                      <Card
                        key={item.id.toString()}
                        className="p-4 flex items-start gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-lg">{item.name}</p>
                            <Badge
                              className={
                                item.isVegetarian
                                  ? "bg-green-100 text-green-700"
                                  : ""
                              }
                            >
                              {item.isVegetarian ? "🌿 Veg" : "🍖 Non-Veg"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                        <p className="font-bold text-maroon text-lg">
                          ₹{item.price.toString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* BOOKING FORM */}
      {activeTab === "booking" && (
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl text-maroon mb-3">
              Book Your Event
            </h2>
            <p className="text-muted-foreground text-lg">
              Fill the form below and we'll get back to you shortly
            </p>
          </div>

          <Card className="shadow-royal">
            <CardContent className="p-8">
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Full Name *
                    </Label>
                    <Input
                      placeholder="e.g. Priya Sharma"
                      className="text-base h-12"
                      value={form.customerName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, customerName: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Phone Number *
                    </Label>
                    <Input
                      placeholder="e.g. 9876543210"
                      className="text-base h-12"
                      value={form.customerPhone}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          customerPhone: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. priya@email.com"
                    className="text-base h-12"
                    value={form.customerEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, customerEmail: e.target.value }))
                    }
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Type of Event *
                    </Label>
                    <Select
                      value={form.eventType}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, eventType: v }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((e) => (
                          <SelectItem
                            key={e.value}
                            value={e.value}
                            className="text-base"
                          >
                            {e.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Select Hall *
                    </Label>
                    <Select
                      value={form.hallId}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, hallId: v }))
                      }
                    >
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select a hall" />
                      </SelectTrigger>
                      <SelectContent>
                        {halls.map((h) => (
                          <SelectItem
                            key={h.id.toString()}
                            value={h.id.toString()}
                            className="text-base"
                          >
                            {h.name} ({h.capacity.toString()} seats)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Event Date *
                    </Label>
                    <Input
                      type="date"
                      className="text-base h-12"
                      value={form.eventDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, eventDate: e.target.value }))
                      }
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">
                      Number of Guests
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g. 200"
                      className="text-base h-12"
                      value={form.guestCount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, guestCount: e.target.value }))
                      }
                      min="1"
                    />
                  </div>
                </div>

                {menuItems.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">
                      Menu Selections (Optional)
                    </Label>
                    <div className="grid sm:grid-cols-2 gap-2 border rounded-lg p-4 bg-muted/30 max-h-48 overflow-y-auto">
                      {menuItems.map((item) => (
                        <div
                          key={item.id.toString()}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`menu-${item.id}`}
                            checked={selectedMenuItems.includes(item.id)}
                            onCheckedChange={() => handleMenuToggle(item.id)}
                          />
                          <label
                            htmlFor={`menu-${item.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {item.isVegetarian ? "🌿" : "🍖"} {item.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-base font-semibold">
                    Special Notes / Requirements
                  </Label>
                  <Textarea
                    placeholder="Any special requirements, dietary restrictions, decoration preferences..."
                    className="text-base min-h-24"
                    value={form.notes}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, notes: e.target.value }))
                    }
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={createBooking.isPending}
                  className="w-full bg-maroon text-white text-lg h-14 font-bold hover:bg-maroon/90"
                >
                  {createBooking.isPending ? (
                    <span className="flex items-center gap-2">
                      <Clock className="h-5 w-5 animate-spin" /> Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" /> Confirm Booking
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MY BOOKING */}
      {activeTab === "mybooking" && (
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-4xl text-maroon mb-3">
              Track Your Booking
            </h2>
            <p className="text-muted-foreground text-lg">
              Enter your Booking ID to view your event details
            </p>
          </div>

          <Card className="shadow-royal mb-6">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <Input
                  placeholder="Enter Booking ID (e.g. 1)"
                  className="text-lg h-12"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                />
                <Button
                  onClick={handleLookup}
                  className="bg-maroon text-white h-12 px-6"
                >
                  <Search className="h-5 w-5 mr-2" /> Search
                </Button>
              </div>
            </CardContent>
          </Card>

          {foundBooking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-royal mb-6">
                <CardHeader>
                  <CardTitle className="font-display text-2xl text-maroon">
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Booking ID
                      </p>
                      <p className="font-bold text-lg">
                        #{foundBooking.id.toString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge
                        className={
                          foundBooking.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : foundBooking.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : foundBooking.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-700"
                        }
                      >
                        {foundBooking.status.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Customer Name
                      </p>
                      <p className="font-semibold text-base">
                        {foundBooking.customerName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Event Type
                      </p>
                      <p className="font-semibold text-base capitalize">
                        {foundBooking.eventType}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Event Date
                      </p>
                      <p className="font-semibold text-base">
                        {new Date(
                          Number(foundBooking.eventDate) / 1_000_000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Guests</p>
                      <p className="font-semibold text-base">
                        {foundBooking.guestCount.toString()} guests
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Payment Status
                      </p>
                      <Badge variant="outline">
                        {foundBooking.paymentStatus
                          .replace("_", " ")
                          .toUpperCase()}
                      </Badge>
                    </div>
                    {foundBooking.quotationAmount > 0n && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Quotation
                        </p>
                        <p className="font-bold text-lg text-maroon">
                          ₹{foundBooking.quotationAmount.toString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {foundBooking.status === "completed" && (
                <Card className="shadow-royal">
                  <CardHeader>
                    <CardTitle className="font-display text-xl text-maroon">
                      Share Your Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className="text-base font-semibold mb-2 block">
                        Your Rating
                      </Label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setFeedbackRating(star)}
                            className={`text-3xl transition-colors ${star <= feedbackRating ? "text-gold" : "text-muted-foreground"}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">
                        Your Comments
                      </Label>
                      <Textarea
                        placeholder="Tell us about your experience..."
                        className="mt-2"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                      />
                    </div>
                    <Button
                      className="bg-maroon text-white"
                      onClick={handleFeedback}
                      disabled={submitFeedback.isPending}
                    >
                      <Star className="mr-2 h-4 w-4" />
                      Submit Feedback
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <footer className="portal-header mt-20 py-10 text-center text-white/70">
        <div className="max-w-5xl mx-auto px-4">
          <img
            src="/assets/generated/logo-transparent.dim_300x100.png"
            alt="Royal Banquet"
            className="h-12 mx-auto mb-4"
          />
          <div className="flex flex-wrap justify-center gap-6 text-sm mb-4">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> +91 98765 43210
            </span>
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> events@royalbanquet.in
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Mumbai, Maharashtra
            </span>
          </div>
          <p className="text-white/40 text-sm">
            © {new Date().getFullYear()}. Built with{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="text-gold hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              ❤️ using caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* BOOKING CONFIRMED MODAL */}
      <AnimatePresence>
        {bookingConfirmed && (
          <Dialog open={bookingConfirmed} onOpenChange={setBookingConfirmed}>
            <DialogContent className="sm:max-w-md text-center border-gold/30">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="py-6"
              >
                <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center mx-auto mb-6 animate-celebration">
                  <CheckCircle className="h-10 w-10 text-maroon" />
                </div>
                <DialogHeader>
                  <DialogTitle className="font-display text-3xl text-maroon text-center mb-2">
                    Booking Confirmed! 🎉
                  </DialogTitle>
                </DialogHeader>
                <p className="text-lg text-foreground mt-4 mb-2">
                  Your booking has been successfully received.
                </p>
                <p className="text-muted-foreground mb-2">
                  A member of our team will call you shortly to confirm all
                  details and answer your questions.
                </p>
                {bookingId && (
                  <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 my-4">
                    <p className="text-sm text-muted-foreground">
                      Your Booking ID
                    </p>
                    <p className="font-display text-3xl font-bold text-maroon">
                      #{bookingId.toString()}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Save this number to track your booking
                    </p>
                  </div>
                )}
                <Button
                  className="bg-maroon text-white w-full text-lg h-12 mt-2"
                  onClick={() => setBookingConfirmed(false)}
                >
                  Great, Thank You!
                </Button>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}
