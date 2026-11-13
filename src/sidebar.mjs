// One group per chapter, shared by the site's sidebar and AGENTS.md, which
// lists the rules in this order.
export const sidebar = [
  {
    label: "Design",
    items: [{ autogenerate: { directory: "design" } }],
  },
  {
    label: "Testing",
    items: [{ autogenerate: { directory: "testing" } }],
  },
  {
    label: "Shipping changes",
    items: [{ autogenerate: { directory: "shipping" } }],
  },
  {
    label: "Working with LLMs",
    items: [{ autogenerate: { directory: "llms" } }],
  },
];
