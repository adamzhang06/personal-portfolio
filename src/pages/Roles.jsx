import { cardByKey } from "@/data/cards";
import { rolesIn } from "@/data/roles";
import { CardHead } from "@/components/CardHead";
import { RolePane } from "@/components/RolePane";

// Experience and Leadership share one layout.
export function Roles({ group }) {
  const card = cardByKey(group);
  return (
    <div className="wrap page">
      <CardHead card={card} />
      <RolePane roles={rolesIn(group)} label={card.name} />
    </div>
  );
}
