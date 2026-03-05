import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Loader2,
  LogIn,
  LogOut,
  Package,
  Shield,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";

export function Header() {
  const { totalItems } = useCart();
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin } = useIsAdmin();
  const isLoggedIn = !!identity;
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Store className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">
            Sab<span className="text-primary">Kuch</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link to="/">
            <Button
              variant={currentPath === "/" ? "default" : "ghost"}
              size="sm"
              className="font-medium"
              data-ocid="nav.shop.link"
            >
              <Store className="w-4 h-4 mr-1.5" />
              Shop
            </Button>
          </Link>

          <Link to="/cart">
            <Button
              variant={currentPath === "/cart" ? "default" : "ghost"}
              size="sm"
              className="font-medium relative"
              data-ocid="header.cart_link"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              Cart
              {totalItems > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground border-2 border-background rounded-full">
                  {totalItems > 99 ? "99+" : totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          {isLoggedIn && (
            <Link to="/orders">
              <Button
                variant={currentPath === "/orders" ? "default" : "ghost"}
                size="sm"
                className="font-medium"
              >
                <Package className="w-4 h-4 mr-1.5" />
                My Orders
              </Button>
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin">
              <Button
                variant={currentPath === "/admin" ? "default" : "ghost"}
                size="sm"
                className="font-medium"
                data-ocid="header.admin_link"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* Auth button */}
        <div className="flex items-center gap-2 shrink-0">
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:block text-xs text-muted-foreground font-mono truncate max-w-[120px]">
                {identity.getPrincipal().toString().slice(0, 8)}...
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clear}
                data-ocid="header.logout_button"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              data-ocid="header.login_button"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-1.5" />
              )}
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="sm:hidden border-t border-border bg-card px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <Link to="/">
          <Button
            variant={currentPath === "/" ? "default" : "ghost"}
            size="sm"
            className="text-xs shrink-0"
          >
            <Store className="w-3 h-3 mr-1" />
            Shop
          </Button>
        </Link>
        <Link to="/cart">
          <Button
            variant={currentPath === "/cart" ? "default" : "ghost"}
            size="sm"
            className="text-xs shrink-0 relative"
            data-ocid="header.cart_link"
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            Cart
            {totalItems > 0 && (
              <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1">
                {totalItems}
              </span>
            )}
          </Button>
        </Link>
        {isLoggedIn && (
          <Link to="/orders">
            <Button
              variant={currentPath === "/orders" ? "default" : "ghost"}
              size="sm"
              className="text-xs shrink-0"
            >
              <Package className="w-3 h-3 mr-1" />
              Orders
            </Button>
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin">
            <Button
              variant={currentPath === "/admin" ? "default" : "ghost"}
              size="sm"
              className="text-xs shrink-0"
              data-ocid="header.admin_link"
            >
              <Shield className="w-3 h-3 mr-1" />
              Admin
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
