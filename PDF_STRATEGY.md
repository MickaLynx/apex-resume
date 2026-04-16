# PDF Generation Strategy
# Cost: 0 tokens

**1. PDF Generation:** Use **Puppeteer** (or Playwright) running on the server. It offers the highest fidelity for complex HTML/CSS layouts, making it superior to `@react-pdf/renderer` for highly styled resumes.

**2. Template Design:** Prioritize **semantic HTML and CSS** (using CSS Grid/Flexbox). For ATS compatibility, ensure clear headings, standard section titles, and avoid complex graphics or text boxes.

**3. Client vs. Server:** **Server-Side Generation** is mandatory. Client-side generation is unreliable, slow, and difficult to manage for complex layouts. Use Next.js API Routes or Edge Functions.

**4. Multiple Templates:** Create a modular component structure. Define each template (e.g., `TemplateA.jsx`, `TemplateB.jsx`) that accepts the same data props. The server simply renders the data into the chosen template component before passing it to Puppeteer.

**5. Performance:** To achieve < 2 seconds, pre-warm your server environment and use **streaming/caching** for the PDF generation process