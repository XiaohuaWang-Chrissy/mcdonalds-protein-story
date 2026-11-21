import raw from './data/stocks.json';
import storyRaw from './data/story.json';

export const story: string[] = storyRaw;

export const dates: string[] = raw.daily.map((r) => r[0] as string);
export const mcd: number[] = raw.daily.map((r) => r[1] as number);
export const spx: number[] = raw.daily.map((r) => r[2] as number);

const pct = (arr: number[]) => arr.map((v) => (v / arr[0] - 1) * 100);
export const mcdYtd = pct(mcd);
export const spxYtd = pct(spx);

export const weeklyDates: string[] = raw.mcdWeekly.map((r) => r[0] as string);
export const mcdWeekly: number[] = raw.mcdWeekly.map((r) => r[1] as number);

/** index of first trading day on/after the given ISO date */
export function idx(date: string, ds: string[] = dates): number {
	const i = ds.findIndex((d) => d >= date);
	return i === -1 ? ds.length - 1 : i;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export const monthOf = (d: string) => MONTHS[+d.slice(5, 7) - 1];
export const fmtDate = (d: string) => `${monthOf(d)} ${+d.slice(8, 10)}, ${d.slice(0, 4)}`;
export const usd = (v: number) =>
	'$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const signed = (v: number, digits = 1) => (v >= 0 ? '+' : '') + v.toFixed(digits) + '%';
