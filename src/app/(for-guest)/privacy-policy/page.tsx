export default function PrivacyPolicyPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <h1 className="text-4xl font-serif font-bold mb-8">
                Privacy Policy
            </h1>

            <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground mb-8">
                    Last updated: January 2024
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-serif font-semibold mb-4">
                        Information We Collect
                    </h2>
                    <p className="mb-4">
                        At Menu+ Fine Dining, we collect information you provide
                        directly to us, such as when you:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Make a reservation or place an order</li>
                        <li>Create an account on our website</li>
                        <li>Subscribe to our newsletter</li>
                        <li>Contact us for customer service</li>
                        <li>Participate in surveys or promotions</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-serif font-semibold mb-4">
                        How We Use Your Information
                    </h2>
                    <p className="mb-4">
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 mb-4">
                        <li>Process your reservations and orders</li>
                        <li>Provide customer service and support</li>
                        <li>
                            Send you updates about your orders and reservations
                        </li>
                        <li>Improve our services and develop new features</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-serif font-semibold mb-4">
                        Information Sharing
                    </h2>
                    <p className="mb-4">
                        We do not sell, trade, or otherwise transfer your
                        personal information to third parties without your
                        consent, except as described in this policy.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-serif font-semibold mb-4">
                        Contact Us
                    </h2>
                    <p>
                        If you have any questions about this Privacy Policy,
                        please contact us at privacy@menuplus.com or call +1
                        (800) MENU-PLUS.
                    </p>
                </section>
            </div>
        </div>
    );
}
