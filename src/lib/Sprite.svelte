<script lang="ts">
	import { SPRITES, PAL } from './sprites';

	let {
		name,
		size = 4,
		recolor = {},
		class: cls = '',
		title = ''
	}: {
		name: keyof typeof SPRITES | string;
		size?: number;
		recolor?: Record<string, string>;
		class?: string;
		title?: string;
	} = $props();

	const grid = $derived(SPRITES[name] ?? []);
	const w = $derived(Math.max(1, ...grid.map((r) => r.length)));
	const h = $derived(grid.length);
	// merge horizontal runs of the same colour into one rect
	const runs = $derived.by(() => {
		const out: { x: number; y: number; len: number; c: string }[] = [];
		grid.forEach((row, y) => {
			let x = 0;
			while (x < row.length) {
				const ch = row[x];
				let len = 1;
				while (row[x + len] === ch) len++;
				if (ch !== '.') out.push({ x, y, len, c: recolor[ch] ?? PAL[ch] ?? ch });
				x += len;
			}
		});
		return out;
	});
</script>

<svg
	class={cls}
	viewBox="0 0 {w} {h}"
	width={w * size}
	height={h * size}
	shape-rendering="crispEdges"
	role={title ? 'img' : 'presentation'}
	aria-hidden={title ? undefined : 'true'}
	aria-label={title || undefined}
>
	{#each runs as r, i (i)}
		<rect x={r.x} y={r.y} width={r.len} height="1" fill={r.c} />
	{/each}
</svg>

<style>
	svg {
		display: inline-block;
		image-rendering: pixelated;
		vertical-align: middle;
	}
</style>
