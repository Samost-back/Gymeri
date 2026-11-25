import type { Metadata } from "next";
import { AuthPage, LoginForm } from "@/modules/accounts";

export const metadata: Metadata = {
  title: "Вхід · Gymeri",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <AuthPage>
      <LoginForm />
    </AuthPage>
  );
}
