"use client";

import { useMemo, useState } from "react";
import { LUCIDE_PATHS } from "@/lib/lucide-paths";
import Icon from "./Icon";

// آیکون‌های دستیِ قدیمی که هنوز در دیتابیس استفاده می‌شوند
const LEGACY_NAMES = [
  "phone", "laptop", "tablet", "watch", "coins", "basket", "shirt",
  "gamepad", "wrench", "headphones", "home", "coffee", "book", "spray",
  "gift", "lamp", "camera", "t-shirt", "shoe", "monitor", "tag", "box",
  "heart", "car",
];

// آیکون‌های محبوب Lucide که به‌صورت پیش‌فرض نمایش داده می‌شوند
const POPULAR_LUCIDE = [
  "Smartphone", "Laptop", "Tablet", "Watch", "Headphones", "Shirt", "Gamepad2",
  "Wrench", "ShoppingBag", "ShoppingCart", "House", "Coffee", "BookOpen", "Gift",
  "Lamp", "Camera", "Monitor", "Tag", "Package", "Heart", "Car", "Truck",
  "Sparkles", "Flame", "Box", "Star", "Clock", "Bell", "User", "Search",
  "Mail", "Lock", "Key", "CreditCard", "MapPin", "Phone", "Shield", "ArrowRight",
  "Calendar", "Tv", "Radio", "Mic", "Speaker", "Battery", "Cpu", "HardDrive",
  "Printer", "Keyboard", "Mouse", "MemoryStick", "Plug", "Router", "Refrigerator",
  "WashingMachine", "Microwave", "Blender", "Utensils", "CupSoda", "Pizza",
  "Drumstick", "Beef", "Wine", "Beer", "Snowflake", "Sun", "Moon", "Cloud",
  "Umbrella", "Wind", "Trees", "Flower2", "PawPrint", "Baby", "Puzzle", "ToyBrick",
  "Bike", "Dumbbell", "Tent", "TreePalm", "Plane", "TrainFront", "Bus", "AirVent",
  "CarFront", "Fuel", "Gem", "Crown", "Trophy", "Medal", "Award", "BadgeCheck",
  "ThumbsUp", "ThumbsDown", "MessageCircle", "Send", "Share2", "Bookmark",
  "Download", "Upload", "Settings", "SlidersHorizontal", "ListFilter", "LayoutGrid",
  "List", "Eye", "ShoppingBasket", "Banknote", "Sparkle", "Gamepad", "Sofa",
  "Armchair", "MonitorSmartphone", "Sailboat", "Ship", "Rocket", "Leaf", "Sprout",
  "Salad", "Sandwich", "IceCreamBowl", "CakeSlice", "Candy", "Cherry", "Apple",
  "Wheat", "Milk", "EggFried", "Fish", "Soup", "ChefHat", "Martini", "GlassWater",
  "UtensilsCrossed", "Backpack", "Binoculars", "Compass", "Globe", "Map",
  "Navigation", "Timer", "AlarmClock", "Hourglass", "CalendarDays", "Palette",
  "Paintbrush", "Hammer", "Axe", "PocketKnife", "Shovel", "PenTool", "Pencil",
  "Ruler", "Clipboard", "FileText", "FolderOpen", "Inbox", "Layers", "Zap",
  "PlugZap", "Lightbulb", "Flashlight", "SunMedium", "MoonStar", "CloudSun",
  "CloudRain", "CloudSnow", "CloudLightning", "Tornado", "Droplets", "Rainbow",
  "Mountain", "MountainSnow", "TreeDeciduous", "TreePine", "Bird", "Dog", "Cat",
  "Rabbit", "Snail", "Turtle",
];

type Props = {
  value: string;
  onChange: (name: string) => void;
};

export default function IconPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState("");

  const allLucide = useMemo(
    () =>
      Object.keys(LUCIDE_PATHS)
        .filter((n) => !LEGACY_NAMES.includes(n))
        .sort((a, b) => a.localeCompare(b)),
    [],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return POPULAR_LUCIDE.filter((n) => LUCIDE_PATHS[n]);
    }
    return allLucide
      .filter((n) => n.toLowerCase().includes(q))
      .slice(0, 300);
  }, [query, allLucide]);

  const selected = value || "tag";

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="جستجوی آیکون (مثلاً phone یا shirt)..."
        style={{
          padding: "6px 10px",
          borderRadius: 6,
          border: "1px solid var(--border)",
          fontSize: 13,
          width: "100%",
          marginBottom: 8,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
          gap: 6,
          maxHeight: 240,
          overflowY: "auto",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: 8,
          background: "var(--bg)",
        }}
      >
        {visible.map((n) => {
          const isActive = n === selected;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              title={n}
              aria-label={n}
              aria-pressed={isActive}
              style={{
                aspectRatio: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
                border: isActive ? "2px solid #ef4050" : "1px solid var(--border)",
                background: isActive ? "rgba(239,64,80,0.08)" : "var(--panel)",
                cursor: "pointer",
              }}
            >
              <Icon name={n} size={18} />
            </button>
          );
        })}
        {visible.length === 0 && (
          <p style={{ fontSize: 12, color: "var(--text-muted)", padding: 8 }}>
            آیکونی با این اسم پیدا نشد.
          </p>
        )}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>
        {query.trim()
          ? `${visible.length} آیکون یافت شد (از ${allLucide.length} آیکون Lucide)`
          : `${POPULAR_LUCIDE.length} آیکون محبوب — برای جستجو در همه آیکون‌ها تایپ کنید`}
      </div>
    </div>
  );
}
