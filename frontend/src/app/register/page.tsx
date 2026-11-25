import type { Metadata } from "next";
import { AuthPage, RegisterForm } from "@/modules/accounts";

export const metadata: Metadata = {
  title: "Реєстрація · Gymeri",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <AuthPage>
      <RegisterForm />
    </AuthPage>
  );
}
