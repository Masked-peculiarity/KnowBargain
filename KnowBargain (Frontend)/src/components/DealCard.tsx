import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUp, MessageSquare, Bookmark, Share2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";
import { useState } from "react";


interface DealCardProps {
  id: string | number;
  title: string;
  description?: string;
  image_url?: string;
  price?: string | number;
  originalPrice?: string;
  discount?: string;
  seller?: string;
  status?: "active" | "expired" | "out-of-stock" | "price-mistake";
  votes?: number;
  comments?: number;
  category?: string;
  link?: string;
  onSaveToggle?: () => void;
}

const DealCard = ({
  id,
  title,
  description,
  image_url,
  price,
  originalPrice,
  discount,
  seller,
  status,
  votes,
  comments,
  category,
  link,
  onSaveToggle,
}: DealCardProps) => {

  console.log("DealCard category:", category);



  const [isSaved, setIsSaved] = useState(false);
  const [currentVotes, setCurrentVotes] = useState(votes);
  const [isVoted, setIsVoted] = useState(false);
  const [notisVoted, notsetIsVoted] = useState(false);

  const handleVote = async (type: "upvote" | "downvote") => {
    try {
      const res = await apiFetch(`/deals/${id}/vote`, {
        method: "POST",
        body: JSON.stringify({ vote_type: type === "upvote" ? "up" : "down" }),
      });

      // Handle response correctly depending on your apiFetch
      if (res && res.score !== undefined) {
        setCurrentVotes(res.score);
        toast({ title: res.message });
        setIsVoted(!isVoted);
        
      } else {
        toast({ title: "Voted!", description: "Your vote has been recorded." });
        setCurrentVotes((prev) => prev + 1);
        notsetIsVoted(notisVoted);

      }
    } catch (err: any) {
      toast({
        title: "Error voting",
        description: err.message || "Could not register your vote.",
        variant: "destructive",
      });
    }
  };


  const handleSave = async () => {
    try {
      const res = await apiFetch(`/deals/${id}/save`, { method: "POST" });
      setIsSaved(!isSaved);
      toast({
        title: "Success!",
        description: res.message || "Deal saved to your profile.",
      });
      if (onSaveToggle) onSaveToggle();
    } catch (err: any) {
      toast({
        title: "Error saving deal",
        description: err.message || "Please log in first.",
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
  

  const statusColors = {
    active: "bg-success text-success-foreground",
    expired: "bg-muted text-muted-foreground",
    "out-of-stock": "bg-destructive text-destructive-foreground",
    "price-mistake": "bg-warning text-warning-foreground",
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        {/* Vote Section */}
        <div className="flex sm:flex-col items-center sm:items-center justify-start sm:justify-start gap-1 sm:gap-2 p-4 sm:p-3 sm:w-16 bg-muted/30">
          <Button
            variant={isVoted ? "default" : "ghost"}
            size="icon"
            onClick={() => handleVote("upvote")}
            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-primary hover:text-primary-foreground"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <span className="font-bold text-sm">{currentVotes ?? 0}</span>

          <Button
            variant={notisVoted ? "default" : "ghost"}
            size="icon"
            onClick={() => handleVote("downvote")}
            className="h-8 w-8  sm:h-10 sm:w-10 rounded-full hover:bg-destructive hover:text-destructive-foreground"
          >
            <ArrowUp className="h-4 w-4 rotate-180" />
          </Button>

        </div>

        {/* Image Section */}
        <Link to={`/deal/${id}`} className="sm:w-48 flex-shrink-0">
          <div className="relative h-48 sm:h-full overflow-hidden">
            <img
              src={image_url}
              alt={title}
              className="h-full w-full object-cover transition-transform hover:scale-105"
            />
            <Badge className={`absolute top-2 right-2 ${statusColors[status]}`}>
              {status === "active" ? "🔥 Active" : status.replace("-", " ")}
            </Badge>
          </div>
        </Link>

        {/* Content Section */}
        <div className="flex-1 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <Link to={`/deal/${id}`} className="flex-1">
              <h3 className="font-bold text-lg hover:text-primary transition-colors line-clamp-2">
                {title}
              </h3>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{description}</p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="font-normal">
              {category}
            </Badge>
            <span className="text-xs text-muted-foreground">by {seller}</span>
          </div>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-primary">{price}</span>
            <span className="text-sm text-muted-foreground">{originalPrice}</span>
            <Badge variant="destructive" className="ml-auto">
              {discount} OFF
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to={`/deal/${id}`}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {comments} Comments
              </Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DealCard;
