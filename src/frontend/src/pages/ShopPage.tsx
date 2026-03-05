import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Search, Sparkles } from "lucide-react";
import { Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { ProductCard } from "../components/ProductCard";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useListProducts } from "../hooks/useQueries";
import { useAssignRole, useIsAdmin } from "../hooks/useQueries";

const CATEGORIES = [
  "all",
  "electronics",
  "clothing",
  "food",
  "books",
  "home",
  "toys",
  "beauty",
];

export function ShopPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: products, isLoading } = useListProducts();
  const { data: isAdmin } = useIsAdmin();
  const { identity } = useInternetIdentity();
  const assignRole = useAssignRole();

  const handleClaimAdmin = async () => {
    if (!identity) return;
    try {
      await assignRole.mutateAsync({
        user: identity.getPrincipal(),
        role: UserRole.admin,
      });
      toast.success(
        "Admin access mil gaya! 🎉 Ab Admin Panel access kar sakte ho.",
      );
    } catch {
      toast.error("Admin claim karne mein problem aayi.");
    }
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    let list = products.filter((p) => p.active);
    if (activeCategory !== "all") {
      list = list.filter(
        (p) => p.category.toLowerCase() === activeCategory.toLowerCase(),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );
    }
    return list;
  }, [products, activeCategory, search]);

  const allCategories = useMemo(() => {
    if (!products) return CATEGORIES;
    const cats = Array.from(
      new Set(products.map((p) => p.category.toLowerCase())),
    );
    return ["all", ...cats];
  }, [products]);

  return (
    <main className="min-h-screen">
      {/* Hero banner */}
      <div className="hero-gradient pattern-dots relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="/assets/generated/sabkuch-hero.dim_1200x400.jpg"
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 hidden md:block"
          />
        </div>
        <div className="container max-w-7xl mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">
                India's favourite marketplace
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-3 leading-tight">
              Sab Milega <span className="text-primary">Yahan!</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Lacs of products, best prices, fast delivery — sab kuch ek jagah
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Kya dhundh rahe ho? Search karo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-12 text-base bg-card border-border shadow-sm"
                data-ocid="shop.search_input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Claim Admin (first-time setup) */}
        {identity && isAdmin === false && (
          <div className="mb-6 p-4 bg-accent rounded-xl border border-border flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-medium text-foreground">
                Pehli baar login kar rahe ho?
              </p>
              <p className="text-sm text-muted-foreground">
                Admin access lo aur products manage karo
              </p>
            </div>
            <Button
              onClick={handleClaimAdmin}
              disabled={assignRole.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
            >
              <Shield className="w-4 h-4 mr-2" />
              {assignRole.isPending ? "Processing..." : "Claim Admin Access"}
            </Button>
          </div>
        )}

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {allCategories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className="shrink-0 capitalize font-medium"
              data-ocid="shop.category_tab"
            >
              {cat === "all" ? "Sab Categories" : cat}
            </Button>
          ))}
        </div>

        {/* Results info */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {search ? (
              <>
                {filtered.length} products mila "<strong>{search}</strong>" ke
                liye
              </>
            ) : (
              <>{filtered.length} products available</>
            )}
          </p>
        )}

        {/* Product grid */}
        {isLoading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            data-ocid="shop.loading_state"
          >
            {["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"].map((k) => (
              <div key={k} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16" data-ocid="shop.empty_state">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-xl text-foreground mb-2">
              Koi product nahi mila
            </h3>
            <p className="text-muted-foreground mb-4">
              {search
                ? `"${search}" ke liye koi product nahi hai`
                : "Is category mein abhi koi product nahi hai"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
            >
              Sab products dekho
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i + 1} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
