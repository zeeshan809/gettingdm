import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { APP_DOMAIN, APP_NAME, BUSINESS_ADDRESS, BUSINESS_LEGAL_NAME, PLANS, SUPPORT_EMAIL, TRIAL_DAYS } from "@/lib/config";

export const metadata: Metadata = { title: "Terms of Service", description: `The terms for using ${APP_NAME}.` };

const operator = BUSINESS_LEGAL_NAME ? `${BUSINESS_LEGAL_NAME} (trading as ${APP_NAME})` : APP_NAME;

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <p>
        These terms are an agreement between you and {operator} ({BUSINESS_LEGAL_NAME ? <>&quot;{APP_NAME}&quot;, </> : null}&quot;we&quot;, &quot;us&quot;) for your use of{" "}
        {APP_DOMAIN} and its services. By creating an account or using {APP_NAME} you accept these terms and our{" "}
        <Link href="/privacy">Privacy Policy</Link>. If you do not agree, do not use {APP_NAME}.
      </p>

      <h2>1. The service</h2>
      <p>
        {APP_NAME} lets you connect an Instagram professional account through Meta&apos;s official API, create campaigns that send a
        private reply (direct message) to people who comment on your chosen posts, optionally ask them to follow you first, and
        publish a link storefront. Features depend on Meta&apos;s APIs, limits and policies, which Meta can change at any time.
      </p>
      <p>
        {APP_NAME} is an independent service. It is not affiliated with, endorsed or sponsored by Meta Platforms, Inc. or
        Instagram. Instagram is a trademark of Meta Platforms, Inc.
      </p>

      <h2>2. Eligibility and your account</h2>
      <ul>
        <li>You must be at least 18 and able to enter a binding contract.</li>
        <li>You must give accurate information and keep your password safe. You are responsible for all activity on your account.</li>
        <li>You must own, or be authorised to manage, any Instagram account you connect.</li>
        <li>One person or business may hold more than one account only if each is used for a different Instagram account.</li>
      </ul>

      <h2>3. Your responsibilities when messaging people</h2>
      <p>You are the sender of every message {APP_NAME} sends for you. You agree to:</p>
      <ul>
        <li>
          Follow the Instagram Terms of Use, Community Guidelines, Meta&apos;s Platform Terms and the Instagram Platform Policy,
          including Meta&apos;s messaging rules.
        </li>
        <li>
          Only message people who commented on your post, and only about what your post offered. Instagram allows one private reply
          per comment, within 7 days of the comment; further messages are only allowed after the person replies.
        </li>
        <li>Make clear in your post what people will receive by commenting, and keep your messages accurate and not misleading.</li>
        <li>
          Use &quot;Follow before DM&quot; fairly: the content must be what you promised, and people must be able to get it once they
          follow. Do not use it to mislead people or to buy or trade followers.
        </li>
        <li>
          Have the right to share the links, files and content you send, and tell your audience how you use their information where
          the law requires it.
        </li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You must not use {APP_NAME} to:</p>
      <ul>
        <li>Break any law, or any of Meta&apos;s or Instagram&apos;s terms and policies.</li>
        <li>Send spam, unsolicited bulk messages, or messages to people who did not comment on your post.</li>
        <li>
          Share or link to content that is illegal, sexual, violent, hateful, harassing, deceptive, or that infringes others&apos;
          rights, including gambling, financial scams, &quot;get rich quick&quot; schemes, or unapproved medical claims.
        </li>
        <li>Link to malware, phishing pages, or pages that collect passwords or payment details under false pretences.</li>
        <li>Collect, sell or misuse data about commenters or visitors.</li>
        <li>Try to bypass Instagram&apos;s limits, use {APP_NAME} through automated scripts, or interfere with, copy or reverse-engineer the service.</li>
      </ul>
      <p>
        We may remove content, pause campaigns, or suspend accounts that break these rules, or when Meta asks us to. Where we can,
        we will tell you why.
      </p>

      <h2>5. Plans, trial and billing</h2>
      <ul>
        <li>New accounts get a {TRIAL_DAYS}-day free trial. No payment details are needed to start it.</li>
        <li>
          Paid plans: {PLANS.map((p) => `${p.name} at ₹${p.price}/month`).join(" and ")}, billed monthly in advance through
          Razorpay. Applicable taxes are shown at checkout.
        </li>
        <li>Subscriptions renew automatically each month until cancelled. You can cancel any time; access continues until the end of the paid period.</li>
        <li>Fees already paid are non-refundable, except where required by law or where we cannot provide the service for reasons within our control.</li>
        <li>If a payment fails, automations may pause until it is resolved.</li>
        <li>We may change prices with at least 30 days&apos; notice. The new price applies from your next billing period.</li>
      </ul>

      <h2>6. Your content and data</h2>
      <p>
        You keep ownership of your content, including your storefront, images, links and messages. You give us a limited permission
        to store, display and send it only to run {APP_NAME} for you. How we handle personal data, including data received from
        Meta, is explained in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
      <p>
        Data about your commenters and storefront visitors is available to you only inside {APP_NAME}, to run and measure your
        campaigns. You must not export it to build lists, sell it, or use it for advertising.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        {APP_NAME} relies on Meta, Instagram, Razorpay, Supabase, Vercel, Cloudflare and other providers. We are not responsible
        for their availability, changes or decisions, for example Meta limiting requests, changing features, or restricting or
        revoking your account&apos;s access.
      </p>

      <h2>8. Availability</h2>
      <p>
        We aim to keep {APP_NAME} running smoothly but do not guarantee that it will be uninterrupted or error-free, or that every
        comment will receive a message. Messages may be delayed by Meta&apos;s limits, by your campaign&apos;s delay setting, or by outages.
      </p>

      <h2>9. Ending your account</h2>
      <p>
        You can disconnect Instagram or delete your account at any time in {APP_NAME}. We may suspend or end your access if you
        break these terms, if your payment is overdue, or if required by law or by Meta. When an account is deleted, your data is
        removed as described on our <Link href="/data-deletion">Data Deletion page</Link>.
      </p>

      <h2>10. Disclaimers and limitation of liability</h2>
      <p>
        {APP_NAME} is provided &quot;as is&quot; and &quot;as available&quot;. To the extent permitted by law, we are not liable for
        indirect, incidental or consequential losses, lost profits, lost followers or lost data. Our total liability for any claim
        is limited to the amount you paid us in the three months before the claim.
      </p>

      <h2>11. Indemnity</h2>
      <p>
        You agree to compensate us for claims, losses and costs caused by your messages, links or content, or by your breach of
        these terms or of Meta&apos;s or Instagram&apos;s policies.
      </p>

      <h2>12. Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of India. Please contact us first so we can try to resolve any issue. Disputes that
        cannot be resolved are subject to the jurisdiction of the courts of India.
      </p>

      <h2>13. Changes to these terms</h2>
      <p>
        We may update these terms. We will post changes here and update the date at the top, and notify you of significant changes
        before they take effect. Continuing to use {APP_NAME} after that means you accept the updated terms.
      </p>

      <h2>14. Contact</h2>
      <p>
        {operator}
        {BUSINESS_ADDRESS && <><br />{BUSINESS_ADDRESS}</>}
        <br />
        Email: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
