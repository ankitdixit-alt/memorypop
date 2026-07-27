"use client";
import { useSearchParams } from "next/navigation";
import CreateForm from "./CreateForm";

/**
 * Wrapper component that reads URL search parameters and passes
 * the initial occasion to the CreateForm.
 *
 * This component must be wrapped in a Suspense boundary because
 * it uses useSearchParams(), which is a dynamic API in Next.js App Router.
 */
export default function CreateFormWithParams() {
  const searchParams = useSearchParams();

  // Read occasion from URL parameter (e.g., /create?occasion=birthday)
  const urlOccasion = searchParams.get('occasion');

  // Map URL occasion values to display names
  const occasionMap: Record<string, string> = {
    'birthday': 'Birthday',
    'retirement': 'Retirement',
    'farewell': 'Farewell',
    'wedding': 'Wedding',
    'anniversary': 'Anniversary',
    'new-arrival': 'New Arrival',
    'thank-you': 'Thank You',
    'graduation': 'Graduation',
  };

  const initialOccasion = urlOccasion && occasionMap[urlOccasion.toLowerCase()]
    ? occasionMap[urlOccasion.toLowerCase()]
    : "Birthday";

  return <CreateForm initialOccasion={initialOccasion} />;
}
