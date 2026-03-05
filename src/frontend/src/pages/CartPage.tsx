import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Minus,
  Package,
  Plus,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePlaceOrder } from "../hooks/useQueries";

export function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, totalAmount } =
    useCart();
  const { identity, login } = useInternetIdentity();
  const placeOrder = usePlaceOrder();
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    if (!identity) {
      toast.error("Pehle login karo order place karne ke liye!");
      return;
    }
    if (items.length === 0) {
      toast.error("Cart khali hai!");
      return;
    }

    try {
      const orderItems = items.map((i) => ({
        productId: i.product.id,
        quantity: BigInt(i.quantity),
        price: i.product.price,
      }));

      await placeOrder.mutateAsync(orderItems);
      clearCart();
      toast.success("Order place ho gaya! 🎉 Bahut shukriya!");
      navigate({ to: "/orders" });
    } catch {
      toast.error("Order place karne mein problem aayi. Dobara try karo.");
    }
  };

  if (items.length === 0) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="w-12 h-12 text-muted-foreground opacity-50" />
        </div>
        <h1 className="font-display font-bold text-3xl text-foreground mb-3">
          Cart Khali Hai!
        </h1>
        <p className="text-muted-foreground mb-8">
          Koi product cart mein nahi hai. Shop se kuch add karo!
        </p>
        <Link to="/">
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            data-ocid="cart.empty_state"
          >
            <Package className="w-4 h-4 mr-2" />
            Shopping Shuru Karo
          </Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="container max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Continue Shopping
          </Button>
        </Link>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Mera Cart
        </h1>
        <span className="text-muted-foreground text-sm">
          ({items.length} items)
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => {
            const imageUrl = item.product.imageUrl.getDirectURL();
            return (
              <Card
                key={item.product.id}
                className="border-border overflow-hidden"
                data-ocid={`cart.item.${i + 1}`}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Product image */}
                    <Link to="/product/$id" params={{ id: item.product.id }}>
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-muted-foreground opacity-40" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to="/product/$id"
                            params={{ id: item.product.id }}
                          >
                            <h3 className="font-display font-semibold text-foreground hover:text-primary transition-colors truncate">
                              {item.product.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground capitalize">
                            {item.product.category}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0 h-8 w-8"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-md"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= Number(item.product.stock)
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-display font-bold text-lg text-primary">
                            ₹
                            {(
                              Number(item.product.price) * item.quantity
                            ).toLocaleString("en-IN")}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-muted-foreground">
                              ₹
                              {Number(item.product.price).toLocaleString(
                                "en-IN",
                              )}{" "}
                              × {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <Card className="border-border sticky top-24">
            <CardContent className="p-5 space-y-4">
              <h2 className="font-display font-bold text-lg">Order Summary</h2>
              <Separator />

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate mr-2">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium shrink-0">
                      ₹
                      {(
                        Number(item.product.price) * item.quantity
                      ).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="flex justify-between font-display font-bold text-xl">
                <span>Total</span>
                <span className="text-primary">
                  ₹{totalAmount.toLocaleString("en-IN")}
                </span>
              </div>

              {!identity ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Order place karne ke liye login karo
                  </p>
                  <Button
                    onClick={login}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    Login Karo
                  </Button>
                </div>
              ) : (
                <Button
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={placeOrder.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12"
                  data-ocid="cart.place_order_button"
                >
                  {placeOrder.isPending ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 mr-2" />
                  )}
                  {placeOrder.isPending
                    ? "Order ho raha hai..."
                    : "Order Place Karo"}
                </Button>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Secure payment • Fast delivery
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
