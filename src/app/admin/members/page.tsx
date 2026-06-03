import { AdminResourceCrudPage } from "@/components/admin/resource-crud-page";

export default function AdminMembersPage() {
  return (
    <AdminResourceCrudPage
      activeTab="Members"
      endpoint="members"
      keyField="id"
      title="Members"
      subtitle="Create and manage member accounts, access roles, and account status."
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "email", label: "Email", type: "email", required: true },
        { key: "role", label: "Role", type: "select", options: [{ label: "Member", value: "member" }, { label: "Admin", value: "admin" }] },
        { key: "status", label: "Status", type: "select", options: [{ label: "Active", value: "active" }, { label: "Inactive", value: "inactive" }] },
        { key: "password", label: "Password", type: "password" },
        { key: "location", label: "Location" },
        { key: "crew", label: "Crew" },
      ]}
    />
  );
}
