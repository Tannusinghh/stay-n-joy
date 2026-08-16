export interface Property {
  id: string;
  title: string;
  location: string;
  country: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  category: string;
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  description: string;
  host: {
    name: string;
    avatar: string;
    superhost: boolean;
    joinedYear: number;
  };
  houseRules: string[];
  cancellationPolicy: string;
  instantBook: boolean;
}

export interface Review {
  id: string;
  propertyId: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: "confirmed" | "completed" | "cancelled";
  bookedAt: string;
}

const IMG = (id: number, w = 800, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

export const properties: Property[] = [
  {
    id: "1",
    title: "Oceanfront Villa with Infinity Pool",
    location: "Uluwatu, Bali",
    country: "Indonesia",
    price: 285,
    rating: 4.95,
    reviewCount: 128,
    images: [
      IMG(1600596542815, 800, 600),
      IMG(1582268611958, 800, 600),
      IMG(1571896349842, 800, 600),
      IMG(1564013799919, 800, 600),
    ],
    category: "Beach",
    guests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Pool", "Kitchen", "Air conditioning", "Ocean view", "Free parking", "Washer", "BBQ grill"],
    description: "Perched on the cliffs of Uluwatu, this stunning villa offers panoramic ocean views from every room. The infinity pool seems to merge with the Indian Ocean, creating a breathtaking visual. Wake up to the sound of waves and enjoy world-class sunsets from your private terrace. The villa features handcrafted Balinese furniture, a fully equipped gourmet kitchen, and spacious living areas perfect for relaxation.",
    host: { name: "Made Wijaya", avatar: "MW", superhost: true, joinedYear: 2018 },
    houseRules: ["No smoking", "No parties", "Check-in after 3 PM", "Check-out before 11 AM"],
    cancellationPolicy: "Free cancellation up to 7 days before check-in. After that, the first night is non-refundable.",
    instantBook: true,
  },
  {
    id: "2",
    title: "Cozy Mountain Chalet with Hot Tub",
    location: "Chamonix, Alps",
    country: "France",
    price: 195,
    rating: 4.88,
    reviewCount: 94,
    images: [
      IMG(1518780664697, 800, 600),
      IMG(1542718610476, 800, 600),
      IMG(1520250497591, 800, 600),
      IMG(1506905925346, 800, 600),
    ],
    category: "Mountain",
    guests: 8,
    bedrooms: 4,
    beds: 5,
    bathrooms: 3,
    amenities: ["WiFi", "Hot tub", "Fireplace", "Kitchen", "Ski-in/Ski-out", "Free parking", "Mountain view", "Heating"],
    description: "Nestled in the heart of the French Alps, this traditional chalet combines rustic charm with modern luxury. After a day on the slopes, unwind in the private hot tub with stunning mountain views, or gather around the stone fireplace. The chalet sleeps eight comfortably across four beautifully appointed bedrooms.",
    host: { name: "Pierre Dumont", avatar: "PD", superhost: true, joinedYear: 2019 },
    houseRules: ["No smoking indoors", "Quiet hours 10 PM - 8 AM", "Remove ski boots at entrance"],
    cancellationPolicy: "Moderate: Full refund up to 5 days before check-in.",
    instantBook: true,
  },
  {
    id: "3",
    title: "Designer Loft in Historic Quarter",
    location: "Barcelona, Catalonia",
    country: "Spain",
    price: 142,
    rating: 4.92,
    reviewCount: 215,
    images: [
      IMG(1502672260266, 800, 600),
      IMG(1560448204771, 800, 600),
      IMG(1522708323592, 800, 600),
      IMG(1540518614846, 800, 600),
    ],
    category: "City",
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Air conditioning", "Kitchen", "Washer", "Balcony", "City view", "Coffee maker", "Smart TV"],
    description: "This architect-designed loft sits in the heart of the Gothic Quarter, steps from La Rambla and the cathedral. Soaring ceilings, exposed brick walls, and curated art create a space that's both stylish and inviting. Enjoy morning coffee on the sun-drenched balcony overlooking the charming streets below.",
    host: { name: "Lucia Ferrer", avatar: "LF", superhost: false, joinedYear: 2020 },
    houseRules: ["No parties", "No smoking", "Respect neighbors"],
    cancellationPolicy: "Flexible: Full refund up to 24 hours before check-in.",
    instantBook: true,
  },
  {
    id: "4",
    title: "Secluded Lakefront Cabin",
    location: "Lake Bled, Julian Alps",
    country: "Slovenia",
    price: 168,
    rating: 4.97,
    reviewCount: 67,
    images: [
      IMG(1510414842594, 800, 600),
      IMG(1449158743715, 800, 600),
      IMG(1587061949409, 800, 600),
      IMG(1500382017468, 800, 600),
    ],
    category: "Lakefront",
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Kayak", "Fireplace", "Kitchen", "Lake access", "BBQ grill", "Hiking trails", "Bird watching"],
    description: "Escape to this idyllic lakefront cabin surrounded by pristine nature. Fall asleep to the gentle lapping of water and wake up to misty mountain views. The cabin features a private dock with kayaks, a cozy fireplace, and floor-to-ceiling windows that frame the stunning lake panorama.",
    host: { name: "Ana Horvat", avatar: "AH", superhost: true, joinedYear: 2017 },
    houseRules: ["No motorboats", "Campfire in designated area only", "Leave no trace"],
    cancellationPolicy: "Strict: 50% refund up to 7 days before check-in.",
    instantBook: false,
  },
  {
    id: "5",
    title: "Tropical Treehouse Retreat",
    location: "Ubud, Bali",
    country: "Indonesia",
    price: 120,
    rating: 4.91,
    reviewCount: 183,
    images: [
      IMG(1618767689160, 800, 600),
      IMG(1596394516093, 800, 600),
      IMG(1604999333679, 800, 600),
      IMG(1615571022219, 800, 600),
    ],
    category: "Tropical",
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Jungle view", "Breakfast included", "Outdoor shower", "Yoga deck", "Rice terrace view", "Fan cooling"],
    description: "Live among the treetops in this magical bamboo treehouse overlooking terraced rice paddies. This unique eco-retreat offers an immersive tropical experience with all the comforts you need. Enjoy daily breakfast, practice yoga on your private deck, and drift off to the sounds of the jungle.",
    host: { name: "Ketut Suarsa", avatar: "KS", superhost: true, joinedYear: 2016 },
    houseRules: ["Eco-friendly guests only", "No plastic", "Respect wildlife"],
    cancellationPolicy: "Moderate: Full refund up to 5 days before check-in.",
    instantBook: true,
  },
  {
    id: "6",
    title: "Countryside Stone Farmhouse",
    location: "Tuscany, Val d'Orcia",
    country: "Italy",
    price: 225,
    rating: 4.89,
    reviewCount: 156,
    images: [
      IMG(1523531294919, 800, 600),
      IMG(1558618666248, 800, 600),
      IMG(1512917774080, 800, 600),
      IMG(1505576399279, 800, 600),
    ],
    category: "Countryside",
    guests: 10,
    bedrooms: 5,
    beds: 6,
    bathrooms: 3,
    amenities: ["WiFi", "Pool", "Kitchen", "Vineyard", "Free parking", "Garden", "Washer", "BBQ grill", "Wine cellar"],
    description: "This beautifully restored 17th-century stone farmhouse is set among rolling Tuscan hills and vineyards. Enjoy the private pool, tend the herb garden, and sample wines from the estate's own cellar. With five bedrooms, it's perfect for families or groups seeking an authentic Italian countryside experience.",
    host: { name: "Giovanni Rossi", avatar: "GR", superhost: true, joinedYear: 2015 },
    houseRules: ["No smoking indoors", "Pool hours 8 AM - 9 PM", "Respect the vineyard"],
    cancellationPolicy: "Strict: 50% refund up to 14 days before check-in.",
    instantBook: false,
  },
  {
    id: "7",
    title: "Modern Beachfront Apartment",
    location: "Tulum, Riviera Maya",
    country: "Mexico",
    price: 175,
    rating: 4.85,
    reviewCount: 112,
    images: [
      IMG(1590523277543, 800, 600),
      IMG(1600607687939, 800, 600),
      IMG(1600585154340, 800, 600),
      IMG(1600573472591, 800, 600),
    ],
    category: "Beach",
    guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Pool", "Beach access", "Air conditioning", "Kitchen", "Rooftop terrace", "Bike rental", "Yoga"],
    description: "Steps from the turquoise Caribbean Sea, this modern apartment blends minimalist Mexican design with bohemian Tulum vibes. The rooftop terrace offers ocean views and the perfect spot for sunset cocktails. Explore cenotes, Mayan ruins, and world-class restaurants all within easy reach.",
    host: { name: "Carlos Rivera", avatar: "CR", superhost: false, joinedYear: 2021 },
    houseRules: ["No parties", "Beach towels provided", "Recycle"],
    cancellationPolicy: "Flexible: Full refund up to 24 hours before check-in.",
    instantBook: true,
  },
  {
    id: "8",
    title: "Glass Cabin in the Forest",
    location: "Rovaniemi, Lapland",
    country: "Finland",
    price: 310,
    rating: 4.98,
    reviewCount: 89,
    images: [
      IMG(1520250497591, 800, 600),
      IMG(1477959858617, 800, 600),
      IMG(1551524559800, 800, 600),
      IMG(1517299321609, 800, 600),
    ],
    category: "Mountain",
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Glass ceiling", "Sauna", "Northern lights view", "Heated floors", "Fireplace", "Snowshoes", "Kitchen"],
    description: "Experience the magic of Lapland from this extraordinary glass-roofed cabin. Watch the Northern Lights dance across the sky from the warmth of your bed. The cabin features a private sauna, heated floors, and is surrounded by pristine Arctic forest. Snowmobile and husky sled tours can be arranged.",
    host: { name: "Elina Korhonen", avatar: "EK", superhost: true, joinedYear: 2019 },
    houseRules: ["No shoes inside", "Sauna etiquette guide provided", "Check aurora forecast nightly"],
    cancellationPolicy: "Moderate: Full refund up to 5 days before check-in.",
    instantBook: false,
  },
  {
    id: "9",
    title: "Penthouse with Skyline Views",
    location: "Manhattan, New York",
    country: "USA",
    price: 450,
    rating: 4.82,
    reviewCount: 201,
    images: [
      IMG(1502672260266, 800, 600),
      IMG(1560448204771, 800, 600),
      IMG(1560185127830, 800, 600),
      IMG(1600607687644, 800, 600),
    ],
    category: "City",
    guests: 6,
    bedrooms: 3,
    beds: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Gym", "Doorman", "Air conditioning", "Kitchen", "City view", "Elevator", "Smart home", "Washer"],
    description: "Live like a New Yorker in this stunning penthouse apartment with floor-to-ceiling windows showcasing the iconic Manhattan skyline. Located in a full-service building with gym and concierge, you're steps from Central Park, world-class dining, and Broadway theaters.",
    host: { name: "Sarah Mitchell", avatar: "SM", superhost: false, joinedYear: 2020 },
    houseRules: ["No smoking", "No parties", "Building quiet hours 11 PM - 7 AM"],
    cancellationPolicy: "Strict: 50% refund up to 7 days before check-in.",
    instantBook: true,
  },
  {
    id: "10",
    title: "Overwater Bungalow Paradise",
    location: "Bora Bora, Leeward Islands",
    country: "French Polynesia",
    price: 520,
    rating: 4.99,
    reviewCount: 45,
    images: [
      IMG(1573843981267, 800, 600),
      IMG(1540541338287, 800, 600),
      IMG(1571003123894, 800, 600),
      IMG(1544551763604, 800, 600),
    ],
    category: "Tropical",
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Glass floor", "Ocean view", "Snorkeling gear", "Kayak", "Breakfast included", "Private deck", "Outdoor shower"],
    description: "Suspend reality in this overwater bungalow floating above crystal-clear lagoon waters. The glass floor panel lets you watch tropical fish from your living room. Step directly from your private deck into the warm Pacific waters for snorkeling among coral reefs. Pure paradise.",
    host: { name: "Moana Tehei", avatar: "MT", superhost: true, joinedYear: 2018 },
    houseRules: ["Reef-safe sunscreen only", "No fishing from bungalow", "Respect marine life"],
    cancellationPolicy: "Strict: 50% refund up to 14 days before check-in.",
    instantBook: false,
  },
  {
    id: "11",
    title: "Historic Riad with Rooftop Terrace",
    location: "Marrakech, Medina",
    country: "Morocco",
    price: 95,
    rating: 4.87,
    reviewCount: 178,
    images: [
      IMG(1558618666248, 800, 600),
      IMG(1523531294919, 800, 600),
      IMG(1600585154340, 800, 600),
      IMG(1505576399279, 800, 600),
    ],
    category: "City",
    guests: 6,
    bedrooms: 3,
    beds: 4,
    bathrooms: 2,
    amenities: ["WiFi", "Courtyard pool", "Rooftop terrace", "Breakfast included", "Air conditioning", "Traditional decor", "Hammam"],
    description: "Step through an unassuming door in the ancient Medina to discover this stunning riad, a hidden oasis of calm. The central courtyard features a mosaic-tiled plunge pool, while the rooftop terrace offers panoramic views of the Atlas Mountains. Traditional Moroccan breakfast served daily.",
    host: { name: "Youssef Amrani", avatar: "YA", superhost: true, joinedYear: 2017 },
    houseRules: ["Remove shoes in courtyard", "Respect local customs", "No alcohol in common areas"],
    cancellationPolicy: "Flexible: Full refund up to 24 hours before check-in.",
    instantBook: true,
  },
  {
    id: "12",
    title: "Lakeside A-Frame Cabin",
    location: "Lake Tahoe, California",
    country: "USA",
    price: 210,
    rating: 4.93,
    reviewCount: 134,
    images: [
      IMG(1449158743715, 800, 600),
      IMG(1510414842594, 800, 600),
      IMG(1518780664697, 800, 600),
      IMG(1500382017468, 800, 600),
    ],
    category: "Lakefront",
    guests: 6,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    amenities: ["WiFi", "Hot tub", "Fireplace", "Kitchen", "Lake access", "Free parking", "Board games", "Deck", "Mountain view"],
    description: "This iconic A-frame cabin sits just steps from Lake Tahoe's crystal-clear shores. The dramatic floor-to-ceiling windows flood the space with natural light and frame stunning lake and mountain views. Enjoy the hot tub under the stars, cozy up by the fireplace, or kayak on the lake.",
    host: { name: "Jake Morrison", avatar: "JM", superhost: true, joinedYear: 2019 },
    houseRules: ["No smoking", "Bear-proof trash cans provided", "Quiet hours after 10 PM"],
    cancellationPolicy: "Moderate: Full refund up to 5 days before check-in.",
    instantBook: true,
  },
];

export const reviews: Review[] = [
  { id: "r1", propertyId: "1", userName: "Emma S.", avatar: "ES", rating: 5, date: "2025-12-15", comment: "Absolutely breathtaking! The infinity pool overlooking the ocean was surreal. Made made us feel so welcome. Will definitely return!" },
  { id: "r2", propertyId: "1", userName: "Tom K.", avatar: "TK", rating: 5, date: "2025-11-20", comment: "Perfect honeymoon spot. The sunset views are even better than the photos. Highly recommend!" },
  { id: "r3", propertyId: "1", userName: "Yuki M.", avatar: "YM", rating: 4, date: "2025-10-05", comment: "Beautiful villa with amazing views. The kitchen was well-stocked. Only wish the WiFi was a bit stronger." },
  { id: "r4", propertyId: "2", userName: "Sophie L.", avatar: "SL", rating: 5, date: "2025-12-28", comment: "The hot tub with mountain views was a dream! Perfect ski-in/ski-out location. Pierre was an amazing host." },
  { id: "r5", propertyId: "2", userName: "Marco B.", avatar: "MB", rating: 5, date: "2025-11-10", comment: "Cozy and charming with everything you need. The fireplace made cold evenings magical." },
  { id: "r6", propertyId: "3", userName: "Alex R.", avatar: "AR", rating: 5, date: "2026-01-05", comment: "Incredible location right in the Gothic Quarter. The loft is even more beautiful in person!" },
  { id: "r7", propertyId: "3", userName: "Nina P.", avatar: "NP", rating: 5, date: "2025-12-12", comment: "Stylish apartment with a perfect balcony for people-watching. Lucia gave great restaurant recommendations." },
  { id: "r8", propertyId: "4", userName: "Hans W.", avatar: "HW", rating: 5, date: "2025-09-20", comment: "The most peaceful place I've ever stayed. Kayaking at sunrise was unforgettable." },
  { id: "r9", propertyId: "5", userName: "Rachel D.", avatar: "RD", rating: 5, date: "2026-01-18", comment: "Magical treehouse experience! Waking up to jungle sounds and rice paddy views was something else." },
  { id: "r10", propertyId: "6", userName: "James H.", avatar: "JH", rating: 5, date: "2025-10-30", comment: "The perfect Tuscan getaway. Wine from the cellar, swimming in the pool, cooking with garden herbs — la dolce vita!" },
  { id: "r11", propertyId: "7", userName: "Lisa M.", avatar: "LM", rating: 4, date: "2025-11-15", comment: "Great location in Tulum. Loved the rooftop terrace. Beach was steps away!" },
  { id: "r12", propertyId: "8", userName: "Olga V.", avatar: "OV", rating: 5, date: "2025-12-01", comment: "Saw the Northern Lights from bed! The sauna was incredible. A once-in-a-lifetime experience." },
];

export const sampleBookings: Booking[] = [
  { id: "b1", propertyId: "1", checkIn: "2026-04-10", checkOut: "2026-04-17", guests: 4, totalPrice: 1995, status: "confirmed", bookedAt: "2026-03-01" },
  { id: "b2", propertyId: "3", checkIn: "2025-11-05", checkOut: "2025-11-10", guests: 2, totalPrice: 710, status: "completed", bookedAt: "2025-10-01" },
  { id: "b3", propertyId: "6", checkIn: "2025-08-20", checkOut: "2025-08-27", guests: 8, totalPrice: 1575, status: "completed", bookedAt: "2025-07-15" },
  { id: "b4", propertyId: "9", checkIn: "2026-06-01", checkOut: "2026-06-05", guests: 3, totalPrice: 1800, status: "confirmed", bookedAt: "2026-02-20" },
  { id: "b5", propertyId: "5", checkIn: "2025-12-20", checkOut: "2025-12-27", guests: 2, totalPrice: 840, status: "cancelled", bookedAt: "2025-11-01" },
];

export const categories = [
  { name: "Beach", icon: "Waves" },
  { name: "Mountain", icon: "Mountain" },
  { name: "City", icon: "Building2" },
  { name: "Countryside", icon: "TreePine" },
  { name: "Lakefront", icon: "Sailboat" },
  { name: "Tropical", icon: "Palmtree" },
] as const;
