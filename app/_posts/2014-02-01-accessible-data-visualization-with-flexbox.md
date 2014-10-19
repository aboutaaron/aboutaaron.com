---
layout: post
title:  "Accessible Data Visualization with Flexbox"
---

In 2008, digital designer [Wilson Miner](http://wilsonminer.com/) wrote an article for __A List Apart__ called [__Accessbile Data Visualization with Web Standards__](http://alistapart.com/article/accessibledatavisualization) where he discussed how to to create simple, accessible data visualizations using HTML/CSS and not Flash. I found his approach powerful and simple as it leveraged tools many developers already know and doesn't introduce another tool, e.g. d3.js or Raphael.js, into what could be an already complicated application.

Indeed, organizations like ProPublica have used Miner's technique in many of their data-driven interactive investigations (thanks to [Jeff Larson](https://twitter.com/thejefflarson) for showing me Miner's original article). For example, their  [__Message Machine__](http://projects.propublica.org/emails/) app renders HTML bars with relevant __data-uri__s that contain data for each campaign email. These bars in total create a timeline of events within a fixed container:

![A screenshot of ProPublica's message machine app](/img/messagemachine.png)

After seeing this, I was inspired to build an interactive like this without using the industry go-to d3.js. I love Miner's article, but it was written several years ago so it doesn't offer, I think, the most up-to-date approach to creating a flexible, HTML- and CSS-based chart.

For one Flash, isn't the tool for data viz these days &mdash; JavaScript is. It's arguable that they're both inaccessbile for data viz, but JavaScript support is pretty solid in modern browsers (Firefox doesn't even let you turn it off unless you're in developer mode) so I'm going to assume we can build for users with it enabled.

Secondly, his article doesn't use any new CSS3 properties for styling bars, nor does it consider using responsive web design for mobile users. Luckily, a new-ish CSS spec can solve some of these headaches: **flexbox**.

### Flex box

**NOTE:** There are two `flexbox` specs: an older, 2009 version and the current one. This article refers to the most recent iteration of the spec. Refer to this [CSS-Tricks article](http://css-tricks.com/old-flexbox-and-new-flexbox/) to learn the difference between the two specifications and also check out W3C's [official documentation](http://www.w3.org/TR/css3-flexbox/) on it.

While flexbox has [decent __modern__ browser support](http://caniuse.com/flexbox), it is still kind of bleeding edge so consider your audience when using this technique and make sure you have a fallback.

#### How it works

While I could probably try to explain `flexbox`, Sean Fioritto at  **Sketching with CSS** does a much better job (it's how I learned about it). First, watch his [interactive video tutorial](http://www.sketchingwithcss.com/flexbox-tutorial/) and then view his handy [cheatsheet](http://www.sketchingwithcss.com/samplechapter/cheatsheet.html).

The basic idea is that the browser, given a flexbox-enabled container, will adjust the width of its children elements to always fit inside the container. For example take this HTML from Miner's article:

```html
<ul class="timeline">
  <li class="bar">
    <a href="http://www.example.com/2007/dec/1/" title="December 1, 2007: 40">
      <span class="bar-label">1</span>
      <span class="count" style="height: 20%">(40)</span>
    </a>
  </li>
  <! -- more bars -->
</ul>
```
You can see the timeline from his original code [here](http://alistapart.com/d/accessibledata/example-timeline.html). To adjust it for flexbox, we simply add the `display: flex` property to the __.timeline__ `ul` element, which makes it flexbox-enabled. From there we can tell the flexbox to align the child elements horizontally with `flex-direction: row` and make sure they span evenly between the entire container with `justify-content`.
```css
.timeline {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
```
Here's our new, finished result:
<iframe src="//aboutaaron.github.io/flexbox-chart/" width="100%" scrolling="no" frameborder="0"></iframe>
<small>View a larger example of this chart [here](//aboutaaron.github.io/flexbox-chart/)</small>

It looks the same, but __resize the browser window__ to see `flexbox` in action. You'll notice that the bars of the chart adjust their width dynamically to fit inside the container. We didn't have to write any media queries or use complicated absolute positioning. _It just works_.

The code I used for this flexbox chart is [hosted on Github](https://github.com/aboutaaron/flexbox-chart). Poke around and take a look at how I put it together.

I used this code in the wild for an interactive I built last year that went with CIR's investigation on telemarketing agencies representing charities in Iowa. [View the interactive](http://cironline.org/reports/one-donation-charity-telemarketer-spawns-more-solicitation-calls-5544#interactive) to see this same flexbox technique.

#### Caveats

As I said above, `flexbox` is still in active development and is subject to change. Whenever you use a bleeding edge CSS spec, __make sure you have a fallback__. Use a tool like [Modernizr](http://modernizr.com/) to detect if flexbox is supported, and if not, write a `.no-flexbox` rule in CSS to just float the child elements and display them as inline-blocks. Modernizr will attach the class to the `<html>` element for you.

Also, as of this writing, the `position` declaration doesn't play very nicely with `flexbox`. For example, you'll notice in the HTML above that  `span.count` is a child of `li.bar` and its height is determined by the data associated inline in the height attribute. Normally, to achieve a bar chart look, you would write some CSS to float `.count` to the bottom of `.bar`:

```css
.bar {
  position: relative;
}

.bar .count {
  position: absolute;
  bottom: 0;
}
```

Unfortunately, this will mess up the `flexbox` dynamic resizing and provide less than ideal results. Furthermore, since you can't position `.count` absolutely, all the  child elements will float to the top of their parent elements and and create upside-down bar chart:

![An upside down bart chart.](/img/upside_down.png)

One __hacky__ way to solve this is to find the heights of the parent and child elements, subtract them from each other, and assign the difference to the `margin-top` of the child element (*using jQuery because laziness*):

```js
  var $bars = $('.timeline .bar');

  $.each($bars, function (index, bar) {
    var barHeight = $(bar).find('a').height(),
        countHeight = $(bar).find('a .count').height();

    $(bar).find('.count').css('margin-top', (barHeight - countHeight));
  });
```

This __is not__ an elegant solution, but it does solve the problem. In my experience, there isn't a huge performance hit doing this on a decent array of `div`s (I tried this on 500+ without lag), but your mileage may vary.

### Closing Thoughts

I want to make it clear that I *love d3.js*. It's a powerful tool and I would recommend it to anyone making any kind of interactive visualization for the web. That said, it's always worth exploring other techniques for creating web content.

CSS is a clunky technology, but it's all we have for making things look pretty on the web. Luckily, people are working hard to make it a worthwhile spec and tools like `flexbox` are just the beginning.
