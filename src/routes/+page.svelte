<script lang="ts">
	import TimelineChart, { type ChartEvent, type View } from '#lib/TimelineChart.svelte';
	import Sprite from '#lib/Sprite.svelte';
	import { story, dates, idx } from '#lib/market.ts';

	const last = dates.length - 1;

	// Events on the timeline. `para` = the paragraph that first mentions it.
	const EVENTS = [
		{ para: 1, i0: idx('2026-09-23'), label: 'Sept. 23: NEXT plan detailed at investor day' },
		{ para: 4, i0: idx('2026-10-01'), i1: idx('2026-10-31'), label: 'October: Dublin pilot announced' },
		{ para: 14, i0: idx('2026-04-01'), i1: idx('2026-04-30'), label: 'April: protein labels on 17 items' },
		{ para: 17, i0: idx('2026-04-20'), i1: idx('2026-04-30'), label: 'Late April: 10 items under $3, deals dropped' },
		{ para: 20, i0: idx('2026-07-01'), i1: idx('2026-09-30'), label: 'Q3: revenue +1%, net income +9%' },
		{ para: 21, i0: idx('2026-10-07'), color: '#2b6cb0', label: 'Oct. 7: 2026 low' },
		{ para: 21, i0: idx('2026-11-16'), i1: last, label: 'Week ended Nov. 20' },
		{ para: 22, i0: idx('2026-10-02'), price: 233.59, color: '#2e9e44', label: 'Oct. 2: Yi buys at $233.59' },
		{ para: 23, i0: idx('2026-11-06'), price: 278.79, color: '#DA291C', label: 'Nov. 6: Yi sells at $278.79' }
	];
	// spans that a later, overlapping span replaces
	const HIDE_AFTER: Record<number, number> = { 14: 17, 20: 21 };

	// For each paragraph: where the playhead sits and which slice of the year the chart zooms to.
	const FULL: View = { from: 0, to: last, mode: 'pct' };
	const FULL_USD: View = { from: 0, to: last, mode: 'usd' };
	const NEXT: View = { from: idx('2026-08-17'), to: idx('2026-10-23'), mode: 'usd' };
	const OCT: View = { from: idx('2026-09-14'), to: last, mode: 'usd' };
	const APR: View = { from: idx('2026-03-02'), to: idx('2026-06-01'), mode: 'usd' };
	const LATE_APR: View = { from: idx('2026-04-01'), to: idx('2026-05-29'), mode: 'usd' };
	const YI: View = { from: idx('2026-09-21'), to: last, mode: 'usd' };

	const STEPS: [string, View][] = [
		['2026-11-20', FULL], // 0 headline
		['2026-09-23', NEXT], ['2026-09-23', NEXT], ['2026-09-23', NEXT], // 1–3 NEXT plan, chicken
		['2026-10-01', OCT], ['2026-10-01', OCT], ['2026-10-01', OCT], ['2026-10-01', OCT], // 4–7 Dublin pilot, costs
		['2026-10-01', OCT], ['2026-10-01', OCT], ['2026-10-01', OCT], ['2026-10-01', OCT], // 8–11
		['2026-10-01', OCT], ['2026-10-01', OCT], // 12–13 Yi intro
		['2026-04-01', APR], ['2026-04-01', APR], ['2026-04-01', APR], // 14–16 protein labels
		['2026-04-27', LATE_APR], ['2026-04-27', LATE_APR], ['2026-04-27', LATE_APR], // 17–19 value menu
		['2026-09-30', FULL_USD], // 20 analysts, Q3
		['2026-11-20', FULL], // 21 vs S&P 500
		['2026-10-02', YI], // 22 Yi buys
		['2026-11-06', YI], // 23 Yi sells
		['2026-11-20', YI] // 24
	];

	// Charts embedded in the article, shown after the given paragraph.
	const FIGURES: Record<number, { src: string; alt: string }> = {
		2: { src: 'figures/chicken-vs-beef.png', alt: 'Chicken vs. beef: size of each fast-food category, with McDonald’s share' },
		8: { src: 'figures/next-costs.png', alt: 'What McDonald’s Next costs per restaurant' },
		20: { src: 'figures/revenue-profit.png', alt: 'McDonald’s revenue and profit, 2025 to 2027 estimates' },
		22: { src: 'figures/intel-vs-mcdonalds.png', alt: 'Intel vs. McDonald’s: percent change in share price since Dec. 31, 2025' }
	};

	let active = $state(0);
	const currentPara = $derived(Math.max(0, ...EVENTS.filter((e) => e.para <= active).map((e) => e.para)));
	const events = $derived<ChartEvent[]>(
		EVENTS.filter((e) => e.para <= active && !(HIDE_AFTER[e.para] && active >= HIDE_AFTER[e.para])).map((e) => ({
			...e,
			current: e.para === currentPara
		}))
	);
	const head = $derived(idx(STEPS[active][0]));
	const view = $derived(STEPS[active][1]);

	// The paragraph being read = the last one whose top has scrolled up to just below the sticky chart.
	let chartBar: HTMLElement;
	let paras: HTMLElement[] = $state([]);
	let ticking = false;
	function update() {
		ticking = false;
		const line = chartBar.getBoundingClientRect().bottom + Math.min(120, window.innerHeight * 0.15);
		let next = 0;
		paras.forEach((el, i) => {
			if (el && el.getBoundingClientRect().top <= line) next = i + 1;
		});
		active = next;
	}
	function onScroll() {
		if (!ticking) {
			ticking = true;
			requestAnimationFrame(update);
		}
	}
	$effect(() => {
		update();
	});
