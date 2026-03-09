export const C = {
  bg: "#F2F2F7", card: "#FFFFFF", text: "#1C1C1E", text2: "#8E8E93", text3: "#AEAEB2",
  accent: "#007AFF", accentLight: "#E8F2FF",
  green: "#34C759", greenLight: "#E8FAF0",
  orange: "#FF9500", orangeLight: "#FFF4E5",
  red: "#FF3B30", redLight: "#FFEBEA",
  pink: "#FF2D55", purple: "#AF52DE", teal: "#5AC8FA",
  yellow: "#FFCC00",
  separator: "#E5E5EA", navBg: "rgba(249,249,249,0.94)", navBorder: "#D1D1D6",
};
export const TODO_CATS = [
  { id: "courses", label: "Courses", icon: "\u{1F6D2}", color: C.orange },
  { id: "maison", label: "Maison", icon: "\u{1F3E0}", color: C.purple },
  { id: "perso", label: "Perso", icon: "\u{1F464}", color: C.accent },
  { id: "travail", label: "Travail", icon: "\u{1F4BC}", color: C.green },
  { id: "urgent", label: "Urgent", icon: "\u{1F525}", color: C.red },
];
export const BUDGET_CATS = {
  income: [
    { id: "salaire", label: "Salaire", icon: "\u{1F4B0}", color: C.green },
    { id: "freelance", label: "Freelance", icon: "\u{1F4BB}", color: C.accent },
    { id: "investissement", label: "Investissement", icon: "\u{1F4C8}", color: C.purple },
    { id: "autre_rev", label: "Autre", icon: "\u{1F4B5}", color: C.text2 },
  ],
  expense: [
    { id: "logement", label: "Logement", icon: "\u{1F3E0}", color: C.orange },
    { id: "courses_b", label: "Courses", icon: "\u{1F6D2}", color: C.red },
    { id: "transport", label: "Transport", icon: "\u{1F697}", color: C.accent },
    { id: "loisirs", label: "Loisirs", icon: "\u{1F3AC}", color: C.pink },
    { id: "sante", label: "Sant\u00e9", icon: "\u{1F3E5}", color: C.green },
    { id: "renovation", label: "R\u00e9novation", icon: "\u{1F528}", color: C.purple },
    { id: "abonnements", label: "Abonnements", icon: "\u{1F4F1}", color: C.text2 },
    { id: "autre_dep", label: "Autre", icon: "\u{1F4E6}", color: C.text3 },
  ],
};
export const PORTFOLIOS = [
  { id: "curvo", name: "Curvo", icon: "\u{1F331}", color: C.green, type: "DCA mensuel", keywords: ["MSCI World ESG", "Curvo", "index fund Europe"] },
  { id: "trade_republic", name: "Trade Republic", icon: "\u{1F4CA}", color: C.accent, type: "ETFs", keywords: ["IWDA", "VWCE", "IEMA", "XESC", "ETF Europe"] },
  { id: "retraite", name: "Assurance Retraite", icon: "\u{1F3E6}", color: C.purple, type: "\u00c9pargne pension", keywords: ["pension Belgique", "\u00e9pargne pension"] },
];
export const EVENT_CATS = [
  { id: "perso", label: "Perso", icon: "\u{1F389}", color: C.accent },
  { id: "pro", label: "Travail", icon: "\u{1F4BC}", color: C.green },
  { id: "anniversaire", label: "Anniversaire", icon: "\u{1F382}", color: C.pink },
  { id: "finance", label: "Finance", icon: "\u{1F4B6}", color: C.orange },
  { id: "renovation", label: "R\u00e9novation", icon: "\u{1F528}", color: C.purple },
  { id: "tache", label: "T\u00e2che", icon: "\u2705", color: C.teal },
];
export const NOTE_CATS = [
  { id: "film", label: "Films / S\u00e9ries", icon: "\u{1F3AC}", color: C.red },
  { id: "livre", label: "Livres", icon: "\u{1F4DA}", color: C.orange },
  { id: "expo", label: "Expos / Mus\u00e9es", icon: "\u{1F3A8}", color: C.purple },
  { id: "resto", label: "Restos / Bars", icon: "\u{1F37D}\uFE0F", color: C.green },
  { id: "musique", label: "Musique / Podcasts", icon: "\u{1F3B5}", color: C.pink },
  { id: "voyage", label: "Voyages / Lieux", icon: "\u2708\uFE0F", color: C.teal },
];
export const NOTE_STATUSES = [
  { id: "to_see", label: "\u00c0 d\u00e9couvrir", color: C.orange },
  { id: "in_progress", label: "En cours", color: C.accent },
  { id: "done", label: "Vu / Lu / Fait", color: C.green },
];
export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "Home" },
  { id: "todos", label: "T\u00e2ches", icon: "CheckCircle" },
  { id: "budget", label: "Budget", icon: "TrendingUp" },
  { id: "calendar", label: "Calendrier", icon: "Calendar" },
  { id: "notes", label: "Notes", icon: "BookOpen" },
];
export const EMPTY_INVESTMENTS = [
  { id: "curvo", invested: 0, currentValue: 0, monthlyDCA: 0, holdings: [], history: [] },
  { id: "trade_republic", invested: 0, currentValue: 0, monthlyDCA: 0, holdings: [], history: [] },
  { id: "retraite", invested: 0, currentValue: 0, monthlyDCA: 0, holdings: [], history: [] },
];
export const EMPTY_STATE = {
  activeTab: "home", todos: [], transactions: [], monthlyBudget: 2000,
  investments: EMPTY_INVESTMENTS, events: [], notes: [], newsFeed: [], chatHistory: [],
};
export const mapsUrl = (a) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(a);
