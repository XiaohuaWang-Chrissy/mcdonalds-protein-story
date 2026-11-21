<script lang="ts" module>
	export type ChartEvent = {
		i0: number;
		i1?: number; // if set, the event is a span (e.g. "late April")
		label: string;
		price?: number; // place a dot at this MCD price (e.g. Yi's trade)
		color?: string;
		current: boolean;
	};
	export type View = { from: number; to: number; mode: 'usd' | 'pct' };
</script>

<script lang="ts">
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { untrack } from 'svelte';
	import { dates, mcd, spx, mcdYtd, spxYtd, fmtDate, usd, signed } from './market';

	let { head, events = [], view }: { head: number; events?: ChartEvent[]; view: View } = $props();

	const L = 70, R = 18, T = 12, B = 30;
	const PW = 680;
	// flatter on wide screens, a bit taller on phones (where the chart is narrow)
	let narrow = $state(false);
	$effect(() => {
		const mq = matchMedia('(max-width: 700px)');
		narrow = mq.matches;
		const on = () => (narrow = mq.matches);
		mq.addEventListener('change', on);
		return () => mq.removeEventListener('change', on);
	});
	const PH = $derived(narrow ? 230 : 165);
	const W = L + PW + R;
	const H = $derived(T + PH + B);
	const opts = { duration: 900, easing: cubicInOut };

	const headT = new Tween(untrack(() => head), opts);
	const xr = new Tween(untrack(() => ({ a: view.from, b: view.to })), opts);
	$effect(() => {
		headT.target = head;
		xr.target = { a: view.from, b: view.to };
	});

	const a = $derived(xr.current.a);
	const b = $derived(xr.current.b);
	const h = $derived(Math.round(headT.current));

	const series = $derived(
		view.mode === 'usd'
			? [{ vals: mcd, pastC: '#DA291C', futureC: '#f0c2bd' }]
			: [
					{ vals: spxYtd, pastC: '#2b6cb0', futureC: '#cfdcea' },
					{ vals: mcdYtd, pastC: '#DA291C', futureC: '#f0c2bd' }
				]
	);
	const toVal = (price: number) => (view.mode === 'usd' ? price : (price / mcd[0] - 1) * 100);

	// y-range follows whatever is visible, so zooming in also stretches the price axis
	const yr = $derived.by(() => {
		let lo = Infinity, hi = -Infinity;
		const i0 = Math.max(0, Math.floor(a)), i1 = Math.min(dates.length - 1, Math.ceil(b));
		for (const s of series)
			for (let i = i0; i <= i1; i++) {
				lo = Math.min(lo, s.vals[i]);
				hi = Math.max(hi, s.vals[i]);
			}
		for (const e of events)
			if (e.price != null && e.i0 >= a && e.i0 <= b) {
				lo = Math.min(lo, toVal(e.price));
				hi = Math.max(hi, toVal(e.price));
			}
		const pad = (hi - lo) * 0.1 || 1;
		return { lo: lo - pad, hi: hi + pad };
	});

	const yOf = (v: number) => T + ((yr.hi - v) / (yr.hi - yr.lo)) * PH;
	const xOf = (i: number) => L + ((i - a) / (b - a)) * PW;
	const inView = (i: number) => i >= a - 0.5 && i <= b + 0.5;
	const valAt = (vals: number[], fi: number) => {
		const i = Math.floor(fi), f = fi - i;
		const v0 = vals[Math.max(0, Math.min(vals.length - 1, i))];
		const v1 = vals[Math.max(0, Math.min(vals.length - 1, i + 1))];
		return v0 + (v1 - v0) * f;
	};
	const pts = (vals: number[], from: number, to: number) => {
		if (to < from) return '';
		const out = [`${xOf(from).toFixed(1)},${yOf(valAt(vals, from)).toFixed(1)}`];
		for (let i = Math.ceil(from + 1e-6); i < to; i++) out.push(`${xOf(i).toFixed(1)},${yOf(vals[i]).toFixed(1)}`);
		out.push(`${xOf(to).toFixed(1)},${yOf(valAt(vals, to)).toFixed(1)}`);
		return 'M' + out.join('L');
	};

	const lines = $derived.by(() => {
		const lo = Math.max(0, a - 1), hi = Math.min(dates.length - 1, b + 1);
		const hd = Math.max(lo, Math.min(hi, headT.current));
		return series.map((s) => ({ ...s, past: pts(s.vals, lo, hd), future: pts(s.vals, hd, hi) }));
	});

	const yTicks = $derived.by(() => {
		const span = yr.hi - yr.lo;
		const step = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100].find((s) => span / s <= (narrow ? 4 : 3.5)) ?? 100;
		const out: number[] = [];
		for (let v = Math.ceil(yr.lo / step) * step; v <= yr.hi; v += step) out.push(+v.toFixed(2));
		return out;
	});
	const fmtY = (v: number) =>
		view.mode === 'usd' ? '$' + (v % 1 ? v.toFixed(1) : v.toFixed(0)) : (v > 0 ? '+' : '') + v + '%';

	const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const xTicks = $derived.by(() => {
		const span = b - a;
		const out: { x: number; label: string }[] = [];
		const i0 = Math.max(1, Math.ceil(a)), i1 = Math.min(dates.length - 1, Math.floor(b));
		if (span > 110) {
			for (let i = i0; i <= i1; i++)
				if (dates[i].slice(5, 7) !== dates[i - 1].slice(5, 7))
					out.push({ x: xOf(i), label: MON[+dates[i].slice(5, 7) - 1] });
		} else {
			const step = span > 60 ? 10 : 5; // trading days (~2 weeks / 1 week)
			for (let i = i0; i <= i1; i++)
				if (i % step === 0)
					out.push({ x: xOf(i), label: `${MON[+dates[i].slice(5, 7) - 1]} ${+dates[i].slice(8, 10)}` });
		}
		return out;
	});

	const headX = $derived(xOf(headT.current));
	const headY = $derived(yOf(valAt(series[series.length - 1].vals, headT.current)));
	const pct = (x: number) => (x / W) * 100;
