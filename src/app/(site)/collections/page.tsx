import { redirect } from "next/navigation";

/** Legacy Collections URL — taxonomy now lives under /shop. */
export default function CollectionsRedirectPage() {
  redirect("/shop");
}
