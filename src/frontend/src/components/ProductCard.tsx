import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { ShoppingCart, Star } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import type { Product } from "../hooks/useQueries";

interface ProductCardProps {
  product: Product;
  index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} cart mein add ho gaya! 🛒`);
  };

  const imageUrl = product.imageUrl.getDirectURL();

  return (
    <Card
      className="group overflow-hidden card-hover border-border bg-card"
      data-ocid={`shop.product.item.${index}`}
    >
      <Link to="/product/$id" params={{ id: product.id }}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent">
              <ShoppingCart className="w-12 h-12 text-muted-foreground opacity-30" />
            </div>
          )}
          {!product.active && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary">Out of Stock</Badge>
            </div>
          )}
          {product.stock <= 5n && product.stock > 0n && (
            <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs">
              Sirf {String(product.stock)} bacha!
            </Badge>
          )}
          <Badge className="absolute top-2 right-2 bg-primary/90 text-primary-foreground text-xs capitalize">
            {product.category}
          </Badge>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-display font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {product.description}
            </p>
          </div>

          <div className="flex items-center gap-1 text-yellow-500">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-3 h-3 fill-current" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.5)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display font-bold text-xl text-primary">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </span>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!product.active || product.stock === 0n}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
              data-ocid={`shop.add_to_cart_button.${index}`}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
