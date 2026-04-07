import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createMicroKitchenDeliveryTeamMember,
  deleteMicroKitchenDeliveryTeamMember,
  fetchMicroKitchenDeliveryTeam,
  fetchSupplyChainUsers,
  MicroKitchenTeamMember,
  patchMicroKitchenDeliveryTeamMember,
  SupplyChainUser,
} from "../DeliveryManagement/api";

const ROLE_OPTIONS: Array<{ value: "primary" | "backup" | "temporary"; label: string }> = [
  { value: "primary", label: "Primary" },
  { value: "backup", label: "Backup" },
  { value: "temporary", label: "Temporary" },
];

export default function SupplyChainTeamMemberForMKPage() {
  const [users, setUsers] = useState<SupplyChainUser[]>([]);
  const [rows, setRows] = useState<MicroKitchenTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newPerson, setNewPerson] = useState("");
  const [newRole, setNewRole] = useState<"primary" | "backup" | "temporary">("primary");
  const [newZone, setNewZone] = useState("");
  const [newPincode, setNewPincode] = useState("");

  const teamPersonIds = useMemo(() => new Set(rows.map((r) => r.delivery_person)), [rows]);
  const selectableUsers = useMemo(
    () => users.filter((u) => !teamPersonIds.has(u.id)),
    [users, teamPersonIds]
  );

  const load = async () => {
    try {
      setLoading(true);
      const [team, supply] = await Promise.all([fetchMicroKitchenDeliveryTeam(), fetchSupplyChainUsers()]);
      setRows(team);
      setUsers(supply);
    } catch (e) {
      console.error(e);
      toast.error("Could not load team members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMember = async () => {
    const personId = parseInt(newPerson, 10);
    if (!Number.isFinite(personId)) {
      toast.error("Select a delivery person.");
      return;
    }
    try {
      setSaving(true);
      await createMicroKitchenDeliveryTeamMember({
        delivery_person: personId,
        role: newRole,
        is_active: true,
        zone_name: newZone.trim() || null,
        pincode: newPincode.trim() || null,
      });
      toast.success("Team member added.");
      setNewPerson("");
      setNewRole("primary");
      setNewZone("");
      setNewPincode("");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Could not add team member.");
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (id: number, payload: Parameters<typeof patchMicroKitchenDeliveryTeamMember>[1]) => {
    try {
      await patchMicroKitchenDeliveryTeamMember(id, payload);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...payload } as MicroKitchenTeamMember : r)));
      toast.success("Updated.");
    } catch (e) {
      console.error(e);
      toast.error("Update failed.");
    }
  };

  const removeMember = async (id: number) => {
    try {
      await deleteMicroKitchenDeliveryTeamMember(id);
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("Removed.");
    } catch (e) {
      console.error(e);
      toast.error("Could not remove member.");
    }
  };

  return (
    <div>
      <PageMeta
        title="Delivery Team Members"
        description="Each micro kitchen has its own pool/team of delivery persons."
      />
      <PageBreadcrumb pageTitle="Delivery Team Members" />
      <ToastContainer position="bottom-right" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-gray-900">
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
            Each micro kitchen has its own pool/team of delivery persons.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <select
              value={newPerson}
              onChange={(e) => setNewPerson(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="">Select delivery person</option>
              {selectableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {`${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || `#${u.id}`}
                </option>
              ))}
            </select>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as "primary" | "backup" | "temporary")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <input
              value={newZone}
              onChange={(e) => setNewZone(e.target.value)}
              placeholder="Zone (optional)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <input
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              placeholder="Pincode (optional)"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
            <button
              type="button"
              onClick={addMember}
              disabled={saving}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Adding..." : "Add member"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left dark:border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Pincode</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No team members added yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="px-4 py-3">
                      {`${r.delivery_person_details?.first_name || ""} ${r.delivery_person_details?.last_name || ""}`.trim() ||
                        `#${r.delivery_person}`}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={r.role}
                        onChange={(e) =>
                          updateMember(r.id, { role: e.target.value as "primary" | "backup" | "temporary" })
                        }
                        className="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                      >
                        {ROLE_OPTIONS.map((ro) => (
                          <option key={ro.value} value={ro.value}>
                            {ro.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        defaultValue={r.zone_name || ""}
                        onBlur={(e) => updateMember(r.id, { zone_name: e.target.value.trim() || null })}
                        className="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        defaultValue={r.pincode || ""}
                        onBlur={(e) => updateMember(r.id, { pincode: e.target.value.trim() || null })}
                        className="rounded-md border border-gray-300 px-2 py-1 dark:border-gray-700 dark:bg-gray-800"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={r.is_active}
                          onChange={(e) => updateMember(r.id, { is_active: e.target.checked })}
                        />
                        <span>{r.is_active ? "Active" : "Inactive"}</span>
                      </label>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeMember(r.id)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
