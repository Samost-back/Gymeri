import { RegisterForm } from "@/modules/accounts";
import { RouteModal } from "@/shared/ui";

// Opening /register from the site shows the form over the current page.
export default function RegisterModal() {
  return (
    <RouteModal label="Реєстрація">
      <RegisterForm />
    </RouteModal>
  );
}
