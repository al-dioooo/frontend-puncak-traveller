import AdminEditCommunityPage from "../[slug]/edit/page";

export default function AdminNewCommunityPage() {
  return <AdminEditCommunityPage params={Promise.resolve({ slug: "new" })} />;
}
