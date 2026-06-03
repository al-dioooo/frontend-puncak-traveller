import AdminEditPlacePage from "../[id]/edit/page";

export default function AdminNewPlacePage() {
  return <AdminEditPlacePage params={Promise.resolve({ id: "new" })} />;
}
