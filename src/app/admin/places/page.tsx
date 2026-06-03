import { AdminResourceCrudPage } from "@/components/admin/resource-crud-page";

export default function AdminPlacesPage() {
  return (
    <AdminResourceCrudPage
      activeTab="Places"
      endpoint="places"
      keyField="id"
      title="Places"
      subtitle="Create and manage event venues and route locations."
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "community_id", label: "Community ID", type: "number", required: true },
        { key: "lat", label: "Latitude", type: "number", required: true },
        { key: "lng", label: "Longitude", type: "number", required: true },
        { key: "description", label: "Description", type: "textarea" },
      ]}
    />
  );
}
