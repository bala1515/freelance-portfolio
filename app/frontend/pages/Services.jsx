import React, { useState, useEffect } from "react";
import {
  Plus,
  Scissors,
  Leaf,
  Flower2,
  Sparkles,
  Search,
  Pencil,
  Archive,
  RotateCcw,
  Clock3,
  Crown,
  ArrowLeft,
  ArrowRight,
  CheckCheck,
  X,
  LoaderCircle,
  Layers3,
  ShieldCheck,
  LayoutGrid,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SERVICES_API } from "@/lib/service-paths";
import "../styles/services.css";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });
const icons = {
  All: LayoutGrid,
  Hair: Scissors,
  Skin: Leaf,
  Nails: Flower2,
  Other: Sparkles,
};
const blankService = {
  name: "",
  category: "Hair",
  price: "",
  duration_minutes: "30",
  description: "",
  active: true,
};
async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token":
        document.querySelector('meta[name="csrf-token"]')?.content || "",
    },
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      "Unable to load your workspace. Refresh the page and try again.",
    );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.errors?.join(". ") ||
        "Unable to save this service. Please try again.",
    );
  return data;
}

export default function Services() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blankService);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingStatus, setChangingStatus] = useState(null);
  const categories = data?.categories || ["Hair", "Skin", "Nails", "Other"];
  const count = data?.pagination.total || 0;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          q: search,
          category,
          status,
          page: String(page),
        });
        const result = await request(`${SERVICES_API}?${query}`, {
          signal: controller.signal,
        });
        setData(result);
      } catch (failure) {
        if (failure.name !== "AbortError") setError(failure.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, category, status, page, revision]);

  function openForm(service = null) {
    setEditing(service);
    setForm(
      service
        ? {
            name: service.name,
            category: service.category,
            price: String(service.price),
            duration_minutes: String(service.duration_minutes),
            description: service.description || "",
            active: service.active,
          }
        : { ...blankService },
    );
    setFormError("");
    setFormOpen(true);
  }
  async function saveService(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      await request(
        editing
          ? `${SERVICES_API}/${encodeURIComponent(editing.token)}`
          : SERVICES_API,
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({
            service: {
              ...form,
              price: Number(form.price),
              duration_minutes: Number(form.duration_minutes),
            },
          }),
        },
      );
      setFormOpen(false);
      setPage(1);
      setRevision((value) => value + 1);
      setNotice(
        editing
          ? "Service updated. Existing bill amounts stay preserved."
          : "Service added to your catalogue and available for billing when active.",
      );
    } catch (failure) {
      setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus() {
    if (saving || !changingStatus) return;
    setSaving(true);
    setFormError("");
    try {
      await request(
        `${SERVICES_API}/${encodeURIComponent(changingStatus.token)}`,
        {
          method: "PATCH",
          body: JSON.stringify({ service: { active: !changingStatus.active } }),
        },
      );
      setNotice(
        changingStatus.active
          ? "Service archived. Its existing bill history stays preserved."
          : "Service restored and available for new bills.",
      );
      setChangingStatus(null);
      setPage(1);
      setRevision((value) => value + 1);
    } catch (failure) {
      setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  function changeCategory(value) {
    setCategory(value);
    setPage(1);
  }

  return (
    <div className="billing-workspace services-workspace">
      <div className="workspace-breadcrumb">
        <span>Workspace</span>
        <span>/</span>
        <span>Services</span>
      </div>
      <header className="workspace-heading">
        <div>
          <div className="workspace-eyebrow">
            <span />
            YOUR SERVICE MENU
          </div>
          <h1>
            Services<span className="heading-dot">.</span>
          </h1>
          <p>
            Your craft, beautifully organised. Set the details for every great
            visit.
          </p>
        </div>
        <Button className="catalogue-primary" onClick={() => openForm()}>
          <Plus size={16} />
          Add service
        </Button>
      </header>
      {notice && (
        <div role="status" className="billing-notice success">
          <span>
            <CheckCheck size={17} />
            {notice}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={15} />
          </Button>
        </div>
      )}
      <Card className="catalogue-panel">
        <div className="catalogue-panel-heading">
          <div>
            <h2>The service collection</h2>
            <p>
              Thoughtfully priced. Easy to find. Ready for your next client.
            </p>
          </div>
          <Badge variant="secondary">
            {count} {count === 1 ? "service" : "services"}
          </Badge>
        </div>
        <div className="catalogue-toolbar">
          <div className="input-with-icon">
            <Search size={16} />
            <Input
              aria-label="Search services catalogue"
              placeholder="Find a service by name…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger aria-label="Service status filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="active">
                Active services ({data?.counts.active ?? 0})
              </SelectItem>
              <SelectItem value="archived">
                Archived services ({data?.counts.archived ?? 0})
              </SelectItem>
              <SelectItem value="all">All services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Tabs
          value={category}
          onValueChange={changeCategory}
          className="catalogue-tabs"
        >
          <TabsList aria-label="Service catalogue categories">
            {["All", ...categories].map((value) => {
              const Icon = icons[value] || Sparkles;
              return (
                <TabsTrigger key={value} value={value}>
                  <Icon size={14} />
                  {value === "All" ? "All categories" : value}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <TabsContent value={category}>
            {error && (
              <div role="alert" className="catalogue-error">
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  Retry
                </Button>
              </div>
            )}
            {loading ? (
              <div className="catalogue-empty">
                <LoaderCircle className="spin" size={27} />
                <p>Getting your service menu ready…</p>
              </div>
            ) : !error && count === 0 ? (
              <div className="catalogue-empty">
                <Scissors size={32} />
                <h3>No services found</h3>
                <p>
                  Try another category or search, or add something new to your
                  menu.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setStatus("all");
                    setPage(1);
                  }}
                >
                  Show all services
                </Button>
              </div>
            ) : (
              !error && (
                <div className="catalogue-grid">
                  {data?.services.map((service) => {
                    const Icon = icons[service.category] || Sparkles;
                    return (
                      <article
                        className={`catalogue-service ${service.active ? "" : "is-archived"}`}
                        key={service.token}
                      >
                        <div className="catalogue-service-top">
                          <span
                            className={`service-symbol tone-${service.category.toLowerCase()}`}
                          >
                            <Icon size={23} strokeWidth={1.5} />
                          </span>
                          <Badge
                            className={`catalogue-status ${service.active ? "active" : "archived"}`}
                          >
                            {service.active ? "Active" : "Archived"}
                          </Badge>
                        </div>
                        <div className="catalogue-service-info">
                          <span>{service.category}</span>
                          <h3>{service.name}</h3>
                          <p>
                            {service.description ||
                              `${service.category === "Other" ? "A signature" : service.category} service, tailored to your client.`}
                          </p>
                        </div>
                        <div className="catalogue-duration">
                          <Clock3 size={13} />
                          {service.duration_minutes} min{" "}
                          <span>estimated duration</span>
                        </div>
                        <div className="catalogue-prices">
                          <div>
                            <span>Regular price</span>
                            <strong>{money(service.price)}</strong>
                          </div>
                          <div>
                            <span>
                              <Crown size={11} />
                              Member price
                            </span>
                            <strong>{money(service.member_price)}</strong>
                          </div>
                        </div>
                        <div className="catalogue-service-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openForm(service)}
                            aria-label={`Edit ${service.name}`}
                          >
                            <Pencil size={13} />
                            Edit service
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setChangingStatus(service);
                              setFormError("");
                            }}
                            aria-label={`${service.active ? "Archive" : "Restore"} ${service.name}`}
                          >
                            {service.active ? (
                              <Archive size={13} />
                            ) : (
                              <RotateCcw size={13} />
                            )}
                            {service.active ? "Archive" : "Restore"}
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )
            )}
          </TabsContent>
        </Tabs>
        <div className="catalogue-pagination">
          <span>
            {count} {count === 1 ? "service" : "services"} · Page {page} of{" "}
            {Math.max(data?.pagination.pages || 0, 1)}
          </span>
          <div>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              <ArrowLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={!data || page >= data.pagination.pages || loading}
              onClick={() => setPage(page + 1)}
            >
              <ArrowRight size={14} />
            </Button>
          </div>
        </div>
      </Card>
      <div className="catalogue-note">
        <Crown size={17} />
        <span>
          <strong>A little extra for your members.</strong> Active members
          receive {data?.membership_discount || 15}% off every service. Member
          prices are applied automatically at checkout.
        </span>
      </div>
      <div className="workspace-bottom">
        <span>
          <ShieldCheck size={14} />
          Catalogue changes keep your past bills intact.
        </span>
        <span>
          NEWBILLING <span className="bottom-dot">•</span> SERVICE COLLECTION
        </span>
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) setFormOpen(open);
        }}
      >
        <DialogContent className="catalogue-form-dialog">
          <DialogHeader>
            <div className="dialog-heading-icon">
              <Scissors size={22} />
            </div>
            <DialogTitle>
              {editing ? "Refine your service" : "Add something wonderful"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Update the details for future visits. Past bills keep their saved prices."
                : "Create a new service for your catalogue and billing menu."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saveService}>
            <fieldset disabled={saving}>
              <div className="catalogue-field">
                <label htmlFor="service-name">Service name</label>
                <Input
                  id="service-name"
                  required
                  maxLength={80}
                  placeholder="e.g. Signature haircut"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </div>
              <div className="catalogue-form-row">
                <div className="catalogue-field">
                  <label htmlFor="service-category">Category</label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm({ ...form, category: value })
                    }
                    disabled={saving}
                  >
                    <SelectTrigger id="service-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {categories.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="catalogue-field">
                  <label htmlFor="service-duration">Duration (minutes)</label>
                  <Input
                    id="service-duration"
                    type="number"
                    required
                    min="1"
                    max="480"
                    step="1"
                    value={form.duration_minutes}
                    onChange={(event) =>
                      setForm({ ...form, duration_minutes: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="catalogue-field">
                <label htmlFor="service-price">Regular price (₹)</label>
                <Input
                  id="service-price"
                  type="number"
                  required
                  min="0.01"
                  max="99999999.99"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                />
                <div className="catalogue-member-preview">
                  <Crown size={13} />
                  <span>Active member price</span>
                  <strong>{money(Number(form.price || 0) * 0.85)}</strong>
                  <small>15% off</small>
                </div>
              </div>
              <div className="catalogue-field">
                <label htmlFor="service-description">
                  Description <span>optional</span>
                </label>
                <textarea
                  id="service-description"
                  rows={3}
                  maxLength={500}
                  placeholder="A short description of the experience…"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </div>
              <div className="catalogue-visibility">
                <label htmlFor="service-active">
                  <strong>Available for billing</strong>
                  <span>Active services appear in the billing menu.</span>
                </label>
                <Switch
                  id="service-active"
                  checked={form.active}
                  onCheckedChange={(value) =>
                    setForm({ ...form, active: value })
                  }
                  disabled={saving}
                />
              </div>
              {formError && (
                <p role="alert" className="catalogue-form-error">
                  {formError}
                </p>
              )}
              <Button
                type="submit"
                className="catalogue-primary catalogue-submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <CheckCheck size={17} />
                )}
                {saving ? "Saving…" : editing ? "Save changes" : "Add service"}
              </Button>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!changingStatus}
        onOpenChange={(open) => {
          if (!open && !saving) setChangingStatus(null);
        }}
      >
        <DialogContent className="catalogue-form-dialog">
          <DialogHeader>
            <div className="dialog-heading-icon">
              {changingStatus?.active ? (
                <Archive size={22} />
              ) : (
                <RotateCcw size={22} />
              )}
            </div>
            <DialogTitle>
              {changingStatus?.active
                ? "Take this off the menu?"
                : "Welcome this service back?"}
            </DialogTitle>
            <DialogDescription>{changingStatus?.name}</DialogDescription>
          </DialogHeader>
          <p className="catalogue-archive-copy">
            {changingStatus?.active
              ? "Archiving hides this service from new bills. Existing bills retain their original service details and amounts. You can restore it anytime."
              : "Restoring makes this service available for new bills again at its current catalogue price."}
          </p>
          {formError && (
            <p role="alert" className="catalogue-form-error">
              {formError}
            </p>
          )}
          <Button
            className="catalogue-primary catalogue-submit"
            onClick={changeStatus}
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle className="spin" size={16} />
            ) : changingStatus?.active ? (
              <Archive size={16} />
            ) : (
              <RotateCcw size={16} />
            )}
            {saving
              ? "Saving…"
              : changingStatus?.active
                ? "Archive service"
                : "Restore service"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
