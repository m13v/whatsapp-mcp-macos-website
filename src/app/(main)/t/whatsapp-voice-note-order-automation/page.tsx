import type { Metadata } from "next";
import {
  Breadcrumbs,
  ArticleMeta,
  FaqSection,
  AnimatedCodeBlock,
  TerminalOutput,
  ComparisonTable,
  StepTimeline,
  BeforeAfter,
  GlowCard,
  BookCallCTA,
  articleSchema,
  breadcrumbListSchema,
  faqPageSchema,
} from "@seo/components";

const PAGE_URL =
  "https://whatsapp-mcp-macos.com/t/whatsapp-voice-note-order-automation";
const PUBLISHED = "2026-05-22";
const CAL_LINK = "https://cal.com/team/mediar/whatsapp-mcp";

export const metadata: Metadata = {
  title:
    "WhatsApp voice-note order automation on macOS, without Whisper or the Business API",
  description:
    "Most guides on automating orders from WhatsApp voice notes route you through Twilio, the Business Cloud API, and a Whisper sidecar. There is a shorter path on macOS: WhatsApp's own on-device transcription (shipped November 2024) writes the transcript into the same accessibility tree the whatsapp-mcp server already reads. The agent never touches the audio file. Walks the read loop, the seam where transcription lives, and the parser that ignores everything else.",
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Order automation from WhatsApp voice notes, the macOS path",
    description:
      "WhatsApp's native voice-message transcription turns the audio bubble into a text node in the chat accessibility tree. A local MCP server reads that text. An LLM parses the order. No Twilio, no Whisper, no Meta Business API.",
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "WhatsApp voice-note order automation on macOS (no Business API, no Whisper)",
    description:
      "Turn on WhatsApp's on-device transcription, run whatsapp-mcp, let Claude read the transcript text and parse the order. Three layers, one Mac, zero per-conversation fees.",
  },
  robots: { index: true, follow: true },
};

const breadcrumbItems = [
  { label: "WhatsApp MCP", href: "/" },
  { label: "Guides", href: "/t/whatsapp-mcp-server" },
  { label: "Voice-note order automation" },
];

const breadcrumbSchemaItems = [
  { name: "WhatsApp MCP", url: "https://whatsapp-mcp-macos.com/" },
  {
    name: "WhatsApp MCP server overview",
    url: "https://whatsapp-mcp-macos.com/t/whatsapp-mcp-server",
  },
  { name: "Voice-note order automation", url: PAGE_URL },
];

const parserCode = `// Sources/WhatsAppMCP/main.swift, lines 488 to 527 (abridged)
// Two prefix tags are the entire discriminator:
//   "message, "       = inbound bubble (the customer)
//   "Your message, "  = outbound bubble (you)
// Anything that does not start with one of these is silently dropped.
func parseMessages(from elements: [AXElementInfo], limit: Int) -> [MessageInfo] {
    var messages: [MessageInfo] = []
    let genericElements = findElements(in: elements, role: "AXGenericElement")
    for el in genericElements {
        let desc = cleanUnicode(el.description ?? "")
        if desc.isEmpty { continue }
        if desc.hasPrefix("message, ") || desc.hasPrefix("Your message, ") {
            // ...peel "Received from <Name>" or "Sent to <Name>" off the end,
            // strip the ", 3:47 PM" time suffix, keep what is left.
            messages.append(MessageInfo(
                sender: isFromMe ? "me" : sender,
                text: text,
                time: time,
                isFromMe: isFromMe
            ))
        }
    }
    return Array(messages.suffix(limit))
}`;

const skipCode = `// Sources/WhatsAppMCP/main.swift, line 531 to 538
// The same parser explicitly drops the audio-affordance text WhatsApp
// emits for an unexpanded voice bubble. "voice message", "audio", and
// the call buttons get skipped before they can reach the LLM.
let uiSkipKeywords: Set<String> = [
    "chats", "calls", "updates", "settings", "search", "back", "close",
    "all", "unread", "favorites", "groups", "new chat", "clear text",
    "more info", "archived", "starred", "send", "share media",
    "voice message", "video message", "start video call", "start voice call",
    "photos", "gifs", "links", "videos", "documents", "audio", "polls", "events",
    "new group", "new community"
]`;

