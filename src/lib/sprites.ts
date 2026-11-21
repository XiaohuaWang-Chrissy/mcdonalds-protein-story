// Tiny pixel sprites. Each char is a palette key; '.' is transparent.
export const PAL: Record<string, string> = {
	b: '#E8A33D', // bun
	B: '#C47F22', // bun shade
	w: '#FFF3D6', // sesame / bone / egg white
	g: '#3BA84A', // lettuce
	y: '#FFC72C', // yellow
	Y: '#FFE38A', // light yellow
	d: '#B8860B', // dark gold
	m: '#6B3A1E', // patty
	r: '#DA291C', // red
	R: '#A81E13', // dark red
	o: '#C9782B', // fried chicken
	O: '#E9A456', // chicken highlight
	k: '#27251F', // ink
	t: '#FF7A59', // tomato
	s: '#8FD3FF', // window
	G: '#2E9E44' // up green
};

export const SPRITES: Record<string, string[]> = {
	burger: [
		'....bbbbbb....',
		'..bbwbbbbwbb..',
		'.bbbbbbbwbbbb.',
		'bbbwbbbbbbbwbb',
		'BBBBBBBBBBBBBB',
		'gggggggggggggg',
		'tttttttttttttt',
		'yyyyyyyyyyyyyy',
		'mmmmmmmmmmmmmm',
		'mmmmmmmmmmmmmm',
		'bbbbbbbbbbbbbb',
		'.BBBBBBBBBBBB.'
	],
	fries: [
		'..y.y..y.y..',
		'.yY.yy.Yy.y.',
		'.yyyYyyyyYy.',
		'.yyyyyyyyyy.',
		'rrrrrrrrrrrr',
		'rRrrrrrrrrRr',
		'.rrrrrrrrrr.',
		'.rRrrrrrrRr.',
		'..rrrrrrrr..',
		'..rrrrrrrr..'
	],
	drumstick: [
		'....ooooo...',
		'..ooOOooooo.',
		'.ooOOoooOoo.',
		'.oOoooooooo.',
		'.oooooOoooo.',
		'..ooooooooo.',
		'...oooooo...',
		'......ww....',
		'.......ww...',
		'......wwww..',
		'.......ww...'
	],
	coin: [
		'..yyyy..',
		'.yYYYYy.',
		'yYyddyYy',
		'yYdyyyYy',
		'yYyddyYy',
		'yYyyydYy',
		'yYyddyYy',
		'.yyyyyy.',
		'..yyyy..'
	],
	egg: [
		'..wwww..',
		'.wwwwww.',
		'wwwyywww',
		'wwyyyyww',
		'wwyyyyww',
		'wwwyywww',
		'.wwwwww.',
		'..wwww..'
	],
	bowl: [
		'...g.tt.O...',
		'..gggttOOo..',
		'.ggoOgtyoOg.',
		'rrrrrrrrrrrr',
		'.rRrrrrrrRr.',
		'..rrrrrrrr..',
		'....RRRR....'
	],
	store: [
		'..kkkkkkkk..',
		'.kyyyyyyyyk.',
		'kyrryyrryyrk',
		'kkkkkkkkkkkk',
		'.krrrrrrrrk.',
		'.krsskrsskk.',
		'.krsskrsskk.',
		'.krrrkkrrrk.',
		'.krrrkkrrrk.',
		'.kkkkkkkkkk.'
	],
	house: [
		'....kk....',
		'...krrk...',
		'..krrrrk..',
		'.krrrrrrk.',
		'kkkkkkkkkk',
		'.kwwwwwwk.',
		'.kwsswkwk.',
		'.kwsswkwk.',
		'.kkkkkkkk.'
	],
	phone: [
		'kkkkkkkk',
		'kssssssk',
		'ksGGsssk',
		'kssssssk',
		'ksyyyysk',
		'kssssssk',
		'kssssssk',
		'kkkwwkkk',
		'kkkkkkkk'
	],
	arrowUp: ['...GG...', '..GGGG..', '.GGGGGG.', 'GGGGGGGG', '..GGGG..', '..GGGG..', '..GGGG..'],
	arrowDown: ['..rrrr..', '..rrrr..', '..rrrr..', 'rrrrrrrr', '.rrrrrr.', '..rrrr..', '...rr...']
};
