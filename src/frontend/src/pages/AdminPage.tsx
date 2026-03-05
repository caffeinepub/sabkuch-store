import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Edit,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Save,
  Shield,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { OrderStatus } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type Product,
  useCreateProduct,
  useDeleteProduct,
  useDeleteReview,
  useIsAdmin,
  useListAllOrders,
  useListProducts,
  useListReviews,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

function generateId(): string {
  return `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

interface ProductFormData {
  id: string;
  name: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  category: string;
  active: boolean;
}

const emptyForm: ProductFormData = {
  id: "",
  name: "",
  description: "",
  price: "",
  stock: "",
  imageUrl: "",
  category: "",
  active: true,
};

function ProductsTab() {
  const { data: products, isLoading } = useListProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [form, setForm] = useState<ProductFormData>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      imageUrl: product.imageUrl.getDirectURL(),
      category: product.category,
      active: product.active,
    });
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price || !form.category.trim()) {
      toast.error("Name, price aur category required hai!");
      return;
    }

    const data = {
      id: editingId ?? generateId(),
      name: form.name.trim(),
      description: form.description.trim(),
      price: BigInt(Math.round(Number.parseFloat(form.price) || 0)),
      stock: BigInt(Math.round(Number.parseFloat(form.stock) || 0)),
      imageUrl:
        form.imageUrl.trim() ||
        "https://placehold.co/400x400/f97316/ffffff?text=Product",
      category: form.category.trim(),
      active: form.active,
    };

    try {
      if (editingId) {
        await updateProduct.mutateAsync(data);
        toast.success("Product update ho gaya! ✅");
      } else {
        await createProduct.mutateAsync(data);
        toast.success("Naya product add ho gaya! 🎉");
      }
      handleCancel();
    } catch {
      toast.error("Product save karne mein problem aayi.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ko delete karna chahte ho?`)) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product delete ho gaya!");
    } catch {
      toast.error("Delete karne mein problem aayi.");
    }
  };

  const isPending = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      {/* Add / Edit form */}
      {showForm ? (
        <Card className="border-primary/20 bg-accent/20">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              {editingId ? (
                <Edit className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {editingId ? "Product Edit Karo" : "Naya Product Add Karo"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Basmati Rice 5kg"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  data-ocid="admin.product_form.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  placeholder="e.g. food, electronics"
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value }))
                  }
                  data-ocid="admin.product_form.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="e.g. 499"
                  value={form.price}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, price: e.target.value }))
                  }
                  data-ocid="admin.product_form.input"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                  data-ocid="admin.product_form.input"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, imageUrl: e.target.value }))
                  }
                  data-ocid="admin.product_form.input"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Product ka vivaran likhiye..."
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="resize-none"
                  data-ocid="admin.product_form.input"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="active"
                  checked={form.active}
                  onCheckedChange={(v) =>
                    setForm((f) => ({ ...f, active: !!v }))
                  }
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Product Active (visible in shop)
                </Label>
              </div>

              <div className="sm:col-span-2 flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  data-ocid="admin.product_form.submit_button"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isPending
                    ? "Saving..."
                    : editingId
                      ? "Update Karo"
                      : "Add Karo"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  data-ocid="admin.product_form.cancel_button"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Naya Product Add Karo
        </Button>
      )}

      {/* Products list */}
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.products.loading_state">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : !products || products.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.products.empty_state"
        >
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Koi product nahi hai. Pehla product add karo!</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product, i) => {
                const imageUrl = product.imageUrl.getDirectURL();
                return (
                  <TableRow
                    key={product.id}
                    data-ocid={`admin.product.item.${i + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-4 h-4 text-muted-foreground opacity-40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {product.description}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell
                      className={
                        product.stock === 0n
                          ? "text-destructive font-medium"
                          : "text-foreground"
                      }
                    >
                      {String(product.stock)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          product.active
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-muted text-muted-foreground"
                        }
                        variant="outline"
                      >
                        {product.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="h-8 text-muted-foreground hover:text-foreground"
                          data-ocid={`admin.product.edit_button.${i + 1}`}
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleteProduct.isPending}
                          className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-ocid={`admin.product.delete_button.${i + 1}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useListAllOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (id: bigint, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Order status update ho gaya!");
    } catch {
      toast.error("Status update karne mein problem aayi.");
    }
  };

  const statusOptions = [
    { value: OrderStatus.pending, label: "Pending" },
    { value: OrderStatus.confirmed, label: "Confirmed" },
    { value: OrderStatus.shipped, label: "Shipped" },
    { value: OrderStatus.delivered, label: "Delivered" },
    { value: OrderStatus.cancelled, label: "Cancelled" },
  ];

  return (
    <div>
      {isLoading ? (
        <div className="space-y-3" data-ocid="admin.orders.loading_state">
          {["a", "b", "c", "d"].map((k) => (
            <Skeleton key={k} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : !orders || orders.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.orders.empty_state"
        >
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Koi order nahi hai abhi.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders
                .slice()
                .sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))
                .map((order, i) => (
                  <TableRow
                    key={String(order.id)}
                    data-ocid={`admin.order.item.${i + 1}`}
                  >
                    <TableCell className="font-mono text-sm">
                      #{String(order.id)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {order.customer.toString().slice(0, 10)}...
                    </TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell className="font-semibold text-primary">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(
                        Number(order.timestamp) / 1_000_000,
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) =>
                          handleStatusChange(order.id, v as OrderStatus)
                        }
                      >
                        <SelectTrigger
                          className="w-32 h-8 text-xs"
                          data-ocid={`admin.order.status_select.${i + 1}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-xs"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ReviewsForProduct({
  productId,
  productName,
}: { productId: string; productName: string }) {
  const { data: reviews } = useListReviews(productId);
  const deleteReview = useDeleteReview();

  const handleDelete = async (
    customer: import("@icp-sdk/core/principal").Principal,
  ) => {
    if (!confirm("Is review ko delete karna chahte ho?")) return;
    try {
      await deleteReview.mutateAsync({ productId, customer });
      toast.success("Review delete ho gaya!");
    } catch {
      toast.error("Review delete karne mein problem aayi.");
    }
  };

  if (!reviews || reviews.length === 0) return null;

  return (
    <div>
      <h3 className="font-medium text-sm text-foreground mb-2 px-1">
        {productName}
      </h3>
      <div className="rounded-xl border border-border overflow-hidden mb-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review, i) => (
              <TableRow
                key={review.customer.toString()}
                data-ocid={`admin.review.item.${i + 1}`}
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {review.customer.toString().slice(0, 10)}...
                </TableCell>
                <TableCell>
                  <div className="flex text-yellow-500">
                    {"★".repeat(Number(review.rating))}
                    {"☆".repeat(5 - Number(review.rating))}
                  </div>
                </TableCell>
                <TableCell className="text-sm max-w-xs">
                  <span className="line-clamp-2">{review.comment}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(review.customer)}
                    disabled={deleteReview.isPending}
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    data-ocid={`admin.review.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ReviewsTab() {
  const { data: products } = useListProducts();

  return (
    <div>
      {!products || products.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="admin.reviews.empty_state"
        >
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Koi product ya review nahi hai abhi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <ReviewsForProduct
              key={product.id}
              productId={product.id}
              productName={product.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: isCheckingAdmin } = useIsAdmin();
  const navigate = useNavigate();

  if (!identity) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h1 className="font-display font-bold text-2xl mb-3">Admin Panel</h1>
        <p className="text-muted-foreground mb-6">
          Admin panel access karne ke liye pehle login karo
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

  if (isCheckingAdmin) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 text-destructive mx-auto mb-4 opacity-50" />
        <h1 className="font-display font-bold text-2xl mb-3">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          Tumhare paas admin access nahi hai. Shop pe jao aur "Claim Admin"
          button use karo.
        </p>
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Shop Pe Jao
        </Button>
      </main>
    );
  }

  return (
    <main className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Shop
          </Button>
        </Link>
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Admin Panel
          </h1>
          <p className="text-sm text-muted-foreground">
            Products, orders aur reviews manage karo
          </p>
        </div>
      </div>

      <Tabs defaultValue="products">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger
            value="products"
            className="flex items-center gap-2"
            data-ocid="admin.products_tab"
          >
            <Package className="w-4 h-4" />
            Products
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="flex items-center gap-2"
            data-ocid="admin.orders_tab"
          >
            <ShoppingBag className="w-4 h-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="flex items-center gap-2"
            data-ocid="admin.reviews_tab"
          >
            <MessageSquare className="w-4 h-4" />
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>

        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
      </Tabs>
    </main>
  );
}
