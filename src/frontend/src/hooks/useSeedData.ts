import { useEffect, useRef } from "react";
import { useActor } from "./useActor";
import { useGetAllBranches } from "./useQueries";

/**
 * Seeds the database with sample data on first load.
 * Only runs when branches list is empty to avoid duplicates.
 */
export function useSeedData() {
  const { actor, isFetching } = useActor();
  const { data: branches = [], isLoading } = useGetAllBranches();
  const seeded = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || isLoading || seeded.current) return;
    if (branches.length > 0) return; // Already seeded

    seeded.current = true;

    (async () => {
      try {
        // Create branch
        const branchId = await actor.createBranch(
          "Royal Banquet — Main Branch",
          "123, MG Road, Mumbai, Maharashtra 400001",
          "Rajesh Kumar",
          "+91 98765 43210",
        );

        // Create halls
        await Promise.all([
          actor.createHall(
            branchId,
            "Grand Ballroom",
            500n,
            500n,
            "Our flagship hall with crystal chandeliers and marble floors, perfect for grand weddings",
            850n,
          ),
          actor.createHall(
            branchId,
            "Wedding Pavilion",
            300n,
            300n,
            "Traditional Indian wedding setup with mandap and marigold decorations",
            750n,
          ),
          actor.createHall(
            branchId,
            "Celebration Hall",
            200n,
            200n,
            "Vibrant and colorful hall perfect for birthdays and social celebrations",
            600n,
          ),
          actor.createHall(
            branchId,
            "Corporate Suite",
            150n,
            150n,
            "Professional setup for corporate events, conferences and seminars",
            500n,
          ),
        ]);

        // Create menu categories
        await Promise.all([
          actor.createMenuCategory(
            "Starters",
            "Delicious appetizers to begin your feast",
          ),
          actor.createMenuCategory(
            "Main Course",
            "Authentic Indian main course dishes",
          ),
          actor.createMenuCategory(
            "Desserts",
            "Traditional Indian sweets and desserts",
          ),
        ]);

        // Create menu items
        await Promise.all([
          actor.createMenuItem(
            "Starters",
            "Paneer Tikka",
            "Marinated cottage cheese grilled to perfection with spices",
            180n,
            true,
          ),
          actor.createMenuItem(
            "Starters",
            "Chicken Malai Seekh",
            "Tender chicken kebabs with cream and mild spices",
            220n,
            false,
          ),
          actor.createMenuItem(
            "Starters",
            "Hara Bhara Kabab",
            "Spinach and pea patties with mint chutney",
            160n,
            true,
          ),
          actor.createMenuItem(
            "Main Course",
            "Dum Biryani",
            "Slow-cooked aromatic rice with tender meat or vegetables",
            320n,
            false,
          ),
          actor.createMenuItem(
            "Main Course",
            "Paneer Butter Masala",
            "Rich tomato-based curry with soft paneer cubes",
            280n,
            true,
          ),
          actor.createMenuItem(
            "Main Course",
            "Dal Makhani",
            "Slow-cooked black lentils in creamy butter sauce",
            220n,
            true,
          ),
          actor.createMenuItem(
            "Main Course",
            "Butter Naan",
            "Freshly baked leavened bread with butter",
            60n,
            true,
          ),
          actor.createMenuItem(
            "Desserts",
            "Gulab Jamun",
            "Soft milk-solid dumplings in rose sugar syrup",
            120n,
            true,
          ),
          actor.createMenuItem(
            "Desserts",
            "Kheer",
            "Creamy rice pudding with saffron and cardamom",
            100n,
            true,
          ),
        ]);

        // Create stock items
        await Promise.all([
          actor.createStock(branchId, "Basmati Rice", "kg", 200n, 50n),
          actor.createStock(branchId, "Cooking Oil", "litre", 100n, 25n),
          actor.createStock(branchId, "Onions", "kg", 80n, 20n),
          actor.createStock(branchId, "Tomatoes", "kg", 60n, 15n),
          actor.createStock(branchId, "Paneer", "kg", 30n, 10n),
          actor.createStock(branchId, "Spice Mix", "kg", 20n, 5n),
        ]);

        // Create vendors
        await Promise.all([
          actor.createVendor(
            "Sharma Decorators",
            "Decoration & Floral",
            "+91 99001 12233",
            "sharma.dec@email.com",
            branchId,
          ),
          actor.createVendor(
            "Mehta Photography",
            "Photography & Videography",
            "+91 88002 33445",
            "mehta.photo@email.com",
            branchId,
          ),
          actor.createVendor(
            "Royal Tent House",
            "Furniture & Tent",
            "+91 77003 44556",
            "royaltent@email.com",
            branchId,
          ),
        ]);

        // Create staff members
        await Promise.all([
          actor.createStaff(
            "Anjali Singh",
            "branch_manager",
            branchId,
            "+91 96543 21098",
            "anjali.singh@royalbanquet.in",
          ),
          actor.createStaff(
            "Ramesh Patel",
            "kitchen_staff",
            branchId,
            "+91 95432 10987",
            "ramesh.patel@royalbanquet.in",
          ),
          actor.createStaff(
            "Priya Nair",
            "receptionist",
            branchId,
            "+91 94321 09876",
            "priya.nair@royalbanquet.in",
          ),
        ]);

        console.log("✅ Sample data seeded successfully");
      } catch (err) {
        console.warn("Seeding error (may already exist):", err);
      }
    })();
  }, [actor, isFetching, isLoading, branches]);
}
