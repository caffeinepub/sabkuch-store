import Map "mo:core/Map";
import Array "mo:core/Array";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    stock : Nat;
    imageUrl : Storage.ExternalBlob;
    category : Text;
    active : Bool;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Text.compare(product1.id, product2.id);
    };
  };

  public type OrderItem = {
    productId : Text;
    quantity : Nat;
    price : Nat;
  };

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type Order = {
    id : Nat;
    items : [OrderItem];
    totalAmount : Nat;
    status : OrderStatus;
    customer : Principal;
    timestamp : Time.Time;
  };

  module OrderHelper {
    public func compare(order1 : Order, order2 : Order) : Order.Order {
      Nat.compare(order1.id, order2.id);
    };
  };

  public type Review = {
    customer : Principal;
    rating : Nat;
    comment : Text;
  };

  module Review {
    public func compare(review1 : Review, review2 : Review) : Order.Order {
      Principal.compare(review1.customer, review2.customer);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let products = Map.empty<Text, Product>();
  let orders = Map.empty<Nat, Order>();
  let reviews = Map.empty<Text, Map.Map<Principal, Review>>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextOrderId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func createProduct(id : Text, name : Text, description : Text, price : Nat, stock : Nat, imageUrl : Storage.ExternalBlob, category : Text, active : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    if (products.containsKey(id)) {
      Runtime.trap("Product with this ID already exists");
    };
    let product : Product = {
      id;
      name;
      description;
      price;
      stock;
      imageUrl;
      category;
      active;
    };
    products.add(id, product);
  };

  public shared ({ caller }) func updateProduct(id : Text, name : Text, description : Text, price : Nat, stock : Nat, imageUrl : Storage.ExternalBlob, category : Text, active : Bool) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updated : Product = {
          id;
          name;
          description;
          price;
          stock;
          imageUrl;
          category;
          active;
        };
        products.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    products.remove(id);
  };

  public query func listProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProduct(id : Text) : async ?Product {
    products.get(id);
  };

  public query func searchProducts(searchText : Text) : async [Product] {
    let searchLower = searchText.toLower();
    let filteredProducts = products.values().toArray().filter(
      func(product) {
        product.name.toLower().contains(#text(searchLower)) or product.description.toLower().contains(#text(searchLower))
      }
    );
    filteredProducts.sort();
  };

  public query func filterProductsByCategory(category : Text) : async [Product] {
    let filteredProducts = products.values().toArray().filter(
      func(product) { product.category == category }
    );
    filteredProducts.sort();
  };

  public query ({ caller }) func listUserOrders(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Cannot view orders of another user");
    };
    let filteredOrders = orders.values().toArray().filter(
      func(order) { order.customer == user }
    );
    filteredOrders.sort();
  };

  public shared ({ caller }) func placeOrder(items : [OrderItem]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    if (items.size() == 0) {
      Runtime.trap("Order must have at least one item");
    };

    var total : Nat = 0;
    for (item in items.values()) {
      switch (products.get(item.productId)) {
        case (null) { Runtime.trap("Product not found: " # item.productId) };
        case (?product) {
          if (item.quantity > product.stock) {
            Runtime.trap("Not enough stock for " # product.name);
          };
          let updatedProduct : Product = {
            product with stock = product.stock - item.quantity;
          };
          products.add(item.productId, updatedProduct);
          total += item.price * item.quantity;
        };
      };
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      id = orderId;
      items;
      totalAmount = total;
      status = #pending;
      customer = caller;
      timestamp = Time.now();
    };

    orders.add(orderId, order);
    orderId;
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : OrderStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updated : Order = {
          order with status;
        };
        orders.add(id, updated);
      };
    };
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.customer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  public query ({ caller }) func listOrdersByCustomer(customer : Principal) : async [Order] {
    if (caller != customer and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    let customerOrders = orders.values().toArray().map(func(o) { o }).filter(
      func(o) { o.customer == customer }
    ).sort();
    customerOrders;
  };

  public query ({ caller }) func listAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray().sort();
  };

  public shared ({ caller }) func submitReview(productId : Text, rating : Nat, comment : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    let review : Review = {
      customer = caller;
      rating;
      comment;
    };

    let prodReviews = switch (reviews.get(productId)) {
      case (null) { Map.empty<Principal, Review>() };
      case (?existing) { existing };
    };

    prodReviews.add(caller, review);
    reviews.add(productId, prodReviews);
  };

  public query func listReviews(productId : Text) : async [Review] {
    switch (reviews.get(productId)) {
      case (null) { [] };
      case (?prodReviews) { prodReviews.values().toArray().sort() };
    };
  };

  public shared ({ caller }) func deleteReview(productId : Text, customer : Principal) : async () {
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let isOwnReview = caller == customer;

    if (not isAdmin and not isOwnReview) {
      Runtime.trap("Unauthorized: Can only delete your own review or be an admin");
    };

    switch (reviews.get(productId)) {
      case (null) { Runtime.trap("No reviews found for product") };
      case (?prodReviews) {
        switch (prodReviews.get(customer)) {
          case (null) { Runtime.trap("No review found for this user") };
          case (?_) {
            prodReviews.remove(customer);
          };
        };
      };
    };
  };
};
