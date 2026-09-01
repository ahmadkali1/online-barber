import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BarberApp } from "@/src/app/barber-app";
import "@/src/styles.css";

const root = document.getElementById("root");

if (!root) throw new Error("Application root was not found");

createRoot(root).render(<StrictMode><BarberApp /></StrictMode>);
