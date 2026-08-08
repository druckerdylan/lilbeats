import { Notice } from "./notice";

/**
 * Rendered when page.tsx throws notFound() — an unknown token, or a token
 * whose order rows are gone. The boundary is what turns the response into a
 * real 404 instead of a 200 with error copy, which search engines index.
 */
export default function ContractNotFound() {
  return (
    <Notice
      eyebrow="Not Found"
      title="Agreement Not Found"
      body="This link doesn't match an order. Check the link in your receipt email, or get in touch."
    />
  );
}
