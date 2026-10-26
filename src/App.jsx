import { useMemo, useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

const navItems = [
  { id: "overview", label: "Overview", icon: "◌" },
  { id: "customers", label: "Customers", icon: "◉" },
  { id: "predictions", label: "Predictions", icon: "✦" },
  { id: "insights", label: "Insights", icon: "◒" },
  { id: "model", label: "Model", icon: "◇" },
];

const sampleCustomers = [
  { id: "CX-0001", tenure: 2, contract: "Month-to-month", monthlyCharges: 70.7, totalCharges: 151.65, internetService: "DSL", techSupport: "No", paymentMethod: "Electronic check", churnProbability: 84, risk: "High" },
  { id: "CX-0027", tenure: 8, contract: "Month-to-month", monthlyCharges: 99.65, totalCharges: 820.5, internetService: "Fiber optic", techSupport: "No", paymentMethod: "Electronic check", churnProbability: 81, risk: "High" },
  { id: "CX-0142", tenure: 24, contract: "One year", monthlyCharges: 64.8, totalCharges: 1549.4, internetService: "DSL", techSupport: "Yes", paymentMethod: "Bank transfer (automatic)", churnProbability: 43, risk: "Medium" },
  { id: "CX-0218", tenure: 62, contract: "Two year", monthlyCharges: 20.2, totalCharges: 1238.45, internetService: "No", techSupport: "No internet service", paymentMethod: "Mailed check", churnProbability: 12, risk: "Low" },
  { id: "CX-0334", tenure: 11, contract: "Month-to-month", monthlyCharges: 89.1, totalCharges: 1018.7, internetService: "Fiber optic", techSupport: "No", paymentMethod: "Credit card (automatic)", churnProbability: 72, risk: "High" },
  { id: "CX-0460", tenure: 35, contract: "One year", monthlyCharges: 75.3, totalCharges: 2634.2, internetService: "Fiber optic", techSupport: "Yes", paymentMethod: "Credit card (automatic)", churnProbability: 38, risk: "Medium" },
  { id: "CX-0521", tenure: 48, contract: "Two year", monthlyCharges: 55.7, totalCharges: 2678.4, internetService: "DSL", techSupport: "Yes", paymentMethod: "Bank transfer (automatic)", churnProbability: 18, risk: "Low" },
  { id: "CX-0619", tenure: 15, contract: "Month-to-month", monthlyCharges: 94.2, totalCharges: 1455.1, internetService: "Fiber optic", techSupport: "No", paymentMethod: "Electronic check", churnProbability: 77, risk: "High" },
];

const initialForm = {
  gender: "Female", seniorCitizen: "No", partner: "Yes", dependents: "No", tenure: "", contract: "Month-to-month", phoneService: "Yes", multipleLines: "No", internetService: "Fiber optic", onlineSecurity: "No", onlineBackup: "No", deviceProtection: "No", techSupport: "No", streamingTV: "No", streamingMovies: "No", monthlyCharges: "", totalCharges: "", paymentMethod: "Electronic check", paperlessBilling: "Yes",
};

const fieldGroups = [
  { title: "Customer", description: "Basic profile attributes from the customer snapshot.", fields: [["gender", "Gender", "select", ["Female", "Male"]], ["seniorCitizen", "Senior citizen", "select", ["No", "Yes"]], ["partner", "Partner", "select", ["Yes", "No"]], ["dependents", "Dependents", "select", ["No", "Yes"]]] },
  { title: "Account", description: "Tenure and contract commitment are strong churn signals.", fields: [["tenure", "Tenure", "number", "Months"], ["contract", "Contract", "select", ["Month-to-month", "One year", "Two year"]]] },
  { title: "Services", description: "The services currently attached to the account.", fields: [["phoneService", "Phone service", "select", ["Yes", "No"]], ["multipleLines", "Multiple lines", "select", ["No", "Yes", "No phone service"]], ["internetService", "Internet service", "select", ["DSL", "Fiber optic", "No"]], ["onlineSecurity", "Online security", "select", ["No", "Yes", "No internet service"]], ["onlineBackup", "Online backup", "select", ["No", "Yes", "No internet service"]], ["deviceProtection", "Device protection", "select", ["No", "Yes", "No internet service"]], ["techSupport", "Tech support", "select", ["No", "Yes", "No internet service"]], ["streamingTV", "Streaming TV", "select", ["No", "Yes", "No internet service"]], ["streamingMovies", "Streaming movies", "select", ["No", "Yes", "No internet service"]] ] },
  { title: "Billing", description: "Charges and payment setup from the IBM Telco schema.", fields: [["monthlyCharges", "Monthly charges", "number", "e.g. 79.90"], ["totalCharges", "Total charges", "number", "e.g. 1284.30"], ["paymentMethod", "Payment method", "select", ["Electronic check", "Mailed check", "Bank transfer (automatic)", "Credit card (automatic)"]], ["paperlessBilling", "Paperless billing", "select", ["Yes", "No"]]] },
];

function riskForProbability(probability) {
  if (probability >= 70) return "High";
  if (probability >= 40) return "Medium";
  return "Low";
}

function normalizeRisk(value, probability) {
  if (!value) return riskForProbability(probability);
  const normalized = String(value).toLowerCase();
  if (normalized.includes("high")) return "High";
  if (normalized.includes("medium") || normalized.includes("moderate")) return "Medium";
  return "Low";
}

function getReasons(data) {
  const reasons = [];
  if (data.contract === "Month-to-month") reasons.push("Month-to-month contract");
  if (Number(data.tenure) < 12) reasons.push("Short customer tenure");
  if (data.techSupport === "No") reasons.push("No technical support");
  if (data.internetService === "Fiber optic") reasons.push("Fiber optic service profile");
  if (Number(data.monthlyCharges) >= 80) reasons.push("High monthly charges");
  if (data.paymentMethod === "Electronic check") reasons.push("Electronic check payment method");
  return reasons.slice(0, 4);
}

function demoPrediction(data) {
  let probability = 0.16;
  if (data.contract === "Month-to-month") probability += 0.22;
  if (Number(data.tenure) < 12) probability += 0.18;
  else if (Number(data.tenure) < 24) probability += 0.07;
  if (data.internetService === "Fiber optic") probability += 0.1;
  if (data.techSupport === "No") probability += 0.08;
  if (data.onlineSecurity === "No") probability += 0.06;
  if (data.paymentMethod === "Electronic check") probability += 0.08;
  if (Number(data.monthlyCharges) >= 80) probability += 0.05;
  if (data.paperlessBilling === "Yes") probability += 0.02;
  if (data.seniorCitizen === "Yes") probability += 0.02;
  const percentage = Math.round(Math.min(0.96, Math.max(0.08, probability)) * 100);
  return { probability: percentage, risk: riskForProbability(percentage), classification: percentage >= 50 ? "Likely to churn" : "Likely to stay", reasons: getReasons(data), source: "demo" };
}

async function requestPrediction(data) {
  if (!API_URL) return demoPrediction(data);
  const response = await fetch(`${API_URL.replace(/\/$/, "")}/predict`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, tenure: Number(data.tenure), monthlyCharges: Number(data.monthlyCharges), totalCharges: Number(data.totalCharges) }) });
  if (!response.ok) throw new Error("Prediction service unavailable");
  const payload = await response.json();
  const rawProbability = payload.churn_probability ?? payload.probability ?? 0;
  const probability = Math.round(rawProbability <= 1 ? rawProbability * 100 : rawProbability);
  return { probability, risk: normalizeRisk(payload.risk_level ?? payload.risk, probability), classification: payload.prediction === 1 || probability >= 50 ? "Likely to churn" : "Likely to stay", reasons: payload.explanations ?? payload.reasons ?? getReasons(data), source: "api", modelVersion: payload.model_version };
}