</script>

<svelte:window onscroll={onScroll} onresize={onScroll} />

<header class="top">
	<div class="sprites" aria-hidden="true">
		<Sprite name="burger" size={4} />
		<Sprite name="fries" size={4} />
		<Sprite name="drumstick" size={4} />
		<Sprite name="egg" size={4} />
	</div>
</header>

<main>
	<h1 class="col">{story[0]}</h1>

	<div class="chart-bar" bind:this={chartBar}>
		<div class="chart-box">
			<TimelineChart {head} {events} {view} />
		</div>
	</div>

	<article class="col text">
		{#each story as p, i (i)}
			{#if i > 0}
				<p class:on={active === i} bind:this={paras[i - 1]}>{p}</p>
				{#if FIGURES[i]}
					<figure class="fig"><img src={FIGURES[i].src} alt={FIGURES[i].alt} loading="lazy" /></figure>
				{/if}
			{/if}
		{/each}
	</article>
</main>

<footer class="col">
	Data source: Google Finance
</footer>

<style>
	.top {
		background: var(--red);
		border-bottom: 6px solid var(--yellow);
		padding: 14px 24px;
	}
	.sprites {
		max-width: 680px;
		margin: 0 auto;
		display: flex;
		gap: 16px;
		align-items: flex-end;
	}
	.col {
		max-width: 680px;
		margin-left: auto;
		margin-right: auto;
		padding-left: 20px;
		padding-right: 20px;
	}
	h1 {
		font-size: clamp(28px, 4vw, 44px);
		line-height: 1.15;
		font-weight: 800;
		letter-spacing: -0.01em;
		margin-top: 36px;
		margin-bottom: 24px;
	}
	.chart-bar {
		position: sticky;
		top: 0;
		z-index: 2;
		padding: 8px 20px 10px;
		background: linear-gradient(var(--cream) 92%, transparent);
	}
	.chart-box {
		/* keep the chart short enough that text stays readable below it */
		width: min(100%, 900px, calc(24vh * 3.7 + 30px));
		margin: 0 auto;
	}
	.text {
		padding-top: 24px;
		padding-bottom: 50vh;
	}
	p {
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 20px;
		line-height: 1.65;
		margin: 0 0 1.1em;
		padding-left: 14px;
		border-left: 5px solid transparent;
		transition: border-color 0.2s;
	}
	p.on { border-left-color: var(--yellow); }
	.fig {
		margin: 8px 0 28px;
		background: #fff;
		padding: 12px;
		border-radius: 8px;
		border: 1px solid #e2d6bb;
	}
	.fig img { display: block; width: 100%; height: auto; }
	footer {
		padding-top: 20px;
		padding-bottom: 40px;
		font-size: 14px;
		color: #6b6353;
		border-top: 2px solid #e7dcc4;
	}
	@media (max-width: 700px) {
		.top { padding: 10px 16px; }
		.chart-bar { padding: 6px 8px 8px; }
		.col { padding-left: 14px; padding-right: 14px; }
		h1 { font-size: 28px; margin-top: 24px; }
		p { font-size: 18px; padding-left: 10px; }
	}
</style>
