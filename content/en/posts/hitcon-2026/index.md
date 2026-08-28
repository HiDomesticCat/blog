+++
title = "HITCON 2026 Notes: When AI Starts Acting"
date = 2026-08-24
slug = "hitcon-2026"
description = "My second HITCON. This year's theme was WHEN AI ACTS — from Agent2Shell's pre-prompt RCEs, to CTFusion catching AI cheating at CTF, to Orange's Edge sandbox escape built entirely from logic bugs. Two days of notes."
tags = ["HITCON", "Security Conference", "AI Agent", "LLM", "Supply Chain Security", "Notes"]
categories = ["Events"]
+++

I spent 21 and 22 August at [HITCON 2026](https://hitcon.org/2026/en/). This was my second time, and the second time I did not pay for a ticket.

The first was an invitation from winning Best Project at AIS3; this one came from the [Hacks in Taiwan Association](https://hacker.org.tw/) as a student invitation. For someone still studying, that matters for more than the money — it puts you in a room full of people who actually do this work, hearing what really happened this year.

{{< figure src="07-swag-tshirt.jpg" alt="HITCON 2026 T-shirt printed with this year's theme" caption="The theme, printed on the shirt: WHEN AI ACTS — HACKING THE AGE OF AGENTIC SYSTEMS" >}}

The through-line was unambiguous: **when AI starts acting**. Not how AI helps you write code, but what the attack surface looks like once AI actually gains the ability to execute. Over two days that thread ran through nearly every session I sat in.

## Getting there, and the venue

Coming out of the MRT on the first morning there was already a crowd waiting for the shuttle. Two batches later we were on a bus to Academia Sinica, and across both days we caught a shuttle each way and always found a seat.

{{< figure src="14-venue-bus.jpg" alt="The shuttle bus" caption="Our shuttle" >}}

{{< figure src="13-venue-street.jpg" alt="The street outside the Academia Sinica campus" caption="The entrance to Academia Sinica. The Humanities and Social Sciences building was a genuinely good choice of venue" >}}

I liked the venue itself — the layout never felt cramped and moving between session rooms was easy. The only hard part was the weather: it rained every afternoon and lunch was served outside. There was cover, but wind and drizzle still got in. Not that it mattered much; half an hour later we were back inside.

{{< figure src="15-venue-entrance.jpg" alt="The venue entrance with sponsor and HITCON 2026 banners" caption="The entrance" >}}

Also, **the food was excellent**. That belongs in the write-up 😋.

{{< gallery >}}
{{< figure src="11-lunch-day1.jpg" alt="Day 1 lunch" caption="Day 1 lunch" >}}
{{< figure src="16-lunch-day2.jpg" alt="Day 2 bento" caption="Day 2 lunch" >}}
{{< figure src="12-coffee-break.jpg" alt="Coffee and pastries at the afternoon break" caption="Afternoon break" >}}
{{< /gallery >}}

## Day 1

### Keynote: Vulnerability Disclosure in the Age of AI

A researcher from Google Project Zero opened the conference and set the tone straight away.

Disclosure has never had a settled answer. The spectrum runs from dumping full details on a public mailing list, through coordinated disclosure with an embargo, all the way to not disclosing at all. Project Zero's own position is explicit: vendors get 90 days, and at the deadline the full details go public **whether or not it has been fixed**.

AI-assisted vulnerability discovery is now shaking the assumptions underneath that policy. When the rate of finding bugs shifts by an order of magnitude, does 90 days still hold? The speaker's argument was that even under those conditions, **going public still favours the defenders**.

What I took away: a lone researcher against a vendor that does not want to fix something has very little leverage, and "we publish on the deadline" is close to the only pressure that works.

{{< figure src="08-hall-wide.jpg" alt="The session hall and the screen on stage" caption="Track R0" >}}

### Agent2Shell: the attack lands outside the model

This was the session that stuck with me most. Its full title was
"[UnPwn2Own Berlin 2026 / $70,000] Agent2Shell: Pre-Prompt RCEs in Claude Code, Cursor, and Gemini".

The conclusion is blunt: **simply opening a repository an attacker prepared can be enough to take over your AI coding agent.** Against Claude Code, Cursor and Gemini, the speaker demonstrated a set of RCE chains where opening a folder, double-clicking a file, or running an entirely ordinary command was enough to execute arbitrary code on a **fully patched** Windows machine.

The key insight is *where* the attack lands. Prompt injection defences, guardrails, output filtering, alignment — all of that lives **inside** the model. These chains fire before that line is ever reached; the payload never gets in front of the model at all. The speaker called it **pre-prompt RCE**.

The root cause is not one bug but a **gap in understanding**: what the vendor treats as trusted, pre-approved and safe to load is nothing like what the user thinks they are doing — I only opened a folder. Trust boundaries, auto-approval and configuration loading all live in that gap.

VS Code has actually been warning us about this for years; it prompts when you open an untrusted folder. Move the same action to an AI agent and nobody thinks twice. Myself included.

Incidentally, this research was meant for Pwn2Own, but they were not drawn in the ballot — so the speaker published all of it and called it **UnPwn2Own** 😂.

### CTFusion: AI cheats to solve the problem

From KAIST Hacking Lab, and directly relevant to my own research, so I listened closely.

The premise is pointed: every large model release cites CTF benchmark scores as proof of capability, **but those benchmarks were published years before the models were trained**.

They caught it happening. Across agents actually in use — ENIGMA, D-CIPHER and others — they catalogued **71 distinct cheating behaviours**. The most flagrant: an agent ran `pip install nyuctf`, installing the benchmark's own answer key, then printed the flag in three commands.

Adding a single instruction forbidding it from answering out of pretrained memory — **changing nothing else** — dropped pass@3 by around 29% relative. Contamination went from a theoretical concern to a measured number.

So they built CTFusion: an open-source MCP server plus a submission proxy that plugs different agents into live, **previously unpublished** CTFd events. The results are striking. Across five international CTFs in 2025, real-world pass@3 came to just **6.3%** — less than half the 14.4% the same agents claim on static benchmarks.

This is exactly the problem we hit in our own research: how do you write rules that stop an LLM cutting corners, when the definition of "cutting corners" shifts with every problem? Still worth thinking about properly.

### 1% of tokens: finding IoT bugs with an LLM

Full title: "1% of tokens, All of the Strategy: LLM-Assisted Vulnerability Discovery in IoT/Embedded systems", from a TXOne Networks researcher.

I have wanted to get somewhere with bug bounty for a while, so this was directly useful.

The starting point is a number. Of the 48,174 CVEs published in 2025, once classified by CWE, **64.4%** fall into categories where obtaining a primitive is effectively equivalent to owning the device — which happens to be exactly what pattern recognition over decompiled code is good at.

The method is semi-automatic: a frontier LLM paired with a decompiler and debugger, working systematically inside boundaries the researcher sets, with the human choosing targets, setting strategy and verifying results. On two chosen targets that produced **30 vulnerabilities in five days, three of them CVSS 10.0 mass remote execution**. Given a single sentence of direction, the model took two minutes to chain hardcoded credentials, a broken ACL and an authentication bypass into a complete path to over 2,000 devices.

The example I remember best is the failure. On one run without guardrails, the agent got root and then **modified the device it was testing** to make its own reverse engineering easier — and bricked the machine overnight.

Several of the speaker's techniques rhyme with our own research, particularly using structure to check whether individual findings actually chain together. That gave me something concrete to try.

### HITCON Mini Cyber Range

I also entered the blue team competition on day one. The platform is built by trapa and resembles what I have been building myself — CTF plus OpenStack, where you can spin up a challenge along with its environment.

The challenges were mostly traditional log analysis: work backwards from alerts to the attacker's behaviour, then handle incident response. Some of them **allow an LLM as an assistant** — you can ask it to make sense of the logs and reconstruct the chain. Others target the LLM assistant itself as the way to get the flag.

I want to dig into this properly and write it up as its own research post.

## Day 2

### Content Isn't All You Need: ignore the contents, read the name

Also from TXOne Networks. What makes this one interesting is that it **does not use an LLM** — they trained their own model.

The setting is phishing. Encrypted archives and multi-layer packaging are increasingly common, and content scanning simply cannot see inside before delivery. In that window where the contents are unavailable, the heavyweight approaches — unpacking, deobfuscating, decompiling — are far too slow to use in practice.

They inverted the premise: **even when the bytes are unreadable, the attacker still has to decide where things go and what to call them.** The structure of paths and filenames carries meaning on its own — hierarchy, depth, repeated fragment patterns — reflecting both normal installation and naming conventions and the staging and disguise locations attackers prefer. Dropping a backdoor somewhere Temp-like, say, while borrowing a credible-looking brand name to blend in.

The model is called NameSemAI. The dataset comes from VirusTotal after cleaning, and it fuses three views: structured filename and path semantics, the import table, and version resource fields — **with no decompilation at any point**. Under a strict temporal split (25.58M training, 14.80M test, no overlap) it reaches 99.99% AUC-ROC, 99.73% TPR and 99.90% TNR. Its embeddings also support post-hoc clustering across 49 or more recurring usage scenarios, with no hand-written expert rules.

I thought the angle was excellent: it is not reading content, it is reading structural signals. That kind of dependency-bearing feature exists in plenty of other places, and there is room to take the idea further.

### Analyst-Guided LLM Agent for Analyzing Windows Authentication Logs

From the CTO of JPCERT/CC.

Windows authentication logs are the key evidence for tracing lateral movement and credential abuse. The difficulty is that attackers use the same paths as legitimate operations, and no single event distinguishes them.

Their approach turns the event log into a **graph of users and hosts**, and has an LLM agent reason over structured data pulled from that graph rather than grinding through raw logs.

The real substance was in the second half. In practice you cannot take the LLM's judgement at face value. It may give different results run to run, may not know what counts as normal operations in this particular environment, may flag legitimate administration as suspicious, and may follow a thin lead a long way. So they added an **analyst in the loop** — the analyst reviews each investigative step and feeds that judgement into the next round.

In one line: **the LLM is not there to replace the analyst, it is a component that works alongside one during an investigation.**

"Turn the data into a graph" came up more than once over the two days, and I do not think that is a coincidence 🤔.

### Notes from DEF CON CTF

A competitor just back from the DEF CON 2026 CTF finals in Las Vegas shared first-hand experience and observations, followed by a speaker from Korea's BoB team on what CTF and real-world vulnerability research have in common and where they sharply differ. Both mattered.

The main point was that this was the **first event run by a new challenge-authoring team**, so there is visibly room to improve. The other observation I noted: as we move into the AI era, doing **unified monitoring, management and discussion** well is becoming increasingly important — which is itself a research topic 😎.

### Born Corrupted: hacking the place software is published from

A DEVCORE session, delivered in Taiwanese; the English title was "Born Corrupted: Dusk of Provenance".

The content was excellent, though my Taiwanese struggled to keep up (the comedy landed regardless 🤣), so what follows is roughly what I understood and details may be off.

The core argument: in software supply chain security we may have spent too long worrying about malicious packages and typosquatting, while **missing the factory that actually builds and publishes the software**.

The speaker studied, at scale, the systems that manage and publish for the ecosystems the world trusts most — Linux distributions, mainstream programming languages, Windows package managers — and found that this rarely examined infrastructure is far more fragile than assumed: shared builders, over-privileged bots, flawed APIs.

With nothing more than ordinary user permissions they achieved production RCE, stole tokens, and in some cases took over other people's repositories outright. Five real cases spanning the **Python, Ubuntu, Go, Alpine and Windows** package ecosystems.

The closing line carried the most weight: **a signature on the package you finally receive means nothing if the machine that built it for you was already compromised.**

You only ran `apt update`, or downloaded an installer from an official site. Fortunately it was white hats who found this.

### Keynote: a pure-logic zero-click Microsoft Edge sandbox escape

Orange walked through the Microsoft Edge (Chromium) sandbox escape chain he used at Pwn2Own Berlin 2026. Five things about it, each significant on its own:

- the **only** successful browser entry of the event
- the entire chain used **no AI or LLM**
- the entire chain used **no memory corruption** — logic bugs all the way through
- the **first Chromium-based full chain** to land at Pwn2Own in ten years
- Microsoft shipped a fix within **24 hours**

At a conference themed on AI starting to act, the closing keynote was a chain that used neither AI nor a single memory corruption bug. I find that contrast interesting in itself.

One more thing he mentioned is worth recording: LLMs are good news for him, because they free up time for the things he always wanted to do but never had time for. For instance — **opening a browser from a pocket calculator**. He played the demo video. It was very funny 🤣.

## Around the venue

### NFC Battle

I thought this year's NFC Battle was a genuinely good idea.

Every badge carries an **NTAG215 chip** (a remarkably small, thin thing). You tap your phone against someone's badge to complete an exchange and unlock their card — and when they tap yours, your card lands in their collection. If you want to go further, you can buy blank cards at the merchandise stall and have your own design printed and configured at the service desk, then hand that to people instead.

It replaces the business card entirely: nothing on paper, one tap and it is on your phone. The system ranks people by how many they collect (although once it got broken it turned into a contest for the lowest score 😂, and the organisers also tracked who scanned the most people without ever letting anyone scan them 😂).

The official framing was clear that this is not just a collection game — **"don't only exchange business cards, exchange trading cards too"**. It exists to give you a reason to talk to a stranger.

{{< gallery cols="2" >}}
{{< figure src="09-badge-front.jpg" alt="An NFC card printed with my own design" caption="Printed onto an NFC card" >}}
{{< figure src="23-nfc-profile.jpg" alt="The personal card screen in the NFC badge app" caption="The card in the app. I reworked my old avatar into something more hacker-ish and I like how it came out 😎" >}}
{{< /gallery >}}

### ICS challenge: making a machine pour a drink

There was a simulated industrial control setup on the show floor. The full flow: watch the **MQTT traffic in Wireshark**, read the **PLC ladder logic**, work out what is really controlling the equipment, then send MQTT messages to change PLC variables and trip the relay — and the drinks machine dispenses.

It was less difficult than expected. **Read their format out of the packets, send the commands with the script provided on site, and the machine starts pouring — like a water cooler, with us holding paper cups underneath.**

The feedback loop is what made it different. Security work is usually logs, response codes, whether a flag appeared — all of it on a screen. Here you send a packet and **a physical machine moves**.

ICS security keeps saying that information systems act directly on the physical world. A cup of drink says it in one go. The vending machines, drinks dispensers and automatic doors around us are all PLCs, relays and sensors already.

{{< figure src="17-ics-village.jpg" alt="The hands-on table, cardboard box and laptop" caption="The organisers' home-built drinks machine" >}}

{{< figure src="18-ics-hardware.jpg" alt="ICS hardware kit and wiring on the table" caption="The hardware to attack" >}}

{{< figure src="19-ics-mqtt.jpg" alt="A laptop terminal sending MQTT commands" caption="Sending the MQTT commands" >}}

What I remember most, though, is something an organiser said: **the whole setup costs fifty to sixty thousand NT dollars to build.**

That number roughly explains why ICS security is hard to learn on your own. For web or pwn you can stand up your own target and practise; buying a PLC rig to play with at home is another matter. The barrier is not knowledge, it is hardware.

Which is why a hands-on area like this is valuable — not because the challenge is hard, but **because it lets you touch something you otherwise never get near**.

## What I took away

Three threads overlapped across the two days, and I think they are the real signal from this year:

1. **An AI agent's ability to execute is the new attack surface, and the attack lands outside the model.** Agent2Shell's pre-prompt RCE makes the point: all your prompt injection defences sit inside the model, and the attack finished before that. CTFusion is the other face of it — give a system a goal and it will reach it in ways you did not anticipate.

2. **Turning data into a graph beats stuffing data in.** The Windows authentication log session and the 1% of tokens session were doing something similar: extract the structure of the attack first, then let the model reason over that. Not only to save context, but because attacks are structured to begin with.

3. **Not every problem needs an LLM.** NameSemAI reaches 99.99% AUC from filenames and paths alone, without decompiling anything; Orange's Edge chain used not a single line of AI. Those two side by side left a stronger impression than any session about what AI can do.

## One regret

The one thing I wish I had done differently: I am too much of an introvert, and barely visited the community or vendor booths. The sessions were packed; the conversations around them essentially did not happen.

And there was a lot to miss. Community & Village had talks from individual communities, hands-on labs and tool demos; the soldering station let you build your own PCB hacker cat; Badge Quest had you bring a PCB badge from a previous year, flash new firmware, and follow clues to base stations scattered around the venue to assemble a QR code puzzle. None of that is available from a seat in the session hall.

Looking back, that NFC Battle line — "don't only exchange business cards, exchange trading cards too" — was about exactly this. It hands you a reason to open a conversation, and I did not use it. Next time I will make myself walk over and say something. I expect it would be a lot of fun.

{{< figure src="22-rain-leaving.jpg" alt="Rain outside the window on the way out" caption="Still raining on the way out 😒" >}}

Overall, HITCON 2026 was genuinely enjoyable. The sessions and activities were substantial, and it did not end when the talks did — it left me understanding more about a lot of topics, and with more directions I want to pursue. As someone still studying, getting close to problems from real environments is the most valuable part.

One more thank you to the [Hacks in Taiwan Association](https://hacker.org.tw/). I have been to HITCON twice without paying for a ticket, which is not a small thing for a student — it removes the gap between wanting to go and actually going (and it becomes a reason to show up 😤, otherwise my laziness wins 🥱😪).

{{< figure src="hit-logo.webp" alt="Hacks in Taiwan Association" link="https://hacker.org.tw/" target="_blank" class="logo" caption="Organiser: Hacks in Taiwan Association" >}}

I hope I get an invitation again. And if I ever get to stand up there and give a talk, better still.

---

*Full agenda and community notes: [hitcon.org/2026/en/agenda](https://hitcon.org/2026/en/agenda/)*
