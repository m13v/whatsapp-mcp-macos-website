import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  GlowCard,
  GradientText,
  TerminalOutput,
  StepTimeline,
  BeforeAfter,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@m13v/seo-components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/self-hosted-whatsapp-gateway-risk";
const PUBLISHED = "2026-05-17";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title: "The hidden risk of a self-hosted WhatsApp gateway",
  description:
    "The famous risk of a self-hosted WhatsApp gateway is the account ban. The hidden one is custody: the gateway stores your full WhatsApp session as a portable plaintext file and runs it through an unaudited npm dependency tree. lotusbail, a poisoned Baileys clone with 56,000+ downloads, exfiltrated exactly that credential before it was caught in December 2025.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "The hidden risk of a self-hosted WhatsApp gateway",
    description:
      "The hidden risk is not the ban. It is that the gateway holds your WhatsApp account as a portable credential file, in the hands of an npm dependency tree you never audited.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The hidden risk of a self-hosted WhatsApp gateway",
    description:
      "Everyone warns about the ban. The quiet risk is that your account becomes a file an npm dependency tree can read. lotusbail proved it.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Self-hosted WhatsApp gateway: the hidden risk" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  {
    name: "Self-hosted WhatsApp gateway: the hidden risk",
    url: PAGE_URL,
  },
];

const authFolderLines = [
  { text: "ls auth_info/", type: "command" as const },
  { text: "creds.json", type: "output" as const },
  {
    text: "app-state-sync-key-*.json   pre-key-*.json   session-*.json",
    type: "output" as const,
  },
  {
    text: "creds.json holds the Noise keypair, signed identity key, and registration id",
    type: "info" as const,
  },
  {
    text: "that one file IS a linked device. it does not need your phone to work.",
    type: "info" as const,
  },
  {
    text: "scp -r auth_info/ user@other-box:~/gateway/",
    type: "command" as const,
  },
  {
    text: "node gateway.js   # boots straight back into your WhatsApp session",
    type: "command" as const,
  },
  {
    text: "no QR scan, no 2FA prompt, no login alert. your account is now live on a box you do not own.",
    type: "error" as const,
  },
];

const lotusbailSteps = [
  {
    title: "May 2025: lotusbail is published to npm",
    description:
      "A package named lotusbail appears on the public npm registry. It is a clone of @whiskeysockets/baileys, the standard library for talking to WhatsApp over the web protocol, wrapped in a malicious proxy layer that duplicates every operation.",
  },
  {
    title: "Seven months live, 56,000+ downloads",
    description:
      "Developers install it as the engine of their self-hosted gateway. It works exactly as advertised. Behind the proxy, every authentication token, session key, message, contact list, and media file is copied to the operator.",
  },
  {
    title: "A hard-coded pairing code",
    description:
      "The package quietly links the attacker's own device to each victim account through a hard-coded pairing code. The attacker is now a trusted linked device on accounts that just wanted a chatbot.",
    detail: (
      <p className="text-zinc-600 italic leading-relaxed">
        &ldquo;When you use this library to authenticate, you are not just
        linking your application, you are also linking the threat actor&apos;s
        device.&rdquo; (Koi Security analysis)
      </p>
    ),
  },
  {
    title: "December 2025: disclosed by Koi Security",
    description:
      "The security firm Koi Security publishes its analysis. Uninstalling the package does not undo the damage: the attacker's linked device stays connected until each victim manually removes it from WhatsApp's linked-devices screen.",
  },
];