function App() {
  const [activePage, setActivePage] = useState("overview");
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState(sampleCustomers);
  const averageRisk = Math.round(customers.reduce((sum, customer) => sum + customer.churnProbability, 0) / customers.length);
  const highRiskCount = customers.filter((customer) => customer.risk === "High").length;

  const handleChange = (event) => { setFormData((current) => ({ ...current, [event.target.name]: event.target.value })); if (error) setError(""); };
  const handlePredict = async (event) => {
    event.preventDefault(); setIsLoading(true); setError("");
    try {
      const prediction = await requestPrediction(formData); setResult(prediction);
      setCustomers((current) => [{ id: `CX-${String(current.length + 700).padStart(4, "0")}`, tenure: Number(formData.tenure), contract: formData.contract, monthlyCharges: Number(formData.monthlyCharges), totalCharges: Number(formData.totalCharges), internetService: formData.internetService, techSupport: formData.techSupport, paymentMethod: formData.paymentMethod, churnProbability: prediction.probability, risk: prediction.risk }, ...current]);
    } catch { setError("Unable to analyze this customer. Please verify the service connection and try again."); } finally { setIsLoading(false); }
  };

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand-block"><div className="brand-mark">C</div><div><strong>ChurnX</strong><span>Customer intelligence</span></div></div><div className="sidebar-label">WORKSPACE</div><nav aria-label="Main navigation">{navItems.map((item) => <button key={item.id} className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setActivePage(item.id)}><span className="nav-icon">{item.icon}</span><span>{item.label}</span></button>)}</nav><div className="sidebar-footer"><div className="model-status"><span className="status-dot" /><div><strong>{API_URL ? "API connected" : "Demo mode"}</strong><span>{API_URL ? "FastAPI inference" : "Local preview model"}</span></div></div><span className="sidebar-version">ChurnX v1.0 · IBM Telco schema</span></div></aside>
    <main className="main-content"><header className="topbar"><div><span className="breadcrumb">Workspace / {navItems.find((item) => item.id === activePage)?.label}</span><h1>{navItems.find((item) => item.id === activePage)?.label}</h1></div><div className="topbar-actions"><span className={`mode-pill ${API_URL ? "connected" : ""}`}><span />{API_URL ? "Live API" : "Demo workspace"}</span><span className="date-label">26 OCT 2026</span><div className="avatar">AS</div></div></header>
      {activePage === "overview" && <Overview averageRisk={averageRisk} highRiskCount={highRiskCount} customers={customers} openPrediction={() => setActivePage("predictions")} setActivePage={setActivePage} />}
      {activePage === "customers" && <CustomersPage customers={customers} />}
      {activePage === "predictions" && <PredictionsPage formData={formData} handleChange={handleChange} handlePredict={handlePredict} result={result} isLoading={isLoading} error={error} />}
      {activePage === "insights" && <InsightsPage customers={customers} />}
      {activePage === "model" && <ModelPage />}
      <footer><span>ChurnX Intelligence Platform</span><span>Snapshot risk scoring · {API_URL ? "FastAPI" : "local demo"}</span></footer>
    </main>
  </div>;
}

