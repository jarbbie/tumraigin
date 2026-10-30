export type DemoPlanningScenario = {
  id: string;
  labelTh: string;
  maxCheckoutBudgetSatang: number;
  minProteinGPerServing: number;
  excludedTags: string[];
  noteTh: string;
};

/** Inputs for future calculation/ranking work; these are not stored results. */
export const demoPlanningScenarios: DemoPlanningScenario[] = [
  {
    id: "everyday-budget",
    labelTh: "งบประหยัด",
    maxCheckoutBudgetSatang: 20_000,
    minProteinGPerServing: 10,
    excludedTags: [],
    noteTh: "ตัวอย่างงบและโปรตีนที่ผู้ใช้เลือก ผลเมนูต้องคำนวณจากข้อมูลจริงของชุดสาธิต",
  },
  {
    id: "protein-focused",
    labelTh: "เน้นโปรตีน",
    maxCheckoutBudgetSatang: 30_000,
    minProteinGPerServing: 25,
    excludedTags: [],
    noteTh: "ตัวอย่างงบและโปรตีนที่ผู้ใช้เลือก ผลเมนูต้องคำนวณจากข้อมูลจริงของชุดสาธิต",
  },
  {
    id: "plant-forward",
    labelTh: "เน้นพืชและเต้าหู้",
    maxCheckoutBudgetSatang: 25_000,
    minProteinGPerServing: 10.5,
    excludedTags: ["pork", "poultry"],
    noteTh: "ตัวอย่างงบและโปรตีนที่ผู้ใช้เลือก ผลเมนูต้องคำนวณจากข้อมูลจริงของชุดสาธิต",
  },
];
