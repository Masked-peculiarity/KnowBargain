import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp, MessageSquare, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import DealCard from "@/components/DealCard";

const Profile = () => {

  const [user, setUser] = useState<any>(null);
  const [userDeals, setUserDeals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function loadProfile() {
      try {
        const me = await apiFetch("/auth/me");
        setUser(me);
        const statsData = await apiFetch("/auth/stats");
        setStats(statsData);
        const allDeals = await apiFetch("/deals/");
        setUserDeals(allDeals.filter((d) => d.username === me.username));
      } catch (err) {
        console.error(err);
        toast({
          title: "Error loading profile",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{user?.username}</h1>
              <p className="mb-4 text-muted-foreground">
                {user?.email}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{stats?.deals || 0} Deals Posted</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{stats?.comments || 0} Comments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{stats?.karma || 0} Karma</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="mb-2 text-2xl font-bold text-primary">
              {stats?.deals || 0}
            </div>
            <div className="text-sm text-muted-foreground">Deals Shared</div>
          </Card>
          
          <Card className="p-4">
            <div className="mb-2 text-2xl font-bold text-success">
              {stats?.karma || 0}
            </div>
            <div className="text-sm text-muted-foreground">Total Upvotes</div>
          </Card>
          <Card className="p-4">
            <div className="mb-2 text-2xl font-bold text-primary">
              {stats?.saved || 0}
            </div>
            <div className="text-sm text-muted-foreground">Saved Deals</div>
          </Card>
        </div>

        {/* Activity Tabs */}
        <Tabs defaultValue="deals" className="w-full">
          <TabsList>
            <TabsTrigger value="deals">My Deals</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          {/* My Deals */}
          <TabsContent value="deals" className="mt-6">
            <Card className="p-6">
              {userDeals.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  You haven’t posted any deals yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {userDeals.map((deal) => (
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
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="comments" className="mt-6">
            <Card className="p-6">
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <div className="mb-2 text-sm text-muted-foreground">
                      Comment on "Amazing Product Deal" • 1 day ago
                    </div>
                    <p className="text-sm">
                      Great find! I've been waiting for this deal for weeks. Just ordered mine!
                    </p>
                    <div className="mt-2">
                      <Badge variant="outline">12 upvotes</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            <Card className="p-6">
              <p className="text-center text-muted-foreground">
                View all your saved deals on the{" "}
                <a href="/saved" className="text-primary hover:underline">
                  Saved Deals page
                </a>
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