function Overview({ averageRisk, highRiskCount, customers, openPrediction, setActivePage }) {
  return <><section className="hero-section"><div><span className="eyebrow">CUSTOMER RETENTION INTELLIGENCE</span><h2>Know who is leaving<br /><em>before they do.</em></h2><p>ChurnX estimates customer churn probability, explains the signals behind each score, and helps retention teams prioritize their next conversation.</p><button className="primary-button hero-button" onClick={openPrediction}>Analyze a customer <span>→</span></button></div><div className="hero-aside"><span className="eyebrow">MODEL STATUS</span><strong>Ready to score</strong><p>IBM Telco Customer Churn<br />snapshot schema</p><span className="aside-link" onClick={() => setActivePage("model")}>View model details →</span></div></section>
    <section className="metric-grid"><Metric label="Dataset records" value="7,043" note="IBM Telco sample" accent="lime" /><Metric label="High-risk workspace" value={highRiskCount} note={`of ${customers.length} scored records`} accent="rose" /><Metric label="Average demo risk" value={`${averageRisk}%`} note="across scored records" accent="amber" /><Metric label="Dataset churn rate" value="26.5%" note="historical target rate" accent="blue" /></section>
    <section className="overview-grid"><div className="panel overview-card"><div className="section-heading"><div><span className="panel-kicker">NEXT BEST ACTION</span><h3>Turn a risk score into a retention decision.</h3></div><span className="spark-icon">✦</span></div><div className="workflow"><WorkflowStep number="01" title="Score" text="Estimate probability from account and service data." /><WorkflowStep number="02" title="Explain" text="Surface the most relevant risk signals." /><WorkflowStep number="03" title="Prioritize" text="Focus attention where intervention matters." /></div></div><div className="panel quick-card"><span className="panel-kicker">QUICK START</span><h3>Start with a customer profile</h3><p>Use the canonical IBM schema so the form and the model stay aligned from training to inference.</p><button className="secondary-button" onClick={openPrediction}>Open prediction form <span>↗</span></button><div className="schema-note"><span className="status-dot" /> 19 model fields · validated inputs</div></div></section>
    <RecentCustomers customers={customers.slice(0, 4)} setActivePage={setActivePage} /></>;
}

