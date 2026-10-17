import React from "react";
import { createRoot } from "react-dom/client";
import Navbar from "../components/Navbar";
import "../styles/ui.css";
import "../styles/billing.css";
import "../styles/navigation.css";
import "../styles/professional.css";
import "../styles/plum-theme.css";

const navbarEl = document.getElementById("navbar");
if (navbarEl) {
  createRoot(navbarEl).render(<Navbar />);
}
const billingEl = document.getElementById("billing");
if (billingEl) {
  import("../pages/Billing").then(({ default: Billing }) => {
    createRoot(billingEl).render(<Billing />);
  });
}

const customersEl = document.getElementById("customers");
if (customersEl) {
  import("../pages/Customers").then(({ default: Customers }) => {
    createRoot(customersEl).render(
      <Customers kind={customersEl.dataset.kind} />,
    );
  });
}

const servicesEl = document.getElementById("services");
if (servicesEl) {
  import("../pages/Services").then(({ default: Services }) => {
    createRoot(servicesEl).render(<Services />);
  });
}

const staffEl = document.getElementById("staff");
if (staffEl)
  import("../pages/Staff").then(({ default: Staff }) =>
    createRoot(staffEl).render(<Staff />),
  );
const reportsEl = document.getElementById("reports");
if (reportsEl)
  import("../pages/Reports").then(({ default: Reports }) =>
    createRoot(reportsEl).render(<Reports />),
  );