</script>

<figure class="chart">
	<div class="readout" aria-live="polite">
		<div class="date">{fmtDate(dates[h])}</div>
		<div class="vals">
			<span class="mcd"><i></i>McDonald’s <b>{usd(mcd[h])}</b> <em class:neg={mcdYtd[h] < 0}>{signed(mcdYtd[h])} YTD</em></span>
			<span class="spx"><i></i>S&amp;P 500 <b>{spx[h].toLocaleString('en-US', { maximumFractionDigits: 0 })}</b> <em class:neg={spxYtd[h] < 0}>{signed(spxYtd[h])} YTD</em></span>
		</div>
	</div>

	<div class="plot">
		<svg viewBox="0 0 {W} {H}" role="img"
			aria-label={view.mode === 'usd' ? 'McDonald’s share price' : 'McDonald’s and S&P 500, change since start of 2026'}>
			<defs>
				<clipPath id="plot-clip"><rect x={L} y={T - 8} width={PW} height={PH + 16} /></clipPath>
			</defs>

			{#each yTicks as v (v)}
				<line x1={L} x2={L + PW} y1={yOf(v)} y2={yOf(v)} stroke={view.mode === 'pct' && v === 0 ? '#27251F' : '#e7dcc4'} stroke-width="1" />
				<text class="tick" x={L - 10} y={yOf(v) + 5} text-anchor="end">{fmtY(v)}</text>
			{/each}
			{#each xTicks as t (t.label)}
				<text class="tick" x={t.x} y={T + PH + 24} text-anchor="middle">{t.label}</text>
			{/each}

			<g clip-path="url(#plot-clip)">
				{#each events as e (e.label)}
					{#if e.i1 != null}
						{@const x0 = Math.max(L, xOf(e.i0 - 0.5))}
						{@const x1 = Math.min(L + PW, xOf(e.i1 + 0.5))}
						{#if x1 > x0}
							<rect x={x0} y={T - 8} width={x1 - x0} height={PH + 16} fill="#FFC72C" opacity={e.current ? 0.35 : 0.1} />
						{/if}
					{:else if inView(e.i0)}
						<line x1={xOf(e.i0)} x2={xOf(e.i0)} y1={T - 8} y2={T + PH + 8} stroke={e.color ?? '#DA291C'} stroke-width="2" stroke-dasharray="4 4" opacity={e.current ? 0.9 : 0.3} />
					{/if}
				{/each}

				{#each lines as s, k (k)}
					<path d={s.future} fill="none" stroke={s.futureC} stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
					<path d={s.past} fill="none" stroke={s.pastC} stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
				{/each}

				{#each events as e (e.label)}
					{#if e.price != null && inView(e.i0)}
						<circle cx={xOf(e.i0)} cy={yOf(toVal(e.price))} r="7" fill={e.color ?? '#FFC72C'} stroke="#fff" stroke-width="2.5" />
					{/if}
				{/each}

				<line x1={headX} x2={headX} y1={T - 8} y2={T + PH + 8} stroke="#27251F" stroke-width="1.5" />
				<circle cx={headX} cy={headY} r="6.5" fill="#FFC72C" stroke="#27251F" stroke-width="2.5" />
			</g>
		</svg>

		{#each events.filter((e) => e.current && inView(e.i1 != null ? (e.i0 + e.i1) / 2 : e.i0)) as e, k (e.label)}
			{@const x = pct(xOf(e.i1 != null ? (e.i0 + e.i1) / 2 : e.i0))}
			<div class="flag" class:left={x > 50} style="left:{x}%; top:{6 + k * 34}px; --c:{e.color ?? '#DA291C'}">
				{e.label}
			</div>
		{/each}
	</div>
</figure>

<style>
	.chart {
		margin: 0;
		background: #fff;
		border: 1px solid #e2d6bb;
		border-top: 5px solid var(--red);
		border-radius: 10px;
		box-shadow: 0 6px 20px rgba(39, 37, 31, 0.12);
		padding: 6px 12px 4px;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 2px 16px;
		padding-bottom: 5px;
		margin-bottom: 2px;
		border-bottom: 1px solid #eee3cc;
	}
	.date { font-weight: 800; font-size: 16px; font-variant-numeric: tabular-nums; }
	.vals { display: flex; flex-wrap: wrap; gap: 2px 14px; font-size: 14px; font-variant-numeric: tabular-nums; }
	.vals i { display: inline-block; width: 12px; height: 12px; margin-right: 6px; vertical-align: -1px; }
	.mcd i { background: #da291c; }
	.spx i { background: #2b6cb0; }
	em { font-style: normal; color: #1f7a35; font-weight: 600; }
	em.neg { color: #b3261e; }
	.plot { position: relative; }
	svg {
		display: block;
		width: 100%;
		height: auto;
	}
	.tick { font-size: 16px; fill: #6b6353; font-family: system-ui, sans-serif; }
	.flag {
		position: absolute;
		transform: translateX(8px);
		width: max-content;
		max-width: 55%;
		background: var(--ink);
		color: #fff;
		font-size: 14px;
		font-weight: 600;
		line-height: 1.3;
		padding: 5px 9px;
		border-radius: 4px;
		border-left: 4px solid var(--c);
		animation: pop 0.25s ease both;
	}
	.flag.left { transform: translateX(calc(-100% - 6px)); border-left: 0; border-right: 4px solid var(--c); }
	@keyframes pop { from { opacity: 0; } }
	@media (max-width: 700px) {
		.chart { padding: 4px 8px 2px; }
		.date { font-size: 14px; }
		.vals { font-size: 12px; }
		.flag, .flag.left {
			position: static;
			transform: none;
			display: inline-block;
			max-width: none;
			margin: 0 4px 3px 0;
			font-size: 11px;
			padding: 3px 6px;
			border-right: 0;
			border-left: 4px solid var(--c);
		}
		.tick { font-size: 24px; }
	}
</style>
