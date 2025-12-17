import Homepage from "@/components/component/homepage";
import { getUserData } from "@/actions/auth";

export default async function Home() {
  const user = await getUserData();

  return (
    <div>
      <Homepage user={user}/>
    </div>
  );
}
