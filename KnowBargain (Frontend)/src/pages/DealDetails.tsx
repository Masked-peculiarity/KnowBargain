import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUp,
  Bookmark,
  Share2,
  ExternalLink,
  AlertTriangle,
  MessageSquare,
  TrendingDown,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";



const DealDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [deal, setDeal] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [priceHistory, setPriceHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadDeal() {
      try {
        const dealData = await apiFetch(`/deals/${id}`);
        const commentData = await apiFetch(`/deals/${id}/comments`);
        const priceData = await apiFetch(`/deals/${id}/price_history`);
        setDeal(dealData);
        setComments(commentData);
        setPriceHistory(priceData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDeal();
  }, [id]);


  const handleComment = async () => {
    try {
      await apiFetch(`/deals/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: commentText }),
      });
      setCommentText("");
      const updated = await apiFetch(`/deals/${id}/comments`);
      setComments(updated);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };


  const handleSave = async () => {
    try {
      await apiFetch(`/deals/${id}/save`, { method: "POST" });
      toast({
        title: "Deal saved!",
        description: "You can find it in your saved deals.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReport = () => {
    toast({
      title: "Report submitted",
      description: "Thank you for helping keep our community accurate!",
    });
  };

  const handleSimulatePriceChange = async () => {
    try {
      const res = await apiFetch(`/deals/${id}/simulate_price_change`, {
        method: "POST",
      });

      toast({
        title: "Price Updated!",
        description: `New Price: $${res.new_price}`,
      });

      // ✅ Update deal and chart instantly
      setDeal((prev: any) => ({
        ...prev,
        price: res.new_price,
      }));

      setPriceHistory((prev: any) => [
        ...prev,
        { price: res.new_price, timestamp: res.timestamp },
      ]);
    } catch (err: any) {
      toast({
        title: "Error updating price",
        description: err.message,
        variant: "destructive",
      });
    }
  };

    const handleShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/deal/${id}`);
    toast({
      title: "Link copied!",
      description: "Deal link copied to clipboard.",
    });
  }
  


  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading deal...</p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Deal not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Card */}
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-muted">
                {deal.image_url ? (
                  <img
                    src={deal.image_url}
                    alt={deal.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    No image
                  </div>
                )}
                <Badge className="absolute top-4 right-4 bg-success text-success-foreground">
                  {deal.status === "active" ? "🔥 Active Deal" : deal.status}
                </Badge>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold">{deal.title}</h1>
                    <p className="text-muted-foreground">
                      {deal.description}
                    </p>
                  </div>
                </div>

                <div className="mb-6 flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">₹{deal.price}</span>
                  {deal.original_price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ${deal.original_price}
                      </span>
                      <Badge variant="destructive" className="text-base">
                        {Math.round(((deal.original_price - deal.price) / deal.original_price) * 100)}%
                        OFF
                      </Badge>
                    </>
                  )}
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  {deal.category && <Badge variant="outline">{deal.category}</Badge>}
                  {deal.seller && <Badge variant="outline">{deal.seller}</Badge>}
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="lg" asChild>
                    <a href={deal.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Get This Deal
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleSave}>
                    <Bookmark className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="lg" onClick={handleShare}>
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
                <div className="mt-4">
                  <Button variant="secondary" size="lg" onClick={handleSimulatePriceChange}>
                    Get Recent Price
                  </Button>
                </div>
              </div>
            </Card>

            {/* Price History */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Price History</h2>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* Comments Section */}
            <Card className="p-6">
              <div className="mb-6 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Discussion ({comments.length})</h2>
              </div>

              <div className="mb-6">
                <Textarea
                  placeholder="Share your thoughts about this deal..."
                  className="mb-2"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <Button onClick={handleComment}>Post Comment</Button>
              </div>

              <Separator className="mb-6" />

              {comments.length === 0 ? (
                <p className="text-muted-foreground">No comments yet.</p>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {comment.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{comment.username}</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          {new Date(comment.created_at).toLocaleString()}
                        </p>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4 font-bold">Deal Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Score</span>
                  <span className="font-bold">{deal.score}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted by</span>
                  <span className="font-bold">{deal.username}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <Button variant="outline" className="w-full" onClick={handleReport}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Report Issue
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DealDetails;
