import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Crown,
  Plus,
  Search,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  History,
  LoaderCircle,
  CheckCheck,
  X,
  ShieldCheck,
  Phone,
  ReceiptText,
  RefreshCw,
  Sparkles,
  UserRound,
  CircleHelp,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import {
  CUSTOMER_API,
  CUSTOMER_PATHS,
  BILLING_PATH,
} from "@/lib/customer-paths";
import "../styles/customers.css";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  });
const date = (value) =>
  value
    ? new Date(
        value.length === 10 ? `${value}T12:00:00` : value,
      ).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No visits yet";
const billUrl = (customer) =>
  `${BILLING_PATH}?customer=${encodeURIComponent(customer.token)}`;
async function request(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-CSRF-Token":
        document.querySelector('meta[name="csrf-token"]')?.content || "",
      ...options.headers,
    },
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new Error(
      response.redirected
        ? "Your session has expired. Refresh the page to sign in again."
        : "Unable to complete the request. Please try again.",
    );
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      data.errors?.join(". ") ||
        "Unable to complete the request. Please try again.",
    );
  return data;
}
function Status({ customer }) {
  return (
    <Badge className={`customer-status ${customer.membership_status}`}>
      {customer.membership_status === "walk_in"
        ? "Walk-in"
        : customer.membership_active
          ? "Active"
          : "Expired"}
    </Badge>
  );
}
function PaymentField({ value, onChange, disabled }) {
  return (
    <div className="customer-field">
      <label htmlFor="membership-payment">Payment received via</label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="membership-payment">
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="cash">Cash</SelectItem>
          <SelectItem value="upi">UPI</SelectItem>
          <SelectItem value="card">Card</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function Customers({ kind }) {
  const members = kind === "member";
  const customerCountLabel = (count) =>
    members
      ? count === 1
        ? "member"
        : "members"
      : count === 1
        ? "customer"
        : "customers";
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [formError, setFormError] = useState("");
  const [payment, setPayment] = useState("cash");
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [renewing, setRenewing] = useState(null);
  const requestKey = useRef("");
  const detailRequest = useRef(0);
  const fee = data?.membership_fee || 1500;
  const discount = data?.membership_discount || 15;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        const query = new URLSearchParams({
          kind,
          q: search,
          status,
          page: String(page),
        });
        const result = await request(`${CUSTOMER_API}?${query}`, {
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
  }, [kind, search, status, page, revision]);

  function openCreate() {
    setForm({ name: "", phone: "" });
    setPayment("cash");
    setFormError("");
    requestKey.current = crypto.randomUUID();
    setFormOpen(true);
  }
  async function createCustomer(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      await request(CUSTOMER_API, {
        method: "POST",
        body: JSON.stringify({
          customer: { ...form, customer_type: kind },
          payment_method: payment,
          request_key: requestKey.current,
        }),
      });
      setFormOpen(false);
      setPage(1);
      setRevision((value) => value + 1);
      setNotice(
        members
          ? "Member added. Annual membership is active with 15% off every service."
          : "Walk-in customer added. Their service history will appear after billing.",
      );
    } catch (failure) {
      setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  async function showHistory(customer, nextPage = 1) {
    const id = nextPage === 1 ? ++detailRequest.current : detailRequest.current;
    if (nextPage === 1) {
      setSelected(customer);
      setDetail(null);
      setDetailLoading(true);
      setMoreLoading(false);
    } else setMoreLoading(true);
    setDetailError("");
    try {
      const result = await request(
        `${CUSTOMER_API}/${encodeURIComponent(customer.token)}?page=${nextPage}`,
      );
      if (id !== detailRequest.current) return;
      setDetail((previous) =>
        nextPage === 1
          ? result
          : {
              ...result,
              billings: [...(previous?.billings || []), ...result.billings],
            },
      );
    } catch (failure) {
      if (id === detailRequest.current) setDetailError(failure.message);
    } finally {
      if (id === detailRequest.current) {
        setDetailLoading(false);
        setMoreLoading(false);
      }
    }
  }
  function openRenew(customer) {
    detailRequest.current += 1;
    setSelected(null);
    setRenewing(customer);
    setPayment("cash");
    setFormError("");
    requestKey.current = crypto.randomUUID();
  }
  async function renewMembership() {
    if (saving || !renewing) return;
    setSaving(true);
    setFormError("");
    try {
      const result = await request(
        `${CUSTOMER_API}/${encodeURIComponent(renewing.token)}/renew`,
        {
          method: "POST",
          body: JSON.stringify({
            payment_method: payment,
            request_key: requestKey.current,
          }),
        },
      );
      setRenewing(null);
      setPage(1);
      setRevision((value) => value + 1);
      setNotice(
        `Membership recorded for ${result.customer.name}. Valid until ${date(result.customer.membership_expires_on)}.`,
      );
    } catch (failure) {
      setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  const profile = detail?.customer || selected;

  return (
    <div className="billing-workspace customers-workspace">
      <div className="workspace-breadcrumb">
        <span>Workspace</span>
        <span>/</span>
        <span>Customers</span>
        <span>/</span>
        <span>{members ? "Members" : "Walk-ins"}</span>
      </div>
      <header className="workspace-heading">
        <div>
          <div className="workspace-eyebrow">
            <span />
            CLIENT CONNECTIONS
          </div>
          <h1>
            {members ? "Members" : "Walk-in customers"}
            <span className="heading-dot">.</span>
          </h1>
          <p>
            {members
              ? "Reward loyalty. Keep every membership a little more personal."
              : "Familiar faces, first visits, and everything in between."}
          </p>
        </div>
        <Button className="customer-primary" onClick={openCreate}>
          <Plus size={16} />
          {members ? "Add member" : "Add customer"}
        </Button>
      </header>
      <div className="customer-page-tabs">
        <a
          href={CUSTOMER_PATHS.walk_in}
          className={!members ? "active" : ""}
          aria-current={!members ? "page" : undefined}
        >
          <Users size={16} />
          Walk-in customers
        </a>
        <a
          href={CUSTOMER_PATHS.member}
          className={members ? "active" : ""}
          aria-current={members ? "page" : undefined}
        >
          <Crown size={16} />
          Members
        </a>
      </div>
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
      {members && (
        <div className="membership-banner">
          <div className="membership-banner-icon">
            <Crown size={28} strokeWidth={1.4} />
          </div>
          <div>
            <div className="membership-banner-eyebrow">
              THE NEWBILLING MEMBERSHIP
            </div>
            <h2>A year of looking your best.</h2>
            <p>
              <strong>{discount}% off every service.</strong> One membership.
              Every visit.
            </p>
          </div>
          <div className="membership-banner-price">
            <strong>{money(fee).replace(".00", "")}</strong>
            <span>per year · renewable annually</span>
          </div>
        </div>
      )}
      <Card className="customer-list-card">
        <div className="customer-list-heading">
          <div>
            <h2>{members ? "Your members" : "Your customers"}</h2>
            <p>
              {members
                ? "Membership status, renewal dates, and visit history."
                : "Customer details and the services they have enjoyed."}
            </p>
          </div>
          <Badge variant="secondary">
            {data?.pagination.total ?? 0}{" "}
            {customerCountLabel(data?.pagination.total ?? 0)}
          </Badge>
        </div>
        <div className="customer-toolbar">
          <div className="input-with-icon">
            <Search size={16} />
            <Input
              aria-label="Search customers"
              placeholder="Search name or mobile number…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          {members && (
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            >
              <SelectTrigger aria-label="Membership status filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All memberships</SelectItem>
                <SelectItem value="active">
                  Active ({data?.counts.active ?? 0})
                </SelectItem>
                <SelectItem value="expiring">
                  Renewing soon ({data?.counts.expiring ?? 0})
                </SelectItem>
                <SelectItem value="expired">
                  Expired ({data?.counts.expired ?? 0})
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        {error && (
          <div role="alert" className="customer-inline-error">
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
          <div className="customer-empty">
            <LoaderCircle className="spin" size={27} />
            <p>Loading {members ? "members" : "customers"}…</p>
          </div>
        ) : !error && data?.customers.length === 0 ? (
          <div className="customer-empty">
            {members ? <Crown size={35} /> : <Users size={35} />}
            <h3>
              {search || status !== "all"
                ? "No matching customers"
                : members
                  ? "Your membership community starts here"
                  : "Welcome your first customer"}
            </h3>
            <p>
              {search || status !== "all"
                ? "Try a different search or filter."
                : members
                  ? "Add a member to start their year of exclusive savings."
                  : "Add a customer here, or save a bill to create their profile automatically."}
            </p>
            {!search && status === "all" && (
              <Button variant="outline" onClick={openCreate}>
                <Plus size={15} />
                {members ? "Add your first member" : "Add a customer"}
              </Button>
            )}
          </div>
        ) : (
          !error && (
            <div className="customer-table-scroll">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>{members ? "Membership" : "Visits"}</th>
                    <th>{members ? "Valid until" : "Last visit"}</th>
                    <th>Service spending</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data?.customers.map((customer) => (
                    <tr key={customer.token}>
                      <td>
                        <div className="customer-name-cell">
                          <span
                            className={`customer-avatar ${members ? "member" : ""}`}
                          >
                            {customer.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <strong>{customer.name}</strong>
                            <span>
                              <Phone size={10} />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        {members ? (
                          <Status customer={customer} />
                        ) : (
                          <span className="customer-visit-count">
                            {customer.visits}{" "}
                            {customer.visits === 1 ? "visit" : "visits"}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="customer-table-date">
                          {date(
                            members
                              ? customer.membership_expires_on
                              : customer.last_visit,
                          )}
                        </span>
                        {members && (
                          <small className="customer-row-helper">
                            {customer.visits}{" "}
                            {customer.visits === 1 ? "visit" : "visits"}
                          </small>
                        )}
                      </td>
                      <td>
                        <strong className="customer-spending">
                          {money(customer.total_spent)}
                        </strong>
                      </td>
                      <td>
                        <div className="customer-row-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showHistory(customer)}
                            aria-label={`View history for ${customer.name}`}
                          >
                            <History size={14} />
                            History
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRenew(customer)}
                          >
                            {members ? (
                              <RefreshCw size={13} />
                            ) : (
                              <Crown size={13} />
                            )}
                            {members ? "Renew" : "Make member"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
        <div className="customer-pagination">
          <span>
            {data
              ? `${data.pagination.total} ${customerCountLabel(data.pagination.total)} · Page ${page} of ${Math.max(data.pagination.pages, 1)}`
              : "Customer directory"}
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
      <div className="workspace-bottom">
        <span>
          <ShieldCheck size={14} />
          Your customer details stay within your workspace.
        </span>
        <span>
          NEWBILLING <span className="bottom-dot">•</span> CLIENT CONNECTIONS
        </span>
      </div>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) setFormOpen(open);
        }}
      >
        <DialogContent className="customer-form-dialog">
          <DialogHeader>
            <div className="dialog-heading-icon">
              {members ? <Crown size={22} /> : <UserRound size={22} />}
            </div>
            <DialogTitle>
              {members ? "Welcome a new member" : "Add a walk-in customer"}
            </DialogTitle>
            <DialogDescription>
              {members
                ? "A full year of member savings starts today."
                : "Keep their details ready for the next visit."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={createCustomer}>
            <fieldset disabled={saving}>
              <div className="customer-field">
                <label htmlFor="customer-name">Customer name</label>
                <Input
                  id="customer-name"
                  required
                  maxLength={100}
                  autoComplete="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </div>
              <div className="customer-field">
                <label htmlFor="customer-phone">Mobile number</label>
                <Input
                  id="customer-phone"
                  required
                  inputMode="numeric"
                  autoComplete="tel-national"
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      phone: event.target.value.replace(/\D/g, ""),
                    })
                  }
                />
              </div>
              {members && (
                <>
                  <div className="membership-fee-summary">
                    <span>
                      <Crown size={17} />
                      Annual membership
                      <small>{discount}% off all services for one year</small>
                    </span>
                    <strong>{money(fee)}</strong>
                  </div>
                  <PaymentField
                    value={payment}
                    onChange={setPayment}
                    disabled={saving}
                  />
                  <p className="membership-payment-note">
                    Record this membership after collecting the annual fee. This
                    action does not charge a card or UPI account.
                  </p>
                </>
              )}
              {formError && (
                <p role="alert" className="customer-form-error">
                  {formError}
                </p>
              )}
              <Button
                type="submit"
                className="customer-primary customer-submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={16} />
                ) : members ? (
                  <Crown size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {saving
                  ? "Saving…"
                  : members
                    ? `Record membership · ${money(fee)}`
                    : "Save customer"}
              </Button>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!renewing}
        onOpenChange={(open) => {
          if (!open && !saving) setRenewing(null);
        }}
      >
        <DialogContent className="customer-form-dialog">
          <DialogHeader>
            <div className="dialog-heading-icon">
              <Crown size={23} />
            </div>
            <DialogTitle>
              {renewing?.customer_type === "member"
                ? "Another year of great visits"
                : "Make them a member"}
            </DialogTitle>
            <DialogDescription>
              {renewing?.name} · {renewing?.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="membership-fee-summary">
            <span>
              Annual membership<small>{discount}% off every service</small>
            </span>
            <strong>{money(fee)}</strong>
          </div>
          <div className="renewal-dates">
            <div>
              <span>Starts</span>
              <strong>{date(renewing?.next_membership_starts_on)}</strong>
            </div>
            <ChevronRight size={17} />
            <div>
              <span>Valid until</span>
              <strong>{date(renewing?.next_membership_expires_on)}</strong>
            </div>
          </div>
          <p className="renewal-help">
            {renewing?.membership_active
              ? "Your remaining membership days are preserved. This renewal adds a full year after the current expiry."
              : "Membership starts today and lasts one full year. Expired memberships receive savings again after renewal."}
          </p>
          <PaymentField
            value={payment}
            onChange={setPayment}
            disabled={saving}
          />
          <p className="membership-payment-note">
            Confirm after collecting ₹1,500. The selected payment method is
            recorded; no payment is processed here.
          </p>
          {formError && (
            <p role="alert" className="customer-form-error">
              {formError}
            </p>
          )}
          <Button
            className="customer-primary customer-submit"
            onClick={renewMembership}
            disabled={saving}
          >
            {saving ? (
              <LoaderCircle className="spin" size={16} />
            ) : (
              <CheckCheck size={17} />
            )}
            {saving ? "Recording…" : "Confirm ₹1,500 received"}
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            detailRequest.current += 1;
            setSelected(null);
          }
        }}
      >
        <DialogContent className="customer-history-dialog">
          <DialogHeader>
            <div className="customer-profile-heading">
              <span className="customer-avatar large">
                {profile?.name.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <DialogTitle>{profile?.name || "Customer history"}</DialogTitle>
                <DialogDescription>{profile?.phone}</DialogDescription>
              </div>
              {profile && <Status customer={profile} />}
            </div>
          </DialogHeader>
          {profile && (
            <>
              <div className="customer-profile-stats">
                <div>
                  <span>Total visits</span>
                  <strong>{profile.visits ?? "—"}</strong>
                </div>
                <div>
                  <span>Service spending</span>
                  <strong>{money(profile.total_spent)}</strong>
                </div>
                <div>
                  <span>
                    {profile.customer_type === "member"
                      ? "Member until"
                      : "Last visit"}
                  </span>
                  <strong>
                    {date(
                      profile.customer_type === "member"
                        ? profile.membership_expires_on
                        : profile.last_visit,
                    )}
                  </strong>
                </div>
              </div>
              <div className="customer-history-actions">
                <Button asChild className="customer-primary">
                  <a href={billUrl(profile)}>
                    <Plus size={15} />
                    Create bill
                  </a>
                </Button>
                <Button variant="outline" onClick={() => openRenew(profile)}>
                  <Crown size={15} />
                  {profile.customer_type === "member"
                    ? "Renew membership"
                    : "Make member"}
                </Button>
              </div>
            </>
          )}
          <div className="customer-history-scroll">
            {detailLoading && (
              <div className="customer-empty">
                <LoaderCircle className="spin" />
                <p>Loading visits…</p>
              </div>
            )}
            {detailError && (
              <div role="alert" className="customer-inline-error">
                {detailError}
                <Button variant="outline" onClick={() => showHistory(selected)}>
                  Retry
                </Button>
              </div>
            )}
            {!detailLoading && detail && (
              <>
                <div className="customer-history-title">
                  <ReceiptText size={16} />
                  <h3>Service history</h3>
                </div>
                {detail.billings.length === 0 ? (
                  <div className="customer-empty">
                    <ReceiptText size={29} />
                    <h3>No services recorded yet</h3>
                    <p>Create their first bill to start their visit history.</p>
                  </div>
                ) : (
                  detail.billings.map((bill) => (
                    <article className="customer-visit" key={bill.token}>
                      <div className="customer-visit-heading">
                        <span>{date(bill.created_at)}</span>
                        <strong>{money(bill.total)}</strong>
                      </div>
                      {bill.items?.length ? (
                        <div className="customer-visit-services">
                          {bill.items.map((item, index) => (
                            <div key={`${item.service_id}-${index}`}>
                              <span>
                                {item.name} <small>×{item.qty}</small>
                              </span>
                              <span>
                                {money(Number(item.price) * Number(item.qty))}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{bill.service}</p>
                      )}
                      <div className="customer-visit-footer">
                        <span>
                          #{bill.token.slice(-6).toUpperCase()} ·{" "}
                          {bill.payment_method.toUpperCase()}
                        </span>
                        {bill.membership_discount_applied && (
                          <Badge variant="secondary">15% member savings</Badge>
                        )}
                      </div>
                    </article>
                  ))
                )}
                {detail.pagination.page < detail.pagination.pages && (
                  <Button
                    variant="outline"
                    className="customer-load-more"
                    disabled={moreLoading}
                    onClick={() =>
                      showHistory(profile, detail.pagination.page + 1)
                    }
                  >
                    {moreLoading ? (
                      <LoaderCircle className="spin" size={15} />
                    ) : (
                      <History size={15} />
                    )}
                    Load older visits
                  </Button>
                )}
                {detail.renewals.length > 0 && (
                  <>
                    <div className="customer-history-title">
                      <Crown size={16} />
                      <h3>Membership payments</h3>
                    </div>
                    {detail.renewals.map((renewal, index) => (
                      <div
                        className="customer-renewal-row"
                        key={`${renewal.created_at}-${index}`}
                      >
                        <div>
                          <strong>
                            {date(renewal.starts_on)} –{" "}
                            {date(renewal.expires_on)}
                          </strong>
                          <span>
                            Recorded {date(renewal.created_at)} ·{" "}
                            {renewal.payment_method.toUpperCase()}
                          </span>
                        </div>
                        <strong>{money(renewal.amount)}</strong>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