function PredictionsPage({ formData, handleChange, handlePredict, result, isLoading, error }) {
  return <section className="prediction-layout"><div className="page-intro"><span className="eyebrow">INDIVIDUAL SCORING</span><h2>Analyze a customer</h2><p>Enter the same account, service, and billing fields used by the IBM Telco churn model.</p></div><div className="prediction-columns"><form className="panel prediction-form" onSubmit={handlePredict}><div className="form-header"><div><span className="panel-kicker">CUSTOMER PROFILE</span><h3>Model inputs</h3></div><span className="required-note">All fields required</span></div>{fieldGroups.map((group) => <FormGroup key={group.title} group={group} formData={formData} handleChange={handleChange} />)}{error && <div className="error-message" role="alert">{error}</div>}<button className="primary-button full-button" type="submit" disabled={isLoading}>{isLoading ? "Analyzing customer…" : "Analyze churn risk"}<span>{isLoading ? "·" : "→"}</span></button><p className="form-footnote">{API_URL ? "Requests are sent to the configured FastAPI service." : "Demo fallback is active. Add VITE_API_URL to use live inference."}</p></form><PredictionResult result={result} /></div></section>;
}

function FormGroup({ group, formData, handleChange }) { return <div className="form-group"><div className="group-heading"><h4>{group.title}</h4><p>{group.description}</p></div><div className="fields-grid">{group.fields.map(([name, label, type, options]) => <label className="field" key={name}><span>{label}</span>{type === "select" ? <select name={name} value={formData[name]} onChange={handleChange} required>{options.map((option) => <option key={option}>{option}</option>)}</select> : <input type="number" min="0" step={name === "monthlyCharges" || name === "totalCharges" ? "0.01" : "1"} name={name} value={formData[name]} onChange={handleChange} placeholder={options} required />}</label>)}</div></div>; }