const faqItems = [
  {
    q: "What is the single biggest hidden risk of a self-hosted WhatsApp gateway?",
    a: "Credential custody. To work, any web-protocol gateway (Baileys, Evolution API, whatsapp-web.js, wppconnect and the rest) has to hold a resumable login for your WhatsApp account. It lives as a file on disk, typically a folder called auth_info with creds.json inside it. That file is not a config, it is the account. The ban risk that every tutorial warns about is real but loud and recoverable. The custody risk is quiet: anyone who reads that file owns your WhatsApp until you notice and unlink. Most guides never mention it.",
  },
  {
    q: "Can someone really use my Baileys auth folder from another computer?",
    a: "Yes, and that is by design, not a bug. The whole point of useMultiFileAuthState is that the folder restores your session on the next boot, so your bot survives a restart without re-scanning a QR code. Copy that same folder to a different machine, point Baileys at it, and it reconnects as the same linked device. No QR scan, no phone, no 2FA prompt. WhatsApp may eventually desync or drop a stale session, but a fresh copy of the folder is enough to be live as you. That is why a leaked auth folder is account takeover, not just a data leak.",
  },
  {
    q: "What was the lotusbail npm package?",
    a: "lotusbail was a malicious npm package that cloned @whiskeysockets/baileys, the standard WhatsApp web-protocol library, and wrapped it in a proxy that copied everything. It was published in May 2025, stayed on the registry for about seven months, and was downloaded over 56,000 times. It captured authentication tokens and session keys, message history, contact lists with phone numbers, and media. It also embedded a hard-coded pairing code that linked the attacker's own device to each victim account, so the attacker kept access even after the package was uninstalled. Security firm Koi Security disclosed it in December 2025.",
  },
  {
    q: "Does encrypting the auth folder fix this?",
    a: "Not really. Encryption at rest protects the file when nothing is using it. But the gateway process has to decrypt the credential to authenticate, which means a working, plaintext copy of your WhatsApp identity sits in the memory of a long-running Node process. That process is the npm dependency tree. Encrypting the folder defends against someone reading the disk while the gateway is off. It does nothing against a malicious or compromised dependency running inside the process that legitimately needs the plaintext. lotusbail did not need to crack any encryption; it was handed the credential by the code itself.",
  },
  {
    q: "Is a SQL-backed auth store safer than useMultiFileAuthState?",
    a: "The Baileys docs themselves say they would not endorse useMultiFileAuthState for any production use other than maybe a bot, and recommend a SQL or NoSQL auth state instead. That advice is about reliability and corruption, not about custody. Moving the bytes from JSON files into Postgres changes where the credential rests, not who can read it. The gateway process still pulls a plaintext, resumable login into memory on every connect, and the dependency tree still runs in that same process. A database makes the gateway more robust. It does not remove the risk class.",
  },
  {
    q: "How does WhatsApp MCP avoid storing a credential at all?",
    a: "WhatsApp MCP never opens a WhatsApp session. It is a Swift MCP server that drives the official WhatsApp Desktop app on macOS through the system accessibility APIs, the same ones a screen reader uses. The WhatsApp app keeps its own credentials inside its Mac App Store sandbox, exactly as it did before you installed anything. Grep the entire server source, all 1,214 lines of Sources/WhatsAppMCP/main.swift, for writeToFile, FileManager, creds, auth, token, save, or persist. The only matches are saveCursorPosition and restoreCursorPosition, which hold a mouse position in memory so your cursor does not jump while the agent clicks. There is no creds.json. There is no auth folder. There is nothing on disk to copy.",
  },
  {
    q: "If the Mac running WhatsApp MCP is compromised, am I still exposed?",
    a: "A compromised machine is always bad, and this is not a magic shield. If an attacker has live control of that Mac, they can drive the WhatsApp app the same way the MCP server does, while they are on the machine. The difference is the shape of the attack. There is no portable credential file to quietly exfiltrate and resume from somewhere else, so the attack is bound to that one machine and to the window during which the attacker holds it. With a gateway, the auth folder leaves with the attacker and outlives the breach. With the accessibility path, when you clean the Mac, the access is gone.",
  },
  {
    q: "Should I never run a self-hosted gateway?",
    a: "No. A self-hosted gateway is the right tool for some jobs: disposable or business-grade numbers, Linux and Docker deployments, and outbound volume you accept ban risk on. The point is to price the custody risk honestly. Treat the account on a gateway as disposable, never put your personal number on it, audit the dependency tree, pin versions, and check WhatsApp's linked-devices screen regularly. If the sending account is the one you also use personally, that math rarely works out. The architecture-level comparison is on the self-hosted gateway vs accessibility APIs page.",
  },
];

const jsonLd = [
  articleSchema({
    headline: "The hidden risk of a self-hosted WhatsApp gateway",
    description:
      "A self-hosted WhatsApp gateway built on Baileys, Evolution API, whatsapp-web.js or wppconnect carries a risk most guides never name. The famous risk is the account ban. The hidden risk is custody: to speak WhatsApp's web protocol, the gateway must hold a resumable login for your account, stored as a portable plaintext credential (the auth_info folder with creds.json) and decrypted inside a long-running Node process that runs an unaudited npm dependency tree. That credential is a clone of your account: copy it to another machine and it resumes the session with no QR scan and no phone. The supply-chain risk is not theoretical: the lotusbail npm package, a poisoned clone of @whiskeysockets/baileys with over 56,000 downloads, exfiltrated exactly this credential and was disclosed by Koi Security in December 2025. WhatsApp MCP for macOS avoids the entire risk class because it stores no credential: a grep of its 1,214-line Swift source for writeToFile, FileManager, creds, auth, token, save and persist returns only an in-memory mouse-cursor helper.",
    url: PAGE_URL,
    datePublished: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "WhatsApp MCP for macOS",
    publisherUrl: "https://whatsapp-mcp-macos.com",
    articleType: "TechArticle",
  }),
  breadcrumbListSchema(breadcrumbSchemaItems),
  faqPageSchema(faqItems),
];