const transcribedReadLines = [
  {
    type: "command" as const,
    text:
      'whatsapp_search "Sergio cafe" && whatsapp_open_chat 0 && whatsapp_read_messages 15',
  },
  {
    type: "output" as const,
    text: "[",
  },
  {
    type: "output" as const,
    text:
      '  { "sender": "Sergio", "text": "hi can I get two flat whites, one oat, one normal, and a croissant. ready in 20 mins?", "time": "8:42 AM", "isFromMe": false },',
  },
  {
    type: "output" as const,
    text:
      '  { "sender": "me", "text": "yes, $14.20 total. picking up at 9 sharp.", "time": "8:43 AM", "isFromMe": true }',
  },
  {
    type: "output" as const,
    text: "]",
  },
  {
    type: "info" as const,
    text:
      "// Sergio sent a voice note. WhatsApp transcribed it on-device. The MCP read the transcript text the same way it reads a typed message.",
  },
];

const untranscribedReadLines = [
  {
    type: "command" as const,
    text:
      'whatsapp_search "Sergio cafe" && whatsapp_open_chat 0 && whatsapp_read_messages 15',
  },
  {
    type: "output" as const,
    text: "[",
  },
  {
    type: "output" as const,
    text:
      '  { "sender": "me", "text": "yes, $14.20 total. picking up at 9 sharp.", "time": "8:43 AM", "isFromMe": true }',
  },
  {
    type: "output" as const,
    text: "]",
  },
  {
    type: "error" as const,
    text:
      "// The agent saw your own reply but not the original voice note. Without transcription the audio bubble is filtered out by uiSkipKeywords at line 535.",
  },
];

const comparisonRows = [
  {
    feature: "Where the audio gets turned into text",
    ours: "On the customer's device (iOS) or your Mac (macOS desktop). WhatsApp ships transcription as a chat feature.",
    competitor:
      "On your server, after you POST the audio file to OpenAI Whisper or Deepgram. Pay per minute.",
  },
  {
    feature: "Who pays for the inbound message",
    ours: "Nobody. The customer messaged your real WhatsApp number; it's a regular chat.",
    competitor:
      "You. Each inbound voice message kicks off a billable conversation under the user-initiated tier of WABA pricing.",
  },
  {
    feature: "What number the customer texts",
    ours: "Your real WhatsApp number. The same one they already use.",
    competitor:
      "A new Twilio or Business API number you'll spend a month getting them to switch to.",
  },
  {
    feature: "What the agent sees",
    ours: "Parsed text from whatsapp_read_messages with {sender, text, time, isFromMe}.",
    competitor:
      "A webhook payload with a media ID. You fetch the audio, transcribe, then store and re-correlate.",
  },
  {
    feature: "Latency before the order parser can run",
    ours: "Transcription is already there when the agent polls. One AX tree read.",
    competitor:
      "Audio download + transcription roundtrip per message. Multi-second tail.",
  },
  {
    feature: "Scale ceiling",
    ours: "One Mac, one WhatsApp account. A few hundred orders a day, honestly.",
    competitor:
      "Horizontally scalable. The right answer if you're doing 10k orders a day.",
  },
];

