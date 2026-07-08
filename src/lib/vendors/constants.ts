export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]["value"];

export const IDENTITY_DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "driving_licence", label: "Driving licence" },
] as const;

export const ADDRESS_DOC_TYPES = [
  { value: "driving_licence", label: "Driving licence" },
  { value: "utility_bill", label: "Utility bill" },
] as const;

export const ONBOARDING_INVITE_DAYS = 7;

export function genderLabel(value: string | null | undefined) {
  if (!value) return "—";
  return GENDER_OPTIONS.find((option) => option.value === value)?.label ?? value;
}
