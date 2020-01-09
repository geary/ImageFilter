# Image Filter Experiment

This is an experiment in filtering images on a web page. The goal is to be able to apply something like brightness and contrast adjustments, either for all colors at once, or for the individual red, green, and blue channels.

To try out the current version of this experiment, clone this repo and copy an image of your choice to `image.png` in the root directory next to `index.html`. Then load `index.html` in any modern web browser.

There is no build process; the test page is pure HTML/JavaScript/CSS. The only dependencies are [noUiSlider](https://refreshless.com/nouislider/) and [jQuery](https://jquery.com/), both included in this repo.

## Filtering Methods

There are at least three ways to do this kind of filtering, and probably more.

### Canvas 2D

Load the image into a 2d `canvas` element and get its `context`. Call `getImageData()` to fetch the pixel data for the entire image. Iterate over each pixel and recalculate them all, and then call `putImageData()` to write the modified pixels back to the canvas.

This is easy and flexible, but slow.

### WebGL

Write a vertex shader and a fragment shader. Since we are only working on a 2D image, the vertex shader is a simple 1:1 pixel mapping. The fragment shader takes the brightness/contrast/other parameters as uniforms and calculates each pixel.

This is the most flexible and perhaps the fastest performing option.

### CSS/SVG Filters

CSS supports `brightness` and `contrast` filters, e.g.

    filter: brightness(120%) contrast(85%);

It also supports SVG filters, and MDN defines the `brightness` and `contrast` filters like this:

```
<filter id="brightness">
    <feComponentTransfer>
        <feFuncR type="linear" slope="n"/>
        <feFuncG type="linear" slope="n"/>
        <feFuncB type="linear" slope="n"/>
    </feComponentTransfer>
</filter>
```

```
<filter id="contrast">
    <feComponentTransfer>
        <feFuncR type="linear" slope="n" intercept="-(0.5*n) + 0.5"/>
        <feFuncG type="linear" slope="n" intercept="-(0.5*n) + 0.5"/>
        <feFuncB type="linear" slope="n" intercept="-(0.5*n) + 0.5"/>
    </feComponentTransfer>
</filter>
```

So the underlying values for R, G, and B are `slope` and `intercept`.

Brightness is simple: it translates directly into `slope`.

Contrast is more interesting: it goes directly into `slope` in the same way, but also affects `intercept`.

In any case, to make it easy to experiment with these values, the current version of this code has sliders to manipulate `slope` and `intercept` directly instead of the `contrast` calculation.

For familiarity, `slope` is labeled as Brightness, and `intercept` is labeled as Background, since those seem to fairly well match the visual experience.

SVG filters do not accept input parameters (i.e. there is no way to change `n` in the examples above), but it is easy to rewrite the entire filter in the DOM, so the code does that on every slider update.
