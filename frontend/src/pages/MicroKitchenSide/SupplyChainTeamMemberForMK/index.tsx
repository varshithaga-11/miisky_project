import { useEffect, useMemo, useState } from "react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import "react-toastify/dist/ReactToastify.css";
import SearchableSelect, { Option } from "../../../components/form/SearchableSelect";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import {
  createMicroKitchenDeliveryTeamMember,
  deleteMicroKitchenDeliveryTeamMember,
  fetchMicroKitchenDeliveryTeam,
  fetchSupplyChainUsers,
  fetchPlanDeliveryAssignments,
  MicroKitchenTeamMember,
  patchMicroKitchenDeliveryTeamMember,
  SupplyChainUser,
} from "../DeliveryManagement/api";

const ROLE_OPTIONS: Array<{ value: "primary" | "backup" | "temporary"; label: string }> = [
  { value: "primary", label: "Primary" },
  { value: "backup", label: "Backup" },
  { value: "temporary", label: "Temporary" },
];

function supplyChainUserLabel(u: SupplyChainUser): string {
  const name = `${u.first_name || ""} ${u.last_name || ""}`.trim();
  const phone = u.mobile ? ` · ${u.mobile}` : "";
  return name || u.email || `#${u.id}${phone}`;
}

export default function SupplyChainTeamMemberForMKPage() {
  const [users, setUsers] = useState<SupplyChainUser[]>([]);
  const [rows, setRows] = useState<MicroKitchenTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedPersonId, setSelectedPersonId] = useState<number | undefined>(undefined);
  const [newRole, setNewRole] = useState<"primary" | "backup" | "temporary">("primary");
  const [newZone, setNewZone] = useState("");
  const [newPincode, setNewPincode] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<MicroKitchenTeamMember | null>(null);

  const teamPersonIds = useMemo(() => {
    const ids = new Set<number>();
    for (const r of rows) {
      const id = Number(r.delivery_person);
      if (Number.isFinite(id)) ids.add(id);
    }
    return ids;
  }, [rows]);

  const selectableUsers = useMemo(
    () => users.filter((u) => !teamPersonIds.has(Number(u.id))),
    [users, teamPersonIds]
  );

  const personOptions: Option<number>[] = useMemo(
    () =>
      selectableUsers.map((u) => ({
        value: u.id,
        label: supplyChainUserLabel(u),
      })),
    [selectableUsers]
  );

  const load = async () => {
    try {
      setLoading(true);
      const team = await fetchMicroKitchenDeliveryTeam();
      setRows(team);
    } catch (e) {
      console.error(e);
      toast.error("Could not load team members.");
    } finally {
      setLoading(false);
    }
  };

  const loadSupplyChainPool = async () => {
    if (users.length > 0) return;
    try {
      const supply = await fetchSupplyChainUsers({ allSupplyChainUsers: true });
      setUsers(supply);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMember = async () => {
    const personId = selectedPersonId;
    if (personId == null || !Number.isFinite(personId)) {
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
      setSelectedPersonId(undefined);
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
      setRows((prev) => prev.map((r) => (r.id === id ? ({ ...r, ...payload } as MicroKitchenTeamMember) : r)));
      toast.success("Updated.");
    } catch (e) {
      console.error(e);
      toast.error("Update failed.");
    }
  };

  const removeMember = async (member: MicroKitchenTeamMember) => {
    try {
      const assignments = await fetchPlanDeliveryAssignments();
      const hasAssignments = assignments.some((a: any) => a.delivery_person === member.delivery_person);
      
      if (hasAssignments) {
        const name = `${member.delivery_person_details?.first_name || ""} ${member.delivery_person_details?.last_name || ""}`.trim() || `#${member.delivery_person}`;
        toast.error(`Cannot remove ${name}. This person has active global plan assignments. Reassign their plans under 'Global assignments' first.`);
        return;
      }
      setMemberToDelete(member);
    } catch (e) {
      console.error(e);
      toast.error("Failed to check member dependencies.");
    }
  };

  const confirmRemove = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    const name = `${memberToDelete.delivery_person_details?.first_name || ""} ${memberToDelete.delivery_person_details?.last_name || ""}`.trim() || `#${memberToDelete.delivery_person}`;
    try {
      await deleteMicroKitchenDeliveryTeamMember(memberToDelete.id);
      setRows((prev) => prev.filter((r) => r.id !== memberToDelete.id));
      toast.success(`${name} removed from team.`);
      setMemberToDelete(null);
    } catch (e) {
      console.error(e);
      toast.error("Could not remove team member.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageMeta
        title="Delivery Team Members"
        description="Each micro kitchen has its own pool/team of delivery persons."
      />
      <PageBreadcrumb pageTitle="Delivery Team Members" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-gray-900">
          <h3 className="mb-1 text-base font-semibold text-gray-900 dark:text-white">Add team member</h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Search and select a supply chain user, set their role and optional zone or pincode, then add them to this
            kitchen&apos;s delivery team.
          </p>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              void addMember();
            }}
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="mk-team-person" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Delivery person <span className="text-red-500">*</span>
                </label>
                <SearchableSelect<number>
                  options={personOptions}
                  value={selectedPersonId}
                  onFocus={loadSupplyChainPool}
                  onChange={(v) => setSelectedPersonId(v)}
                  placeholder="Search by name, email, or phone"
                  required
                />
              </div>
              <div>
                <label htmlFor="mk-team-role" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Role
                </label>
                <select
                  id="mk-team-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as "primary" | "backup" | "temporary")}
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="mk-team-zone" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Zone <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="mk-team-zone"
                  type="text"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  placeholder="e.g. North zone"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="mk-team-pincode" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
                  Pincode <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="mk-team-pincode"
                  type="text"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  placeholder="e.g. 560001"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || selectableUsers.length === 0}
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? "Adding…" : "Add member"}
              </button>
            </div>
          </form>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-gray-900">
          <Table className="text-sm">
            <TableHeader>
              <TableRow className="border-b border-gray-200 text-left dark:border-white/10">
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Name
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Role
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Zone
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Pincode
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Status
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Loading…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No team members added yet.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} className="border-b border-gray-100 dark:border-white/5">
                    <TableCell className="px-4 py-3 text-gray-900 dark:text-gray-100">
                      {`${r.delivery_person_details?.first_name || ""} ${r.delivery_person_details?.last_name || ""}`.trim() ||
                        `#${r.delivery_person}`}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <select
                        value={r.role}
                        onChange={(e) =>
                          updateMember(r.id, { role: e.target.value as "primary" | "backup" | "temporary" })
                        }
                        className="rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        {ROLE_OPTIONS.map((ro) => (
                          <option key={ro.value} value={ro.value}>
                            {ro.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <input
                        defaultValue={r.zone_name || ""}
                        onBlur={(e) => updateMember(r.id, { zone_name: e.target.value.trim() || null })}
                        className="w-full min-w-[8rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <input
                        defaultValue={r.pincode || ""}
                        onBlur={(e) => updateMember(r.id, { pincode: e.target.value.trim() || null })}
                        className="w-full min-w-[6rem] rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 text-gray-800 dark:text-gray-200">
                        <input
                          type="checkbox"
                          checked={r.is_active}
                          onChange={(e) => updateMember(r.id, { is_active: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <span>{r.is_active ? "Active" : "Inactive"}</span>
                      </label>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => removeMember(r)}
                        className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmationModal
        isOpen={memberToDelete !== null}
        onClose={() => setMemberToDelete(null)}
        onConfirm={confirmRemove}
        isLoading={isDeleting}
        title="Remove Team Member?"
        message={`Are you sure you want to remove ${
          memberToDelete
            ? `${memberToDelete.delivery_person_details?.first_name || ""} ${memberToDelete.delivery_person_details?.last_name || ""}`.trim() || `#${memberToDelete.delivery_person}`
            : "this member"
        } from the delivery team?`}
        confirmText="Remove Member"
      />
    </div>
  );
}
