import { describe, it, expect, beforeEach } from "vitest";
import { DataStore } from "./DataStore";
import { ProductService } from "./ProductService";
import { OrderService } from "./OrderService";
import { CustomerService } from "./CustomerService";
import { ICustomer, ProductCategory } from "./types";

describe("OrderService - Tests d'intégration complets", () => {
  let dataStore: DataStore;
  let productService: ProductService;
  let customerService: CustomerService;
  let orderService: OrderService;

  beforeEach(() => {
    dataStore = new DataStore();
    productService = new ProductService(dataStore);
    customerService = new CustomerService(dataStore);
    orderService = new OrderService(dataStore, productService, customerService);

    const client: ICustomer = {
      id: "client_1",
      name: "Fatou Ndiaye",
      email: "fatou@example.com",
      address: "Dakar, Sénégal",
      phone: "778900111",
      loyaltyPoints: 0,
    };
    dataStore.saveCustomer(client);

    productService.createProduct({
      name: "Poulet Yassa",
      price: 12.5,
      category: "main" as ProductCategory,
      available: true,
      description: "Plat sénégalais à base de poulet et d’oignons",
      preparationTimeMinutes: 30,
    });

    productService.createProduct({
      name: "Bissap",
      price: 3,
      category: "drink" as ProductCategory,
      available: false,
      description: "Boisson traditionnelle à base de fleur d’hibiscus",
      preparationTimeMinutes: 5,
    });

    productService.createProduct({
      name: "Pastels",
      price: 5,
      category: "starter" as ProductCategory,
      available: true,
      description: "Beignets de poisson épicés",
      preparationTimeMinutes: 20,
    });
  });

  it("crée une commande avec client et produit valides", () => {
    const product = dataStore.getAvailableProducts()[0];

    const order = orderService.createOrder("client_1", [
      { productId: product.id, quantity: 2 },
    ]);

    expect(order).not.toBeNull();
    expect(order?.items.length).toBe(1);
    expect(order?.totalAmount).toBe(25);
  });

  it("refuse la commande si le produit est indisponible", () => {
    const unavailable = dataStore
      .getAllProducts()
      .find((p) => p.name === "Bissap");

    const order = orderService.createOrder("client_1", [
      { productId: unavailable!.id, quantity: 1 },
    ]);

    expect(order).toBeNull();
  });

  it("refuse la commande si le client est inconnu", () => {
    const product = dataStore.getAvailableProducts()[0];

    const order = orderService.createOrder("inexistant", [
      { productId: product.id, quantity: 1 },
    ]);

    expect(order).toBeNull();
  });

  it("calcule le total correct pour plusieurs produits", () => {
    const produits = dataStore.getAvailableProducts();
    const [p1, p2] = produits;

    const order = orderService.createOrder("client_1", [
      { productId: p1.id, quantity: 1 },
      { productId: p2.id, quantity: 2 },
    ]);

    expect(order).not.toBeNull();
    expect(order?.items.length).toBe(2);
    expect(order?.totalAmount).toBe(22.5);
  });
});
