import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";

type PublicPageShellProps = {
  children: React.ReactNode;
};

export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <SmoothScrollProvider>
      <Header />
      <main className="page-main">{children}</main>
      <Footer />
    </SmoothScrollProvider>
  );
}
