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

make new layer and context ( context will automatically selected )

```
canvas.addLayer().addContext('L1-cube');
```

select a context and save

```js
canvas.select('L0-test1')
.save();
```

draw in new context
```
	canvas.select('L1-cube',1)
	.clear()
	.beginPath({'border-color':'#000','background-color':'#000',opacity:1})
	.rect(0,0,90,30)
	.stroke()
	.text("X座標：" + canvas.mouseX(e), 5, 12)
	.text("Y座標：" + canvas.mouseY(e), 5, 24);
```

Dependency
=
* [jQuery](http://jquery.com/)
