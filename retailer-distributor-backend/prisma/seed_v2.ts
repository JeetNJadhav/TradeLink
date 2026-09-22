import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { Prisma } from "../src/generated/prisma/client";
const connectionString = process.env.DATABASE_URL!;

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

/**
 * ---------------------------------------------------------
 * Configuration
 * ---------------------------------------------------------
 */

const USER_COUNT = 1200;
const RETAILER_COUNT = 600;
const DISTRIBUTOR_COUNT = 150;
const LOCATION_COUNT = 800;
const PRODUCT_COUNT = 1200;
const DISTRIBUTOR_PRODUCT_COUNT = 6000;

/**
 * ---------------------------------------------------------
 * Deterministic pseudo-random generator
 * ---------------------------------------------------------
 *
 * Same seed => same generated data.
 */
let seed = 20260922;

function random(): number {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

function randomInt(min: number, max: number): number {
  return Math.floor(random() * (max - min + 1)) + min;
}

function randomItem<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function randomBoolean(probability = 0.5): boolean {
  return random() < probability;
}

/**
 * ---------------------------------------------------------
 * Helpers
 * ---------------------------------------------------------
 */

function makeUuid(prefix: number, index: number): string {
  const prefixHex = prefix.toString(16).padStart(4, "0");
  const indexHex = index.toString(16).padStart(8, "0");

  return `00000000-0000-4000-8000-${prefixHex}${indexHex}`;
}

function randomPrice(min: number, max: number): Prisma.Decimal {
  const price = min + random() * (max - min);

  return new Prisma.Decimal(price.toFixed(2));
}

function randomStock(): number {
  const probability = random();

  if (probability < 0.15) {
    return 0;
  }

  if (probability < 0.3) {
    return randomInt(1, 20);
  }

  if (probability < 0.75) {
    return randomInt(20, 300);
  }

  return randomInt(300, 2000);
}

/**
 * ---------------------------------------------------------
 * Indian data
 * ---------------------------------------------------------
 */

const firstNames = [
  "Aarav",
  "Aditi",
  "Akash",
  "Amit",
  "Ananya",
  "Aniket",
  "Arjun",
  "Ayush",
  "Deepak",
  "Diya",
  "Isha",
  "Karan",
  "Kavya",
  "Manish",
  "Meera",
  "Neha",
  "Nikhil",
  "Pooja",
  "Prakash",
  "Rahul",
  "Riya",
  "Rohit",
  "Sachin",
  "Sakshi",
  "Sameer",
  "Shreya",
  "Sneha",
  "Sonal",
  "Suresh",
  "Tanvi",
  "Varun",
  "Vikas",
  "Vivek",
];

const lastNames = [
  "Sharma",
  "Patil",
  "Jadhav",
  "Deshmukh",
  "Kulkarni",
  "Joshi",
  "Pawar",
  "Kadam",
  "More",
  "Shinde",
  "Chavan",
  "Gupta",
  "Verma",
  "Singh",
  "Mehta",
  "Shah",
  "Iyer",
  "Nair",
  "Reddy",
  "Rao",
];

const locations = [
  {
    city: "Pune",
    addressPrefix: "Baner Road",
    latitude: 18.559,
    longitude: 73.7868,
  },
  {
    city: "Pune",
    addressPrefix: "Kharadi",
    latitude: 18.551,
    longitude: 73.947,
  },
  {
    city: "Pune",
    addressPrefix: "Hadapsar",
    latitude: 18.5089,
    longitude: 73.926,
  },
  {
    city: "Mumbai",
    addressPrefix: "Andheri East",
    latitude: 19.1197,
    longitude: 72.8468,
  },
  {
    city: "Mumbai",
    addressPrefix: "Powai",
    latitude: 19.1176,
    longitude: 72.906,
  },
  {
    city: "Nashik",
    addressPrefix: "College Road",
    latitude: 20.0059,
    longitude: 73.7785,
  },
  {
    city: "Nagpur",
    addressPrefix: "Dharampeth",
    latitude: 21.1458,
    longitude: 79.0882,
  },
  {
    city: "Bengaluru",
    addressPrefix: "Whitefield",
    latitude: 12.9698,
    longitude: 77.75,
  },
  {
    city: "Hyderabad",
    addressPrefix: "Madhapur",
    latitude: 17.4483,
    longitude: 78.3915,
  },
  {
    city: "Chennai",
    addressPrefix: "T Nagar",
    latitude: 13.0418,
    longitude: 80.2341,
  },
  {
    city: "Delhi",
    addressPrefix: "Saket",
    latitude: 28.5244,
    longitude: 77.2066,
  },
  {
    city: "Ahmedabad",
    addressPrefix: "Satellite",
    latitude: 23.0306,
    longitude: 72.516,
  },
];

/**
 * ---------------------------------------------------------
 * Product catalogue
 * ---------------------------------------------------------
 *
 * We deliberately have multiple categories.
 */

type ProductTemplate = {
  name: string;
  brand: string;
  category: string;
  description: string;
};

const productTemplates: ProductTemplate[] = [
  // Medicines
  {
    name: "Paracetamol 500 mg Tablet",
    brand: "Cipla",
    category: "Medicines",
    description: "Paracetamol 500 mg tablets for fever and pain relief.",
  },
  {
    name: "Paracetamol 650 mg Tablet",
    brand: "Crocin",
    category: "Medicines",
    description: "Paracetamol 650 mg tablets for fever and pain relief.",
  },
  {
    name: "Paracetamol 250 mg Tablet",
    brand: "Calpol",
    category: "Medicines",
    description: "Paracetamol 250 mg tablets.",
  },
  {
    name: "Paracetamol Syrup",
    brand: "Calpol",
    category: "Medicines",
    description: "Paracetamol oral syrup.",
  },
  {
    name: "Paracetamol Suspension",
    brand: "Crocin",
    category: "Medicines",
    description: "Paracetamol oral suspension.",
  },
  {
    name: "Paracetamol + Caffeine Tablet",
    brand: "Saridon",
    category: "Medicines",
    description: "Combination tablet containing paracetamol and caffeine.",
  },
  {
    name: "Ibuprofen 200 mg Tablet",
    brand: "Brufen",
    category: "Medicines",
    description: "Ibuprofen 200 mg tablets.",
  },
  {
    name: "Ibuprofen 400 mg Tablet",
    brand: "Brufen",
    category: "Medicines",
    description: "Ibuprofen 400 mg tablets.",
  },
  {
    name: "Amoxicillin 250 mg Capsule",
    brand: "Mox",
    category: "Antibiotics",
    description: "Amoxicillin 250 mg capsules.",
  },
  {
    name: "Amoxicillin 500 mg Capsule",
    brand: "Mox",
    category: "Antibiotics",
    description: "Amoxicillin 500 mg capsules.",
  },
  {
    name: "Azithromycin 250 mg Tablet",
    brand: "Azithral",
    category: "Antibiotics",
    description: "Azithromycin 250 mg tablets.",
  },
  {
    name: "Azithromycin 500 mg Tablet",
    brand: "Azithral",
    category: "Antibiotics",
    description: "Azithromycin 500 mg tablets.",
  },
  {
    name: "Cetirizine 10 mg Tablet",
    brand: "Zyrtec",
    category: "Allergy",
    description: "Cetirizine 10 mg antihistamine tablets.",
  },
  {
    name: "Pantoprazole 40 mg Tablet",
    brand: "Pantocid",
    category: "Gastrointestinal",
    description: "Pantoprazole 40 mg tablets.",
  },
  {
    name: "Omeprazole 20 mg Capsule",
    brand: "Omez",
    category: "Gastrointestinal",
    description: "Omeprazole 20 mg capsules.",
  },
  {
    name: "Montelukast 10 mg Tablet",
    brand: "Montair",
    category: "Allergy",
    description: "Montelukast 10 mg tablets.",
  },
  {
    name: "Levocetirizine 5 mg Tablet",
    brand: "Levocet",
    category: "Allergy",
    description: "Levocetirizine 5 mg tablets.",
  },
  {
    name: "Diclofenac 50 mg Tablet",
    brand: "Voveran",
    category: "Pain Relief",
    description: "Diclofenac 50 mg tablets.",
  },
  {
    name: "Aspirin 75 mg Tablet",
    brand: "Ecosprin",
    category: "Cardiology",
    description: "Aspirin 75 mg tablets.",
  },
  {
    name: "Metformin 500 mg Tablet",
    brand: "Glycomet",
    category: "Diabetes",
    description: "Metformin 500 mg tablets.",
  },

  // Vitamins & supplements
  {
    name: "Vitamin C 500 mg Tablet",
    brand: "Limcee",
    category: "Vitamins",
    description: "Vitamin C supplement tablets.",
  },
  {
    name: "Vitamin D3 60000 IU Capsule",
    brand: "Uprise",
    category: "Vitamins",
    description: "Vitamin D3 supplement capsules.",
  },
  {
    name: "Calcium 500 mg Tablet",
    brand: "Shelcal",
    category: "Vitamins",
    description: "Calcium supplement tablets.",
  },
  {
    name: "Iron Folic Acid Tablet",
    brand: "Livogen",
    category: "Vitamins",
    description: "Iron and folic acid supplement.",
  },
  {
    name: "Multivitamin Tablets",
    brand: "Supradyn",
    category: "Vitamins",
    description: "Daily multivitamin tablets.",
  },
  {
    name: "Omega 3 Fish Oil Capsule",
    brand: "Seven Seas",
    category: "Supplements",
    description: "Omega 3 dietary supplement.",
  },
  {
    name: "Protein Powder 1 kg",
    brand: "Protinex",
    category: "Nutrition",
    description: "Protein nutritional supplement.",
  },

  // Personal care
  {
    name: "Antiseptic Liquid 100 ml",
    brand: "Dettol",
    category: "Personal Care",
    description: "Antiseptic liquid for personal hygiene.",
  },
  {
    name: "Antiseptic Liquid 250 ml",
    brand: "Savlon",
    category: "Personal Care",
    description: "Antiseptic liquid.",
  },
  {
    name: "Hand Sanitizer 100 ml",
    brand: "Dettol",
    category: "Personal Care",
    description: "Alcohol-based hand sanitizer.",
  },
  {
    name: "Hand Sanitizer 500 ml",
    brand: "Lifebuoy",
    category: "Personal Care",
    description: "Hand sanitizer for hygiene.",
  },
  {
    name: "Moisturizing Lotion 200 ml",
    brand: "Nivea",
    category: "Skin Care",
    description: "Daily moisturizing lotion.",
  },
  {
    name: "Aloe Vera Gel 150 ml",
    brand: "Patanjali",
    category: "Skin Care",
    description: "Aloe vera skin gel.",
  },
  {
    name: "Sunscreen SPF 50 50 g",
    brand: "Lakme",
    category: "Skin Care",
    description: "Broad spectrum sunscreen.",
  },
  {
    name: "Face Wash 100 ml",
    brand: "Himalaya",
    category: "Skin Care",
    description: "Daily facial cleanser.",
  },

  // Baby care
  {
    name: "Baby Diapers Small",
    brand: "Pampers",
    category: "Baby Care",
    description: "Disposable baby diapers, small size.",
  },
  {
    name: "Baby Diapers Medium",
    brand: "Pampers",
    category: "Baby Care",
    description: "Disposable baby diapers, medium size.",
  },
  {
    name: "Baby Diapers Large",
    brand: "Huggies",
    category: "Baby Care",
    description: "Disposable baby diapers, large size.",
  },
  {
    name: "Baby Wipes 72 Sheets",
    brand: "Huggies",
    category: "Baby Care",
    description: "Gentle baby cleansing wipes.",
  },
  {
    name: "Baby Shampoo 200 ml",
    brand: "Johnson's",
    category: "Baby Care",
    description: "Mild baby shampoo.",
  },
  {
    name: "Baby Lotion 200 ml",
    brand: "Johnson's",
    category: "Baby Care",
    description: "Baby moisturizing lotion.",
  },

  // Medical devices
  {
    name: "Digital Thermometer",
    brand: "Dr Trust",
    category: "Medical Devices",
    description: "Digital clinical thermometer.",
  },
  {
    name: "Blood Pressure Monitor",
    brand: "Omron",
    category: "Medical Devices",
    description: "Digital blood pressure monitoring device.",
  },
  {
    name: "Pulse Oximeter",
    brand: "Dr Morepen",
    category: "Medical Devices",
    description: "Finger pulse oximeter.",
  },
  {
    name: "Glucometer",
    brand: "Accu-Chek",
    category: "Medical Devices",
    description: "Blood glucose monitoring device.",
  },
  {
    name: "Nebulizer",
    brand: "Dr Trust",
    category: "Medical Devices",
    description: "Compressor nebulizer.",
  },

  // Surgical supplies
  {
    name: "Disposable Surgical Gloves Medium",
    brand: "HLL",
    category: "Surgical Supplies",
    description: "Disposable surgical gloves.",
  },
  {
    name: "Disposable Surgical Gloves Large",
    brand: "HLL",
    category: "Surgical Supplies",
    description: "Disposable surgical gloves.",
  },
  {
    name: "Surgical Face Mask",
    brand: "3M",
    category: "Surgical Supplies",
    description: "Disposable surgical face mask.",
  },
  {
    name: "Cotton Roll 100 g",
    brand: "Romsons",
    category: "Surgical Supplies",
    description: "Sterile medical cotton roll.",
  },
  {
    name: "Gauze Swab 10 cm",
    brand: "Romsons",
    category: "Surgical Supplies",
    description: "Medical gauze swab.",
  },
  {
    name: "Elastic Crepe Bandage 4 inch",
    brand: "Tynor",
    category: "Surgical Supplies",
    description: "Elastic crepe bandage.",
  },

  // Dental
  {
    name: "Toothpaste 100 g",
    brand: "Colgate",
    category: "Dental Care",
    description: "Daily fluoride toothpaste.",
  },
  {
    name: "Toothpaste Sensitive 70 g",
    brand: "Sensodyne",
    category: "Dental Care",
    description: "Toothpaste for sensitive teeth.",
  },
  {
    name: "Mouthwash 250 ml",
    brand: "Listerine",
    category: "Dental Care",
    description: "Daily mouthwash.",
  },
  {
    name: "Dental Floss 50 m",
    brand: "Oral-B",
    category: "Dental Care",
    description: "Dental floss.",
  },

  // Hygiene
  {
    name: "Sanitary Pads Regular 20 Pack",
    brand: "Whisper",
    category: "Feminine Hygiene",
    description: "Regular sanitary pads.",
  },
  {
    name: "Sanitary Pads XL 15 Pack",
    brand: "Stayfree",
    category: "Feminine Hygiene",
    description: "Extra large sanitary pads.",
  },
  {
    name: "Adult Diapers Medium",
    brand: "Friends",
    category: "Adult Care",
    description: "Adult incontinence diapers.",
  },
  {
    name: "Adult Diapers Large",
    brand: "Friends",
    category: "Adult Care",
    description: "Adult incontinence diapers.",
  },

  // Diagnostics
  {
    name: "Urine Test Strips",
    brand: "AccuSure",
    category: "Diagnostics",
    description: "Urinalysis test strips.",
  },
  {
    name: "Pregnancy Test Kit",
    brand: "Prega News",
    category: "Diagnostics",
    description: "Home pregnancy test kit.",
  },
  {
    name: "Blood Glucose Test Strips",
    brand: "Accu-Chek",
    category: "Diagnostics",
    description: "Blood glucose test strips.",
  },

  // Nutrition
  {
    name: "ORS Powder Orange 21 g",
    brand: "Electral",
    category: "Nutrition",
    description: "Oral rehydration salts.",
  },
  {
    name: "ORS Powder Lemon 21 g",
    brand: "Electral",
    category: "Nutrition",
    description: "Oral rehydration salts.",
  },
  {
    name: "Energy Drink Powder 500 g",
    brand: "Horlicks",
    category: "Nutrition",
    description: "Nutritional beverage powder.",
  },
];

/**
 * ---------------------------------------------------------
 * Generate additional products
 * ---------------------------------------------------------
 *
 * The catalogue above provides realistic search terms.
 * Additional generated products make the dataset large enough
 * to test search, pagination and OpenSearch indexing.
 */

const additionalProductBases = [
  "Paracetamol",
  "Ibuprofen",
  "Amoxicillin",
  "Azithromycin",
  "Cetirizine",
  "Pantoprazole",
  "Omeprazole",
  "Vitamin C",
  "Vitamin D3",
  "Calcium",
  "Multivitamin",
  "ORS",
  "Antiseptic",
  "Hand Sanitizer",
  "Moisturizer",
  "Baby Lotion",
  "Baby Shampoo",
  "Surgical Gloves",
  "Face Mask",
  "Gauze",
  "Bandage",
  "Toothpaste",
  "Mouthwash",
  "Protein Powder",
  "Electrolyte Powder",
];

const strengths = [
  "25 mg",
  "50 mg",
  "100 mg",
  "200 mg",
  "250 mg",
  "400 mg",
  "500 mg",
  "650 mg",
  "750 mg",
  "1000 mg",
];

const dosageForms = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Cream",
  "Gel",
  "Powder",
];

