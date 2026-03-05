import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Product {
    id: string;
    active: boolean;
    name: string;
    description: string;
    stock: bigint;
    imageUrl: ExternalBlob;
    category: string;
    price: bigint;
}
export type Time = bigint;
export interface OrderItem {
    productId: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    customer: Principal;
    totalAmount: bigint;
    timestamp: Time;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
}
export interface Review {
    customer: Principal;
    comment: string;
    rating: bigint;
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(id: string, name: string, description: string, price: bigint, stock: bigint, imageUrl: ExternalBlob, category: string, active: boolean): Promise<void>;
    deleteProduct(id: string): Promise<void>;
    deleteReview(productId: string, customer: Principal): Promise<void>;
    filterProductsByCategory(category: string): Promise<Array<Product>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrder(id: bigint): Promise<Order>;
    getProduct(id: string): Promise<Product | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAllOrders(): Promise<Array<Order>>;
    listOrdersByCustomer(customer: Principal): Promise<Array<Order>>;
    listProducts(): Promise<Array<Product>>;
    listReviews(productId: string): Promise<Array<Review>>;
    listUserOrders(user: Principal): Promise<Array<Order>>;
    placeOrder(items: Array<OrderItem>): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProducts(searchText: string): Promise<Array<Product>>;
    submitReview(productId: string, rating: bigint, comment: string): Promise<void>;
    updateOrderStatus(id: bigint, status: OrderStatus): Promise<void>;
    updateProduct(id: string, name: string, description: string, price: bigint, stock: bigint, imageUrl: ExternalBlob, category: string, active: boolean): Promise<void>;
}
