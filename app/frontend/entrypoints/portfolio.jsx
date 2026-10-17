import React from "react";
import { createRoot } from "react-dom/client";
import Portfolio from "../pages/Portfolio";
import "../styles/portfolio.css";

const element = document.getElementById("portfolio");
if (element) createRoot(element).render(<Portfolio />);
