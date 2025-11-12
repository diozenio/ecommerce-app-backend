import fastify from "fastify";

const app = fastify();

const BASE_URL = "http://10.0.2.2:3000";

import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import json from "./data.json";
import htmlTemplate from "./html-template";

interface User {
  id: string;
  fullName: string;
  email: string;
  password: string;
}

enum UIProductCardCartSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

enum OrderStatus {
  PACKING = "PACKING",
  PICKED = "PICKED",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
}

interface Category {
  id: String;
  title: string;
}

interface Product {
  id: String;
  title: string;
  sizes: UIProductCardCartSize[];
  price: number;
  imageUrl: string;
  category: Category;
  discount?: number;
}

interface Order {
  id: string;
  title: string;
  size: UIProductCardCartSize;
  price: number;
  imageUrl: string;
  status: OrderStatus;
  rating?: number | null;
}

interface LocationCoordinate {
  latitude: number;
  longitude: number;
  address: string | null;
}

interface DeliveryPerson {
  name: string;
  phone: string;
  photo: string | null;
}

interface OrderDeliveryStatus {
  status: OrderStatus;
  location: string;
  timestamp: number;
  isCompleted: boolean;
}

interface OrderDelivery {
  orderId: string;
  currentLocation: LocationCoordinate;
  destination: LocationCoordinate;
  deliveryPerson: DeliveryPerson | null;
  statusHistory: OrderDeliveryStatus[];
}
export interface Image {
  id: string;
  image: string;
}

export interface Root {
  users: User[];
  categories: Category[];
  products: Product[];
  images: Image[];
}

const data = json as Root;

const users: User[] = data.users;
const categories: Category[] = data.categories;
const products: Product[] = data.products.map((product) => {
  const imageId =
    product.imageUrl.split("/images/")[1]?.split("?")[0] ||
    product.imageUrl.split("/images/")[1];
  const imageUrl = imageId ? `${BASE_URL}/images/${imageId}` : product.imageUrl;

  return {
    ...product,
    sizes: product.sizes.map((size) => size as UIProductCardCartSize),
    imageUrl,
  };
});
const orders: Order[] = data.orders.map((order: any) => {
  const product = products.find((p) => p.id === order.product_id);
  if (!product) {
    throw new Error(`Product not found for order ${order.id}`);
  }
  return {
    id: order.id,
    title: product.title,
    size: product.sizes[0] as UIProductCardCartSize,
    price: product.price,
    imageUrl: product.imageUrl,
    status: order.status as OrderStatus,
    rating: order.rating,
  };
});

app.get("/", (_, res) => {
  res.type("text/html").status(200).send(htmlTemplate);
});

app.post("/login", (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return res.status(400).send({ message: "Email and password are required" });
  }

  const user = users.find(
    (user) => user.email === email && user.password === password
  );

  if (!user) {
    return res.status(401).send({ message: "Invalid credentials" });
  }

  res.status(200).send({ message: "Login successful", user });
});

app.post("/signup", (req, res) => {
  const { fullName, email, password } = req.body as {
    fullName: string;
    email: string;
    password: string;
  };
  if (!fullName || !email || !password) {
    return res
      .status(400)
      .send({ message: "Full name, email and password are required" });
  }

  const user = users.find((user) => user.email === email);
  if (user) {
    return res.status(400).send({ message: "User already exists" });
  }

  const newUser = {
    id: uuidv4(),
    fullName,
    email,
    password,
  };
  users.push(newUser);

  res.status(201).send({ message: "User created successfully", user: newUser });
});

app.get("/categories", (_, res) => {
  res.status(200).send(categories);
});

app.get("/categories/:id", (req, res) => {
  const { id } = req.params as { id: string };
  const category = categories.find((category) => category.id === id);
  if (!category) {
    return res.status(404).send({ message: "Category not found" });
  }
  res.status(200).send(category);
});

app.get("/products", (_, res) => {
  res.status(200).send(products);
});

app.get("/products/:id", (req, res) => {
  const { id } = req.params as { id: string };
  const product = products.find((product) => product.id === id);
  if (!product) {
    return res.status(404).send({ message: "Product not found" });
  }
  res.status(200).send(product);
});

app.get("/orders", (_, res) => {
  res.status(200).send(orders);
});

app.get("/orders/:id", (_, res) => {
  const order = {
    status: faker.helpers.arrayElement(["in_transit", "picked", "packing"]),
  };

  res.status(200).send(order);
});

app.get("/orders/:id/track", (req, res) => {
  const { id } = req.params as { id: string };
  const orderTrack = (data.orderTrackHistory as OrderDelivery[]).find(
    (track) => track.orderId === id
  );

  if (!orderTrack) {
    return res.status(404).send({ message: "Order tracking not found" });
  }

  res.status(200).send(orderTrack);
});

app.get("/taxes", (_, res) => {
  const taxes = {
    vat: faker.number.float({ min: 0.1, max: 0.2, fractionDigits: 2 }),
    shippingFee: faker.number.int({ min: 50, max: 100 }),
  };
  res.status(200).send(taxes);
});

app.get("/images/:id", (req, res) => {
  const { id } = req.params as { id: string };
  const image = data.images.find((image) => image.id === id)?.image;
  if (!image) {
    return res.status(404).send({ message: "Image not found" });
  }

  const imageBuffer = Buffer.from(image, "base64");

  res.type("image/png").status(200).send(imageBuffer);
});

app.listen({ port: 3000, host: "0.0.0.0" }, () => {
  console.log("Server is running on port http://localhost:3000");
});
