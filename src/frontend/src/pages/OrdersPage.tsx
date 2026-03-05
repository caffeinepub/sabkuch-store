import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  Clock,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { OrderStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListUserOrders } from "../hooks/useQueries";

function StatusBadge({ status }: { status: OrderStatus }) {
  const configs: Record<
    OrderStatus,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    [OrderStatus.pending]: {
      label: "Pending",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
      icon: <Clock className="w-3 h-3" />,
    },
    [OrderStatus.confirmed]: {
      label: "Confirmed",
      className: "bg-blue-100 text-blue-700 border-blue-200",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    [OrderStatus.shipped]: {
      label: "Shipped",
      className: "bg-purple-100 text-purple-700 border-purple-200",
      icon: <Truck className="w-3 h-3" />,
    },
    [OrderStatus.delivered]: {
      label: "Delivered",
      className: "bg-green-100 text-green-700 border-green-200",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    [OrderStatus.cancelled]: {
      label: "Cancelled",
      className: "bg-red-100 text-red-700 border-red-200",
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const config = configs[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
    icon: <Circle className="w-3 h-3" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export function OrdersPage() {
  const { identity, login } = useInternetIdentity();
  const { data: orders, isLoading } = useListUserOrders();

  if (!identity) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h1 className="font-display font-bold text-2xl mb-3">Mera Orders</h1>
        <p className="text-muted-foreground mb-6">
          Orders dekhne ke liye pehle login karo
        </p>
        <Button
          onClick={login}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Login Karo
        </Button>
      </main>
    );
  }

  return (
    <main className="container max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Shop
          </Button>
        </Link>
        <h1 className="font-display font-bold text-2xl text-foreground">
          Mera Orders
        </h1>
      </div>

      {isLoading ? (
        <div className="space-y-4" data-ocid="orders.loading_state">
          {["a", "b", "c"].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="text-center py-16" data-ocid="orders.empty_state">
          <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-muted-foreground opacity-50" />
          </div>
          <h2 className="font-display font-semibold text-xl text-foreground mb-2">
            Koi order nahi hai abhi
          </h2>
          <p className="text-muted-foreground mb-6">
            Pehla order place karo aur yahan track karo!
          </p>
          <Link to="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Shopping Shuru Karo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders
            .slice()
            .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
            .map((order, i) => (
              <Card
                key={String(order.id)}
                className="border-border overflow-hidden card-hover"
                data-ocid={`orders.item.${i + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-display font-bold text-foreground">
                          Order #{String(order.id)}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                        {" · "}
                        {new Date(
                          Number(order.timestamp) / 1_000_000,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {order.items.map((item, j) => (
                          <span
                            key={`${item.productId}-${j}`}
                            className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-md"
                          >
                            {item.productId.slice(0, 8)}... ×{" "}
                            {String(item.quantity)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-2xl text-primary">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </main>
  );
}
