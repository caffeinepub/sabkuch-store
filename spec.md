# SabKuch - E-Commerce Store

## Current State
A blank Caffeine app with no backend logic, no App.tsx, and only base shadcn-ui components installed. No products, no orders, no login system exists.

## Requested Changes (Diff)

### Add
- Admin login via Internet Identity with role-based access (admin vs customer)
- Product management: admin can add, edit, delete products (name, description, price, stock, image URL, category)
- Customer-facing shop: browse products, search/filter by category
- Shopping cart: add/remove items, view cart total
- Order booking: customers can place orders, orders stored in backend with status tracking
- Order management: admin can view all orders, update order status (pending, confirmed, shipped, delivered, cancelled)
- Customer reviews: customers can submit star ratings and text reviews on products they have ordered; admin can view/delete reviews
- Customer dashboard: view own orders and their status

### Modify
- Nothing to modify (fresh app)

### Remove
- Nothing to remove

## Implementation Plan
1. Select authorization and blob-storage components
2. Generate Motoko backend with:
   - Product CRUD (admin only for write, public for read)
   - Order creation (authenticated customers) and management (admin)
   - Review submission (authenticated customers who ordered the product) and listing (public)
   - Role management (setAdmin, isAdmin)
3. Build frontend with:
   - Internet Identity login button (header)
   - Admin panel: product form, product list with edit/delete, order list with status update, review moderation
   - Shop page: product grid, category filter, search
   - Product detail page: images, description, price, reviews, add-to-cart
   - Cart sidebar/page: item list, quantity, total, place order button
   - My Orders page: order history with status for logged-in customers
