import { useState } from "react";
import Navbar from "@/components/Navbar";
import DealCard from "@/components/DealCard";
import CategoryFilter from "@/components/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Clock, Star, Link } from "lucide-react";
import { useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { useNavigate } from 'react-router-dom';



const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleClick = () => {
        navigate('/login'); 
  };

  useEffect(() => {
    async function loadDeals() {
      try {
        const data = await apiFetch("/deals/");
        setDeals(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDeals();
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-8 text-center">
          <h1 className="mb-3 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Discover Amazing Deals
          </h1>
          <p className="text-muted-foreground">
            Community-driven deals on products you love. Save money, share finds!
          </p>
          <div className="mb-3 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            <Button onClick={handleClick}>Login
              
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Sort Tabs */}
        <div className="mb-6 flex items-center justify-between">
          <Tabs value={sortBy} onValueChange={setSortBy} className="w-full sm:w-auto">
            <TabsList>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="latest" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Latest
              </TabsTrigger>
              <TabsTrigger value="top" className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Top Rated
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Deals Feed */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading deals...</p>
          ) : (
            deals.map((deal) => (
              <DealCard
                key={deal.id}
                id={deal.id}
                title={deal.title}
                description={deal.description}
                image_url={deal.image_url}
                price={`₹${deal.price}`}
                category={deal.category}
                votes={deal.score}
                comments={deal.comment_count}
                link={deal.link}
                seller={deal.username}
                status={deal.status}
              />
            ))
          )}
        </div>

        {/* Load More */}
        <div className="mt-8 text-center">
          <Button variant="outline" size="lg">
            Load More Deals
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Home;
