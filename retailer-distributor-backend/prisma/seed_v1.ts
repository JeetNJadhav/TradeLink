import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, OrderStatus } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const locations = [
  {
    area: "Kharadi",
    address: "World Trade Center Road, Kharadi",
    city: "Pune",
    latitude: 18.5514,
    longitude: 73.943,
  },
  {
    area: "Viman Nagar",
    address: "Airport Road, Viman Nagar",
    city: "Pune",
    latitude: 18.5679,
    longitude: 73.9143,
  },
  {
    area: "Hadapsar",
    address: "Magarpatta Road, Hadapsar",
    city: "Pune",
    latitude: 18.5089,
    longitude: 73.926,
  },
  {
    area: "Koregaon Park",
    address: "North Main Road, Koregaon Park",
    city: "Pune",
    latitude: 18.5362,
    longitude: 73.8958,
  },
  {
    area: "Wagholi",
    address: "Kesnand Road, Wagholi",
    city: "Pune",
    latitude: 18.5827,
    longitude: 73.9897,
  },
  {
    area: "Kalyani Nagar",
    address: "Kalyani Nagar Main Road",
    city: "Pune",
    latitude: 18.5481,
    longitude: 73.9027,
  },
  {
    area: "Baner",
    address: "Baner Road",
    city: "Pune",
    latitude: 18.559,
    longitude: 73.7868,
  },
  {
    area: "Aundh",
    address: "Aundh Road",
    city: "Pune",
    latitude: 18.558,
    longitude: 73.8077,
  },
  {
    area: "Balewadi",
    address: "Balewadi High Street",
    city: "Pune",
    latitude: 18.5761,
    longitude: 73.7797,
  },
  {
    area: "Wakad",
    address: "Datta Mandir Road, Wakad",
    city: "Pune",
    latitude: 18.5975,
    longitude: 73.7898,
  },
  {
    area: "Hinjewadi",
    address: "Phase 1 Road, Hinjewadi",
    city: "Pune",
    latitude: 18.5913,
    longitude: 73.7389,
  },
  {
    area: "Pimpri",
    address: "Old Mumbai-Pune Highway, Pimpri",
    city: "Pune",
    latitude: 18.6298,
    longitude: 73.7997,
  },
  {
    area: "Chinchwad",
    address: "Chinchwad Main Road",
    city: "Pune",
    latitude: 18.629,
    longitude: 73.781,
  },
  {
    area: "Kothrud",
    address: "Paud Road, Kothrud",
    city: "Pune",
    latitude: 18.5074,
    longitude: 73.8077,
  },
  {
    area: "Karve Nagar",
    address: "Karve Nagar Main Road",
    city: "Pune",
    latitude: 18.491,
    longitude: 73.8218,
  },
  {
    area: "Shivajinagar",
    address: "FC Road, Shivajinagar",
    city: "Pune",
    latitude: 18.5308,
    longitude: 73.8475,
  },
  {
    area: "Deccan",
    address: "Deccan Gymkhana",
    city: "Pune",
    latitude: 18.5175,
    longitude: 73.8405,
  },
  {
    area: "Camp",
    address: "East Street, Camp",
    city: "Pune",
    latitude: 18.5144,
    longitude: 73.879,
  },
  {
    area: "Swargate",
    address: "Swargate Main Road",
    city: "Pune",
    latitude: 18.5018,
    longitude: 73.8636,
  },
  {
    area: "Bibwewadi",
    address: "Kondhwa Road, Bibwewadi",
    city: "Pune",
    latitude: 18.4786,
    longitude: 73.858,
  },
];