export default function SelfHostedWhatsAppGatewayRiskPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen pb-24">
        <div className="pt-10">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        <header className="max-w-3xl mx-auto px-6 mt-8">
          <span className="inline-block bg-teal-50 text-teal-700 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6">
            What the gateway tutorials skip
          </span>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-6 leading-[1.07]">
            The hidden risk of a self-hosted WhatsApp gateway{" "}
            <GradientText>is not the ban</GradientText>.
          </h1>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            Spin up Baileys, Evolution API, or whatsapp-web.js and every guide
            tells you the same thing: use a burner number, keep volume low, your
            account might get banned. That risk is real. It is also the loud,
            obvious, recoverable one.
          </p>
          <p className="text-lg text-zinc-700 leading-relaxed mb-4">
            The hidden risk is quieter and worse. To speak WhatsApp&apos;s web
            protocol at all, the gateway has to hold a resumable login for your
            account. That login lives on disk as a plain file, and that file is
            in the custody of an npm dependency tree you never audited. This is
            a guide to the risk underneath the risk.
          </p>
        </header>

        <div className="mt-6">
          <ArticleMeta
            datePublished={PUBLISHED}
            readingTime="8 min read"
            author="Matthew Diakonov"
            authorRole="Written with AI"
          />
        </div>

        <section className="max-w-3xl mx-auto px-6 mt-12">
          <GlowCard>
            <div className="p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-3">
                Direct answer, verified 2026-05-17
              </p>
              <p className="text-zinc-900 text-lg leading-relaxed mb-3">
                The hidden risk of a self-hosted WhatsApp gateway is{" "}
                <span className="font-semibold">credential custody</span>, not
                the ban. To work, the gateway stores your full WhatsApp session
                as a portable plaintext credential and decrypts it inside a
                long-running Node process running code you did not write.
              </p>
              <p className="text-zinc-700 leading-relaxed">
                That credential is a clone of your account: copy the folder to
                another machine and the session resumes with no QR scan and no
                phone. The supply-chain version of this is not hypothetical. The{" "}
                <a
                  href="https://thehackernews.com/2025/12/fake-whatsapp-api-package-on-npm-steals.html"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                >
                  lotusbail
                </a>{" "}
                npm package, a poisoned clone of{" "}
                <a
                  href="https://github.com/WhiskeySockets/Baileys"
                  className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
                >
                  Baileys
                </a>{" "}
                with over 56,000 downloads, exfiltrated exactly that credential
                and was disclosed in December 2025.
              </p>
            </div>
          </GlowCard>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The loud risk and the quiet one
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The account ban is the risk everyone names because it is easy to
            picture and easy to talk about. Meta&apos;s anti-automation models
            score the traffic on your gateway&apos;s socket, decide it looks
            like a bot, and log the session out. Annoying, sometimes expensive,
            but visible. You know it happened. You can use a fresh number. The
            failure mode announces itself.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The custody risk does the opposite. It never announces itself. The
            gateway keeps working perfectly while someone else also has your
            account. There is no error, no logout, no alert. By the time you
            find out, the question is not how to get unbanned, it is how long a
            stranger has been reading your messages. Three specific things make
            this risk real, and none of them are in the tutorials.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Hidden risk one
          </p>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Your WhatsApp account becomes a file
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            A self-hosted gateway has to survive a restart without making you
            re-scan a QR code every time. So it persists the session. In
            Baileys the standard way to do that is{" "}
            <a
              href="https://baileys.wiki/docs/api/functions/useMultiFileAuthState/"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              useMultiFileAuthState
            </a>
            , which writes a folder of JSON files. The one that matters is{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              creds.json
            </code>
            . It holds the Noise keypair, the signed identity key, and the
            registration id: the cryptographic identity of a linked device.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-6">
            That file is not a pointer to your account. It effectively is a
            linked device. It does not need your phone to be powered on. It does
            not trigger a 2FA prompt. A working copy of that folder, anywhere,
            is a live session as you.
          </p>

          <TerminalOutput
            title="What is actually in a Baileys auth folder"
            lines={authFolderLines}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            Now think about where that folder ends up over the life of a
            project. It gets committed to a repo by accident. It rides along in
            a nightly backup. It is baked into a container image layer. It is
            copied to a staging box for debugging and forgotten. Every one of
            those is a full account takeover waiting to be found, and the
            Baileys maintainers say plainly that they{" "}
            <a
              href="https://baileys.wiki/docs/api/functions/useMultiFileAuthState/"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              would not endorse this for any production use
            </a>{" "}
            beyond maybe a bot.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Hidden risk two
          </p>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            You handed that file to an npm dependency tree
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            &ldquo;Self-hosted&rdquo; sounds like &ldquo;I control it.&rdquo; You
            control the server. You do not control the code. A WhatsApp gateway
            is a Node application, and a Node application is a dependency tree:
            the gateway library, plus everything it pulls in, plus everything
            those pull in. Hundreds of packages, most of which you have never
            read, all running in the same process that just decrypted{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              creds.json
            </code>{" "}
            into memory.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-6">
            Any one of those packages can read the credential, because the
            process legitimately needs it in plaintext to authenticate. This is
            not a thought experiment. It already happened, at scale, with a
            package built for exactly this job.
          </p>

          <StepTimeline
            title="The lotusbail incident, end to end"
            steps={lotusbailSteps}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            Read that timeline again with one detail in mind: lotusbail did not
            break any encryption. It did not exploit a vulnerability. It was
            installed on purpose, by developers who wanted a WhatsApp gateway,
            and it was handed the credential by the normal flow of their own
            code. The supply chain is not a side risk to the gateway. For
            anything that speaks WhatsApp&apos;s protocol, the supply chain is
            the gateway.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-700 mb-2">
            Hidden risk three
          </p>
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Nothing tells you when it is used
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            When your bank sees a login from a new device, it emails you. When
            someone resumes a stolen WhatsApp gateway credential, nothing does.
            To WhatsApp, the attacker&apos;s machine is just another linked
            device on an account that already has a linked device, the gateway.
            There is no anomaly to flag.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The lotusbail case made the stickiness explicit. Because the package
            linked the attacker&apos;s device through a hard-coded pairing code,
            uninstalling the package did not cut the access off. The attacker
            stayed a trusted device until each victim opened WhatsApp, went to
            the linked-devices screen, and removed it by hand. If you never look
            at that screen, you never find out.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            So the real exposure of a gateway is not a moment, it is a duration.
            It runs from whenever the credential leaked until whenever you
            happen to notice, and nothing in the system shortens that gap for
            you. The detection job is yours, and most operators never do it.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            But can&apos;t I just lock the folder down?
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            This is the honest pushback, so here is the honest answer. You can
            chmod the folder, encrypt it at rest, move it into a secrets
            manager, or follow the Baileys advice and store the auth state in
            Postgres instead of JSON files. All of that is worth doing. None of
            it removes the risk.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-4">
            The reason is structural. The gateway&apos;s job is to authenticate
            as you, which means it needs the credential in plaintext, in memory,
            every time it connects. Encryption at rest protects the bytes while
            nothing is using them. A secrets manager protects them in transit.
            Neither protects them at the one moment that matters: when the
            gateway process, and therefore the whole dependency tree inside it,
            is holding the decrypted credential to do its work. lotusbail did
            not need to defeat any of those controls. It was inside the process
            that legitimately had the plaintext.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            Any architecture whose plan is &ldquo;open a session pretending to
            be a real WhatsApp client&rdquo; has to hold a resumable credential
            somewhere its own code can read. Harden all you like; the credential
            still exists, and it is still in custody of code you did not write.
            The only way to not have this risk is to not hold the credential.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            The version with no credential to steal
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            There is a way to let an AI agent send and read WhatsApp messages
            that never holds a credential at all, because it never opens a
            WhatsApp session.{" "}
            <a
              href="https://github.com/m13v/whatsapp-mcp-macos"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              WhatsApp MCP for macOS
            </a>{" "}
            is an MCP server that drives the official WhatsApp Desktop app
            through the macOS accessibility APIs, the same framework a screen
            reader uses. The WhatsApp app keeps its own credentials inside its
            Mac App Store sandbox, exactly as it did before you installed
            anything. The MCP server just reads and writes the screen.
          </p>
          <p className="text-zinc-700 leading-relaxed mb-6">
            That claim is checkable. The server is one Swift file,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              Sources/WhatsAppMCP/main.swift
            </code>
            , 1,214 lines, open on GitHub. Grep the whole thing for the symbols
            you would expect credential storage to use:{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              writeToFile
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              FileManager
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              creds
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              auth
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              token
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              save
            </code>
            ,{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              persist
            </code>
            . The only matches are{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              saveCursorPosition
            </code>{" "}
            and{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              restoreCursorPosition
            </code>
            , which hold a mouse position in memory so your cursor does not jump
            while the agent clicks. No{" "}
            <code className="text-sm bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded">
              creds.json
            </code>
            . No auth folder. Nothing on disk to copy.
          </p>

          <BeforeAfter
            title="What an attacker actually gets"
            before={{
              label: "Self-hosted gateway",
              content:
                "Baileys, Evolution API, and every web-protocol gateway must hold a resumable login. It rests on disk as creds.json and is decrypted inside a Node process running an npm dependency tree you never audited.",
              highlights: [
                "creds.json is a portable clone of your account",
                "the npm dependency tree has plaintext custody of it",
                "leaks land in git history, backups, and image layers",
                "compromise is silent: no new-device alert ever fires",
              ],
            }}
            after={{
              label: "Accessibility-API approach",
              content:
                "WhatsApp MCP opens no WhatsApp session. The WhatsApp Desktop app keeps its own credentials in its App Store sandbox. The MCP server is a local stdio process that reads the screen.",
              highlights: [
                "no creds.json, no auth folder, nothing written to disk",
                "the only credential lives inside Apple's app sandbox",
                "no portable file to exfiltrate and resume elsewhere",
                "an attacker needs live access to that one specific Mac",
              ],
            }}
          />

          <p className="text-zinc-700 leading-relaxed mt-6">
            This is not a claim that the accessibility path is risk-free. A
            compromised Mac is still a compromised Mac, and an attacker with
            live control of it could drive the WhatsApp app while they are
            there. The difference is that there is no portable credential to
            carry away. The exposure is bound to one machine and ends when you
            clean it, instead of walking out the door in a file. It is also{" "}
            <a
              href="/t/mcp-server-production-gotchas"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              not a fit for every job
            </a>
            : it is macOS only, it depends on the WhatsApp Desktop app, and it
            sends at human speed.
          </p>
        </section>

        <section className="max-w-3xl mx-auto px-6 mt-20">
          <h2 className="text-3xl font-bold text-zinc-900 mb-4">
            Pick by what the sending account is worth
          </h2>
          <p className="text-zinc-700 leading-relaxed mb-4">
            A self-hosted gateway is still the right tool for plenty of work:
            disposable numbers, Linux and Docker deployments, outbound volume
            you have priced ban risk into. If you go that way, treat the account
            as disposable, never run your personal number on it, pin and audit
            every dependency, and actually check the linked-devices screen on a
            schedule.
          </p>
          <p className="text-zinc-700 leading-relaxed">
            But if the account that sends is the one you also use personally,
            the custody risk is not a footnote, it is the whole decision. A
            credential that clones your real WhatsApp identity should not be a
            file in the hands of an npm dependency tree. The architecture-level
            breakdown of both paths is on the{" "}
            <a
              href="/alternative/self-hosted-whatsapp-gateway-vs-accessibility-apis"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              self-hosted gateway vs accessibility APIs
            </a>{" "}
            page, and the five-minute setup for the no-credential path is on the{" "}
            <a
              href="/install"
              className="text-teal-700 underline underline-offset-2 hover:text-teal-600"
            >
              install page
            </a>
            .
          </p>
        </section>

        <div className="mt-20">
          <BookCallCTA
            appearance="footer"
            destination={CAL_LINK}
            site="WhatsApp MCP"
            heading="Not sure if your gateway is holding a credential it should not?"
            description="Book 30 minutes. We will walk through where your WhatsApp session is stored, who can read it, and whether the accessibility-API path fits your use case."
          />
        </div>

        <FaqSection items={faqItems} />

        <BookCallCTA
          appearance="sticky"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          description="Audit where your WhatsApp gateway credential lives, in 30 min."
        />
      </article>
    </>
  );
}
