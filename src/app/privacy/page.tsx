import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { APP_DOMAIN, APP_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy", description: `How ${APP_NAME} collects, uses and protects your data.` };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {APP_NAME} (&quot;we&quot;, &quot;us&quot;) runs {APP_DOMAIN}, a service that lets Instagram creators automatically send a
        direct message to people who comment a chosen keyword on their posts, and host a simple link storefront. This policy
        explains what personal data we process, why, and the choices you have. It is written to meet India&apos;s Digital
        Personal Data Protection Act, 2023 (DPDP Act) and Meta&apos;s Platform Terms.
      </p>

      <h2>1. Who this applies to</h2>
      <ul>
        <li><strong>Creators</strong>: people who sign up for {APP_NAME} and connect an Instagram professional account.</li>
        <li><strong>Commenters</strong>: people who comment on a creator&apos;s Instagram post that has a {APP_NAME} campaign.</li>
        <li><strong>Visitors</strong>: people who open a creator&apos;s storefront page on {APP_DOMAIN}.</li>
      </ul>

      <h2>2. Data we collect</h2>
      <h3>From creators</h3>
      <ul>
        <li>Account details: name, email address, username and password (stored only as a secure hash by our authentication provider).</li>
        <li>Storefront content you add: bio, links, social profiles, theme and images.</li>
        <li>Campaign settings: chosen posts, keywords, message text and links.</li>
        <li>
          Instagram data received through Meta&apos;s official API after you connect your account: your Instagram account ID,
          username, profile picture, the connected Facebook Page, a list of your recent posts and Reels (ID, caption, type,
          thumbnail, link and date), and an access token that lets us act on your behalf. We never see or store your Instagram
          or Facebook password.
        </li>
        <li>Support messages and notification preferences.</li>
        <li>Billing details handled by our payment provider, Razorpay. We store payment status and amounts, not your card or bank details.</li>
      </ul>
      <h3>From commenters</h3>
      <ul>
        <li>
          When someone comments on a post that has an active campaign, Meta sends us the comment ID, the comment text, the
          commenter&apos;s Instagram-scoped user ID and username, and the post ID. We use this only to check the keyword and send
          the creator&apos;s one-time reply.
        </li>
      </ul>
      <h3>From storefront visitors</h3>
      <ul>
        <li>
          Page visits and link clicks, the referring page, and a one-way daily visitor code made from your IP address and browser
          details. We do not store IP addresses, and the code cannot be turned back into them. It changes every day.
        </li>
      </ul>

      <h2>3. How we use data</h2>
      <ul>
        <li>To provide the service: match comments to keywords, send the creator&apos;s private reply through Meta&apos;s API, and show storefront links.</li>
        <li>To show creators analytics about their campaigns and storefront.</li>
        <li>To manage accounts, subscriptions, support requests and security.</li>
        <li>To meet legal obligations.</li>
      </ul>
      <p>
        We do <strong>not</strong> sell personal data, use it for advertising, or use data received from Meta for any purpose
        other than providing {APP_NAME} to the creator who connected their account.
      </p>

      <h2>4. Legal basis</h2>
      <p>
        We process creators&apos; data with their consent and to perform our agreement with them. Commenter data is processed on
        the creator&apos;s behalf, for the limited purpose of replying to the comment the person chose to post.
      </p>

      <h2>5. Sharing</h2>
      <p>We share data only with service providers who process it for us under contract:</p>
      <ul>
        <li><strong>Meta Platforms</strong>: to read comments and send messages on Instagram.</li>
        <li><strong>Supabase</strong>: database and authentication.</li>
        <li><strong>Vercel</strong>: website hosting.</li>
        <li><strong>Cloudflare</strong>: image storage.</li>
        <li><strong>Razorpay</strong>: subscription payments.</li>
        <li><strong>Email delivery provider</strong>: account and service emails.</li>
      </ul>
      <p>Some providers store data outside India. We use providers with appropriate security commitments. We may also disclose data where required by law.</p>

      <h2>6. Retention</h2>
      <ul>
        <li>Creator account data: while your account is active. Deleting your account removes it immediately.</li>
        <li>Instagram access tokens: until you disconnect Instagram, remove our app in Instagram settings, or delete your account.</li>
        <li>Comment and message records: up to 12 months, to show campaign history and prevent duplicate replies.</li>
        <li>Storefront analytics: up to 24 months.</li>
        <li>Billing records: as long as Indian tax law requires.</li>
      </ul>

      <h2>7. Security</h2>
      <p>
        Data is sent over HTTPS. Instagram access tokens are encrypted before storage. Access to data is restricted by
        role, and each creator can only access their own data.
      </p>

      <h2>8. Your rights</h2>
      <p>Under the DPDP Act you may:</p>
      <ul>
        <li>Access a summary of the personal data we hold about you.</li>
        <li>Correct or update it. Creators can do this in Settings and Storefront.</li>
        <li>Withdraw consent and have your data erased. See our <Link href="/data-deletion">data deletion page</Link>.</li>
        <li>Nominate another person to exercise your rights in case of death or incapacity.</li>
        <li>Raise a grievance with us, and if unresolved, with the Data Protection Board of India.</li>
      </ul>
      <p>To use any of these rights, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We respond within 30 days.</p>

      <h2>9. Children</h2>
      <p>{APP_NAME} is not meant for anyone under 18. We do not knowingly create accounts for children.</p>

      <h2>10. Changes</h2>
      <p>We will post any changes on this page and update the date above. For significant changes, we will notify creators by email or in the app.</p>

      <h2>11. Contact and grievance officer</h2>
      <p>
        {APP_NAME}, Grievance Officer: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
