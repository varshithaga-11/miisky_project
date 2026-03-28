import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Label from "../../../components/form/Label";
import { toast } from "react-toastify";
import {
  fetchPlatformPaymentSettings,
  patchPlatformPaymentSettings,
  PlatformPaymentSettings,
} from "./api";

export default function PaymentSplitSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    default_platform_fee_percent: "",
    default_nutritionist_share_percent: "",
    default_kitchen_share_percent: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const s: PlatformPaymentSettings = await fetchPlatformPaymentSettings();
        setForm({
          default_platform_fee_percent: String(s.default_platform_fee_percent ?? ""),
          default_nutritionist_share_percent: String(s.default_nutritionist_share_percent ?? ""),
          default_kitchen_share_percent: String(s.default_kitchen_share_percent ?? ""),
        });
      } catch {
        toast.error("Failed to load payment split settings");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(form.default_platform_fee_percent);
    const n = parseFloat(form.default_nutritionist_share_percent);
    const k = parseFloat(form.default_kitchen_share_percent);
    if ([p, n, k].some((x) => Number.isNaN(x))) {
      toast.warning("Enter valid numbers for all three percentages");
      return;
    }
    if (Math.abs(p + n + k - 100) > 0.001) {
      toast.warning("Percentages must sum to 100");
      return;
    }
    setSaving(true);
    try {
      await patchPlatformPaymentSettings({
        default_platform_fee_percent: p,
        default_nutritionist_share_percent: n,
        default_kitchen_share_percent: k,
      });
      toast.success("Default split saved. New diet plan payments use these unless a plan overrides them.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Could not save settings";
      toast.error(typeof msg === "string" ? msg : "Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Payment split defaults"
        description="Platform-wide default percentages for patient diet plan payments"
      />
      <PageBreadcrumb pageTitle="Payment split defaults" />

      <div className="max-w-xl mx-auto rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:p-8 shadow-sm">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          When admin verifies a patient payment, the gross amount is split into platform fee, nutritionist pool,
          and kitchen pool. These defaults apply when a diet plan does not define its own three percentages.
          Per-plan overrides are configured under{" "}
          <span className="font-medium text-gray-800 dark:text-gray-200">Health Monitoring → Diet Plans</span>.
        </p>

        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <form onSubmit={onSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="default_platform_fee_percent">Platform %</Label>
                <Input
                  id="default_platform_fee_percent"
                  type="number"
                  step="0.01"
                  value={form.default_platform_fee_percent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, default_platform_fee_percent: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="default_nutritionist_share_percent">Nutritionist %</Label>
                <Input
                  id="default_nutritionist_share_percent"
                  type="number"
                  step="0.01"
                  value={form.default_nutritionist_share_percent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, default_nutritionist_share_percent: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="default_kitchen_share_percent">Kitchen %</Label>
                <Input
                  id="default_kitchen_share_percent"
                  type="number"
                  step="0.01"
                  value={form.default_kitchen_share_percent}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, default_kitchen_share_percent: e.target.value }))
                  }
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save defaults"}
            </Button>
          </form>
        )}
      </div>
    </>
  );
}
