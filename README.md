jqCanvo
=

Chain-draw and layer supported jQuery library for Canvas.

Version
-
0.1.0

Usage
-

head

```html
<script type="text/javascript" src="/jqCanvo/js/jquery.cjbase.js"></script>
<!-- If you want to event handle -->
<script type="text/javascript" src="/jqCanvo/js/jqcanvo.eventUtil.js"></script>
```

body

```html
<canvas id="canvas" width="800" height="360" style="position:relative;top:8px;left:8px;border:1px dotted #ccc"></canvas>
```

make canvas obj

```js
var canvas=$('#canvas').cj();
```

make context and draw ( An layer is automatically made )

```js
canvas.addContext('L0-test1')
.beginPath({'border-color':"#000000",'background-color':"#000000",opacity:0.7})
.bezier(400,0,500,150,450,50,500,100)
.line(400,200)
.fill()
.stroke();
```

new context and draw

```js
canvas.addContext('L0-test2')
.beginPath({'border-color':"#0000ff",'background-color':"#00ffff",opacity:0.7})
.bezier(0,0,270,0,20,50,300,300)
.arc(45, 95, 35, 0, Math.PI*2, false)
.fill()
.stroke();
```

select a context and save

```js
canvas.select('L0-test1')
.save();
```


Dependency
=
* [jQuery](http://jquery.com/)
