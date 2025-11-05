import fastify from "fastify";
import { readFileSync } from "fs";

const app = fastify();

import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";
import data from "./data.json";

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

const users: User[] = data.users;
const categories: Category[] = data.categories;
const products: Product[] = data.products.map((product) => ({
  ...product,
  sizes: product.sizes.map((size) => size as UIProductCardCartSize),
}));

app.get("/", (_, res) => {
  try {
    const html = readFileSync("./index.html", "utf-8");
    res.type("text/html").status(200).send(html);
  } catch (error) {
    res.status(500).send({ message: "Error reading index.html" });
  }
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

app.get("/orders/:id", (_, res) => {
  const order = {
    status: faker.helpers.arrayElement(["in_transit", "picked", "packing"]),
  };

  res.status(200).send(order);
});

app.get("/taxes", (_, res) => {
  const taxes = {
    vat: faker.number.float({ min: 0, max: 0.1 }),
    shippingFee: faker.number.float({ min: 0, max: 0.1 }),
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

app.listen({ port: 3000 }, () => {
  console.log("Server is running on port http://localhost:3000");
});