const brands = [
  "Cipla",
  "Sun Pharma",
  "Dr Reddy's",
  "Lupin",
  "Mankind",
  "Abbott",
  "Zydus",
  "Torrent",
  "Alkem",
  "Glenmark",
  "Himalaya",
  "Patanjali",
  "Dr Morepen",
  "Tynor",
  "3M",
];

/**
 * ---------------------------------------------------------
 * Main seed
 * ---------------------------------------------------------
 */

async function main() {
  console.log("Starting database seed...");

  /**
   * IMPORTANT:
   *
   * We reset only the seed/test database.
   *
   * Dependency order matters because of foreign keys.
   */
  console.log("Cleaning existing data...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.distributorProduct.deleteMany();
  await prisma.location.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.distributor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  /**
   * -------------------------------------------------------
   * Users
   * -------------------------------------------------------
   */

  console.log(`Creating ${USER_COUNT} users...`);

  const users = Array.from({ length: USER_COUNT }, (_, index) => {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);

    return {
      id: makeUuid(1, index + 1),
      name: `${firstName} ${lastName}`,
      phone: `9${String(index + 1).padStart(9, "0")}`,
      email: `user${index + 1}@seed.retaildist.local`,
      password: "SeedPassword123!",
    };
  });

  await prisma.user.createMany({
    data: users,
  });

  /**
   * -------------------------------------------------------
   * Retailers
   * -------------------------------------------------------
   */

  console.log(`Creating ${RETAILER_COUNT} retailers...`);

  const retailers = Array.from({ length: RETAILER_COUNT }, (_, index) => {
    const user = users[index];

    return {
      id: makeUuid(2, index + 1),
      shopName: `${randomItem([
        "Apollo Pharmacy",
        "MedPlus",
        "Care Pharmacy",
        "Wellness Pharmacy",
        "Health Plus",
        "LifeCare Medical",
        "Shree Medical",
        "City Pharmacy",
        "MediCare",
        "Jan Aushadhi",
      ])} ${index + 1}`,
      userId: user.id,
    };
  });

  await prisma.retailer.createMany({
    data: retailers,
  });

  /**
   * -------------------------------------------------------
   * Distributors
   * -------------------------------------------------------
   */

  console.log(`Creating ${DISTRIBUTOR_COUNT} distributors...`);

  const distributors = Array.from({ length: DISTRIBUTOR_COUNT }, (_, index) => {
    // Users after the retailer users.
    const user = users[RETAILER_COUNT + index];

    return {
      id: makeUuid(3, index + 1),
      businessName: `${randomItem([
        "Medico",
        "HealthCare",
        "Pharma",
        "LifeLine",
        "Wellness",
        "MediSupply",
        "HealthFirst",
        "CarePlus",
        "MedSource",
        "PharmaLink",
      ])} Distributors ${index + 1}`,
      contactInfo: `+91-${randomInt(7000000000, 9999999999)}`,
      userId: user.id,
    };
  });

  await prisma.distributor.createMany({
    data: distributors,
  });

  /**
   * -------------------------------------------------------
   * Locations
   * -------------------------------------------------------
   *
   * Each retailer/distributor gets at least one location.
   * Remaining locations are additional branches.
   *
   * Coordinates are clustered around real Indian cities.
   */

  console.log(`Creating ${LOCATION_COUNT} locations...`);

  const locationRows = [];

  for (let index = 0; index < LOCATION_COUNT; index++) {
    const location = randomItem(locations);

    // Small geographic variation around the city center.
    const latitudeOffset = (random() - 0.5) * 0.08;
    const longitudeOffset = (random() - 0.5) * 0.08;

    const isRetailer = index < RETAILER_COUNT;

    locationRows.push({
      id: makeUuid(4, index + 1),
      address: `${location.addressPrefix}, Shop ${randomInt(
        1,
        999,
      )}, ${location.city}`,
      city: location.city,
      latitude: Number((location.latitude + latitudeOffset).toFixed(6)),
      longitude: Number((location.longitude + longitudeOffset).toFixed(6)),
      retailerId: isRetailer ? retailers[index].id : null,
      distributorId:
        !isRetailer && index - RETAILER_COUNT < DISTRIBUTOR_COUNT
          ? distributors[index - RETAILER_COUNT].id
          : null,
    });
  }

  await prisma.location.createMany({
    data: locationRows,
  });

  /**
   * -------------------------------------------------------
   * Products
   * -------------------------------------------------------
   */

  console.log(`Creating ${PRODUCT_COUNT} products...`);

  const products: Array<{
    id: string;
    name: string;
    description: string;
    brand: string;
    category: string;
  }> = [];

  /**
   * First create the explicitly defined realistic products.
   */
  for (
    let index = 0;
    index < productTemplates.length && products.length < PRODUCT_COUNT;
    index++
  ) {
    const template = productTemplates[index];

    products.push({
      id: makeUuid(5, products.length + 1),
      name: template.name,
      description: template.description,
      brand: template.brand,
      category: template.category,
    });
  }

  /**
   * Generate additional variations.
   */
  while (products.length < PRODUCT_COUNT) {
    const base = randomItem(additionalProductBases);
    const strength = randomItem(strengths);
    const dosageForm = randomItem(dosageForms);
    const brand = randomItem(brands);

    let category = "Medicines";

    if (
      base.includes("Vitamin") ||
      base.includes("Calcium") ||
      base.includes("Protein")
    ) {
      category = "Vitamins & Supplements";
    } else if (base.includes("Sanitizer") || base.includes("Antiseptic")) {
      category = "Personal Care";
    } else if (base.includes("Baby")) {
      category = "Baby Care";
    } else if (
      base.includes("Gloves") ||
      base.includes("Mask") ||
      base.includes("Gauze") ||
      base.includes("Bandage")
    ) {
      category = "Surgical Supplies";
    } else if (base.includes("Toothpaste") || base.includes("Mouthwash")) {
      category = "Dental Care";
    } else if (base.includes("ORS") || base.includes("Electrolyte")) {
      category = "Nutrition";
    }

    products.push({
      id: makeUuid(5, products.length + 1),
      name: `${base} ${strength} ${dosageForm} ${products.length + 1}`,
      description: `${base} ${strength} ${dosageForm} product.`,
      brand,
      category,
    });
  }

  await prisma.product.createMany({
    data: products,
  });

  /**
   * -------------------------------------------------------
   * Distributor Products
   * -------------------------------------------------------
   *
   * This is particularly important for testing:
   *
   * Product -> multiple distributors
   *
   * and:
   *
   * Distributor -> many products
   *
   * with different price/stock.
   */

  console.log(
    `Creating approximately ${DISTRIBUTOR_PRODUCT_COUNT} distributor-product records...`,
  );

  const distributorProductPairs = new Set<string>();

  const distributorProducts = [];

  /**
   * First guarantee that every distributor sells
   * a reasonable number of products.
   */
  for (const distributor of distributors) {
    const productsForDistributor = new Set<number>();

    const targetProducts = randomInt(25, 70);

    while (productsForDistributor.size < targetProducts) {
      productsForDistributor.add(randomInt(0, products.length - 1));
    }

    for (const productIndex of productsForDistributor) {
      const product = products[productIndex];

      const pairKey = `${distributor.id}:${product.id}`;

      if (distributorProductPairs.has(pairKey)) {
        continue;
      }

      distributorProductPairs.add(pairKey);

      distributorProducts.push({
        id: makeUuid(6, distributorProducts.length + 1),
        distributorId: distributor.id,
        productId: product.id,
        price: randomPrice(10, 5000),
        stock: randomStock(),
      });
    }
  }

  /**
   * Continue adding random relationships until
   * the requested volume is reached.
   */
  while (distributorProducts.length < DISTRIBUTOR_PRODUCT_COUNT) {
    const distributor = randomItem(distributors);
    const product = randomItem(products);

    const pairKey = `${distributor.id}:${product.id}`;

    if (distributorProductPairs.has(pairKey)) {
      continue;
    }

    distributorProductPairs.add(pairKey);

    distributorProducts.push({
      id: makeUuid(6, distributorProducts.length + 1),
      distributorId: distributor.id,
      productId: product.id,
      price: randomPrice(10, 5000),
      stock: randomStock(),
    });
  }

  await prisma.distributorProduct.createMany({
    data: distributorProducts,
  });

  /**
   * -------------------------------------------------------
   * Summary
   * -------------------------------------------------------
   */

  console.log("");
  console.log("========================================");
  console.log("Seed completed successfully");
  console.log("========================================");
  console.log(`Users:                 ${users.length}`);
  console.log(`Retailers:             ${retailers.length}`);
  console.log(`Distributors:          ${distributors.length}`);
  console.log(`Locations:             ${locationRows.length}`);
  console.log(`Products:              ${products.length}`);
  console.log(`Distributor Products:  ${distributorProducts.length}`);
  console.log("========================================");
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
