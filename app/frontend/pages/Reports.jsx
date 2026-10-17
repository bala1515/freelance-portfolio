import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import {
  CalendarDays,
  ArrowLeft,
  ArrowRight,
  IndianRupee,
  ReceiptText,
  Crown,
  TrendingUp,
  ShieldCheck,
  LoaderCircle,
  Banknote,
  Smartphone,
  CreditCard,
  Scissors,
  Users,
  ChartNoAxesCombined,
  ChartColumn,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REPORTS_API } from "@/lib/workspace-paths";
import { workspaceRequest, money, localToday } from "@/lib/workspace-api";
import "../styles/team-reports.css";

const colours = { cash: "#be185d", upi: "#8c59b7", card: "#c47799" };
const methods = { cash: "Cash", upi: "UPI", card: "Card" };
const paymentIcons = { cash: Banknote, upi: Smartphone, card: CreditCard };
const dateLabel = (value) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const compactMoney = (value) =>
  Number(value) >= 100000
    ? `₹${(value / 100000).toFixed(1)}L`
    : Number(value) >= 1000
      ? `₹${(value / 1000).toFixed(1)}k`
      : `₹${value}`;
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="report-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <div key={entry.dataKey || entry.name}>
          <span>
            <i style={{ background: entry.color || entry.payload?.fill }} />
            {entry.name}
          </span>
          <b>{money(entry.value)}</b>
        </div>
      ))}
    </div>
  );
}
function Breakdown({ title, subtitle, icon: Icon, rows, name, empty }) {
  return (
    <Card className="report-breakdown">
      <div className="feature-panel-heading">
        <div>
          <h2>
            <Icon size={17} />
            {title}
          </h2>
          <p>{subtitle}</p>
        </div>
      </div>
      {rows.length ? (
        <div className="report-table-scroll">
          <table>
            <thead>
              <tr>
                <th>{name}</th>
                <th>Units</th>
                <th>Service value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.token || row.name}>
                  <td>
                    <span className="report-rank">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {row.name}
                  </td>
                  <td>{row.quantity}</td>
                  <td>{money(row.gross_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="report-small-empty">
          <Icon size={27} />
          <p>{empty}</p>
        </div>
      )}
    </Card>
  );
}

export default function Reports() {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(localToday);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [chart, setChart] = useState("graph");
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    if (!date) {
      setLoading(false);
      setError("Choose a date to view your report.");
      return () => controller.abort();
    }
    workspaceRequest(
      `${REPORTS_API}?${new URLSearchParams({ period, date })}`,
      { signal: controller.signal },
    )
      .then(setData)
      .catch((failure) => {
        if (failure.name !== "AbortError") setError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [period, date, revision]);
  function move(direction) {
    const value = new Date(`${date || localToday()}T12:00:00`);
    if (period === "daily") value.setDate(value.getDate() + direction);
    if (period === "weekly") value.setDate(value.getDate() + 7 * direction);
    if (period === "monthly") {
      value.setDate(1);
      value.setMonth(value.getMonth() + direction);
    }
    if (period === "yearly") {
      value.setMonth(0, 1);
      value.setFullYear(value.getFullYear() + direction);
    }
    setDate(
      `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`,
    );
  }
  const totals = data?.totals;
  const payments =
    data?.payments
      .filter((payment) => payment.amount > 0)
      .map((payment) => ({
        ...payment,
        name: methods[payment.method],
        fill: colours[payment.method],
      })) || [];
  const range = data
    ? data.range.from === data.range.to
      ? dateLabel(data.range.from)
      : `${dateLabel(data.range.from)} – ${dateLabel(data.range.to)}`
    : "";
  const chartAxes = (
    <>
      <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e9deed" />
      <XAxis
        dataKey="label"
        axisLine={false}
        tickLine={false}
        tick={{ fill: "#66566e", fontSize: 10 }}
        minTickGap={25}
        tickMargin={12}
      />
      <YAxis
        axisLine={false}
        tickLine={false}
        tickFormatter={compactMoney}
        tick={{ fill: "#66566e", fontSize: 10 }}
        width={58}
        allowDecimals={false}
      />
      <Tooltip content={<ChartTip />} />
    </>
  );
  return (
    <div className="billing-workspace reports-workspace">
      <div className="workspace-breadcrumb">
        <span>Workspace</span>
        <span>/</span>
        <span>Reports</span>
      </div>
      <header className="workspace-heading">
        <div>
          <div className="workspace-eyebrow">
            <span />
            THE BIGGER PICTURE
          </div>
          <h1>
            Business insights<span className="heading-dot">.</span>
          </h1>
          <p>Every visit tells a story. See how your salon is doing.</p>
        </div>
        <span className="report-zone">
          <CalendarDays size={15} />
          Asia / Kolkata · IST
        </span>
      </header>
      <Card className="report-controls">
        <Tabs value={period} onValueChange={setPeriod}>
          <TabsList aria-label="Report period">
            {["daily", "weekly", "monthly", "yearly"].map((value) => (
              <TabsTrigger key={value} value={value}>
                {value[0].toUpperCase() + value.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="report-date-controls">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Previous report period"
            onClick={() => move(-1)}
          >
            <ArrowLeft size={14} />
          </Button>
          <Input
            aria-label="Report reference date"
            type="date"
            min="1900-01-01"
            max="2100-12-31"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Next report period"
            onClick={() => move(1)}
          >
            <ArrowRight size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDate(localToday());
              setRevision((value) => value + 1);
            }}
          >
            Today
          </Button>
        </div>
      </Card>
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
        <div className="report-loading" role="status">
          <LoaderCircle className="spin" size={27} />
          <h2>Putting your insights together…</h2>
          <p>Reading your saved bills and membership payments.</p>
        </div>
      ) : (
        !error &&
        data && (
          <>
            <div className="report-range">
              <span>{range}</span>
              <small>
                {totals.bill_count} {totals.bill_count === 1 ? "bill" : "bills"}{" "}
                · {totals.customers_count}{" "}
                {totals.customers_count === 1 ? "customer" : "customers"} ·{" "}
                {totals.renewal_count} membership payments
              </small>
            </div>
            <div className="feature-metrics report-metrics">
              {[
                {
                  title: "Total collections",
                  value: money(totals.total_collections),
                  icon: IndianRupee,
                  hint: "Services + membership fees · incl. GST",
                },
                {
                  title: "Service collections",
                  value: money(totals.service_collections),
                  icon: ReceiptText,
                  hint: `${totals.bill_count} saved bills · after discounts`,
                },
                {
                  title: "Membership fees",
                  value: money(totals.membership_collections),
                  icon: Crown,
                  hint: `${totals.renewal_count} annual membership payments`,
                },
                {
                  title: "Average service bill",
                  value: money(totals.average_bill),
                  icon: TrendingUp,
                  hint: "Service collections ÷ bill count",
                },
              ].map(({ title, value, icon: Icon, hint }) => (
                <Card key={title}>
                  <span className="feature-metric-icon">
                    <Icon size={18} />
                  </span>
                  <div>
                    <span>{title}</span>
                    <strong>{value}</strong>
                  </div>
                  <small>{hint}</small>
                </Card>
              ))}
            </div>
            <div className="report-charts">
              <Card className="report-trend">
                <div className="feature-panel-heading">
                  <div>
                    <h2>Collections over time</h2>
                    <p>
                      {period === "daily"
                        ? "Hour by hour"
                        : period === "weekly"
                          ? "Monday to Sunday"
                          : period === "monthly"
                            ? "Day by day"
                            : "Month by month"}{" "}
                      · {range}
                    </p>
                  </div>
                  <div
                    className="report-chart-toggle"
                    role="group"
                    aria-label="Trend chart type"
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Graph view"
                      aria-pressed={chart === "graph"}
                      onClick={() => setChart("graph")}
                    >
                      <ChartNoAxesCombined size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Bar chart view"
                      aria-pressed={chart === "bar"}
                      onClick={() => setChart("bar")}
                    >
                      <ChartColumn size={16} />
                    </Button>
                  </div>
                </div>
                <div className="report-chart-legend">
                  <span>
                    <i style={{ background: "#be185d" }} />
                    Services
                  </span>
                  <span>
                    <i style={{ background: "#8c59b7" }} />
                    Memberships
                  </span>
                </div>
                <div
                  className="report-trend-chart"
                  role="region"
                  aria-label="Collections trend chart"
                >
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    {chart === "graph" ? (
                      <AreaChart
                        data={data.series}
                        margin={{ top: 15, right: 17, left: 0, bottom: 8 }}
                        accessibilityLayer
                      >
                        <defs>
                          <linearGradient
                            id="service-collection-fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#be185d"
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="100%"
                              stopColor="#be185d"
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                          <linearGradient
                            id="membership-collection-fill"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8c59b7"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="100%"
                              stopColor="#8c59b7"
                              stopOpacity={0.03}
                            />
                          </linearGradient>
                        </defs>
                        {chartAxes}
                        <Area
                          type="monotone"
                          dataKey="services"
                          name="Services"
                          stackId="collections"
                          stroke="#be185d"
                          fill="url(#service-collection-fill)"
                          strokeWidth={2.5}
                          isAnimationActive={false}
                        />
                        <Area
                          type="monotone"
                          dataKey="memberships"
                          name="Memberships"
                          stackId="collections"
                          stroke="#8c59b7"
                          fill="url(#membership-collection-fill)"
                          strokeWidth={2}
                          isAnimationActive={false}
                        />
                      </AreaChart>
                    ) : (
                      <BarChart
                        data={data.series}
                        margin={{ top: 15, right: 17, left: 0, bottom: 8 }}
                        accessibilityLayer
                      >
                        {chartAxes}
                        <Bar
                          dataKey="services"
                          name="Services"
                          fill="#be185d"
                          stackId="collections"
                          maxBarSize={28}
                          isAnimationActive={false}
                        />
                        <Bar
                          dataKey="memberships"
                          name="Memberships"
                          fill="#8c59b7"
                          stackId="collections"
                          maxBarSize={28}
                          radius={[4, 4, 0, 0]}
                          isAnimationActive={false}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
                {totals.total_collections === 0 && (
                  <div className="report-no-collections">
                    No collections in this period. Saved bills and membership
                    payments will appear here.
                  </div>
                )}
              </Card>
              <Card className="report-payments">
                <div className="feature-panel-heading">
                  <div>
                    <h2>How clients paid</h2>
                    <p>Share of total collections by payment method.</p>
                  </div>
                </div>
                <div
                  className="report-pie-chart"
                  role="region"
                  aria-label="Payment methods pie chart"
                >
                  {payments.length ? (
                    <>
                      <ResponsiveContainer
                        width="100%"
                        height="100%"
                        minWidth={0}
                      >
                        <PieChart accessibilityLayer>
                          <Pie
                            data={payments}
                            dataKey="amount"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="83%"
                            paddingAngle={payments.length > 1 ? 4 : 0}
                            stroke="none"
                            isAnimationActive={false}
                          >
                            {payments.map((payment) => (
                              <Cell key={payment.method} fill={payment.fill} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => money(value)}
                            contentStyle={{
                              border: "1px solid #e2ead9",
                              borderRadius: 10,
                              fontSize: 12,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="report-pie-center">
                        <span>COLLECTED</span>
                        <strong>{money(totals.total_collections)}</strong>
                        <small>
                          {totals.bill_count + totals.renewal_count}{" "}
                          transactions
                        </small>
                      </div>
                    </>
                  ) : (
                    <div className="report-empty-ring">
                      <span>
                        No payments
                        <br />
                        in this period
                      </span>
                    </div>
                  )}
                </div>
                <div className="report-payment-legend">
                  {data.payments.map((payment) => {
                    const Icon = paymentIcons[payment.method];
                    return (
                      <div key={payment.method}>
                        <span>
                          <i style={{ background: colours[payment.method] }} />
                          <Icon size={14} />
                          {methods[payment.method]}
                        </span>
                        <div>
                          <strong>{money(payment.amount)}</strong>
                          <small>
                            {totals.total_collections
                              ? (
                                  (payment.amount / totals.total_collections) *
                                  100
                                ).toFixed(1)
                              : "0.0"}
                            %
                          </small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
            <div className="report-financial-strip">
              <div>
                <span>Net service revenue</span>
                <strong>{money(totals.net_service_revenue)}</strong>
                <small>After discounts, excluding GST</small>
              </div>
              <div>
                <span>GST collected</span>
                <strong>{money(totals.gst_collected)}</strong>
                <small>Already included in service collections</small>
              </div>
              <div>
                <span>Discounts given</span>
                <strong>{money(totals.discounts)}</strong>
                <small>Already deducted from service bills</small>
              </div>
            </div>
            <div className="report-breakdown-grid">
              <Breakdown
                title="Most-loved services"
                subtitle="Recorded service units · value before discounts & GST"
                icon={Scissors}
                name="Service"
                rows={data.top_services}
                empty="No itemised services recorded in this period."
              />
              <Breakdown
                title="Your team's contribution"
                subtitle="Recorded assignments · value before discounts & GST"
                icon={Users}
                name="Staff member"
                rows={data.staff}
                empty="No staff assignments recorded in this period."
              />
            </div>
            {(data.coverage.unitemised_bills > 0 ||
              data.coverage.unassigned_services > 0) && (
              <div className="report-coverage">
                <ShieldCheck size={15} />
                <span>
                  {data.coverage.unitemised_bills} older bills without item
                  details are included in collections.{" "}
                  {data.coverage.unassigned_services} service units have no
                  recorded staff assignment. Breakdowns show available item
                  details.
                </span>
              </div>
            )}
          </>
        )
      )}
      <div className="workspace-bottom">
        <span>
          <ShieldCheck size={14} />
          Based on saved bills and recorded membership payments · IST.
        </span>
        <span>
          NEWBILLING <span className="bottom-dot">•</span> BUSINESS INSIGHTS
        </span>
      </div>
    </div>
  );
}
