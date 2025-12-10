import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Upload, Link as LinkIcon } from "lucide-react";
import { apiFetch } from "@/lib/api";


const SubmitDeal = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = {
      title: (form.querySelector("#title") as HTMLInputElement).value,
      description: (form.querySelector("#description") as HTMLTextAreaElement).value,
      link: (form.querySelector("#link") as HTMLInputElement).value,
      category,
      price: parseFloat((form.querySelector("#price") as HTMLInputElement).value),
      image_url: (form.querySelector("#image_url") as HTMLInputElement).value, 
    };

    try {
      await apiFetch("/deals/", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      toast({
        title: "Deal submitted successfully!",
        description: "Your deal is now live.",
      });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Submit a Deal
            </h1>
            <p className="text-muted-foreground">
              Share amazing deals with the community and help others save money!
            </p>
          </div>

          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Sony WH-1000XM5 Wireless Headphones"
                  required
                />
              </div>

              {/* Product Link */}
              <div className="space-y-2">
                <Label htmlFor="link">Product Link *</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="link"
                    type="url"
                    placeholder="https://example.com/product"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Home">Home & Kitchen</SelectItem>
                    <SelectItem value="Beauty">Beauty</SelectItem>
                    <SelectItem value="Sports">Sports</SelectItem>
                    <SelectItem value="Books">Books</SelectItem>
                    <SelectItem value="Toys">Toys</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Info */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Deal Price *</Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="₹299.99"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="original-price">Original Price</Label>
                  <Input
                    id="original-price"
                    type="text"
                    placeholder="₹399.99"
                  />
                </div>
              </div>

              {/* Seller */}
              <div className="space-y-2">
                <Label htmlFor="seller">Seller/Store</Label>
                <Input
                  id="seller"
                  placeholder="e.g., Amazon, Best Buy"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us why this is a great deal. Include key features, benefits, or special conditions..."
                  rows={5}
                  required
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    <Input
                      id="image_url"
                      placeholder="Or paste image url"
                    />
                  </span>
                </div>
              </div>

              {/* Deal Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Deal Status</Label>
                <Select defaultValue="active">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    <SelectItem value="price-mistake">Price Mistake</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Deal"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6 bg-muted/30 p-6">
            <h3 className="mb-3 font-bold">Tips for a Great Deal Post</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✅ Use clear, descriptive titles that include the product name</li>
              <li>✅ Double-check the deal link works and leads to the correct product</li>
              <li>✅ Include relevant details like expiration dates or coupon codes</li>
              <li>✅ Add high-quality product images when possible</li>
              <li>✅ Be honest about the deal quality and any limitations</li>
            </ul>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SubmitDeal;
