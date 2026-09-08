# Forma AI — Prompt-to-Interactive UI Studio ⚡

> An intelligent, prompt-to-UI generative studio inspired by **v0.dev** and **Lovable**. Turn high-level natural language prompts into living, responsive, production-ready React components rendered live in your browser.

![Forma AI Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80)

---

## 🌟 Key Engineering Highlights

- **⚡ Real-Time Generative Streaming**: Powered by the **Vercel AI SDK** with **Google Gemini 1.5 Flash** (ultra-fast TTFT) and **OpenAI GPT-4o**. Code streams directly into an interactive live workspace as tokens arrive.
- **🛡️ Zero-Compute Client-Side Sandboxing**: Integrated with `@codesandbox/sandpack-react` running a full React 18 + Tailwind CSS compiler inside an isolated in-browser iframe. Zero server compute costs for rendering.
- **📱 Responsive Device Simulator**: Instant 1-click viewport toggling between **Desktop (100%)**, **Tablet (768px)**, and **Mobile (390px)** complete with iPhone Dynamic Island framing.
- **🎨 Multi-View Studio Workspace**: Switch seamlessly between **Preview**, **Live Code Editor**, and **Split View** (side-by-side code + preview with synchronized live updates).
- **🔑 Bring Your Own Key (BYOK) Security**: 100% client-side privacy. Users can connect their own Google Gemini or OpenAI API key saved only to browser `localStorage`.
- **🛠️ Self-Healing Error Recovery**: Sandpack compilation and runtime errors are captured in real time, offering a 1-click **"Auto-Fix with AI"** recovery pipeline.
- **📦 6 Production-Grade Starter Templates**:
  1. *SaaS Analytics & MRR Velocity Dashboard*
  2. *Modern SaaS Pricing & Tier Comparison Matrix*
  3. *Agile Kanban Sprint Board*
  4. *E-Commerce Product Showcase & Cart Configurator*
  5. *Team Access & Role Permission Matrix*
  6. *SonicAI Generative Voice & Audio Studio*
- **📥 Instant Export & Code Copy**: 1-click export to clipboard or download as a standalone `App.tsx` file ready to drop into any Next.js, Vite, or Remix project.

---

## 🏗️ Architecture & Tech Stack

```mermaid
graph TD
    User([User / Prompt]) --> UI[Forma Studio UI]
    UI -->|Streams Prompt + History + BYOK| API[/api/generate API Route]
    API -->|Vercel AI SDK streamText| LLM[Google Gemini 1.5 Flash / OpenAI GPT-4o]
    LLM -->|Token Stream| API
    API -->|SSE Text Stream| Reader[Streaming Client Reader]
    Reader -->|Code Extractor| Sandpack[Sandpack In-Browser Sandbox]
    Sandpack -->|Iframe Execution| Preview[Live Interactive Preview]
    Sandpack -->|Syntax / Runtime Errors| AutoFix[AI Auto-Fix Agent]
```

### Core Technologies
- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Engine**: [Vercel AI SDK (`ai`)](https://sdk.vercel.ai/docs), [`@ai-sdk/google`](https://www.npmjs.com/package/@ai-sdk/google), [`@ai-sdk/openai`](https://www.npmjs.com/package/@ai-sdk/openai)
- **Code Sandboxing**: [`@codesandbox/sandpack-react`](https://sandpack.codesandbox.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Motion & Polish**: [Framer Motion](https://www.framer.com/motion/), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti), [React Hot Toast](https://react-hot-toast.com/)

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Roshanlal02/forma-ai.git
cd forma-ai
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your free Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Note: You can also use the application without setting environment variables by entering your key via the in-app BYOK modal.*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💡 How to Demo to Recruiters & Hiring Managers

1. **Instant Exploration**: Click **Templates** in the top bar and select the *SaaS Analytics Dashboard* or *E-Commerce Showcase Card*. Notice how the components are completely interactive (filtering, date toggles, cart animations).
2. **BYOK Security**: Click **Set API Key** in the top bar. Point out that anyone can grab a free Google Gemini key in 10 seconds without entering a credit card, and test generation completely free.
3. **Conversational Iteration**: Type in the prompt bar:
   - *"Change the primary accent color from indigo to emerald green"*
   - *"Add an export to CSV button next to the search input"*
   - Watch the streaming update the preview in real-time.
4. **Responsive Simulator**: Switch between **Desktop**, **Tablet**, and **Mobile** viewports to demonstrate that generated components are 100% responsive.

---

## 📄 License
MIT License. Created with passion by **Roshanlal D**.