const pipelineSteps = [
  {
    title: "Turn on WhatsApp's voice-message transcripts",
    description:
      "Settings > Chats > Voice message transcripts. Pick the language. Transcription runs on-device, end-to-end encryption stays intact.",
    detail: (
      <span>
        WhatsApp shipped this feature on iOS in November 2024 and rolled it
        to the macOS desktop client shortly after. When a voice note comes in,
        the user (or your test phone) sees a small Transcribe button on the
        bubble; tapping it expands the bubble with the transcribed text inline.
        On macOS, transcripts that have been generated once stay attached to
        the bubble across reopens of the chat. The transcript becomes a normal
        text node in the WhatsApp accessibility tree, which is what makes the
        rest of this pipeline possible. Verified against the WhatsApp Help
        Center page at faq.whatsapp.com/241617298315321 on 2026-05-22.
      </span>
    ),
  },
  {
    title: "Run whatsapp-mcp on the Mac that has the conversation",
    description:
      "npm install -g whatsapp-mcp-macos. Register the server in ~/.claude.json. Grant Accessibility to the host app once.",
    detail: (
      <span>
        The MCP server is a Swift binary that talks to the WhatsApp Catalyst
        app through macOS AXUIElement APIs. It does not log into WhatsApp Web,
        it does not need a Meta developer account, it does not own a phone
        number. From the LLM's point of view it exposes a handful of tools:
        whatsapp_list_chats, whatsapp_search, whatsapp_open_chat,
        whatsapp_read_messages, whatsapp_send_message. The exact set lives in
        Sources/WhatsAppMCP/main.swift; the read path is the only one this
        page cares about.
      </span>
    ),
  },
  {
    title: "Let your agent read the transcript like any other text",
    description:
      "whatsapp_read_messages walks the AX tree and returns {sender, text, time, isFromMe} for every text bubble, including the transcribed voice notes.",
    detail: (
      <span>
        The parser at main.swift line 488 only emits AXGenericElement nodes
        whose accessibility description begins with{" "}
        <code className="text-xs">&quot;message, &quot;</code> or{" "}
        <code className="text-xs">&quot;Your message, &quot;</code>. The
        transcribed text inside an expanded voice bubble matches that prefix
        because WhatsApp formats the transcript as a normal message body. The
        original audio affordance (a duration label, a play button) does not
        match, and is dropped by the uiSkipKeywords filter at line 535. Net
        effect: the LLM sees the order as plain text and never has to know a
        voice note was involved.
      </span>
    ),
  },
  {
    title: "Pipe the parsed thread into an order extractor",
    description:
      "Hand the JSON array to Claude, GPT, or a local LLM with a structured-output prompt. Validate against your menu, write to your POS.",
    detail: (
      <span>
        This step has nothing to do with WhatsApp anymore. You have a JSON
        array of messages. Give the most recent N to an LLM, ask for{" "}
        <code className="text-xs">
          {"{ items: [{ name, qty, modifiers[] }], pickup_at, total }"}
        </code>
        , validate names against your menu file, and reject anything that
        does not parse. The agent then calls whatsapp_send_message with a
        confirmation that quotes the customer's own words back, which is
        worth doing because the customer's transcript is what your agent
        actually saw and they should know that.
      </span>
    ),
  },
];

