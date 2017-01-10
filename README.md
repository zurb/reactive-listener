## Installation

`npm install reactive-listener`

## Basic Usage

Start by adding the reactive listener javascript to your page

<code>
&lt;script src="js/reactive-listener.js"></script>
</code>

Next, you'll need to identify the elements you want to animated, what property you want to animate, and what behavior they're going to be reacting to, for example x distance from mouse, y distance from mouse, or 2d distance from mouse. Once you have these, you'll initialize the reactive listener, and let it handle things from there. In the example above, we're animating opacity on a '.glow' element based on 2d distance once the mouse is within 450 pixels. For simplicity, lets show what this looks like with a single element with id 'glow' and a single animation:

```
var glow = document.getElementById('glow');
ReactiveListener.add(glow, {
  'Pointer2d': [
  property: 'opacity',
  range: [1, 0],
  unit: '',
  maxDist: 450,
  forceMax: true,
  directional: false,
  start: 0
  ]
})
ReactiveListener.start();
```
      
Breaking down the pieces, what we've done here is first find the element, then add a listener that will react to the 2d distance ('Pointer2d') with a particular configuration. What are those different configuration settings doing?

* **property**: This is the property being animated, in this case opacity.
* **range**: What range are we animating between? For opacity, we want to go between 1 (visible) and 0 (invisible)
* **unit**: This is the unit being applied to the range... for opacity there is no unit, but if we were doing a translate or something similar, we might need a 'px' or a 'rem' as unit.
* **maxDist**: What is the maximum distance where we want to have any sort of animation... in this case we don't want to do anything until we get below 450.
* **forceMax**: If we're outside the max, should we do nothing? Or force the value to the max? In this case we want to force to the max (invisible), but if we were chaining another animation we might want to do nothing and let the later animation take control.
* **directional**: Does it matter if we're positive or negative relative to the object? For 2d distance, we'll always be positive, but if we were listining to x or y only the concepts of positive and negative matter.
* **start**: What value should the animation start at?

The extra cool thing comes when we start to chain behaviors. A single element can have any number of reactive animations chained into the listener. Each animation is calculated in order, and then applied in bulk, so if there are multiple animations that apply to the same property (say you have two overlapping ranges), the last one in the array applies.

NOTE: This library is currently a prototype. Please be liberal with filing issues and feature requests.

## Try It Out

We've prepped a couple codepen examples to start playing with the possibilities here: 

<a href="http://codepen.io/kball/pen/egJGJz">http://codepen.io/kball/pen/egJGJz</a>

<a href="http://codepen.io/kball/pen/jMojNQ">http://codepen.io/kball/pen/jMojNQ</a>
