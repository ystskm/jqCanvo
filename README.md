#:: jqCanvo ::
> /jay-cue-kyanbo/

##Abstract
#### Chain-draw and layer supported jQuery library for Canvas.

##Presentation / Demo
#### [realtime editor](http://cloudplus.me/Canvas/)

##Prepare for use
1.__in <head>__  

	<script type="text/javascript" src="/jqCanvo/jquery.jqcanvo.js"></script>
	<!-- If you want to use some shape -->
	<script type="text/javascript" src="/jqCanvo/lib/jqcanvo.shapes.js"></script>
	<!-- If you want to event handle -->
	<script type="text/javascript" src="/jqCanvo/lib/jqcanvo.util.js"></script>

2.__create__  

	<canvas id="canvas" width="800" height="360" style="position:relative;top:8px;left:8px;border:1px dotted #ccc"></canvas>

3.__make canvas obj__  

	var c=$('#canvas').canvo();

##Usage
__make context and draw ( An layer is automatically made )__  

	c.addContext('L0-test1')
	  .beginPath({'border-color':"#000000",'background-color':"#000000",opacity:0.7})
	  .bezier(400,0,500,150,450,50,500,100)
	  .line(400,200)
	  .fill()
	  .stroke();

__new context and draw__  

	c.addContext('L0-test2')
	  .beginPath({'border-color':"#0000ff",'background-color':"#00ffff",opacity:0.7})
	  .bezier(0,0,270,0,20,50,300,300)
	  .arc(45, 95, 35, 0, Math.PI*2, false)
	  .fill()
	  .stroke();

__make new layer and context ( context will automatically selected )__  

	c.addLayer().addContext('L1-cube');

__select a context and save__  

	c.select('L0-test1')
	  .save();

__draw in new context__  

	c.select('L1-cube',1)
	  .clear()
	  .beginPath({'border-color':'#000','background-color':'#000',opacity:1})
	  .rect(0,0,90,30)
	  .stroke()
	  .text("X座標:" + canvas.mouseX(e), 5, 12)
	  .text("Y座標:" + canvas.mouseY(e), 5, 24);

##Dependency
* [jQuery](http://jquery.com/) > 1.8
