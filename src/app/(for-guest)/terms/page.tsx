export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-muted-foreground mb-8">Last updated: January 2024</p>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">
            Reservation Policy
          </h2>
          <ul className="list-disc pl-6 mb-4">
            <li>Reservations are held for 15 minutes past the reserved time</li>
            <li>Cancellations must be made at least 24 hours in advance</li>
            <li>No-shows may be charged a fee of $50 per person</li>
            <li>Large parties (8+ guests) require a deposit</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Dress Code</h2>
          <p className="mb-4">
            We maintain a smart casual to business formal dress code. We reserve
            the right to refuse service to guests who do not meet our dress
            standards.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">
            Payment Terms
          </h2>
          <ul className="list-disc pl-6 mb-4">
            <li>We accept all major credit cards and cash</li>
            <li>Gratuity is not included in menu prices</li>
            <li>
              For parties of 6 or more, an 18% service charge will be added
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-serif font-semibold mb-4">Liability</h2>
          <p className="mb-4">
            Menu+ Fine Dining is not responsible for lost or stolen items.
            Please inform us of any food allergies or dietary restrictions.
          </p>
        </section>
      </div>
    </div>
  );
}
