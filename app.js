// Info for red, blue, and green color panels, along with "all colors".
const colors = [
	{ code: '', css: null, label: 'All Colors', },
	{ code: 'R', css: 'red', label: 'Red', },
	{ code: 'G', css: 'green', label: 'Green', },
	{ code: 'B', css: 'blue', label: 'Blue', },
];

// Flag to avoid needless updates during initialization.
let ready = false;

// Called when any RGB brightness/background slider changes,
// also called when an "all colors" slider changes after it updates the
// individual RGB sliders.
function update() {
	if( ! ready ) return;

	// Render the feFuncR, feFuncG, and feFuncB SVG elements.
	let funcs = [];
	for( const color of colors ) {
		if( color.code === '' ) continue;
		funcs.push( `
			<feFunc${color.code}
				type="linear"
				slope="${color.sliderSlope.noUiSlider.get()}"
				intercept="${color.sliderIntercept.noUiSlider.get()}"
			/>
		` );
	}

	// Render the SVG filter.
	// TODO: experiment with color-interpolation-filters="sRGB" in filter tag.
	const filter = `
		<svg id="svg-filter">
			<filter id="image-filter">
				<feComponentTransfer>
					${funcs.join('')}
				</feComponentTransfer>
			</filter>
		</svg>
	`;

	// Replace the old filter and the browser will update the image.
	$('#svg-filter').replaceWith( filter );
}

// Called when an "All Colors" brightness/background slider changes.
// Updates the RGB sliders to match.
// TODO: Take the previous RGB positions into account instead of overwriting?
// For example, if red brightness is set higher than green brightness,
// preserve that offset instead of setting them both the same.
function updateAll() {
	if( ! ready ) return;

	const slope = $('#sliderSlope')[0].noUiSlider.get();
	const intercept = $('#sliderIntercept')[0].noUiSlider.get();

	for( const color of colors ) {
		if( ! color.code ) continue;
		color.sliderSlope.noUiSlider.set( slope );
		color.sliderIntercept.noUiSlider.set( intercept );
	}

	update();
}

// Render a single color panel (or "all colors") and insert it into the DOM.
function addColorPanel( color ) {
	const code = color.code;
	// colors[code] = color;
	const idPanel = `colorPanel${code}`;
	const idSliderSlope = `sliderSlope${code}`;
	const idSliderIntercept = `sliderIntercept${code}`;

	const $panel = $(`
		<div class="color-panel" id="${idPanel}">
			<div class="color-header">${color.label}</div>
		</div>
	`).appendTo( $('#color-panels') );

	// Render a single slider for this color panel.
	function addSlider( classname, id, label, options ) {
		$(`
			<div class="color-slider-row">
				<span class="color-slider-label">${label}</span>
				<span class="color-slider ${classname}" id="${id}"></span>
			</div>
		`).appendTo( $panel );

		const slider = $('#'+id)[0];
		noUiSlider.create( slider, options );
		slider.noUiSlider.on( 'update', color.code ? update : updateAll );
		return slider;
	}

	color.sliderSlope = addSlider(
		'color-slider-slope', idSliderSlope, 'Brightness', {
			start: 1,
			connect: [ true, false ],
			range: { min: -30, max: 32 },
			// pips: { mode: 'range', density: 5 },
		});

	color.sliderIntercept = addSlider(
		'color-slider-intercept', idSliderIntercept, 'Background', {
			start: 0,
			connect: [ true, false ],
			range: { min: -1, max: 1 },
			// pips: { mode: 'range', density: 5 },
		});
}

// Render the color slider panels and add them to the DOM.
function addColorPanels() {
	for( const color of colors ) {
		addColorPanel( color );
	}
}

// App initialization.
function appInit() {
	addColorPanels();
	ready = true;
	update();
}

const app = {
	init: appInit,
};
