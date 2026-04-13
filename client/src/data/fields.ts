// src/data/fields.ts
// Form field definitions used by the step-by-step form screen.

import type { FarmerProfile } from "../types";

export interface FormField {
  key: keyof FarmerProfile;
  label: string;
  type: "text" | "number" | "boolean";
  placeholder?: string;
  unit?: string;
  icon: string;
}

export const FIELDS: FormField[] = [
  {
    key: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Ramesh Kumar",
    icon: "👤",
  },
  {
    key: "age",
    label: "Age",
    type: "number",
    placeholder: "42",
    unit: "years",
    icon: "🎂",
  },
  {
    key: "landSize",
    label: "Land Size",
    type: "number",
    placeholder: "1.5",
    unit: "hectares",
    icon: "🗺️",
  },
  {
    key: "income",
    label: "Annual Income",
    type: "number",
    placeholder: "120000",
    unit: "₹",
    icon: "💰",
  },
  {
    key: "cropName",
    label: "Main Crop",
    type: "text",
    placeholder: "e.g. Wheat",
    icon: "🌾",
  },
  {
    key: "season",
    label: "Current Season",
    type: "text",
    placeholder: "Kharif / Rabi",
    icon: "📅",
  },
  {
    key: "category",
    label: "Farmer Category",
    type: "text",
    placeholder: "Small / Marginal / Tenant",
    icon: "🚜",
  },
  {
    key: "state",
    label: "State",
    type: "text",
    placeholder: "e.g. Maharashtra",
    icon: "📍",
  },
  {
    key: "district",
    label: "District",
    type: "text",
    placeholder: "e.g. Pune",
    icon: "🏘️",
  },
  {
    key: "landOwner",
    label: "Do you own or lease agricultural land?",
    type: "boolean",
    icon: "🏡",
  },
  {
    key: "govtJob",
    label: "Are you a government employee (current or retired)?",
    type: "boolean",
    icon: "🏛️",
  },
  {
    key: "cropType",
    label: "Do you grow notified crops (wheat, rice, sugarcane, etc.)?",
    type: "boolean",
    icon: "🌱",
  },
  {
    key: "loanee",
    label: "Do you have an institutional farm loan?",
    type: "boolean",
    icon: "🏦",
  },
  {
    key: "creditHistory",
    label: "Do you have a clean loan repayment history (no defaults)?",
    type: "boolean",
    icon: "✅",
  },
];

export const VOICE_CHIPS = [
  { label: "45 years old",   insert: "I am 45 years old. " },
  { label: "1.5 hectares",   insert: "I own 1.5 hectares of land. " },
  { label: "₹90,000 income", insert: "My annual income is 90000 rupees. " },
  { label: "Grows wheat",    insert: "I grow wheat. " },
  { label: "Rabi season",    insert: "It is currently rabi season. " },
  { label: "Maharashtra",    insert: "I am from Maharashtra. " },
  { label: "Pune district",  insert: "I live in Pune district. " },
  { label: "Tenant farmer",  insert: "I am a tenant farmer. " },
  { label: "No govt job",    insert: "I have no government job. " },
  { label: "Clean credit",   insert: "I have a clean credit history. " },
  { label: "Farm loan",      insert: "I have an institutional farm loan. " },
];

export const VOICE_EXAMPLE =
  "My name is Ramesh Kumar. I am 45 years old. I own 1.2 hectares of land. My annual income is 90000 rupees. I grow wheat. No government job. Clean credit history.";

export interface DetectedField {
  key: keyof FarmerProfile;
  label: string;
  fmt: (v: any) => string;
}

export const DETECTED_FIELDS: DetectedField[] = [
  { key: "name",          label: "Name",         fmt: (v) => v },
  { key: "age",           label: "Age",          fmt: (v) => `${v} yrs` },
  { key: "landSize",      label: "Land",         fmt: (v) => `${v} ha` },
  { key: "income",        label: "Income",       fmt: (v) => `₹${Number(v).toLocaleString()}` },
  { key: "landOwner",     label: "Owns land",    fmt: (v) => (v ? "Yes ✓" : "No ✗") },
  { key: "govtJob",       label: "Govt job",     fmt: (v) => (v ? "Yes" : "No") },
  { key: "cropType",      label: "Notified crop",fmt: (v) => (v ? "Yes ✓" : "No") },
  { key: "loanee",        label: "Farm loan",    fmt: (v) => (v ? "Yes" : "No") },
  { key: "creditHistory", label: "Clean credit", fmt: (v) => (v ? "Yes ✓" : "No") },
];
