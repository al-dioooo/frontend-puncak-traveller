import { notFound } from "next/navigation";
import { BookingFlowProvider } from "@/components/booking/booking-flow-provider";
import { getEventDetailBySlugFromApi } from "@/lib/puncak-api";

export default async function BookingLayout({
  children,
  params,
}: LayoutProps<"/events/[slug]/booking">) {
  const { slug } = (await params) as { slug: string };
  const event = await getEventDetailBySlugFromApi(slug);

  if (!event) {
    notFound();
  }

  return <BookingFlowProvider event={event}>{children}</BookingFlowProvider>;
}
