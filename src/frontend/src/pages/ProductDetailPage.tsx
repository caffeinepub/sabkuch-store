import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Package,
  ShoppingCart,
  Star,
  User,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetProduct,
  useListReviews,
  useSubmitReview,
} from "../hooks/useQueries";

export function ProductDetailPage() {
  const { id } = useParams({ from: "/product/$id" });
  const { data: product, isLoading } = useGetProduct(id);
  const { data: reviews } = useListReviews(id);
  const { addToCart } = useCart();
  const { identity, login } = useInternetIdentity();
  const submitReview = useSubmitReview();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success(`${product.name} cart mein add ho gaya! 🛒`);
  };

  const handleSubmitReview = async () => {
    if (!comment.trim()) {
      toast.error("Review likhna zaruri hai!");
      return;
    }
    try {
      await submitReview.mutateAsync({
        productId: id,
        rating: BigInt(rating),
        comment,
      });
      setComment("");
      setRating(5);
      toast.success("Review submit ho gaya! Shukriya 🙏");
    } catch {
      toast.error("Review submit karne mein problem aayi.");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl mb-2">
          Product nahi mila
        </h2>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Wapas shop pe jao
          </Button>
        </Link>
      </div>
    );
  }

  const imageUrl = product.imageUrl.getDirectURL();
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : null;

  return (
    <main className="container max-w-5xl mx-auto px-4 py-8">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Wapas shop pe</span>
      </Link>

      {/* Product detail */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-20 h-20 text-muted-foreground opacity-30" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <Badge variant="secondary" className="w-fit capitalize">
            {product.category}
          </Badge>
          <h1 className="font-display font-bold text-3xl text-foreground">
            {product.name}
          </h1>

          {/* Rating */}
          {avgRating !== null && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5 text-yellow-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s <= Math.round(avgRating) ? "fill-current" : "stroke-current fill-none"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({reviews?.length} reviews)
              </span>
            </div>
          )}

          <div className="text-3xl font-display font-bold text-primary">
            ₹{Number(product.price).toLocaleString("en-IN")}
          </div>

          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {product.stock > 0n ? (
                <>
                  Stock:{" "}
                  <strong className="text-foreground">
                    {String(product.stock)} units
                  </strong>
                </>
              ) : (
                <span className="text-destructive font-medium">
                  Out of Stock
                </span>
              )}
            </span>
          </div>

          <Separator />

          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!product.active || product.stock === 0n}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-12"
            data-ocid="product.add_to_cart_button"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {product.stock === 0n ? "Out of Stock" : "Cart Mein Add Karo"}
          </Button>

          {!product.active && (
            <p className="text-sm text-destructive text-center">
              Yeh product abhi available nahi hai
            </p>
          )}
        </div>
      </div>

      <Separator className="mb-8" />

      {/* Reviews section */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-2xl">Customer Reviews</h2>
          <Badge variant="secondary">{reviews?.length ?? 0}</Badge>
        </div>

        {/* Write review */}
        {identity ? (
          <Card className="border-primary/20 bg-accent/30">
            <CardHeader>
              <CardTitle className="text-lg font-display">
                Apna Review Likho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star rating input */}
              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">
                  Rating
                </span>
                <div
                  className="flex items-center gap-1"
                  data-ocid="product.review_rating_input"
                >
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="text-yellow-500 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 transition-all ${
                          s <= (hoveredStar || rating)
                            ? "fill-current"
                            : "stroke-current fill-none"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({rating}/5)
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm font-medium text-foreground mb-2 block">
                  Comment
                </span>
                <Textarea
                  placeholder="Apna experience share karo..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                  data-ocid="product.review_textarea"
                />
              </div>

              <Button
                onClick={handleSubmitReview}
                disabled={submitReview.isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                data-ocid="product.review_submit_button"
              >
                {submitReview.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {submitReview.isPending
                  ? "Submitting..."
                  : "Review Submit Karo"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-2 border-border bg-muted/30">
            <CardContent className="py-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">
                Review likhne ke liye pehle login karo
              </p>
              <Button
                onClick={login}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Login Karo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reviews list */}
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, i) => (
              <Card
                key={review.customer.toString()}
                className="border-border"
                data-ocid={`product.reviews.item.${i + 1}`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-mono text-muted-foreground truncate max-w-[160px]">
                          {review.customer.toString().slice(0, 12)}...
                        </p>
                        <div className="flex items-center gap-0.5 text-yellow-500 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= Number(review.rating)
                                  ? "fill-current"
                                  : "stroke-current fill-none"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-foreground leading-relaxed pl-12">
                    {review.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-10 text-muted-foreground"
            data-ocid="product.reviews.empty_state"
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Abhi koi review nahi hai. Pehle review likho!</p>
          </div>
        )}
      </div>
    </main>
  );
}
