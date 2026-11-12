import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal-page";
import { APP_DOMAIN, APP_NAME, BUSINESS_ADDRESS, BUSINESS_LEGAL_NAME, SUPPORT_EMAIL } from "@/lib/config";

export const metadata: Metadata = { title: "Privacy Policy", description: `How ${APP_NAME} collects, uses, shares and deletes your data.` };

const operator = BUSINESS_LEGAL_NAME ? `${BUSINESS_LEGAL_NAME} (trading as ${APP_NAME})` : APP_NAME;

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        {operator} ({BUSINESS_LEGAL_NAME ? <>&quot;{APP_NAME}&quot;, </> : null}&quot;we&quot;, &quot;us&quot;) runs {APP_DOMAIN}. {APP_NAME} lets Instagram creators
        automatically send a private reply (direct message) to people who comment on their posts, and publish a simple link
        storefront. This policy explains what personal data we collect, how we use and share it, how long we keep it, and how
        you can have it deleted.
      </p>
      <p>
        It is written to meet India&apos;s Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;), Meta&apos;s Platform Terms
        and Developer Policies, and the Instagram Platform Policy. {APP_NAME} is an independent service and is not affiliated
        with, endorsed or sponsored by Meta Platforms, Inc. or Instagram.
      </p>

      <h2>1. Who this policy covers</h2>
      <ul>
        <li><strong>Creators</strong>: people who sign up for {APP_NAME} and connect an Instagram professional account.</li>
        <li>
          <strong>Commenters</strong>: people who comment on a creator&apos;s Instagram post or Reel that has an active {APP_NAME}
          campaign, and who may receive a direct message from that creator.
        </li>
        <li><strong>Visitors</strong>: people who open a creator&apos;s storefront page on {APP_DOMAIN}.</li>
      </ul>

      <h2>2. Data we collect</h2>

      <h3>2.1 From creators</h3>
      <ul>
        <li>
          <strong>Account details</strong>: name, email address, username and password. Passwords are stored only as a secure
          hash by our authentication provider; we can never see them.
        </li>
        <li><strong>Storefront content</strong> you add: display name, bio, profile picture, cover image, links, social profiles and theme.</li>
        <li>
          <strong>Campaign settings</strong>: the post you choose, keywords, message text, button text, links, delay and
          &quot;Follow before DM&quot; settings.
        </li>
        <li><strong>Support messages</strong> and notification preferences.</li>
        <li>
          <strong>Billing</strong>: payments are handled by Razorpay. We store your plan, payment status, amounts and invoice
          references, never your card, UPI or bank details.
        </li>
      </ul>

      <h3>2.2 Instagram data from Meta (creators)</h3>
      <p>
        When you connect Instagram, you log in through Meta&apos;s official login and choose what to share. We never see or store your
        Instagram or Facebook password. With your permission, Meta gives us:
      </p>
      <ul>
        <li>Your Instagram professional account ID, username and profile picture, and the Meta business portfolio you choose.</li>
        <li>
          Your recent posts and Reels (ID, caption, type, thumbnail, link and date), so you can pick one for a campaign. We store
          these details only for posts you use in a campaign.
        </li>
        <li>
          An access token that lets {APP_NAME} act on your behalf. It is encrypted before it is stored, and is deleted when you
          disconnect.
        </li>
      </ul>
      <p>We use these permissions from Meta, and only for the purposes listed:</p>
      <ul>
        <li><strong>instagram_basic</strong>: show your account and your posts when you set up a campaign.</li>
        <li><strong>instagram_manage_comments</strong>: receive comments on your posts so they can trigger your campaign.</li>
        <li>
          <strong>instagram_manage_messages</strong>: send your private reply to a commenter, and, for campaigns with
          &quot;Follow before DM&quot; on, check whether the commenter follows you and see when they reply.
        </li>
      </ul>

      <h3>2.3 From commenters</h3>
      <p>When someone comments on a post with an active campaign, Meta sends us:</p>
      <ul>
        <li>The comment ID and text, the post ID, and the time.</li>
        <li>The commenter&apos;s Instagram-scoped user ID (an ID that only works with {APP_NAME}) and username.</li>
      </ul>
      <p>For campaigns where the creator has turned on &quot;Follow before DM&quot;, we also:</p>
      <ul>
        <li>
          Ask Meta whether the commenter follows the creator&apos;s Instagram account. Meta only answers once the person has
          interacted with the creator&apos;s message. We use the yes/no answer immediately to decide which message to send, and do not
          store it.
        </li>
        <li>
          Read the most recent messages in that conversation (sender, time and text) to see whether the commenter has replied or
          tapped a button. We use this only to send the next message, and do not store the message text.
        </li>
      </ul>
      <p>
        We store a record of each comment and what we sent (for example &quot;Sent&quot; or &quot;Waiting for follow&quot;) so the
        creator can see their campaign history and so nobody gets the same message twice.
      </p>

      <h3>2.4 From storefront visitors</h3>
      <ul>
        <li>
          Page visits and link clicks, the campaign that sent you (if any), the referring page, and a one-way visitor code made from
          your IP address and browser details. The code changes every day and cannot be turned back into your IP address. We do not
          store IP addresses.
        </li>
      </ul>

      <h3>2.5 Cookies</h3>
      <p>
        We use only essential cookies, to keep creators signed in and secure. We do not use advertising or cross-site tracking
        cookies. Storefront visitors get no cookies from us.
      </p>

      <h2>3. How we use data</h2>
      <ul>
        <li>
          <strong>To run the service</strong>: match comments to a creator&apos;s campaign, send the creator&apos;s private reply and
          follow-up messages, run &quot;Follow before DM&quot;, and show storefront pages and links.
        </li>
        <li><strong>To show creators analytics</strong> about their own campaigns and storefront.</li>
        <li><strong>To manage accounts</strong>, subscriptions, support, security and fraud prevention.</li>
        <li><strong>To meet legal obligations</strong>, such as tax records.</li>
      </ul>

      <h2>4. Data received from Meta (Platform Data)</h2>
      <p>For all data we receive through Meta&apos;s APIs, including Instagram data about creators and commenters:</p>
      <ul>
        <li>We use it only to provide {APP_NAME} to the creator who connected their account, as described in this policy.</li>
        <li>We do <strong>not</strong> sell, license or rent it, or share it with data brokers.</li>
        <li>We do <strong>not</strong> use it for advertising, ad targeting, or building profiles of people.</li>
        <li>
          We do <strong>not</strong> use it to make decisions about anyone&apos;s eligibility for credit, jobs, housing or insurance, or
          for surveillance.
        </li>
        <li>We do not combine it with data from other sources to identify or track people.</li>
        <li>
          We keep it only as long as needed (see section 7), and delete it when you ask, when you disconnect Instagram or remove our
          app, when Meta asks us to, or if we stop running {APP_NAME}.
        </li>
        <li>
          If there is a security incident affecting it, we will notify Meta and affected users as required by law and by Meta&apos;s
          terms.
        </li>
        <li>We will cooperate with any review or audit by Meta of how we handle this data.</li>
      </ul>

      <h2>5. Legal basis</h2>
      <p>
        We process creators&apos; data with their consent and to provide the service they signed up for. Commenter data is processed
        on behalf of the creator, only to reply to the comment the person chose to post. Visitor analytics are limited to what is
        needed to show creators how their storefront performs.
      </p>

      <h2>6. Who we share data with</h2>
      <p>We share data only with these service providers, who process it for us under contract and only to run {APP_NAME}:</p>
      <ul>
        <li><strong>Meta Platforms</strong>: to receive comments and send and read messages on Instagram.</li>
        <li><strong>Supabase</strong>: database and sign-in.</li>
        <li><strong>Vercel</strong>: website hosting.</li>
        <li><strong>Cloudflare</strong>: storage for storefront images.</li>
        <li><strong>Razorpay</strong>: subscription payments.</li>
        <li><strong>Our email provider</strong>: account and service emails.</li>
      </ul>
      <p>
        Some providers process data outside India, including in Singapore and the United States. We choose providers with strong
        security commitments. We may also disclose data if required by law or a valid order from a government authority. Creators
        can see data about comments and visits to their own campaigns and storefront; nobody else can.
      </p>

      <h2>7. How long we keep data</h2>
      <ul>
        <li><strong>Creator account and storefront data</strong>: while your account is active. Deleting your account removes it immediately.</li>
        <li>
          <strong>Instagram connection and access token</strong>: until you disconnect Instagram, remove {APP_NAME} in Instagram or
          Facebook settings, or delete your account.
        </li>
        <li><strong>Comment and message records</strong>: 12 months, then deleted automatically.</li>
        <li><strong>Raw notifications from Meta</strong> (comment and message events as delivered): 30 days, then deleted automatically.</li>
        <li><strong>Storefront analytics</strong>: 24 months, then deleted automatically.</li>
        <li>
          <strong>Billing records</strong>: our copy is deleted with your account. Razorpay keeps payment records for as long as
          Indian law requires.
        </li>
      </ul>

      <h2>8. Security</h2>
      <p>
        All data is sent over HTTPS. Instagram access tokens are encrypted (AES-256) before storage. Database access is
        restricted so each creator can only see their own data, and staff access is limited to what is needed to support you.
      </p>

      <h2>9. Your rights and choices</h2>
      <p>Under the DPDP Act and other applicable laws, you can:</p>
      <ul>
        <li>Ask for a summary of the personal data we hold about you and how we use it.</li>
        <li>Correct or update it. Creators can do this themselves in Settings and Storefront.</li>
        <li>
          Withdraw consent and have your data deleted. Creators can disconnect Instagram or delete their account at any time;
          commenters and visitors can ask us by email. See our <Link href="/data-deletion">Data Deletion page</Link>.
        </li>
        <li>Nominate another person to exercise these rights for you in case of death or incapacity.</li>
        <li>Complain to us, and if we do not resolve it, to the Data Protection Board of India.</li>
      </ul>
      <p>
        To use any of these rights, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We reply within 30 days.
        Withdrawing consent does not affect processing that already happened.
      </p>
      <p>
        If you no longer want a creator&apos;s messages, you can stop replying, block or restrict the account in Instagram, or ask us to
        delete your data.
      </p>

      <h2>10. Children</h2>
      <p>
        {APP_NAME} accounts are for people aged 18 or over. We do not knowingly collect data from children for our own purposes.
        If you believe a child&apos;s data reached us, email us and we will delete it.
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We will post any changes on this page and update the date at the top. For significant changes, we will notify creators by
        email or in the app before they take effect.
      </p>

      <h2>12. Contact and Grievance Officer</h2>
      <p>
        {operator}
        {BUSINESS_ADDRESS && <><br />{BUSINESS_ADDRESS}</>}
        <br />
        Grievance Officer and privacy contact: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </LegalPage>
  );
}
