import { useSearchParams } from "react-router-dom";
import { cardByKey } from "@/data/cards";
import { rolesIn } from "@/data/roles";
import { CardHead } from "@/components/CardHead";
import { RolePane } from "@/components/RolePane";

// Experience and Leadership share one layout. ?role=<slug> opens that role, and &model=<season year> its 3D model
// (Home's model previews link here that way).
export function Roles({ group }) {
  const card = cardByKey(group);
  const [params] = useSearchParams();
  return (
    <div className="wrap page">
      <CardHead card={card} />
      <RolePane roles={rolesIn(group)} label={card.name} open={params.get("role")} model={params.get("model")} />
    </div>
  );
}
