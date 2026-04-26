import lalibelaImg from "@/assets/experience-lalibela.jpg";
import gondarImg from "@/assets/experience-gondar.jpg";
import bluenileImg from "@/assets/experience-bluenile.jpg";

export interface Experience {
  id: string;
  image: string;
  location: string;
  title: string;
  hostName: string;
  rating: number;
  price: number;
  badge?: string;
  duration: string;
  maxGuests: number;
  languages: string;
  description: string;
  reviewCount: number;
}

export const experiences: Experience[] = [
  {
    id: "1",
    image: lalibelaImg,
    location: "Lalibela, Amhara",
    title: "The Hidden Secrets of Rock-Hewn Churches",
    hostName: "Dawit K.",
    rating: 4.9,
    price: 2450,
    badge: "Heritage Badge",
    duration: "Full Day",
    maxGuests: 8,
    languages: "Amharic, English",
    description: "Descend into a world carved from solid rock over 900 years ago. Walk the sacred corridors of Lalibela's churches with a local guide whose ancestors have worshipped here for generations.",
    reviewCount: 128,
  },
  {
    id: "2",
    image: "/imgs/image1.jpg",
    location: "Addis Ababa",
    title: "Authentic Enkutatash Feast & Cooking",
    hostName: "Selam W.",
    rating: 5.0,
    price: 1800,
    duration: "4 Hours",
    maxGuests: 6,
    languages: "Amharic, English",
    description: "Gather around a mesob and learn to prepare injera, tibs, and misir wot from a home cook who has been feeding her community for decades. A feast of flavors and stories.",
    reviewCount: 95,
  },
  {
    id: "3",
    image: "/imgs/image8.jpg",
    location: "Simien Mountains",
    title: "Simien Peaks: Sunset Wildlife Trek",
    hostName: "Yohannes T.",
    rating: 4.8,
    price: 3200,
    duration: "3 Days",
    maxGuests: 10,
    languages: "Amharic, English",
    description: "Trek through the roof of Africa, encountering Gelada baboons grazing on cliff edges and breathtaking gorge vistas that stretch all the way to Sudan.",
    reviewCount: 76,
  },
  {
    id: "4",
    image: gondarImg,
    location: "Gondar, Amhara",
    title: "Gondarine Castles: A Royal Night Walk",
    hostName: "Amanueal B.",
    rating: 4.9,
    price: 2100,
    duration: "3 Hours",
    maxGuests: 12,
    languages: "Amharic, English",
    description: "Walk through the illuminated medieval castles of Gondar as twilight falls over the ancient royal compound and your guide narrates centuries of imperial intrigue.",
    reviewCount: 64,
  },
  {
    id: "5",
    image: bluenileImg,
    location: "Bahir Dar",
    title: "Blue Nile Falls & Island Monasteries",
    hostName: "Tigist G.",
    rating: 5.0,
    price: 2900,
    duration: "Full Day",
    maxGuests: 8,
    languages: "Amharic, English",
    description: "Boat to remote island monasteries on Lake Tana, then follow the Nile to witness the thundering Blue Nile Falls, a sacred site where water, faith, and nature converge.",
    reviewCount: 112,
  },
  {
    id: "6",
    image: "/imgs/hero-1.jpg",
    location: "Danakil, Afar",
    title: "Dallol Expedition: Landscape of Mars",
    hostName: "Mohammed A.",
    rating: 4.7,
    price: 5500,
    badge: "Extreme",
    duration: "2 Days",
    maxGuests: 6,
    languages: "Afar, Amharic, English",
    description: "Descend below sea level into the Danakil Depression, a kaleidoscopic world of sulfur springs, salt caravans, and lava lakes that make Earth look like another planet entirely.",
    reviewCount: 43,
  },
  {
    id: "7",
    image: "/imgs/hero.jpg",
    location: "Simien Mountains",
    title: "Golden Hour Above the Clouds",
    hostName: "Tigabu M.",
    rating: 4.9,
    price: 1950,
    badge: "New",
    duration: "Half Day",
    maxGuests: 8,
    languages: "Amharic, English",
    description: "Hike to a secret ridge above 3,800 m and watch the Simien sunset paint the sky in fire. Your guide will share local legends as darkness blankets the valley below.",
    reviewCount: 31,
  },
  {
    id: "8",
    image: "/imgs/image3.webp",
    location: "Bale Mountains",
    title: "Deep Valleys & Highland Communities",
    hostName: "Birtukan A.",
    rating: 4.8,
    price: 2750,
    duration: "2 Days",
    maxGuests: 10,
    languages: "Oromia, Amharic, English",
    description: "Wind through lush highland valleys dotted with teff fields and eucalyptus forests, spending a night in a traditional Oromo homestead with a family that has farmed these slopes for generations.",
    reviewCount: 22,
  },
];
