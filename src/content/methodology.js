import { SOURCES_LAST_VERIFIED } from "./sources.js";
import { REFERENCE_LINKS } from "./referenceLinks.js";
import { renderReferenceLinksList } from "../ui/referenceLinksList.js";

export const METHODOLOGY_LAST_UPDATED = "2026";

export const METHODOLOGY_SECTIONS = [
  {
    id: "method-scope",
    title: "What this simulator is / is not",
    body: [
      "This is a planning-level simulator to help you understand retirement cash flow and tax interactions.",
      "It is not financial, legal, or tax advice, and it does not replace licensed professional advice.",
      "Outputs are scenario estimates based on your assumptions.",
    ],
  },
  {
    id: "method-tax",
    title: "How taxes are estimated",
    body: [
      "The model uses a simplified progressive federal + provincial bracket approach.",
      "It reports planning-level effective tax rates and estimated tax drag in withdrawal years.",
      `Tax assumptions and brackets are hardcoded planning tables. Last updated: ${METHODOLOGY_LAST_UPDATED}.`,
    ],
  },
  {
    id: "method-oas",
    title: "OAS clawback",
    body: [
      "OAS clawback is estimated as a recovery tax when taxable income exceeds the threshold for a given year.",
      "Estimated clawback is shown as part of the tax wedge and year cards when enabled.",
    ],
  },
  {
    id: "method-rrif",
    title: "RRIF minimum withdrawals",
    body: [
      "RRSP to RRIF conversion is modeled at your selected conversion age (default age 71).",
      "Minimum RRIF withdrawal rates by age are applied when RRIF minimum modeling is enabled.",
    ],
  },
  {
    id: "method-benefits",
    title: "CPP and OAS handling",
    body: [
      "CPP and OAS are modeled from user-entered age-65 estimates and selected start ages.",
      "Start-age adjustments are applied for earlier/later starts as planning approximations.",
      "Indexation and timing impacts are handled at planning level, not benefit-statement precision.",
    ],
  },
  {
    id: "method-limits",
    title: "Limitations",
    body: [
      "Future tax rules and benefit formulas can change.",
      "The simulator does not model every personal tax credit, deduction, or pension detail.",
      "Use results directionally and validate key decisions with an advisor.",
    ],
  },
];

export function renderMethodologyHtml(escapeHtml) {
  return `
    <section class="subsection">
      ${METHODOLOGY_SECTIONS.map((section) => `
        <article id="${escapeHtml(section.id)}" class="subsection">
          <h3>${escapeHtml(section.title)}</h3>
          <ul class="plain-list">
            ${section.body.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}
          </ul>
        </article>
      `).join("")}
      <article class="subsection">
        <h3>Reference Links</h3>
        <p class="small-copy muted">Last verified: ${escapeHtml(SOURCES_LAST_VERIFIED)}</p>
        <p class="small-copy muted">
          Focused calculators:
          <a href="./oas-clawback-calculator.html">OAS clawback calculator</a> |
          <a href="./rrif-withdrawal-calculator.html">RRIF withdrawal calculator</a>
        </p>
        ${renderReferenceLinksList(REFERENCE_LINKS, escapeHtml)}
        <p class="small-copy muted">These references support the planning assumptions used in the simulator. Rules can change.</p>
      </article>
    </section>
  `;
}
