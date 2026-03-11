"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Shield,
  Bell,
  Ban,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Webhook,
  Smartphone,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

const DEFAULTS = {
  fraudThreshold: 0.75,
  highRiskThreshold: 0.9,
  maxTransactionAmount: 50000,
  velocityLimit: 10,
  blockAutomatic: true,
  reviewQueue: true,
  emailAlerts: true,
  webhookAlerts: false,
  smsAlerts: false,
  alertOnBlock: true,
  alertOnHighRisk: true,
  alertOnModel: false,
  blockAction: "flag",
  retentionDays: 90,
};

function Toggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="p-1.5 rounded-md bg-white/5 mt-0.5">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-200">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
          checked ? "bg-blue-600" : "bg-gray-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function RangeInput({
  label,
  description,
  value,
  min,
  max,
  step = 0.01,
  format,
  onChange,
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <div>
          <p className="text-sm font-medium text-gray-200">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <span className="font-mono text-sm font-bold text-blue-400">
          {format ? format(value) : value}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-blue-500
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110"
          style={{
            background: `linear-gradient(to right, #3b82f6 ${pct}%, #1f2937 ${pct}%)`,
          }}
        />
      </div>
    </div>
  );
}

export default function PolicySettingsPage() {
  const [settings, setSettings] = useState({ ...DEFAULTS });
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    fetch("/api/policy")
      .then((r) => r.json())
      .then((data) => {
        if (data && Object.keys(data).length > 0) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch(() => {
        // Fall back to defaults silently
      })
      .finally(() => setIsLoading(false));
  }, []);

  const update = (key, val) => {
    setSettings((s) => ({ ...s, [key]: val }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      setDirty(false);
      toast.success("Policy settings saved successfully.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({ ...DEFAULTS });
    setDirty(true);
    setSaved(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-title tracking-tight">
            Policy Settings
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Configure fraud detection thresholds, alert policies, and automated
            actions.
          </p>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty || isSaving}
            className={`flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-semibold transition-all ${
              saved
                ? "bg-green-600/20 text-green-400 border border-green-500/30"
                : dirty
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-gray-800 text-gray-600 cursor-not-allowed"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> Saved
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {dirty && !isSaving && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          You have unsaved changes. Click &quot;Save Changes&quot; to apply.
        </div>
      )}

      {/* Detection Thresholds */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm">Detection Thresholds</CardTitle>
          </div>
          <CardDescription>
            Adjust the ML model confidence thresholds for fraud classification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RangeInput
            label="Fraud Confidence Threshold"
            description="Transactions above this score are flagged as fraudulent"
            value={settings.fraudThreshold}
            min={0.5}
            max={0.99}
            step={0.01}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={(v) => update("fraudThreshold", v)}
          />
          <RangeInput
            label="High-Risk Threshold"
            description="Transactions above this score are immediately blocked"
            value={settings.highRiskThreshold}
            min={settings.fraudThreshold + 0.01}
            max={0.99}
            step={0.01}
            format={(v) => `${(v * 100).toFixed(0)}%`}
            onChange={(v) => update("highRiskThreshold", v)}
          />
          <RangeInput
            label="Max Transaction Amount"
            description="Flag transactions exceeding this amount for review"
            value={settings.maxTransactionAmount}
            min={1000}
            max={500000}
            step={1000}
            format={(v) => `$${v.toLocaleString()}`}
            onChange={(v) => update("maxTransactionAmount", v)}
          />
          <RangeInput
            label="Velocity Limit"
            description="Max transactions per user per hour before triggering alert"
            value={settings.velocityLimit}
            min={1}
            max={100}
            step={1}
            format={(v) => `${v} tx/hr`}
            onChange={(v) => update("velocityLimit", v)}
          />
        </CardContent>
      </Card>

      {/* Automated Actions */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm">Automated Actions</CardTitle>
          </div>
          <CardDescription>
            Define what happens when a fraudulent transaction is detected.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y divide-gray-800/60">
          <Toggle
            checked={settings.blockAutomatic}
            onChange={(v) => update("blockAutomatic", v)}
            label="Auto-Block High-Risk Transactions"
            description="Automatically block transactions above the high-risk threshold"
            icon={Ban}
          />
          <Toggle
            checked={settings.reviewQueue}
            onChange={(v) => update("reviewQueue", v)}
            label="Add Flagged to Review Queue"
            description="Transactions between thresholds go to manual review queue"
            icon={Sliders}
          />

          {/* Block Action Select */}
          <div className="py-3">
            <p className="text-sm font-medium text-gray-200 mb-2">
              Default Block Action
            </p>
            <div className="flex gap-2 flex-wrap">
              {[
                { val: "flag", label: "Flag Only" },
                { val: "hold", label: "Hold & Review" },
                { val: "decline", label: "Decline" },
                { val: "challenge", label: "2FA Challenge" },
              ].map((opt) => (
                <button
                  key={opt.val}
                  onClick={() => update("blockAction", opt.val)}
                  className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${
                    settings.blockAction === opt.val
                      ? "bg-blue-600/20 border-blue-500/40 text-blue-400"
                      : "border-gray-700 text-gray-500 hover:text-gray-300 hover:border-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert Notifications */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm">Alert Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure how and when you receive fraud alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 divide-y divide-gray-800/60">
          <Toggle
            checked={settings.emailAlerts}
            onChange={(v) => update("emailAlerts", v)}
            label="Email Alerts"
            description="Receive fraud alerts via email"
            icon={Mail}
          />
          <Toggle
            checked={settings.webhookAlerts}
            onChange={(v) => update("webhookAlerts", v)}
            label="Webhook Notifications"
            description="POST alert payload to your webhook URL"
            icon={Webhook}
          />
          <Toggle
            checked={settings.smsAlerts}
            onChange={(v) => update("smsAlerts", v)}
            label="SMS Alerts"
            description="Receive critical alerts via SMS (Pro plan required)"
            icon={Smartphone}
          />
          <Toggle
            checked={settings.alertOnBlock}
            onChange={(v) => update("alertOnBlock", v)}
            label="Alert on Every Block"
            description="Send notification every time a transaction is blocked"
            icon={Bell}
          />
          <Toggle
            checked={settings.alertOnHighRisk}
            onChange={(v) => update("alertOnHighRisk", v)}
            label="Alert on High-Risk Detection"
            description="Notify when high-risk score threshold is exceeded"
            icon={Shield}
          />
          <Toggle
            checked={settings.alertOnModel}
            onChange={(v) => update("alertOnModel", v)}
            label="Model Drift Alerts"
            description="Notify when model performance degrades below baseline"
            icon={AlertTriangle}
          />
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <CardTitle className="text-sm">Data & Retention</CardTitle>
          </div>
          <CardDescription>
            Control how long transaction data is retained.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RangeInput
            label="Data Retention Period"
            description="Transaction records are purged after this number of days"
            value={settings.retentionDays}
            min={7}
            max={365}
            step={1}
            format={(v) => `${v} days`}
            onChange={(v) => update("retentionDays", v)}
          />
          <p className="mt-4 text-xs text-gray-600 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            All data is encrypted at rest. Purged data cannot be recovered.
          </p>
        </CardContent>
      </Card>

      {/* Save Footer */}
      <div className="flex items-center justify-end gap-3 pb-4">
        <button
          onClick={handleReset}
          className="text-xs px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition-all"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          disabled={!dirty || isSaving}
          className={`flex items-center gap-1.5 text-xs px-5 py-2 rounded-lg font-semibold transition-all ${
            saved
              ? "bg-green-600/20 text-green-400 border border-green-500/30"
              : dirty
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-gray-800 text-gray-600 cursor-not-allowed"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved Successfully
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
