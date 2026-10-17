import React, { useState } from "react";
import {
  Scissors,
  Store,
  ChevronDown,
  Menu,
  Users,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CUSTOMER_PATHS } from "@/lib/customer-paths";
import { SERVICES_PATH } from "@/lib/service-paths";
import { STAFF_PATH, REPORTS_PATH } from "@/lib/workspace-paths";

const customerMenus = [
  {
    label: "Walk-in customers",
    href: CUSTOMER_PATHS.walk_in,
    icon: Users,
    description: "Every visit, neatly recorded",
  },
  {
    label: "Members",
    href: CUSTOMER_PATHS.member,
    icon: Crown,
    description: "Memberships & annual renewals",
  },
];
const menus = [
  { label: "Dashboard", href: "/bkqvntzmxprlcas/dashboard" },
  { label: "Billing", href: "/qmnrofoqrygpvip/billing" },
  { label: "Customers", href: CUSTOMER_PATHS.walk_in, children: customerMenus },
  { label: "Services", href: SERVICES_PATH },
  { label: "Staff", href: STAFF_PATH },
  { label: "Reports", href: REPORTS_PATH },
];

function CustomerMenu({ active }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="studio-nav-dropdown"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          event.currentTarget.querySelector("button").focus();
        }
      }}
    >
      <button
        type="button"
        className={`studio-dropdown-trigger ${active ? "active" : ""}`}
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="customer-navigation"
      >
        Customers <ChevronDown size={12} />
      </button>
      {open && (
        <div
          id="customer-navigation"
          className="studio-dropdown-panel"
          aria-label="Customer navigation"
        >
          {customerMenus.map(({ label, href, icon: Icon, description }) => (
            <a href={href} key={href}>
              <span className="customer-nav-icon">
                <Icon size={18} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = window.location.pathname;
  const isCurrent = (menu) =>
    menu.children
      ? menu.children.some((child) => pathname.startsWith(child.href))
      : menu.href === "/bkqvntzmxprlcas/dashboard"
        ? pathname === "/bkqvntzmxprlcas/dashboard" || pathname === "/home/index"
        : pathname.startsWith(menu.href);
  const currentMenu = menus.find(isCurrent);
  return (
    <header className="studio-nav">
      <div className="studio-nav-inner">
        <a href="/bkqvntzmxprlcas/dashboard" className="studio-brand" aria-label="Newbilling home">
          <span className="studio-brand-symbol">
            <Scissors size={20} strokeWidth={1.7} />
          </span>
          <span className="studio-brand-name">
            newbilling<span>.</span>
          </span>
        </a>
        <nav className="studio-nav-links" aria-label="Main navigation">
          {menus.map((menu) =>
            menu.children ? (
              <CustomerMenu key={menu.label} active={isCurrent(menu)} />
            ) : (
              <a
                key={menu.label}
                href={menu.href}
                className={isCurrent(menu) ? "active" : ""}
                aria-current={isCurrent(menu) ? "page" : undefined}
              >
                {menu.label}
              </a>
            ),
          )}
        </nav>
        <div className="studio-mobile-nav">
          <span>{currentMenu?.label || "Workspace"}</span>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation">
                <Menu size={20} />
              </Button>
            </DialogTrigger>
            <DialogContent className="studio-navigation-dialog">
              <DialogHeader>
                <DialogTitle>Your workspace</DialogTitle>
                <DialogDescription>
                  Everything you need to run your salon.
                </DialogDescription>
              </DialogHeader>
              <nav aria-label="Mobile navigation">
                {menus.map((menu) =>
                  menu.children ? (
                    <div className="mobile-customer-links" key={menu.label}>
                      <span>Customers</span>
                      {menu.children.map(({ label, href, icon: Icon }) => (
                        <a
                          href={href}
                          key={href}
                          aria-current={
                            pathname.startsWith(href) ? "page" : undefined
                          }
                        >
                          <Icon size={16} />
                          {label}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <a
                      key={menu.label}
                      href={menu.href}
                      aria-current={isCurrent(menu) ? "page" : undefined}
                    >
                      {menu.label}
                    </a>
                  ),
                )}
              </nav>
            </DialogContent>
          </Dialog>
        </div>
        <div className="studio-workspace-label">
          <Store size={18} strokeWidth={1.5} />
          <span>
            <strong>Salon workspace</strong>
            <small>Make every visit count</small>
          </span>
        </div>
      </div>
    </header>
  );
}
