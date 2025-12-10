import Navbar from "@/components/Navbar";
import DealCard from "@/components/DealCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark } from "lucide-react";
import { useState, useEffect,useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
 
const SavedDeals = () => {

  const [savedDeals, setSavedDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSavedDeals = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/deals/saved");
      setSavedDeals(data);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error fetching saved deals",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

    useEffect(() => {
    loadSavedDeals();
  }, [loadSavedDeals]);

  // ✅ Separate active and expired deals dynamically
  const activeDeals = savedDeals.filter((deal) => deal.status === "active");
  const expiredDeals = savedDeals.filter((deal) => deal.status === "expired");

  // Loader state while fetching
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your saved deals...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <Bookmark className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Saved Deals</h1>
            <p className="text-muted-foreground">
              Your bookmarked deals in one place
            </p>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Deals</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
            <TabsTrigger value="all">All Saved</TabsTrigger>
          </TabsList>

          {/* Active Deals Tab */}
          <TabsContent value="active" className="space-y-4">
            {activeDeals.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No active saved deals
              </p>
            ) : (
              activeDeals.map((deal) => <DealCard
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
                onSaveToggle={loadSavedDeals} />)
            )}
          </TabsContent>

          {/* Expired Deals Tab */}
          <TabsContent value="expired" className="space-y-4">
            {expiredDeals.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
                <p className="text-muted-foreground">No expired deals saved</p>
              </div>
            ) : (
              expiredDeals.map((deal) => <DealCard key={deal.id} {...deal} onSaveToggle={loadSavedDeals} />)
            )}
          </TabsContent>

          {/* All Saved Deals Tab */}
          <TabsContent value="all" className="space-y-4">
            {savedDeals.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No saved deals yet
              </p>
            ) : (
              savedDeals.map((deal) => <DealCard
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
                onSaveToggle={loadSavedDeals} />)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SavedDeals;