const products = [
  {
    name: "Paracetamol 500mg",
    description: "Paracetamol tablets 500mg",
    brand: "Cipla",
    category: "Medicine",
  },
  {
    name: "Ibuprofen 400mg",
    description: "Ibuprofen tablets 400mg",
    brand: "Abbott",
    category: "Medicine",
  },
  {
    name: "ORS Sachets",
    description: "Oral rehydration salts",
    brand: "Electral",
    category: "Medicine",
  },
  {
    name: "Vitamin C Tablets",
    description: "Vitamin C supplement tablets",
    brand: "Limcee",
    category: "Medicine",
  },
  {
    name: "Antiseptic Liquid",
    description: "Antiseptic disinfectant liquid",
    brand: "Dettol",
    category: "Personal Care",
  },
  {
    name: "Hand Sanitizer",
    description: "Alcohol-based hand sanitizer",
    brand: "Savlon",
    category: "Personal Care",
  },
  {
    name: "Face Masks",
    description: "Disposable 3-ply face masks",
    brand: "Dr. Morepen",
    category: "Medical Supplies",
  },
  {
    name: "Surgical Gloves",
    description: "Disposable latex surgical gloves",
    brand: "Vega",
    category: "Medical Supplies",
  },
  {
    name: "Syringe 5ml",
    description: "Disposable 5ml syringe",
    brand: "Dispovan",
    category: "Medical Supplies",
  },
  {
    name: "Bandage Roll",
    description: "Elastic medical bandage roll",
    brand: "Hansaplast",
    category: "Medical Supplies",
  },
  {
    name: "Cotton Roll",
    description: "Absorbent cotton roll",
    brand: "Johnson",
    category: "Medical Supplies",
  },
  {
    name: "Digital Thermometer",
    description: "Digital clinical thermometer",
    brand: "Dr. Trust",
    category: "Medical Equipment",
  },
  {
    name: "Biscuits",
    description: "Glucose biscuits",
    brand: "Parle",
    category: "FMCG",
  },
  {
    name: "Salt",
    description: "Iodized table salt",
    brand: "Tata",
    category: "FMCG",
  },
  {
    name: "Cooking Oil",
    description: "Refined sunflower cooking oil",
    brand: "Fortune",
    category: "FMCG",
  },
  {
    name: "Wheat Flour",
    description: "Whole wheat flour",
    brand: "Aashirvaad",
    category: "FMCG",
  },
  {
    name: "Rice 5kg",
    description: "Premium long grain rice",
    brand: "India Gate",
    category: "FMCG",
  },
  {
    name: "Tea 500g",
    description: "Premium black tea",
    brand: "Tata Tea",
    category: "Beverages",
  },
  {
    name: "Coffee 200g",
    description: "Instant coffee",
    brand: "Nescafe",
    category: "Beverages",
  },
  {
    name: "Orange Juice",
    description: "Orange fruit juice",
    brand: "Real",
    category: "Beverages",
  },
  {
    name: "Notebook",
    description: "200 page ruled notebook",
    brand: "Classmate",
    category: "Stationery",
  },
  {
    name: "Ball Pen",
    description: "Blue ball point pen",
    brand: "Reynolds",
    category: "Stationery",
  },
  {
    name: "Marker Pen",
    description: "Permanent black marker",
    brand: "Camlin",
    category: "Stationery",
  },
  {
    name: "A4 Paper",
    description: "500 sheet A4 paper pack",
    brand: "JK Copier",
    category: "Stationery",
  },
  {
    name: "Toothpaste",
    description: "Fluoride toothpaste",
    brand: "Colgate",
    category: "Personal Care",
  },
  {
    name: "Toothbrush",
    description: "Soft bristle toothbrush",
    brand: "Oral-B",
    category: "Personal Care",
  },
  {
    name: "Shampoo",
    description: "Daily care shampoo",
    brand: "Head & Shoulders",
    category: "Personal Care",
  },
  {
    name: "Bath Soap",
    description: "Moisturizing bath soap",
    brand: "Dove",
    category: "Personal Care",
  },
  {
    name: "Laundry Detergent",
    description: "Detergent powder",
    brand: "Surf Excel",
    category: "Household",
  },
  {
    name: "Dishwash Liquid",
    description: "Dishwashing liquid",
    brand: "Vim",
    category: "Household",
  },
];

const retailerNames = [
  "Shree Medical Store",
  "Health Plus Pharmacy",
  "MediCare Pharmacy",
  "Apollo Care Store",
  "City Medicals",
  "Wellness Pharmacy",
  "LifeCare Medical",
  "Green Cross Pharmacy",
  "Sai Medical Hall",
  "Om Medical Store",
  "Prime Health Pharmacy",
  "Good Health Medicals",
  "New Life Pharmacy",
  "Care Point Medical",
  "Aarogya Medical Store",
  "Reliable Pharmacy",
  "Jan Aushadhi Store",
  "Sunrise Medicals",
  "Unity Pharmacy",
  "TrustCare Medical",
];

const distributorNames = [
  "Pune Pharma Distributors",
  "Maharashtra Medical Supply",
  "Prime Healthcare Distributors",
  "Medico Wholesale",
  "HealthFirst Distribution",
  "City Pharma Supply",
  "Reliable Medical Distributors",
  "Aarogya Wholesale",
  "LifeCare Distributors",
  "Sai Pharma Supply",
  "National Healthcare Supply",
  "Om Medical Distributors",
  "Western Pharma Distributors",
  "Shree Healthcare Supply",
  "Unity Medical Distribution",
  "Apollo Wholesale Supply",
  "GreenCross Distributors",
  "Pioneer Pharma Supply",
  "Metro Healthcare Distributors",
  "CarePlus Distribution",
];

