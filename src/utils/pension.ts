import { SeniorCitizen } from '../types';

export const SOC_PEN_MONTHLY_PENSION = 'DSWD Social Pension (Php 1,000/mo)';

export const isSocPenProgram = (monthlyPension?: string) =>
  monthlyPension?.trim().toLowerCase().startsWith('dswd social pension') ?? false;

export const getMonthlyPension = (
  senior: Pick<SeniorCitizen, 'monthlyPension' | 'pensionBeneficiary'>,
) => {
  const monthlyPension = senior.monthlyPension?.trim();
  if (monthlyPension && monthlyPension.toLowerCase() !== 'none') return monthlyPension;
  return senior.pensionBeneficiary ? SOC_PEN_MONTHLY_PENSION : '';
};

export const hasMonthlyPension = (
  senior: Pick<SeniorCitizen, 'monthlyPension' | 'pensionBeneficiary'>,
) => Boolean(getMonthlyPension(senior));