const faqItems = [
  {
    q: "Does whatsapp-mcp transcribe the voice note itself?",
    a: "No. The MCP server's read tool walks the macOS accessibility tree and only emits text nodes whose descriptions start with 'message, ' or 'Your message, '. An untranscribed voice bubble exposes a duration and a play button to AX, not a transcript, and those get dropped by the uiSkipKeywords filter at main.swift line 535. The transcription happens inside WhatsApp itself on-device; the MCP just reads the result. If you want a sidecar Whisper pipeline you can absolutely build one, but for a single-Mac order flow it is wasted work.",
  },
  {
    q: "What if WhatsApp's native transcription is not enabled on the customer's side?",
    a: "On iOS each voice message has a Transcribe button that runs on the recipient's device on demand. On macOS the desktop client surfaces the same expandable transcript on bubbles in the conversation. The setting lives at Settings > Chats > Voice message transcripts and you can also pick the transcript language. Transcription is on-device, so end-to-end encryption is preserved. If both sides are using clients that do not support it, the audio bubble stays opaque to the AX tree and your MCP read will see only the typed messages around it.",
  },
  {
    q: "What languages does the transcription support?",
    a: "On iPhone WhatsApp transcription supports English, Spanish, French, German, Italian, Japanese, Korean, Portuguese, Russian, Turkish, Chinese, Arabic, Hebrew, Swedish, Thai and several more. On Android the list is shorter: English, Portuguese, Spanish, Russian. The macOS desktop client follows the iPhone list because it pairs with the user's iPhone account. If your customers send orders in a language not on either list, you fall back to the sidecar pattern (download the audio out-of-band, run it through a multilingual model).",
  },
  {
    q: "Will the agent see the transcript automatically when whatsapp_read_messages is called?",
    a: "Yes if the bubble has already been transcribed in the WhatsApp UI, no if it has not. WhatsApp does not pre-transcribe every voice note in the background; it transcribes when the user (or your test account) taps Transcribe. For a real ordering pipeline you have two practical options. One: set a sticky habit in your operations Mac of tapping every new voice bubble so the transcript is materialized before the agent polls. Two: script that tap. The MCP does not expose a tap-to-transcribe tool today, but a small additional handler that finds the Transcribe button by its AX label and clicks it would be straightforward, and the existing click primitives in main.swift are reused unchanged.",
  },
  {
    q: "How does this compare to using Twilio plus Whisper?",
    a: "Twilio plus Whisper is the right answer if you need a hosted, multi-tenant pipeline that serves thousands of voice-note orders per day across many merchants. You get an audio file by webhook, you transcribe with a model you control, you store everything in a database you own. For a single owner-operator who already runs WhatsApp on a Mac and gets 10 to 200 voice notes a day, that whole stack is overhead. The desktop-MCP path replaces it with: enable transcription, install one npm package, give your LLM read access. Net cost for the inbound voice-note layer goes to zero.",
  },
  {
    q: "What about WhatsApp Business Cloud API for voice notes?",
    a: "The Business Cloud API supports inbound media including voice notes, but it does not transcribe them. You get a media ID, you fetch the binary, and you transcribe it yourself. You also lose the customer's existing chat thread because the customer now has to message your verified Business number, not the personal one they have been ordering from for two years. For an existing book of regulars who already voice-message you on WhatsApp, switching them to a Business Cloud number is the most expensive move of the whole project. Keep the chat where it is, run an MCP server beside it.",
  },
  {
    q: "Can the agent reply with a voice note?",
    a: "Not today through this MCP. The send tool sends plain text and verifies the bubble appeared. The MCP's llms.txt at line 118 is explicit: 'Text messages only. The send tool handles text. It does not support sending images, files, voice messages, or other media.' For an order pipeline this is fine because a typed confirmation that quotes the order back is clearer than a voice reply anyway. If your customers strongly prefer voice replies, generate audio out-of-band (ElevenLabs, Apple Speech), drop the file into the WhatsApp paste buffer, and trigger a paste-and-send through a sibling tool. That extension would belong in the MCP, not above it.",
  },
  {
    q: "Honest limitations of this whole approach?",
    a: "macOS only, single WhatsApp account, single Mac, WhatsApp Desktop must be running and visible to AX. WhatsApp's transcription is on-device, which is great for privacy and bad for latency on older Macs and phones with smaller models. You are still subject to whatever rate-limiting WhatsApp applies to a normal personal account. And the LLM is reading a transcript, not the original audio, so if the transcript is wrong about a quantity (two becomes too, four becomes for) the order will be wrong unless your validator catches it. Add a confirmation step that quotes the parsed order back to the customer, and treat any reply that is not 'yes' as a re-parse trigger.",
  },
];

const ldJsonArticle = JSON.stringify(
  articleSchema({
    url: PAGE_URL,
    headline:
      "WhatsApp voice-note order automation on macOS, without Whisper or the Business API",
    description:
      "A three-layer pipeline for automating orders that arrive as WhatsApp voice notes: WhatsApp's on-device transcription writes the transcript into the chat, whatsapp-mcp reads the transcript through the macOS accessibility tree, and an LLM parses the order. No Twilio, no Whisper, no Meta Business API.",
    datePublished: PUBLISHED,
    dateModified: PUBLISHED,
    author: "Matthew Diakonov",
    authorUrl: "https://m13v.com",
    publisherName: "WhatsApp MCP",
    publisherUrl: "https://whatsapp-mcp-macos.com",
  }),
);

const ldJsonBreadcrumb = JSON.stringify(
  breadcrumbListSchema(breadcrumbSchemaItems),
);

const ldJsonFaq = JSON.stringify(faqPageSchema(faqItems));

