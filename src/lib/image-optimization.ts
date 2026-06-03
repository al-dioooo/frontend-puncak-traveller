export function shouldBypassImageOptimization(src: string): boolean {
  try {
    const { hostname } = new URL(src);
    return (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "[::1]" ||
      hostname.endsWith(".test")
    );
  } catch {
    return false;
  }
}
