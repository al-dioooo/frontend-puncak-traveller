import AdminEditMemberPage from "../[id]/edit/page";

export default function AdminNewMemberPage() {
  return <AdminEditMemberPage params={Promise.resolve({ id: "new" })} />;
}
