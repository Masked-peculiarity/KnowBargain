import { Link } from "react-router-dom";
import { Search, PlusCircle, Bookmark, User, TrendingUp, House} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            KnowBargain
          </span>
        </Link>


        <div className="flex items-center space-x-2">
          <ThemeToggle />
          <Link to="/">
          <Button variant="ghost" size="icon" className="hidden md:inline-flex">
            <House className="h-5 w-5 " />
          </Button>
          </Link>
          <Link to="/submit">
            <Button variant="default" className="hidden sm:flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              Submit Deal
            </Button>
            <Button variant="default" size="icon" className="sm:hidden">
              <PlusCircle className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/saved">
            <Button variant="ghost" size="icon">
              <Bookmark className="h-5 w-5" />
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