function PredictionResult({ result }) {
  if (!result) return <div className="panel result-card empty-state"><div className="empty-mark">✦</div><span className="panel-kicker">LATEST ASSESSMENT</span><h3>No prediction yet</h3><p>Complete the profile to generate a probability, risk level, and explanation for this customer.</p><div className="result-flow"><span>Profile</span><b>→</b><span>Model</span><b>→</b><span>Risk</span></div></div>;
  return <div className="panel result-card"><div className="result-top"><span className="panel-kicker">LATEST ASSESSMENT</span><span className="result-source">{result.source === "api" ? "LIVE MODEL" : "DEMO MODEL"}</span></div><div className={`score-ring ${result.risk.toLowerCase()}`} style={{ "--score": `${result.probability * 3.6}deg` }}><div><strong>{result.probability}%</strong><span>churn probability</span></div></div><span className={`risk-badge ${result.risk.toLowerCase()}`}>{result.risk} risk</span><h3>{result.classification}</h3><p className="result-summary">This score is a likelihood estimate from the customer snapshot. It is not a guarantee of future behavior.</p><div className="reasons"><span className="panel-kicker">WHY THIS CUSTOMER IS AT RISK</span>{result.reasons.length ? result.reasons.map((reason, index) => <div key={reason}><b>{String(index + 1).padStart(2, "0")}</b><span>{reason}</span></div>) : <p>No major risk signal detected.</p>}</div></div>;
}

function CustomersPage({ customers }) {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState("All"); const [sort, setSort] = useState("risk");
  const visibleCustomers = useMemo(() => [...customers].filter((customer) => `${customer.id} ${customer.contract} ${customer.internetService}`.toLowerCase().includes(query.toLowerCase())).filter((customer) => filter === "All" || customer.risk === filter).sort((a, b) => sort === "risk" ? b.churnProbability - a.churnProbability : b.tenure - a.tenure), [customers, filter, query, sort]);
  return <section className="page-section"><div className="page-intro compact"><span className="eyebrow">SCORED CUSTOMER DATASET</span><h2>Customers</h2><p>Review scored records and prioritize the accounts that need attention first.</p></div><div className="panel table-card"><div className="table-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customer ID, contract…" aria-label="Search customers" /></label><div className="toolbar-controls"><div className="filter-tabs">{["All", "High", "Medium", "Low"].map((item) => <button className={filter === item ? "selected" : ""} key={item} onClick={() => setFilter(item)}>{item}</button>)}</div><select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort customers"><option value="risk">Sort: highest risk</option><option value="tenure">Sort: longest tenure</option></select></div></div><CustomerTable customers={visibleCustomers} /></div></section>;
}

function RecentCustomers({ customers, setActivePage }) { return <section className="panel recent-card"><div className="section-heading"><div><span className="panel-kicker">CUSTOMER MONITORING</span><h3>Recent assessments</h3></div><button className="text-button" onClick={() => setActivePage("customers")}>View all →</button></div><CustomerTable customers={customers} /></section>; }

function CustomerTable({ customers }) { return <div className="table-wrap"><table><thead><tr><th>Customer</th><th>Tenure</th><th>Contract</th><th>Monthly charges</th><th>Churn probability</th><th>Risk</th></tr></thead><tbody>{customers.map((customer) => <tr key={`${customer.id}-${customer.churnProbability}`}><td><div className="customer-cell"><span className="customer-avatar">{customer.id.slice(-2)}</span><div><strong>{customer.id}</strong><span>{customer.internetService} · {customer.techSupport === "Yes" ? "Support" : "No support"}</span></div></div></td><td>{customer.tenure} mo</td><td>{customer.contract}</td><td>₹{customer.monthlyCharges.toFixed(2)}</td><td><div className="probability-cell"><span className="mini-bar"><i className={`fill ${customer.risk.toLowerCase()}`} style={{ width: `${customer.churnProbability}%` }} /></span><b>{customer.churnProbability}%</b></div></td><td><span className={`risk-badge ${customer.risk.toLowerCase()}`}>{customer.risk}</span></td></tr>)}</tbody></table>{!customers.length && <div className="no-results">No customers match this view.</div>}</div>; }