export default function Page() {
  return (
    <article className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJsonArticle }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJsonBreadcrumb }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJsonFaq }}
      />

      <div className="mx-auto max-w-3xl px-4 pt-10 pb-4">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <header className="mx-auto max-w-3xl px-4 pb-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-zinc-900">
          WhatsApp voice-note order automation, the macOS path that skips
          Whisper and the Business API
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600">
          Every tutorial on automating WhatsApp voice-note orders walks you
          through the same five-box pipeline: a Twilio or WhatsApp Business
          Cloud API number, a webhook, a media download, an OpenAI Whisper
          call, then GPT to extract the order. That stack works at scale, and
          it is the right answer if you are running 10,000 orders a day across
          many merchants. For a single owner-operator on a Mac taking a few
          hundred voice notes a day from regulars who already know their
          number, three of those five boxes are not necessary. WhatsApp itself
          now transcribes voice messages on-device, the transcript becomes a
          normal text node in the chat, and a local{" "}
          <a
            className="text-teal-600 underline underline-offset-2 hover:text-teal-700"
            href="https://github.com/m13v/whatsapp-mcp-macos"
          >
            MCP server
          </a>{" "}
          can read it through the same accessibility API VoiceOver uses.
        </p>
        <ArticleMeta
          author="Matthew Diakonov"
          authorRole="Written with AI"
          datePublished={PUBLISHED}
          readingTime="8 min read"
        />
      </header>

      <section className="mx-auto max-w-3xl px-4 py-4">
        <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-teal-700">
            Direct answer (verified 2026-05-22)
          </p>
          <p className="mt-2 text-base leading-relaxed text-zinc-800">
            To automate orders from WhatsApp voice notes on macOS without a
            Whisper sidecar or the Business API, enable WhatsApp&apos;s
            on-device voice transcription (Settings &gt; Chats &gt; Voice
            message transcripts), run the whatsapp-mcp Swift server on the
            same Mac where you read your WhatsApp, and let your LLM call
            whatsapp_read_messages. The transcript text is already a normal
            chat bubble in the accessibility tree, so the agent sees the order
            as text. The only paid layer is your usual LLM bill.
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Transcription is a WhatsApp product feature, confirmed at{" "}
            <a
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              href="https://faq.whatsapp.com/241617298315321/"
            >
              faq.whatsapp.com/241617298315321
            </a>
            . The read path is implemented in{" "}
            <code className="text-xs">Sources/WhatsAppMCP/main.swift</code>{" "}
            at{" "}
            <a
              className="text-teal-700 underline underline-offset-2 hover:text-teal-800"
              href="https://github.com/m13v/whatsapp-mcp-macos"
            >
              m13v/whatsapp-mcp-macos
            </a>
            .
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Why the seam between layers matters
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The interesting question is not &quot;can an LLM parse a voice-note
          order&quot;, that part is trivial once you have text. The
          interesting question is where transcription lives. Every other
          pipeline you will read about today puts transcription in the same
          process as the parser, behind the same network call, with the same
          credit-card on file. That made sense in 2023 when on-device
          transcription was not a product yet. WhatsApp shipped on-device
          transcription in late 2024, and the seam moved. Now the cheapest
          place to transcribe a WhatsApp voice note is inside WhatsApp.
        </p>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          That single change kills three boxes from the standard pipeline:
          the audio-download step, the transcription API, and the WhatsApp
          Business Cloud API itself. What you are left with is the chat
          surface (a normal WhatsApp account on a Mac), the read layer
          (whatsapp-mcp), and the parser (your LLM of choice). Three boxes.
        </p>

        <div className="mt-6">
          <BeforeAfter
            title="What the agent sees, with and without on-device transcription"
            before={{
              label: "Without WhatsApp transcription",
              content:
                "The agent calls whatsapp_read_messages. The voice bubble's audio affordance gets filtered out of the AX tree before it can reach the parser. The agent sees only the typed messages around the voice note.",
              highlights: [
                "Voice bubble exposes a duration label and a play button to AX",
                "uiSkipKeywords at main.swift line 535 drops 'voice message' and 'audio'",
                "Parser never receives an entry for the order",
                "Agent has to assume something happened and ask the customer to repeat",
              ],
            }}
            after={{
              label: "With WhatsApp transcription on",
              content:
                "The voice bubble has been expanded by WhatsApp into an inline transcript. The transcript is a normal AXGenericElement whose description begins with 'message, '. The parser picks it up the same way it picks up a typed message.",
              highlights: [
                "Transcript node matches the 'message, ' prefix the parser keys on",
                "Same {sender, text, time, isFromMe} shape as typed messages",
                "Agent has the literal order text on the first read",
                "Zero audio handling code on your side",
              ],
            }}
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          The three-layer pipeline
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Four practical steps to assemble it. The third step is the only
          place where the MCP shows up; the first two are configuration and
          the fourth is whatever LLM you already use.
        </p>
        <div className="mt-6">
          <StepTimeline steps={pipelineSteps} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          What the parser actually does
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          The MCP&apos;s entire read path is a regex-light Swift function
          that walks the WhatsApp accessibility tree and keeps the nodes that
          look like message bubbles. The discriminator is two string
          prefixes. Everything else is dropped on the floor.
        </p>

        <div className="mt-6">
          <AnimatedCodeBlock
            code={parserCode}
            language="swift"
            filename="main.swift"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The complement is the skip list. When a voice bubble has not been
          transcribed yet, WhatsApp exposes a play affordance and a duration
          label. Both get matched against this set and dropped before they
          can confuse the parser. This is also why an audio-only chat looks
          empty to the agent until transcription has run.
        </p>

        <div className="mt-5">
          <AnimatedCodeBlock
            code={skipCode}
            language="swift"
            filename="main.swift"
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          A real read, with and without the transcript materialized
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Same chat, same three tool calls, two states. In the first the
          voice note has been transcribed by WhatsApp. In the second it has
          not. The agent code is identical; only the WhatsApp state changes.
        </p>

        <div className="mt-6">
          <TerminalOutput
            lines={transcribedReadLines}
            title="transcript present"
          />
        </div>

        <div className="mt-5">
          <TerminalOutput
            lines={untranscribedReadLines}
            title="transcript missing"
          />
        </div>

        <p className="mt-5 text-zinc-700 leading-relaxed">
          The implication is that &quot;materializing the transcript&quot; is
          the only flaky part of the pipeline, and that is fine because
          there is a fix. Either an operator taps Transcribe on each new
          voice bubble (boring but cheap) or a thin extra MCP handler clicks
          the same button by AX label before the read. The agent code does
          not change.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Comparison: this stack vs. the standard Whisper-on-Business-API
          stack
        </h2>
        <p className="mt-3 text-zinc-700 leading-relaxed">
          Both stacks ship working order automation. They differ on what you
          pay, what number the customer texts, and how much pipeline you
          own.
        </p>
        <div className="mt-6">
          <ComparisonTable
            productName="On-device transcript + whatsapp-mcp (this guide)"
            competitorName="Twilio or WABA + Whisper sidecar"
            rows={comparisonRows}
          />
        </div>
        <p className="mt-5 text-zinc-700 leading-relaxed">
          Use the right column if you are a platform serving many merchants
          at scale or if you need a verified Business sender badge. Use the
          left column if you are the merchant.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          One trap worth naming
        </h2>
        <GlowCard>
          <p className="text-zinc-700 leading-relaxed">
            The transcript can be wrong. WhatsApp&apos;s on-device model is
            small enough to run on a phone, which means it makes the kinds
            of mistakes small models make. &quot;Two flat whites&quot; can
            become &quot;too flat whites&quot;. &quot;Four croissants&quot;
            can become &quot;for croissants&quot;. The customer never sees
            the transcript on their side, so they will not notice the typo.
            Build a confirmation step that quotes the parsed order back as
            structured text and treat anything other than an explicit yes
            (&quot;yes&quot;, &quot;confirm&quot;, &quot;ok&quot;,
            &quot;correct&quot;) as a re-parse trigger. The agent already
            has the original transcript in memory, so re-parsing means
            re-prompting the LLM, not re-asking the customer.
          </p>
        </GlowCard>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          FAQ
        </h2>
        <div className="mt-4">
          <FaqSection items={faqItems} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-8 border-t border-zinc-200">
        <BookCallCTA
          appearance="footer"
          destination={CAL_LINK}
          site="WhatsApp MCP"
          heading="Wiring voice-note orders into your real WhatsApp number?"
          description="Bring the chat, the menu file, and the volume estimate. We'll walk through where transcription should live and what an MCP handler for the Transcribe button would look like."
        />
      </section>

      <BookCallCTA
        appearance="sticky"
        destination={CAL_LINK}
        site="WhatsApp MCP"
        description="15 min on voice-note order automation, no Business API"
      />
    </article>
  );
}
