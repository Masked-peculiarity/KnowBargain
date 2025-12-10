import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const categories = [
  { id: "all", label: "All Deals", icon: "🔥" },
  { id: "electronics", label: "Electronics", icon: "💻" },
  { id: "fashion", label: "Fashion", icon: "👕" },
  { id: "home", label: "Home & Kitchen", icon: "🏠" },
  { id: "beauty", label: "Beauty", icon: "💄" },
  { id: "sports", label: "Sports", icon: "⚽" },
  { id: "books", label: "Books", icon: "📚" },
  { id: "toys", label: "Toys", icon: "🎮" },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 p-1">
        {categories.map((category) => (
          <Badge
            key={category.id}
            variant={selected === category.id ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm transition-all hover:scale-105"
            onClick={() => onSelect(category.id)}
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default CategoryFilter;
