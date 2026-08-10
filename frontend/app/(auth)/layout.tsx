import { AuthShell } from "@/features/auth/components/auth-shell"

export default function AuthenticationLayout({ children }: { children: React.ReactNode }) {
  return <AuthShell>{children}</AuthShell>
}
