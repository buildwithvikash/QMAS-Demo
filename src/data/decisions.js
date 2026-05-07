export const PRIMARY_DECISIONS = [
  {
    id: "accepted",
    name: "Fully Accepted",
    icon: "✅",
    color: "#059669",
    desc: "All inspection criteria met. Goods accepted unconditionally.",
    cls: "sel-accepted",
  },
  {
    id: "rejected",
    name: "Rejected",
    icon: "❌",
    color: "#dc2626",
    desc: "Goods do not meet requirements. Return to vendor / quarantine.",
    cls: "sel-rejected",
  },
  {
    id: "hold",
    name: "Hold",
    icon: "⏸",
    color: "#d97706",
    desc: "Non-conformance found. Select a hold disposition below.",
    cls: "sel-hold",
    hasSubLevel: true,
  },
];

export const HOLD_DECISIONS = [
  {
    id: "rework",
    name: "Rework",
    icon: "🔧",
    color: "#f59e0b",
    cls: "sel-rework",
    desc: "Accepted after rework is performed on non-conforming units.",
  },
  {
    id: "segregation",
    name: "Segregation",
    icon: "🔀",
    color: "#ea580c",
    cls: "sel-segregation",
    desc: "Conforming units accepted after 100% sort; non-conforming returned.",
  },
  {
    id: "deviation",
    name: "Deviation",
    icon: "⚡",
    color: "#7c3aed",
    cls: "sel-deviation",
    desc: "Accepted under deviation — SCM approval & deviation note required.",
  },
];

export const HOLD_TO_DECISION_NAME = {
  rework: "Rework",
  segregation: "Segregation",
  deviation: "Deviation",
};
