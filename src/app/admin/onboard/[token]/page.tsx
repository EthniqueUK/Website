import { SellerOnboardingForm } from "@/components/admin/seller-onboarding-form";
import { getInviteByToken } from "@/lib/actions/vendor-actions";

type OnboardPageProps = {
  params: Promise<{ token: string }>;
};

export default async function SellerOnboardPage({ params }: OnboardPageProps) {
  const { token } = await params;
  const result = await getInviteByToken(token);

  return (
    <main className="min-h-screen bg-[#F7F3EB] px-4 py-10 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {"error" in result ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#3B0F14]">
              Invite unavailable
            </h1>
            <p className="mt-3 text-sm text-[#A79C89]">{result.error}</p>
          </div>
        ) : (
          <SellerOnboardingForm
            token={token}
            invite={{
              displayName: result.invite.display_name ?? "",
              gender: result.invite.gender,
              email: result.invite.email,
              phone: result.invite.phone,
              marketName: result.invite.markets?.name ?? "Market",
              marketCode: result.invite.markets?.code ?? "uk",
              countryCode: result.invite.markets?.country_code ?? "GB",
            }}
          />
        )}
      </div>
    </main>
  );
}
