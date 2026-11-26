"use client";

import { AccountButton, useSessionUser } from "@/modules/accounts";
import { ButtonAnchor, Icon } from "@/shared/ui";

// The account hero's button: «Увійти» for a guest; for a client, a jump to the gym search,
// where every card can become their gym. The hero hides once a gym is chosen.
export function AccountAction() {
  const user = useSessionUser();

  if (!user) {
    return <AccountButton />;
  }
  return (
    <ButtonAnchor href="#find-gym">
      <Icon name="fitness_center" size={18} />
      Обрати зал
    </ButtonAnchor>
  );
}
