import { redirect } from "next/navigation";

/**
 * /top10 is renamed to /top — keep the old URL working as a 308 redirect
 * so anyone with a bookmark or inbound link still lands on the content.
 */
export default function Top10Redirect() {
  redirect("/top");
}