function InsightsPage({ customers }) {
  const contractData = [{ label: "Month-to-month", value: 42 }, { label: "One year", value: 18 }, { label: "Two year", value: 8 }]; const serviceData = [{ label: "Fiber optic", value: 41 }, { label: "DSL", value: 19 }, { label: "No internet", value: 7 }]; const featureData = [{ label: "Contract type", value: 88 }, { label: "Tenure", value: 76 }, { label: "Monthly charges", value: 64 }, { label: "Tech support", value: 51 }, { label: "Payment method", value: 44 }];
  return <section className="page-section"><div className="page-intro compact"><span className="eyebrow">PATTERN EXPLORATION</span><h2>Insights</h2><p>Understand where churn concentrates and which features carry the most signal in the current model.</p></div><div className="insight-grid"><ChartCard title="Churn rate by contract" subtitle="Historical dataset pattern" data={contractData} /><ChartCard title="Churn rate by internet service" subtitle="Historical dataset pattern" data={serviceData} /></div><div className="panel feature-card"><div className="section-heading"><div><span className="panel-kicker">GLOBAL EXPLAINABILITY</span><h3>What drives churn risk?</h3></div><span className="small-tag">Feature importance</span></div><div className="feature-list">{featureData.map((item, index) => <div className="feature-row" key={item.label}><span className="feature-rank">0{index + 1}</span><span className="feature-label">{item.label}</span><span className="feature-track"><i style={{ width: `${item.value}%` }} /></span><b>{item.value}%</b></div>)}</div></div><div className="insight-note"><span className="status-dot" /><div><strong>Read this as association, not causation.</strong><p>These patterns help prioritize conversations; they do not prove that a feature causes churn.</p></div><span className="note-count">{customers.length} records in workspace</span></div></section>;
}

function ChartCard({ title, subtitle, data }) { return <div className="panel chart-card"><span className="panel-kicker">CHURN RATE</span><h3>{title}</h3><p>{subtitle}</p><div className="bar-chart">{data.map((item) => <div className="bar-row" key={item.label}><div className="bar-label"><span>{item.label}</span><b>{item.value}%</b></div><div className="bar-track"><i style={{ width: `${item.value * 2}%` }} /></div></div>)}</div></div>; }

function ModelPage() { const details = [["Model", "Random Forest classifier"], ["Version", "churnx-v1.0.0"], ["Dataset", "IBM Telco Customer Churn"], ["Training", "Snapshot metadata pending API"]]; const metrics = [["ROC-AUC", "0.84"], ["Recall", "0.78"], ["Precision", "0.69"], ["F1 score", "0.73"]]; return <section className="page-section"><div className="page-intro compact"><span className="eyebrow">MODEL OPERATIONS</span><h2>Model</h2><p>Keep the product transparent about the model, its version, and the evaluation context behind each prediction.</p></div><div className="model-grid"><div className="panel model-summary"><div className="model-orb">RF</div><span className="panel-kicker">PRODUCTION CANDIDATE</span><h3>Random Forest classifier</h3><p>A strong tabular baseline for mixed account, service, and billing features. The preprocessing pipeline should travel with the serialized artifact.</p><div className="model-details">{details.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div></div><div className="panel metrics-card"><span className="panel-kicker">EVALUATION SNAPSHOT</span><h3>Performance overview</h3><div className="model-metrics">{metrics.map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="metric-disclaimer"><span>i</span> Metrics are illustrative until the trained artifact is connected through the API.</div></div></div><div className="panel model-contract"><div><span className="panel-kicker">INFERENCE CONTRACT</span><h3>One schema from training to UI</h3></div><div className="contract-points"><span>Validated inputs</span><b>→</b><span>Column transformer</span><b>→</b><span>predict_proba()</span><b>→</b><span>Risk engine</span></div></div></section>; }

function Metric({ label, value, note, accent }) { return <div className="metric-card"><div className="metric-label"><span>{label}</span><i className={accent} /></div><strong>{value}</strong><p>{note}</p></div>; }
function WorkflowStep({ number, title, text }) { return <div className="workflow-step"><span>{number}</span><div><h4>{title}</h4><p>{text}</p></div></div>; }

export default App;
