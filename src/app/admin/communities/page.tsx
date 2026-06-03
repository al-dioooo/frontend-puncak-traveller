import { AdminResourceCrudPage } from "@/components/admin/resource-crud-page";

export default function AdminCommunitiesPage() {
  return (
    <AdminResourceCrudPage
      activeTab="Communities"
      endpoint="communities"
      keyField="slug"
      title="Communities"
      subtitle="Create and manage community groups used across events, galleries, and places."
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "slug", label: "Slug" },
        { key: "member_count", label: "Members", type: "number" },
        { key: "image_path", label: "Image path" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
