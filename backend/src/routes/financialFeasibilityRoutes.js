//Admin Financial Feasibility – Phân tích khả thi tài chính GIIP. phan thuy trang

import express from "express";

const router = express.Router();

function calcNPV(rate, cashFlows) {
  return cashFlows.reduce((sum, cf, index) => {
    return sum + cf / Math.pow(1 + rate, index);
  }, 0);
}

function calcIRR(cashFlows) {
  let low = -0.99;
  let high = 1;
  let mid = 0;

  for (let i = 0; i < 100; i++) {
    mid = (low + high) / 2;
    const npv = calcNPV(mid, cashFlows);

    if (npv > 0) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return mid;
}

router.post("/analyze", async (req, res) => {
  try {
    const {
      initial_investment = 800000000,

      years = 5,

      projects_per_year = 40,
      avg_funding_amount = 500000000,
      success_rate = 0.25,

      transaction_fee_rate = 0.03,
      project_listing_fee = 1500000,
      due_diligence_fee = 3000000,
      membership_fee = 2000000,

      members_per_year = 30,

      staff_cost = 420000000,
      technology_cost = 180000000,
      marketing_cost = 240000000,
      admin_cost = 120000000,
      due_diligence_cost = 100000000,

      growth_rate = 0.25,
      cost_growth_rate = 0.12,
      tax_rate = 0.2,
      discount_rate = 0.12,
    } = req.body || {};

    const rows = [];

    let currentProjects = Number(projects_per_year);
    let currentMembers = Number(members_per_year);

    for (let year = 1; year <= Number(years); year++) {
      const successfulDeals =
        currentProjects * Number(success_rate);

      const transactionRevenue =
        successfulDeals *
        Number(avg_funding_amount) *
        Number(transaction_fee_rate);

      const listingRevenue =
        currentProjects * Number(project_listing_fee);

      const dueDiligenceRevenue =
        currentProjects * Number(due_diligence_fee);

      const membershipRevenue =
        currentMembers * Number(membership_fee);

      const totalRevenue =
        transactionRevenue +
        listingRevenue +
        dueDiligenceRevenue +
        membershipRevenue;

      const costMultiplier = Math.pow(
        1 + Number(cost_growth_rate),
        year - 1
      );

      const totalCost =
        (Number(staff_cost) +
          Number(technology_cost) +
          Number(marketing_cost) +
          Number(admin_cost) +
          Number(due_diligence_cost)) *
        costMultiplier;

      const profitBeforeTax = totalRevenue - totalCost;

      const tax =
        profitBeforeTax > 0
          ? profitBeforeTax * Number(tax_rate)
          : 0;

      const profitAfterTax = profitBeforeTax - tax;

      const breakEvenProjects =
        totalRevenue > 0
          ? Math.ceil(
              totalCost /
                (totalRevenue / currentProjects)
            )
          : 0;

      rows.push({
        year,
        projects: Math.round(currentProjects),
        members: Math.round(currentMembers),
        successful_deals: Math.round(successfulDeals),

        transaction_revenue: Math.round(transactionRevenue),
        listing_revenue: Math.round(listingRevenue),
        due_diligence_revenue: Math.round(dueDiligenceRevenue),
        membership_revenue: Math.round(membershipRevenue),
        total_revenue: Math.round(totalRevenue),

        total_cost: Math.round(totalCost),
        profit_before_tax: Math.round(profitBeforeTax),
        tax: Math.round(tax),
        profit_after_tax: Math.round(profitAfterTax),

        break_even_projects: breakEvenProjects,
      });

      currentProjects *= 1 + Number(growth_rate);
      currentMembers *= 1 + Number(growth_rate);
    }

    const cashFlows = [
      -Number(initial_investment),
      ...rows.map((r) => r.profit_after_tax),
    ];

    const npv = calcNPV(Number(discount_rate), cashFlows);
    const irr = calcIRR(cashFlows);

    const totalRevenue = rows.reduce(
      (sum, r) => sum + r.total_revenue,
      0
    );

    const totalProfit = rows.reduce(
      (sum, r) => sum + r.profit_after_tax,
      0
    );

    const paybackYear =
      rows.findIndex((_, index) => {
        const cumulative =
          rows
            .slice(0, index + 1)
            .reduce((sum, r) => sum + r.profit_after_tax, 0) -
          Number(initial_investment);

        return cumulative >= 0;
      }) + 1 || null;

    let feasibility = "medium";

    if (npv > 0 && irr > Number(discount_rate)) {
      feasibility = "high";
    } else if (npv < 0) {
      feasibility = "low";
    }

    res.json({
      summary: {
        initial_investment: Number(initial_investment),
        total_revenue: Math.round(totalRevenue),
        total_profit_after_tax: Math.round(totalProfit),
        npv: Math.round(npv),
        irr: Number((irr * 100).toFixed(2)),
        discount_rate: Number((Number(discount_rate) * 100).toFixed(2)),
        payback_year: paybackYear,
        feasibility,
      },
      rows,
      cash_flows: cashFlows.map((v) => Math.round(v)),
    });
  } catch (error) {
    console.error("FINANCIAL FEASIBILITY ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;