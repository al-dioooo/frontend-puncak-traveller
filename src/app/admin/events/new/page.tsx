import AdminEditEventPage from "../[slug]/edit/page";

export default function AdminNewEventPage() {
  return <AdminEditEventPage params={Promise.resolve({ slug: "new" })} />;
}
