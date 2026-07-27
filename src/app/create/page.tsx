import { Suspense } from "react";
import CreateFormWithParams from "./CreateFormWithParams";
import CreateForm from "./CreateForm";

/**
 * Create page - Server Component that wraps the client form in Suspense.
 *
 * This pattern allows Next.js to prerender the page while deferring
 * the dynamic useSearchParams() call until client-side hydration.
 *
 * The fallback shows the form with default occasion ("Birthday"),
 * preventing layout shift while preserving functionality for all users.
 */
export default function CreatePage() {
  return (
    <Suspense fallback={<CreateForm initialOccasion="Birthday" />}>
      <CreateFormWithParams />
    </Suspense>
  );
}
