import React, { useState, useEffect } from "react";
import {
  Users,
  UserRoundCheck,
  UserRoundMinus,
  Scissors,
  Plus,
  Search,
  Pencil,
  Phone,
  Mail,
  CalendarDays,
  CheckCheck,
  X,
  LoaderCircle,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { STAFF_API } from "@/lib/workspace-paths";
import { workspaceRequest, money, localToday } from "@/lib/workspace-api";
import "../styles/team-reports.css";

const newPerson = () => ({
  name: "",
  role: "Stylist",
  phone: "",
  email: "",
  joined_on: localToday(),
  active: true,
});
const dateLabel = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
export default function Staff() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(newPerson);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [changing, setChanging] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timer = setTimeout(async () => {
      try {
        setData(
          await workspaceRequest(
            `${STAFF_API}?${new URLSearchParams({ q: search, status, page: String(page) })}`,
            { signal: controller.signal },
          ),
        );
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
  }, [search, status, page, revision]);
  function edit(member = null) {
    setEditing(member);
    setForm(
      member
        ? {
            name: member.name,
            role: member.role,
            phone: member.phone || "",
            email: member.email || "",
            joined_on: member.joined_on,
            active: member.active,
          }
        : newPerson(),
    );
    setFormError("");
    setOpen(true);
  }
  async function save(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setFormError("");
    try {
      await workspaceRequest(
        editing ? `${STAFF_API}/${editing.token}` : STAFF_API,
        {
          method: editing ? "PATCH" : "POST",
          body: JSON.stringify({ staff_member: form }),
        },
      );
      setOpen(false);
      setPage(1);
      setRevision((value) => value + 1);
      setNotice(
        editing
          ? "Staff details updated. Past bill assignments stay preserved."
          : "Team member added and ready for billing assignments.",
      );
    } catch (failure) {
      setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  async function changeStatus() {
    if (saving || !changing) return;
    setSaving(true);
    setFormError("");
    try {
      await workspaceRequest(`${STAFF_API}/${changing.token}`, {
        method: "PATCH",
        body: JSON.stringify({ staff_member: { active: !changing.active } }),
      });
      setNotice(
        changing.active
          ? "Staff member deactivated. Their previous work remains in reports."
          : "Staff member reactivated and available for new bills.",
      );
      setChanging(null);
      setPage(1);
      setRevision((value) => value + 1);
    } catch (failure) {
      setFormError(failure.message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="billing-workspace team-workspace">
      <div className="workspace-breadcrumb">
        <span>Workspace</span>
        <span>/</span>
        <span>Staff</span>
      </div>
      <header className="workspace-heading">
        <div>
          <div className="workspace-eyebrow">
            <span />
            THE PEOPLE BEHIND THE EXPERIENCE
          </div>
          <h1>
            Your team<span className="heading-dot">.</span>
          </h1>
          <p>
            Great service starts with great people. Keep your team connected.
          </p>
        </div>
        <Button className="workspace-primary" onClick={() => edit()}>
          <Plus size={16} />
          Add staff
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
      <Card className="team-panel">
        <div className="feature-panel-heading">
          <div>
            <h2>Meet your team</h2>
            <p>
              Contact details, availability, and a little recognition for their
              work.
            </p>
          </div>
          <Badge variant="secondary">{data?.pagination.total || 0} staff</Badge>
        </div>
        <div className="feature-toolbar">
          <div className="input-with-icon">
            <Search size={16} />
            <Input
              aria-label="Search staff"
              placeholder="Search name, role or mobile number…"
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
            <SelectTrigger aria-label="Staff status filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="all">All staff</SelectItem>
              <SelectItem value="active">
                Active staff ({data?.counts.active ?? 0})
              </SelectItem>
              <SelectItem value="inactive">
                Inactive staff ({data?.counts.inactive ?? 0})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {error && (
          <div className="feature-error" role="alert">
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
          <div className="feature-empty">
            <LoaderCircle className="spin" />
            <p>Loading your team…</p>
          </div>
        ) : !error && data?.staff.length === 0 ? (
          <div className="feature-empty">
            <Users size={33} />
            <h3>No staff found</h3>
            <p>Try another search or add a new team member.</p>
            <Button variant="outline" onClick={() => edit()}>
              <Plus size={14} />
              Add staff
            </Button>
          </div>
        ) : (
          !error && (
            <div className="team-grid">
              {data?.staff.map((member, index) => (
                <article
                  className={`team-person ${member.active ? "" : "inactive"}`}
                  key={member.token}
                >
                  <div className="team-person-heading">
                    <span className={`team-avatar tone-${index % 3}`}>
                      {member.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                    <Badge
                      className={`team-status ${member.active ? "active" : ""}`}
                    >
                      {member.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <h3>{member.name}</h3>
                  <span className="team-role">{member.role}</span>
                  <div className="team-contact">
                    <span>
                      <Phone size={13} />
                      {member.phone || "Mobile not added"}
                    </span>
                    <span>
                      <Mail size={13} />
                      {member.email || "Email not added"}
                    </span>
                    <span>
                      <CalendarDays size={13} />
                      Joined {dateLabel(member.joined_on)}
                    </span>
                  </div>
                  <div className="team-person-stats">
                    <div>
                      <span>Service units</span>
                      <strong>{member.quantity}</strong>
                    </div>
                    <div>
                      <span>Service value</span>
                      <strong>{money(member.gross_value)}</strong>
                    </div>
                  </div>
                  <small className="team-value-hint">
                    Recorded services · before discounts & GST
                  </small>
                  <div className="team-person-actions">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${member.name}`}
                      onClick={() => edit(member)}
                    >
                      <Pencil size={13} />
                      Edit details
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`${member.active ? "Deactivate" : "Reactivate"} ${member.name}`}
                      onClick={() => {
                        setChanging(member);
                        setFormError("");
                      }}
                    >
                      {member.active ? "Deactivate" : "Reactivate"}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )
        )}
        <div className="feature-pagination">
          <span>
            {data?.pagination.total || 0} staff · Page {page} of{" "}
            {Math.max(data?.pagination.pages || 0, 1)}
          </span>
          <div>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Previous page"
              disabled={loading || page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ArrowLeft size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Next page"
              disabled={loading || !data || page >= data.pagination.pages}
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
          Team changes preserve your existing bill history.
        </span>
        <span>
          NEWBILLING <span className="bottom-dot">•</span> YOUR PEOPLE
        </span>
      </div>
      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (!saving) setOpen(value);
        }}
      >
        <DialogContent className="feature-form-dialog">
          <DialogHeader>
            <div className="dialog-heading-icon">
              <Users size={22} />
            </div>
            <DialogTitle>
              {editing ? "Refine their details" : "Welcome to the team"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Keep their profile up to date for your workspace."
                : "Add a team member and start assigning their services."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save}>
            <fieldset disabled={saving}>
              <div className="feature-field">
                <label htmlFor="staff-name">Full name</label>
                <Input
                  id="staff-name"
                  required
                  maxLength={100}
                  value={form.name}
                  placeholder="Enter staff name"
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                />
              </div>
              <div className="feature-field">
                <label htmlFor="staff-role">Role</label>
                <Input
                  id="staff-role"
                  required
                  maxLength={60}
                  value={form.role}
                  placeholder="e.g. Senior stylist"
                  onChange={(event) =>
                    setForm({ ...form, role: event.target.value })
                  }
                />
              </div>
              <div className="feature-form-row">
                <div className="feature-field">
                  <label htmlFor="staff-phone">
                    Mobile <small>optional</small>
                  </label>
                  <Input
                    id="staff-phone"
                    inputMode="numeric"
                    maxLength={10}
                    pattern="[6-9][0-9]{9}"
                    value={form.phone}
                    placeholder="10-digit number"
                    onChange={(event) =>
                      setForm({
                        ...form,
                        phone: event.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>
                <div className="feature-field">
                  <label htmlFor="staff-joined">Joined on</label>
                  <Input
                    id="staff-joined"
                    type="date"
                    required
                    value={form.joined_on}
                    onChange={(event) =>
                      setForm({ ...form, joined_on: event.target.value })
                    }
                  />
                </div>
              </div>
              <div className="feature-field">
                <label htmlFor="staff-email">
                  Email <small>optional</small>
                </label>
                <Input
                  id="staff-email"
                  type="email"
                  maxLength={254}
                  value={form.email}
                  placeholder="name@example.com"
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>
              <div className="feature-switch-row">
                <label htmlFor="staff-active">
                  <strong>Available for billing</strong>
                  <span>Active staff can be assigned to new services.</span>
                </label>
                <Switch
                  id="staff-active"
                  checked={form.active}
                  disabled={saving}
                  onCheckedChange={(value) =>
                    setForm({ ...form, active: value })
                  }
                />
              </div>
              {formError && (
                <p className="feature-form-error" role="alert">
                  {formError}
                </p>
              )}
              <Button
                type="submit"
                className="workspace-primary feature-submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle className="spin" size={16} />
                ) : (
                  <CheckCheck size={16} />
                )}
                {saving
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Add staff member"}
              </Button>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!changing}
        onOpenChange={(value) => {
          if (!value && !saving) setChanging(null);
        }}
      >
        <DialogContent className="feature-form-dialog">
          <DialogHeader>
            <div className="dialog-heading-icon">
              <Users size={22} />
            </div>
            <DialogTitle>
              {changing?.active
                ? "Pause their availability?"
                : "Welcome them back?"}
            </DialogTitle>
            <DialogDescription>{changing?.name}</DialogDescription>
          </DialogHeader>
          <p className="feature-confirm-copy">
            {changing?.active
              ? "They will no longer appear for new bill assignments. Their past services, bill history, and reports stay preserved."
              : "They will be available for new bill assignments again."}
          </p>
          {formError && (
            <p className="feature-form-error" role="alert">
              {formError}
            </p>
          )}
          <Button
            className="workspace-primary feature-submit"
            disabled={saving}
            onClick={changeStatus}
          >
            {saving
              ? "Saving…"
              : changing?.active
                ? "Deactivate staff member"
                : "Reactivate staff member"}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