async function main() {
  console.log("🌱 Starting database seed...");

  /*
   * Clear existing development data.
   *
   * Order matters because of foreign-key constraints.
   */
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.distributorProduct.deleteMany();
  await prisma.location.deleteMany();
  await prisma.product.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️ Existing data cleared");

  /*
   * 1. Create 20 retailers
   */
  const retailers = [];

  for (let i = 0; i < retailerNames.length; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Retailer User ${i + 1}`,
        phone: `987650${String(i).padStart(4, "0")}`,
        email: `retailer${i + 1}@example.com`,
        password: "hashed-password",
      },
    });

    const retailer = await prisma.retailer.create({
      data: {
        shopName: retailerNames[i],
        userId: user.id,
        locations: {
          create: {
            address: locations[i].address,
            city: locations[i].city,
            latitude: locations[i].latitude,
            longitude: locations[i].longitude,
          },
        },
      },
    });

    retailers.push(retailer);
  }

  console.log(`✅ Created ${retailers.length} retailers`);

  /*
   * 2. Create 20 distributors
   *
   * Use the same location dataset but offset the index
   * so retailers and distributors are spread across Pune.
   */
  const distributors = [];

  for (let i = 0; i < distributorNames.length; i++) {
    const location = locations[(i + 5) % locations.length];

    const user = await prisma.user.create({
      data: {
        name: `Distributor User ${i + 1}`,
        phone: `987660${String(i).padStart(4, "0")}`,
        email: `distributor${i + 1}@example.com`,
        password: "hashed-password",
      },
    });

    const distributor = await prisma.distributor.create({
      data: {
        businessName: distributorNames[i],
        contactInfo: `+91 987660${String(i).padStart(4, "0")}`,
        userId: user.id,
        locations: {
          create: {
            address: location.address,
            city: location.city,
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
      },
    });

    distributors.push(distributor);
  }

  console.log(`✅ Created ${distributors.length} distributors`);

  /*
   * 3. Create products
   */
  const createdProducts = [];

  for (const product of products) {
    const createdProduct = await prisma.product.create({
      data: product,
    });

    createdProducts.push(createdProduct);
  }

  console.log(`✅ Created ${createdProducts.length} products`);

  /*
   * 4. Create DistributorProducts
   *
   * Each distributor gets 6 different products.
   *
   * We rotate the starting product so distributors
   * don't all sell exactly the same products.
   */
  const distributorProducts = [];

  for (
    let distributorIndex = 0;
    distributorIndex < distributors.length;
    distributorIndex++
  ) {
    const distributor = distributors[distributorIndex];

    for (let offset = 0; offset < 6; offset++) {
      const productIndex =
        (distributorIndex * 3 + offset) % createdProducts.length;

      const product = createdProducts[productIndex];

      const distributorProduct = await prisma.distributorProduct.create({
        data: {
          distributorId: distributor.id,
          productId: product.id,
          price: 50 + productIndex * 7 + distributorIndex * 3,
          stock: 50 + (((productIndex + distributorIndex) * 37) % 500),
        },
      });

      distributorProducts.push(distributorProduct);
    }
  }

  console.log(`✅ Created ${distributorProducts.length} distributor products`);

  /*
   * 5. Group distributor products by distributor.
   *
   * This lets us create orders where all items
   * belong to the same distributor.
   */
  const productsByDistributor = new Map<string, typeof distributorProducts>();

  for (const distributorProduct of distributorProducts) {
    const existing = productsByDistributor.get(
      distributorProduct.distributorId,
    );

    if (existing) {
      existing.push(distributorProduct);
    } else {
      productsByDistributor.set(distributorProduct.distributorId, [
        distributorProduct,
      ]);
    }
  }

  /*
   * 6. Create 60 orders
   */
  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.ACCEPTED,
    OrderStatus.PROCESSING,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ];

  const orders = [];

  for (let orderIndex = 0; orderIndex < 60; orderIndex++) {
    const retailer = retailers[orderIndex % retailers.length];

    const distributor = distributors[(orderIndex * 3) % distributors.length];

    const distributorProductsForOrder =
      productsByDistributor.get(distributor.id) ?? [];

    /*
     * Select 2-3 products for this order.
     */
    const itemCount = 2 + (orderIndex % 2);

    const selectedProducts = [];

    for (let i = 0; i < itemCount; i++) {
      const product =
        distributorProductsForOrder[
          (orderIndex + i) % distributorProductsForOrder.length
        ];

      selectedProducts.push(product);
    }

    let totalAmount = 0;

    const orderItems = selectedProducts.map((distributorProduct, index) => {
      const quantity = 1 + ((orderIndex + index) % 5);

      const unitPrice = Number(distributorProduct.price);

      totalAmount += quantity * unitPrice;

      return {
        distributorProductId: distributorProduct.id,
        quantity,
        unitPrice,
      };
    });

    const order = await prisma.order.create({
      data: {
        retailerId: retailer.id,
        date: new Date(Date.now() - orderIndex * 24 * 60 * 60 * 1000),
        totalAmount,
        status: statuses[orderIndex % statuses.length],
        orderItems: {
          create: orderItems,
        },
      },
      include: {
        orderItems: true,
      },
    });

    orders.push(order);
  }

  console.log(`✅ Created ${orders.length} orders`);

  console.log("");
  console.log("🎉 Database seeding completed!");
  console.log("");
  console.log("Created:");
  console.log(`  Retailers:             ${retailers.length}`);
  console.log(`  Distributors:          ${distributors.length}`);
  console.log(`  Products:              ${createdProducts.length}`);
  console.log(`  DistributorProducts:   ${distributorProducts.length}`);
  console.log(`  Orders:                ${orders.length}`);
  console.log(
    `  OrderItems:            ${orders.reduce(
      (total, order) => total + order.orderItems.length,
      0,
    )}`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seed failed:", error);

    await prisma.$disconnect();

    process.exit(1);
  });
