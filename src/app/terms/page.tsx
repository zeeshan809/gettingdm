import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { APP_DOMAIN, APP_NAME, PLANS, SUPPORT_EMAIL, TRIAL_DAYS } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Service", description: `The terms for using ${APP_NAME}.` };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms are an agreement between you and {APP_NAME} for your use of {APP_DOMAIN} and its services. By creating an
        account you accept them. If you do not agree, do not use {APP_NAME}.
      </p>

      <h2>1. The service</h2>
      <p>
        {APP_NAME} lets you connect an Instagram professional account through Meta&apos;s official API, set up campaigns that
        send a private reply to people who comment chosen keywords on your posts, and publish a link storefront. Features depend
        on Meta&apos;s APIs and policies, which Meta can change at any time.
      </p>

      <h2>2. Eligibility and your account</h2>
      <ul>
        <li>You must be at least 18 and able to enter a binding contract.</li>
        <li>You must give accurate information and keep your password safe. You are responsible for activity on your account.</li>
        <li>You must own, or be authorised to manage, any Instagram account you connect.</li>
      </ul>

      <h2>3. Acceptable use</h2>
      <p>You agree not to use {APP_NAME} to:</p>
      <ul>
        <li>Break any law, or Instagram&apos;s or Meta&apos;s terms, community guidelines or messaging policies.</li>
        <li>Send spam, misleading messages, or content that is illegal, harmful, hateful or infringes others&apos; rights.</li>
        <li>Link to malware, phishing, or scams.</li>
        <li>Try to bypass Instagram&apos;s limits, or interfere with or reverse-engineer the service.</li>
      </ul>
      <p>You are responsible for the messages, links and content you set up. We may suspend accounts that break these rules.</p>

      <h2>4. Plans, trial and billing</h2>
      <ul>
        <li>New accounts get a {TRIAL_DAYS}-day free trial.</li>
        <li>
          Paid plans: {PLANS.map((p) => `${p.name} at ₹${p.price}/month`).join(" and ")}, billed monthly in advance through
          Razorpay. Prices include or exclude GST as shown at checkout.
        </li>
        <li>Subscriptions renew automatically until cancelled. You can cancel any time; access continues until the end of the paid period.</li>
        <li>Fees already paid are non-refundable, except where required by law.</li>
        <li>If a payment fails, automations may pause until it is resolved.</li>
        <li>We may change prices with at least 30 days&apos; notice.</li>
      </ul>

      <h2>5. Your content and data</h2>
      <p>
        You keep ownership of your content. You give us permission to store and display it only to run the service. How we
        handle personal data is described in our <Link href="/privacy">Privacy Policy</Link>.
      </p>

      <h2>6. Third-party services</h2>
      <p>
        {APP_NAME} depends on Meta, Instagram, Razorpay and other providers. We are not responsible for their availability,
        changes, or decisions, such as Meta limiting or revoking your account&apos;s access.
      </p>

      <h2>7. Availability</h2>
      <p>
        We aim to keep {APP_NAME} running smoothly but do not guarantee it will be uninterrupted or error-free, or that every
        comment will receive a reply. Instagram limits private replies to one per comment, within 7 days of the comment.
      </p>

      <h2>8. Termination</h2>
      <p>
        You can delete your account at any time in Settings. We may suspend or end your access if you break these terms or if
        required by law or by Meta. On deletion, your data is removed as described on our <Link href="/data-deletion">data deletion page</Link>.
      </p>

      <h2>9. Disclaimers and liability</h2>
      <p>
        The service is provided &quot;as is&quot;. To the extent permitted by law, we are not liable for indirect or consequential
        losses, lost profits, or lost data. Our total liability for any claim is limited to the amount you paid us in the three
        months before the claim.
      </p>

      <h2>10. Governing law</h2>
      <p>These terms are governed by the laws of India. Disputes are subject to the jurisdiction of the courts of India.</p>

      <h2>11. Changes</h2>
      <p>We may update these terms. We will post changes here and, for significant changes, notify you. Continuing to use {APP_NAME} means you accept the updated terms.</p>

      <h2>12. Contact</h2>
      <p>Questions about these terms: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
    </LegalPage>
  );
}
