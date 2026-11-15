import { LoginForm } from "@/modules/accounts";
import { RouteModal } from "@/shared/ui";

// Opening /login from the site shows the form over the current page.
export default function LoginModal() {
  return (
    <RouteModal label="Вхід">
      <LoginForm />
    </RouteModal>
  );
}
