import React, { useState, useMemo, useRef, useEffect } from "react";
import $ from "jquery";
import "jquery-validation";
import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  Crown,
  Check,
  CheckCheck,
  CircleHelp,
  CreditCard,
  Flower2,
  History,
  LayoutGrid,
  Leaf,
  LoaderCircle,
  Minus,
  Pencil,
  Plus,
  Printer,
  ReceiptText,
  RefreshCw,
  Scissors,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Separator } from "@/components/ui/separator";
import "../styles/ui.css";
import "../styles/billing.css";
import "../styles/customers.css";
import { CUSTOMER_API, CUSTOMER_PATHS } from "@/lib/customer-paths";
import { SERVICES_API, SERVICES_PATH } from "@/lib/service-paths";
import { STAFF_API, STAFF_PATH } from "@/lib/workspace-paths";

if (typeof window !== "undefined") {
  window.$ = $;
  window.jQuery = $;
}

const PAYMENTS = ["Cash", "UPI", "Card"];
const GST_RATE = 0.18;

const money = (n) =>
  "₹" +
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function Billing() {
  const formRef = useRef(null);
  const historyRequest = useRef(0);
  const [historySearch, setHistorySearch] = useState("");
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    document.body.classList.add("billing-page");
  }, []);
  useEffect(() => {
    if (!formRef.current) return;
    const validator = $(formRef.current).validate({
      rules: {
        customer_phone: {
          required: true,
          digits: true,
          minlength: 10,
          maxlength: 10,
        },
        customer_name: {
          required: true,
          minlength: 2,
        },
      },
      messages: {
        customer_phone: {
          required: "Phone number is required",
          minlength: "Phone number must be 10 digits",
          maxlength: "Phone number must be exactly 10 digits",
          digits: "Please enter numbers only",
        },
        customer_name: {
          required: "Customer name is required",
          minlength: "Name must be at least 2 characters",
        },
      },
      errorClass: "bl-error-text",
      errorElement: "label",
      highlight: function (element) {
        $(element).addClass("bl-error-text");
      },
      unhighlight: function (element) {
        $(element).removeClass("bl-error-text");
      },
    });
    return () => {
      if (validator) validator.destroy();
    };
  }, []);

  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [items, setItems] = useState([]);
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [gstOn, setGstOn] = useState(false);
  const [payment, setPayment] = useState("Cash");
  const [printedBill, setPrintedBill] = useState(null);
  const [billHistory, setBillHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [saving, setSaving] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loadingToken, setLoadingToken] = useState(null);

  const [customerProfile, setCustomerProfile] = useState(null);
  const [customerLookupLoading, setCustomerLookupLoading] = useState(false);
  const [customerLookupError, setCustomerLookupError] = useState("");
  const [customerLookupRevision, setCustomerLookupRevision] = useState(0);
  const [checkedPhone, setCheckedPhone] = useState("");
  const [editingMembershipPhone, setEditingMembershipPhone] = useState(null);
  const matchedCustomer =
    customerProfile?.phone === phone ? customerProfile : null;
  const memberOffer = Boolean(
    matchedCustomer?.membership_active ||
      (editingMembershipPhone && editingMembershipPhone === phone),
  );
  const effectiveDiscountType = memberOffer ? "percent" : discountType;
  const effectiveDiscountValue = memberOffer
    ? 15
    : editingMembershipPhone && editingMembershipPhone !== phone
      ? 0
      : discountValue;

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("customer");
    if (!token) return;
    const controller = new AbortController();
    fetch(`${CUSTOMER_API}/lookup?token=${encodeURIComponent(token)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then(({ customer }) => {
        if (customer) {
          setName(customer.name);
          setPhone(customer.phone);
          setCustomerProfile(customer);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setNotice({
            type: "error",
            message:
              "Unable to load customer details. Enter their phone number to continue.",
          });
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setCustomerLookupError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setCustomerLookupLoading(false);
      setCheckedPhone("");
      return;
    }
    const controller = new AbortController();
    setCustomerLookupLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${CUSTOMER_API}/lookup?phone=${encodeURIComponent(phone)}`,
          {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          },
        );
        if (!response.ok) throw new Error();
        const { customer } = await response.json();
        if (controller.signal.aborted) return;
        setCustomerProfile(customer);
        setCheckedPhone(phone);
        if (customer) setName(customer.name);
      } catch (error) {
        if (error.name !== "AbortError")
          setCustomerLookupError(
            "Unable to check membership. Retry before saving.",
          );
      } finally {
        if (!controller.signal.aborted) setCustomerLookupLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [phone, customerLookupRevision]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState("");
  const [staffRevision, setStaffRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setStaffLoading(true);
    setStaffError("");
    fetch(`${STAFF_API}?for_billing=true`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load staff.");
        return response.json();
      })
      .then((data) => setStaffMembers(data.staff || []))
      .catch((error) => {
        if (error.name !== "AbortError")
          setStaffError("Unable to load staff. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setStaffLoading(false);
      });
    return () => controller.abort();
  }, [staffRevision]);
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [servicesRevision, setServicesRevision] = useState(0);
  const categories = [
    "All",
    ...new Set(services.map((service) => service.category)),
  ];
  useEffect(() => {
    const controller = new AbortController();
    setServicesLoading(true);
    setServicesError("");
    fetch(`${SERVICES_API}?for_billing=true`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data.services)) throw new Error();
        setServices(
          data.services.map((service) => ({
            ...service,
            price: Number(service.price),
          })),
        );
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setServicesError("Unable to load your services. Please retry.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setServicesLoading(false);
      });
    return () => controller.abort();
  }, [servicesRevision]);
  const visibleServices = services.filter(
    (s) =>
      (category === "All" || s.category === category) &&
      s.name.toLowerCase().includes(search.toLowerCase()),
  );

  function addService(s) {
    setItems((prev) => {
      const found = prev.find((i) => i.service_id === s.id);
      if (found) {
        return prev.map((i) =>
          i.service_id === s.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          service_id: s.id,
          name: s.name,
          price: s.price,
          qty: 1,
          staff_id: "",
        },
      ];
    });
  }

  function updateItem(serviceId, changes) {
    setItems((prev) =>
      prev.map((i) => (i.service_id === serviceId ? { ...i, ...changes } : i)),
    );
  }

  function removeItem(serviceId) {
    setItems((prev) => prev.filter((i) => i.service_id !== serviceId));
  }

  function changeQty(item, delta) {
    const qty = item.qty + delta;
    if (qty < 1) return removeItem(item.service_id);
    updateItem(item.service_id, { qty });
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const dv = Number(effectiveDiscountValue) || 0;
    let discount =
      effectiveDiscountType === "percent" ? (subtotal * dv) / 100 : dv;
    discount = Math.min(Math.max(discount, 0), subtotal);
    const taxable = subtotal - discount;
    const tax = gstOn ? taxable * GST_RATE : 0;
    return { subtotal, discount, tax, total: taxable + tax };
  }, [items, effectiveDiscountType, effectiveDiscountValue, gstOn]);

  const missingStaff = items.some((i) => !i.staff_id && !i.legacy);

  function reset() {
    setNotice(null);
    setEditingToken(null);
    setEditingMembershipPhone(null);
    setCustomerProfile(null);
    setCustomerLookupError("");
    setCheckedPhone("");
    setItems([]);
    setPhone("");
    setName("");
    setDiscountValue("");
    setDiscountType("percent");
    setGstOn(false);
    setPayment("Cash");
    if (formRef.current) {
      const validator = $(formRef.current).validate();
      if (validator) validator.resetForm();
      $(formRef.current).find(".bl-error-text").removeClass("bl-error-text");
    }
  }

  async function saveBill() {
    if (saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute("content") : "";
      };

      const serviceText = items
        .map((i) => (i.legacy && i.qty === 1 ? i.name : `${i.name} x${i.qty}`))
        .join(", ");

      const payload = {
        billing: {
          customer_name: name,
          customer_phone: phone,
          service: serviceText,
          subtotal: totals.subtotal,
          discount: Number(effectiveDiscountValue) || 0,
          discount_type:
            effectiveDiscountType === "percent" ? "percentage" : "flat",
          gst: gstOn,
          payment_method: payment.toLowerCase(),
          membership_offer_requested: memberOffer,
          items: items.map((i) => ({
            ...i,
            price: Number(i.price),
            qty: Number(i.qty),
          })),
        },
      };

      const response = await fetch(
        editingToken
          ? `/api/zvpkqndtxhrmfls/bills/${encodeURIComponent(editingToken)}`
          : "/api/kmxgyaevmqogavk/create_bill",
        {
          method: editingToken ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-CSRF-Token": getCsrfToken(),
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors?.some((message) => message.includes("Membership")))
          setCustomerLookupRevision((value) => value + 1);
        setNotice({
          type: "error",
          message: (data.errors || ["Unable to save bill"]).join(". "),
        });
        return;
      }

      setPrintedBill({
        ...data.billing,
        totals: {
          subtotal: Number(data.billing.subtotal),
          discount:
            data.billing.discount_type === "percentage"
              ? (Number(data.billing.subtotal) *
                  Number(data.billing.discount)) /
                100
              : Number(data.billing.discount),
          tax: Number(data.billing.tax),
          total: Number(data.billing.total),
        },
        customer: { name, phone },
        items: data.billing.items || [...items],
        payment,
        gst: gstOn,
        date: new Date(data.billing.created_at || Date.now()).toLocaleString(
          "en-IN",
        ),
      });
      const wasEditing = Boolean(editingToken);
      reset();
      if (wasEditing) {
        setNotice({ type: "success", message: "Bill updated successfully." });
      } else {
        setNotice({
          type: "success",
          message: "Bill saved. Your receipt is ready to print.",
        });
        setTimeout(() => window.print(), 300);
      }
    } catch {
      setNotice({
        type: "error",
        message: "Unable to save bill. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function fetchBillHistory() {
    setHistoryError("");
    setHistoryOpen(true);
    setHistorySearch("");
    setHistoryLoading(true);
    try {
      const response = await fetch("/api/wyaglkrsuzjlfax/bill_history", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data.billings))
        throw new Error("Unable to load bill history");
      setBillHistory(data.billings);
    } catch {
      setHistoryError("Unable to load bill history. Please try again.");
    } finally {
      setHistoryLoading(false);
    }
  }

  async function editBill(token) {
    setHistoryError("");
    setLoadingToken(token);
    const requestId = ++historyRequest.current;
    try {
      const response = await fetch(
        `/api/zvpkqndtxhrmfls/bills/${encodeURIComponent(token)}`,
        {
          headers: { Accept: "application/json" },
        },
      );
      if (!response.ok) throw new Error("Unable to load bill");
      const { billing } = await response.json();
      if (requestId !== historyRequest.current) return;
      const savedItems =
        Array.isArray(billing.items) && billing.items.length > 0
          ? billing.items.map((item) => ({
              ...item,
              price: Number(item.price),
              qty: Number(item.qty),
            }))
          : [
              {
                service_id: `legacy-${billing.token}`,
                name: billing.service,
                price: Number(billing.subtotal),
                qty: 1,
                staff_id: "",
                legacy: true,
              },
            ];
      reset();
      setEditingToken(billing.token);
      setEditingMembershipPhone(
        billing.membership_discount_applied ? billing.customer_phone : null,
      );
      setName(billing.customer_name);
      setPhone(billing.customer_phone);
      setDiscountValue(String(billing.discount));
      setDiscountType(
        billing.discount_type === "percentage" ? "percent" : "flat",
      );
      setGstOn(billing.gst);
      setPayment(
        { cash: "Cash", upi: "UPI", card: "Card" }[billing.payment_method] ||
          "Cash",
      );
      setItems(savedItems);
      setSearch("");
      setCategory("All");
      setPrintedBill(null);
      setHistoryOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      formRef.current
        ?.querySelector('[name="customer_name"]')
        ?.focus({ preventScroll: true });
    } catch {
      setHistoryError("Unable to load this bill. Please try again.");
    } finally {
      setLoadingToken(null);
    }
  }

  function historyDateLabel(value) {
    const billDate = new Date(value);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    billDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);

    if (billDate.getTime() === today.getTime()) return "Today";
    if (billDate.getTime() === yesterday.getTime()) return "Yesterday";

    return billDate.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function handleSaveClick() {
    if (saving) return;
    if (formRef.current) {
      const isValid = $(formRef.current).valid();
      if (!isValid) return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setNotice({
        type: "error",
        message:
          "Enter a valid 10-digit mobile number starting with 6, 7, 8 or 9.",
      });
      return;
    }
    if (
      customerLookupLoading ||
      customerLookupError ||
      checkedPhone !== phone
    ) {
      setNotice({
        type: "error",
        message:
          customerLookupError ||
          "Please wait while customer membership is checked.",
      });
      return;
    }
    if (items.length === 0) {
      setNotice({
        type: "error",
        message: "Choose at least one service to create your bill.",
      });
      return;
    }

    if (missingStaff) {
      setNotice({
        type: "error",
        message: "Assign a staff member to each service before saving.",
      });
      return;
    }

    saveBill();
  }

  const matchingHistory = billHistory.filter((bill) =>
    `${bill.customer_name} ${bill.service} ${bill.token}`
      .toLowerCase()
      .includes(historySearch.toLowerCase()),
  );
  const historyGroups = matchingHistory.reduce((groups, bill) => {
    const label = historyDateLabel(bill.created_at);
    if (!groups[label]) groups[label] = [];
    groups[label].push(bill);
    return groups;
  }, {});
  const itemCount = items.reduce((count, item) => count + item.qty, 0);
  const dateLabel = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const categoryIcons = {
    All: LayoutGrid,
    Hair: Scissors,
    Skin: Leaf,
    Nails: Flower2,
  };
  const paymentIcons = { Cash: Banknote, UPI: Smartphone, Card: CreditCard };

  function closeHistory(open) {
    if (!open) historyRequest.current += 1;
    setHistoryOpen(open);
  }

  return (
    <>
      <div className="billing-workspace">
        <div className="workspace-breadcrumb">
          <span>Workspace</span>
          <span>/</span>
          <span>Billing</span>
        </div>
        <header className="workspace-heading">
          <div>
            <div className="workspace-eyebrow">
              <span /> POINT OF SALE
            </div>
            <h1>
              {editingToken ? "Edit bill" : "New bill"}
              <span className="heading-dot">.</span>
            </h1>
            <p>A little less admin. A little more time for your clients.</p>
          </div>
          <div className="heading-actions">
            <span className="workspace-date">
              <CalendarDays size={15} />
              {dateLabel}
            </span>
            <Dialog open={historyOpen} onOpenChange={closeHistory}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="history-trigger"
                  onClick={fetchBillHistory}
                  disabled={saving}
                >
                  <History size={16} /> Bill history <ArrowUpRight size={14} />
                </Button>
              </DialogTrigger>
              <DialogContent
                className="billing-history-dialog"
                onCloseAutoFocus={(event) => {
                  if (editingToken) {
                    event.preventDefault();
                    formRef.current
                      ?.querySelector('[name="customer_name"]')
                      ?.focus({ preventScroll: true });
                  }
                }}
              >
                <DialogHeader>
                  <div className="dialog-heading-icon">
                    <History size={21} />
                  </div>
                  <DialogTitle>Bill history</DialogTitle>
                  <DialogDescription>
                    Every visit, neatly recorded. Find a bill to review or edit.
                  </DialogDescription>
                </DialogHeader>
                <div className="input-with-icon history-search">
                  <Search size={17} />
                  <Input
                    aria-label="Search bill history"
                    placeholder="Search by customer, service or bill ID…"
                    value={historySearch}
                    onChange={(event) => setHistorySearch(event.target.value)}
                  />
                </div>
                <div className="billing-history-scroll">
                  {historyError && (
                    <div role="alert" className="billing-notice error">
                      {historyError}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchBillHistory}
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                  {historyLoading && (
                    <div className="history-empty">
                      <LoaderCircle className="spin" />
                      <p>Loading your bills…</p>
                    </div>
                  )}
                  {!historyLoading &&
                    !historyError &&
                    matchingHistory.length === 0 && (
                      <div className="history-empty">
                        <ReceiptText size={32} />
                        <h3>
                          {historySearch
                            ? "No matching bills"
                            : "Your history starts here"}
                        </h3>
                        <p>
                          {historySearch
                            ? "Try a different customer or service name."
                            : "Saved bills will appear here, organised by date."}
                        </p>
                      </div>
                    )}
                  {!historyLoading &&
                    Object.entries(historyGroups).map(([label, bills]) => (
                      <section className="bill-date-group" key={label}>
                        <div className="bill-date-heading">
                          <h3>{label}</h3>
                          <span>
                            {bills.length}{" "}
                            {bills.length === 1 ? "bill" : "bills"}
                          </span>
                        </div>
                        {bills.map((bill) => (
                          <div className="bill-history-row" key={bill.token}>
                            <div className="customer-initial">
                              {bill.customer_name?.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="bill-history-person">
                              <strong>{bill.customer_name}</strong>
                              <span>{bill.service}</span>
                              <small>
                                {new Date(bill.created_at).toLocaleTimeString(
                                  "en-IN",
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </small>
                            </div>
                            <div className="bill-history-amount">
                              <strong>{money(bill.total)}</strong>
                              <Badge variant="secondary">
                                {bill.payment_method}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              aria-label={`Edit bill for ${bill.customer_name}`}
                              onClick={() => editBill(bill.token)}
                              disabled={loadingToken !== null || saving}
                            >
                              {loadingToken === bill.token ? (
                                <LoaderCircle className="spin" />
                              ) : (
                                <Pencil size={13} />
                              )}{" "}
                              Edit
                            </Button>
                          </div>
                        ))}
                      </section>
                    ))}
                </div>
                <div className="history-dialog-footer">
                  <ShieldCheck size={14} />
                  <span>Only your workspace's bills are shown here.</span>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {notice && (
          <div
            className={`billing-notice ${notice.type}`}
            role={notice.type === "error" ? "alert" : "status"}
          >
            <span>
              {notice.type === "success" ? (
                <CheckCheck size={18} />
              ) : (
                <CircleHelp size={18} />
              )}
              {notice.message}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss message"
              onClick={() => setNotice(null)}
            >
              <X size={16} />
            </Button>
          </div>
        )}
        {editingToken && (
          <div className="editing-banner">
            <span>
              <Pencil size={15} />
              Editing an existing bill{" "}
              <strong>#{editingToken.slice(-6).toUpperCase()}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={reset} disabled={saving}>
              Cancel edit <X size={14} />
            </Button>
          </div>
        )}

        <fieldset className="billing-layout" disabled={saving}>
          <div className="billing-main-column">
            <Card className="customer-card">
              <div className="section-heading">
                <div className="section-title">
                  <span className="section-step">01</span>
                  <h2>Customer details</h2>
                </div>
                <UserRound size={18} className="muted-icon" />
              </div>
              <form
                ref={formRef}
                onSubmit={(event) => {
                  event.preventDefault();
                  handleSaveClick();
                }}
              >
                <div className="customer-fields">
                  <div className="customer-field">
                    <label htmlFor="billing-customer-name">
                      Customer name <span>*</span>
                    </label>
                    <Input
                      id="billing-customer-name"
                      name="customer_name"
                      autoComplete="name"
                      placeholder="Enter customer name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                    />
                  </div>
                  <div className="customer-field">
                    <label htmlFor="billing-customer-phone">
                      Phone number <span>*</span>
                    </label>
                    <div className="phone-input">
                      <span>+91</span>
                      <Input
                        id="billing-customer-phone"
                        name="customer_phone"
                        autoComplete="tel-national"
                        placeholder="10-digit mobile number"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(event) =>
                          setPhone(event.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  </div>
                </div>
              </form>
              {customerLookupLoading && (
                <div className="billing-member-lookup">
                  <LoaderCircle className="spin" size={13} />
                  Checking customer membership…
                </div>
              )}
              {customerLookupError && (
                <div className="billing-member-banner expired">
                  <CircleHelp size={15} />
                  {customerLookupError}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setCustomerLookupRevision((value) => value + 1)
                    }
                  >
                    Retry
                  </Button>
                </div>
              )}
              {!customerLookupLoading &&
                !customerLookupError &&
                (memberOffer ||
                  matchedCustomer?.customer_type === "member") && (
                  <div
                    className={`billing-member-banner ${memberOffer ? "" : "expired"}`}
                  >
                    <Crown size={17} />
                    <span>
                      {memberOffer
                        ? matchedCustomer?.membership_active
                          ? "Active member · 15% off every service"
                          : "Original bill · 15% member savings preserved"
                        : "Membership expired · renew to restore 15% savings"}
                    </span>
                    <a href={CUSTOMER_PATHS.member}>
                      Members <ArrowUpRight size={12} />
                    </a>
                  </div>
                )}
            </Card>

            <Card className="services-card">
              <div className="section-heading">
                <div className="section-title">
                  <span className="section-step">02</span>
                  <div>
                    <h2>Select services</h2>
                    <p>Good looks start here. Add services to the bill.</p>
                  </div>
                </div>
                <div className="billing-service-actions">
                  <Badge variant="secondary" className="service-count">
                    {services.length} services
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Refresh service menu"
                    disabled={servicesLoading}
                    onClick={() => {
                      setServicesRevision((value) => value + 1);
                      setCategory("All");
                    }}
                  >
                    <RefreshCw size={14} />
                  </Button>
                </div>
              </div>
              <div className="input-with-icon service-search">
                <Search size={17} />
                <Input
                  aria-label="Search services"
                  placeholder="Search for a service…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear service search"
                    onClick={() => setSearch("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {servicesLoading && (
                <div className="service-empty" role="status">
                  <LoaderCircle className="spin" size={23} />
                  <p>Loading your service menu…</p>
                </div>
              )}
              {servicesError && (
                <div className="service-empty" role="alert">
                  <p>{servicesError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setServicesRevision((value) => value + 1)}
                  >
                    Retry services
                  </Button>
                </div>
              )}
              {!servicesLoading && !servicesError && services.length === 0 && (
                <div className="service-empty">
                  <p>Add an active service to start billing.</p>
                  <Button variant="outline" asChild>
                    <a href={SERVICES_PATH}>Manage services</a>
                  </Button>
                </div>
              )}
              <Tabs
                value={category}
                onValueChange={setCategory}
                className="service-tabs"
              >
                <TabsList aria-label="Service categories">
                  {categories.map((value) => {
                    const Icon = categoryIcons[value] || Sparkles;
                    return (
                      <TabsTrigger value={value} key={value}>
                        <Icon size={14} />
                        {value === "All" ? "All services" : value}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                <TabsContent
                  value={category}
                  className="service-grid"
                  aria-label={`${category} services`}
                >
                  {visibleServices.map((service) => {
                    const selected = items.find(
                      (item) => item.service_id === service.id,
                    );
                    const Icon = categoryIcons[service.category] || Sparkles;
                    return (
                      <button
                        type="button"
                        className={`service-tile ${selected ? "is-selected" : ""}`}
                        key={service.id}
                        onClick={() => addService(service)}
                        aria-label={`Add ${service.name}, ${money(service.price)}${selected ? `, ${selected.qty} selected` : ""}`}
                      >
                        <div className="service-tile-top">
                          <span
                            className={`service-symbol tone-${service.category.toLowerCase()}`}
                          >
                            <Icon size={22} strokeWidth={1.5} />
                          </span>
                          {selected ? (
                            <span className="selected-count">
                              <Check size={12} />
                              {selected.qty} added
                            </span>
                          ) : (
                            <span className="service-category">
                              {service.category}
                            </span>
                          )}
                        </div>
                        <strong>{service.name}</strong>
                        <div className="service-tile-bottom">
                          <span>{money(service.price)}</span>
                          <span className="service-add">
                            <Plus size={16} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </TabsContent>
              </Tabs>
              {!servicesLoading &&
                !servicesError &&
                services.length > 0 &&
                visibleServices.length === 0 && (
                  <div className="service-empty">
                    <Search size={25} />
                    <h3>No services found</h3>
                    <p>Try another search or category.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearch("");
                        setCategory("All");
                      }}
                    >
                      Show all services
                    </Button>
                  </div>
                )}
              <div className="service-footer">
                <CircleHelp size={14} />
                <span>
                  Click a service to add it. Click again to increase the
                  quantity.
                </span>
              </div>
            </Card>
            <div className="workspace-bottom">
              <span>
                <ShieldCheck size={14} />A smooth checkout, every time.
              </span>
              <span>
                NEWBILLING <span className="bottom-dot">•</span> SALON WORKSPACE
              </span>
            </div>
          </div>

          <Card className="order-card">
            <div className="order-heading">
              <div className="section-title">
                <span className="order-symbol">
                  <ReceiptText size={19} />
                </span>
                <div>
                  <h2>Bill summary</h2>
                  <p>
                    {itemCount
                      ? `${itemCount} ${itemCount === 1 ? "service" : "services"} added`
                      : "Your next great visit"}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={editingToken ? "edit-badge" : "draft-badge"}
              >
                {editingToken ? "Editing" : "Draft"}
              </Badge>
            </div>
            <div className="order-items">
              {items.length === 0 ? (
                <div className="order-empty">
                  <div className="empty-receipt">
                    <ReceiptText size={30} strokeWidth={1.2} />
                    <span>
                      <Plus size={12} />
                    </span>
                  </div>
                  <h3>Let's build a bill</h3>
                  <p>
                    Select a service on the left
                    <br />
                    and we'll take care of the totals.
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div className="order-item" key={item.service_id}>
                    <div className="order-item-title">
                      <strong>{item.name}</strong>
                      <span>{money(item.price * item.qty)}</span>
                    </div>
                    <div className="order-item-controls">
                      <Select
                        value={String(item.staff_id || "")}
                        onValueChange={(value) =>
                          updateItem(item.service_id, {
                            staff_id: value,
                            staff_name: staffMembers.find(
                              (staff) => staff.token === value,
                            )?.name,
                          })
                        }
                        disabled={saving}
                      >
                        <SelectTrigger
                          className={`staff-select ${!item.staff_id && !item.legacy ? "needs-staff" : ""}`}
                          aria-label={`Staff for ${item.name}`}
                        >
                          <SelectValue
                            placeholder={
                              item.legacy
                                ? "Staff not recorded"
                                : "Assign staff"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          {item.staff_id &&
                            !staffMembers.some(
                              (staff) => staff.token === String(item.staff_id),
                            ) && (
                              <SelectItem
                                value={String(item.staff_id)}
                                disabled
                              >
                                {item.staff_name || "Previously assigned staff"}
                              </SelectItem>
                            )}
                          {staffMembers.map((staff) => (
                            <SelectItem key={staff.id} value={String(staff.id)}>
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="quantity-stepper">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Decrease ${item.name} quantity`}
                          onClick={() => changeQty(item, -1)}
                        >
                          <Minus size={12} />
                        </Button>
                        <span aria-label={`${item.name} quantity`}>
                          {item.qty}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Increase ${item.name} quantity`}
                          onClick={() => changeQty(item, 1)}
                        >
                          <Plus size={12} />
                        </Button>
                      </div>
                      <Button
                        className="remove-service"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => removeItem(item.service_id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {items.some((item) => item.legacy) && (
                <p className="legacy-note">
                  Older bill: services are combined at their original subtotal.
                </p>
              )}
            </div>
            <Separator />
            <div className="order-adjustments">
              <div className="adjustment-row">
                <label htmlFor="bill-discount">
                  <Tag size={15} />
                  Discount
                </label>
                <div className="discount-controls">
                  <Input
                    id="bill-discount"
                    aria-label="Discount amount"
                    disabled={memberOffer}
                    type="number"
                    min="0"
                    max={
                      effectiveDiscountType === "percent"
                        ? 100
                        : totals.subtotal
                    }
                    value={effectiveDiscountValue}
                    onChange={(event) => setDiscountValue(event.target.value)}
                    placeholder="0"
                  />
                  <Select
                    value={effectiveDiscountType}
                    onValueChange={setDiscountType}
                    disabled={saving || memberOffer}
                  >
                    <SelectTrigger aria-label="Discount type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="percent">%</SelectItem>
                      <SelectItem value="flat">₹</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="adjustment-row">
                <label htmlFor="bill-gst">
                  GST <span className="tax-label">18%</span>
                </label>
                <Switch
                  id="bill-gst"
                  checked={gstOn}
                  onCheckedChange={setGstOn}
                  disabled={saving}
                />
              </div>
            </div>
            <Separator />
            <div className="order-totals">
              <div>
                <span>Subtotal</span>
                <span>{money(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="discount-total">
                  <span>
                    {memberOffer ? "Member discount (15%)" : "Discount"}
                  </span>
                  <span>−{money(totals.discount)}</span>
                </div>
              )}
              {gstOn && (
                <div>
                  <span>GST (18%)</span>
                  <span>{money(totals.tax)}</span>
                </div>
              )}
            </div>
            <div className="total-due">
              <div>
                <span>Total amount</span>
                <small>{gstOn ? "Including GST" : "Ready when you are"}</small>
              </div>
              <strong>{money(totals.total)}</strong>
            </div>
            <div className="checkout-section">
              <div className="payment-label">PAYMENT METHOD</div>
              <div
                className="payment-options"
                role="group"
                aria-label="Payment method"
              >
                {PAYMENTS.map((value) => {
                  const Icon = paymentIcons[value];
                  return (
                    <Button
                      key={value}
                      variant="outline"
                      className={payment === value ? "payment-selected" : ""}
                      aria-pressed={payment === value}
                      onClick={() => setPayment(value)}
                    >
                      <Icon size={17} />
                      {value}
                      {payment === value && <span className="payment-dot" />}
                    </Button>
                  );
                })}
              </div>
              {staffLoading && <p className="staff-reminder">Loading staff…</p>}
              {staffError && (
                <div className="staff-reminder" role="alert">
                  {staffError}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setStaffRevision((value) => value + 1)}
                  >
                    Retry
                  </Button>
                </div>
              )}
              {!staffLoading && !staffError && staffMembers.length === 0 && (
                <p className="staff-reminder">
                  <a href={STAFF_PATH}>
                    Add active staff to assign new services.
                  </a>
                </p>
              )}
              {missingStaff && items.length > 0 && (
                <p className="staff-reminder">
                  <UserRound size={13} />
                  Assign a staff member to each service.
                </p>
              )}
              <Button
                className="save-bill-button"
                size="lg"
                onClick={handleSaveClick}
                disabled={
                  staffLoading ||
                  !!staffError ||
                  saving ||
                  customerLookupLoading ||
                  Boolean(customerLookupError)
                }
              >
                {saving ? (
                  <LoaderCircle className="spin" />
                ) : (
                  <CheckCheck size={18} />
                )}
                {saving
                  ? "Saving bill…"
                  : editingToken
                    ? "Update bill"
                    : "Save bill"}
                {!saving && <ArrowRight size={17} />}
              </Button>
              <div className="checkout-hint">
                <Printer size={12} />
                {editingToken
                  ? "Update details and reprint anytime"
                  : "Save your bill and print the receipt"}
              </div>
              {editingToken && (
                <Button
                  className="checkout-secondary"
                  variant="ghost"
                  onClick={reset}
                  disabled={saving}
                >
                  Cancel edit
                </Button>
              )}
              {printedBill && (
                <Button
                  className="checkout-secondary"
                  variant="outline"
                  onClick={() => window.print()}
                >
                  <Printer size={15} />
                  Print last bill
                </Button>
              )}
            </div>
          </Card>
        </fieldset>
      </div>
      {printedBill && (
        <div className="print-receipt">
          <div className="rcp-header">
            <div className="rcp-logo">Newbilling</div>
            <div className="rcp-sub">Payment receipt</div>
          </div>
          <div className="rcp-divider">{"─".repeat(32)}</div>
          <div className="rcp-meta">
            <div>
              <span>Customer</span>
              <span>{printedBill.customer.name}</span>
            </div>
            <div>
              <span>Phone</span>
              <span>{printedBill.customer.phone}</span>
            </div>
            <div>
              <span>Date</span>
              <span>{printedBill.date}</span>
            </div>
            <div>
              <span>Payment</span>
              <span>{printedBill.payment}</span>
            </div>
          </div>
          <div className="rcp-divider">{"─".repeat(32)}</div>
          <table className="rcp-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {printedBill.items.map((item) => (
                <tr key={item.service_id}>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>{money(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="rcp-divider">{"─".repeat(32)}</div>
          <div className="rcp-totals">
            <div>
              <span>Subtotal</span>
              <span>{money(printedBill.totals.subtotal)}</span>
            </div>
            {printedBill.totals.discount > 0 && (
              <div>
                <span>Discount</span>
                <span>−{money(printedBill.totals.discount)}</span>
              </div>
            )}
            {printedBill.gst && (
              <div>
                <span>GST (18%)</span>
                <span>{money(printedBill.totals.tax)}</span>
              </div>
            )}
            <div className="rcp-total-line">
              <span>TOTAL</span>
              <span>{money(printedBill.totals.total)}</span>
            </div>
          </div>
          <div className="rcp-footer">
            Thank you for visiting. See you again!
          </div>
        </div>
      )}
    </>
  );
}
