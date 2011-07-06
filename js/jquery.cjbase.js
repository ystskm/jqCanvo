;jQuery.cj || (function($){


$.cj = {
    version: "0.0.1"
};

$.fn.cj = function( option ) {
	// The cjbase object is actually just the init constructor 'enhanced'
	return new $.cj.fn.init( this, option );
};

$.cj.fn = $.cj.prototype = 
{ 
	init: function( canvas ){
		// general object
		try{ // canvas permits both jQuery-obj and Dom-obj. 
			this.canvas = canvas.get(0);
			this.$canvas = canvas.eq(0);
		}catch(e){
			this.canvas = canvas;
			this.$canvas = $(canvas);
		}
		// if id, delete from original
		if(this.$canvas.attr('id')){
			var id = this.$canvas.attr('id');
			this.$canvas.removeAttr('id').addClass(id);
		}
		
        // self variables
        this.instance = $.data(this.canvas,'cjInstance');
        if(!this.instance){
            this.instance = this;
            // function set
            $.extend(this ,$.cj);
            $.data(this.canvas,'cjInstance',this);
        }
		this.layers = $.data(this.canvas,'cjLayers');
		if(!this.layers){
		    this.layers = [{canvas:this.canvas,context:{}}];
		    $.data(this.canvas,'cjLayers',this.layers);
		}
		
		this.LayerNum = 0;
		this.ContextName = null;
		
		return this.instance;
	}
};

//Give the init function the cjbase prototype for later instantiation
$.cj.fn.init.prototype = $.cj.fn;

// original functions
var extend={
	noConflict: function( deep ) {
		$.cj = _$.cj;
		if ( deep ) {
			window.$.cj = _$.cj;
		}
		return $.cj;
	}
	,select: function( name, index){
		if(index || index===0)
			this.LayerNum = index;
		if(name) 
			this.ContextName = name;
		return this;
	}
	,getLayerNum: function(){
		return this.LayerNum;
	}
	,getContextName: function(){
		return this.ContextName;
	}
	,getLayer: function( index ){
		return (index || index===0)? 
		        this.layers[index]
		       :this.layers[this.LayerNum];
	}
	,addLayer: function(){
		var origin = this.$canvas;
		var newLay = origin.clone();
		origin.after(newLay);
		setPosition();
		$(window).resize(setPosition);
		this.LayerNum = this.layers.push({canvas:newLay.get(0),context:{}}) - 1;
		return this;
		function setPosition(){
			newLay.css({position:'absolute',left:origin.offset().left,top:origin.offset().top});
		}
	}
	,getContext: function( name, index ){
		return this.getLayer(index).context[name || this.ContextName];
	}
	,addContext: function( name, index ){
		var lay = this.getLayer(index);
		lay.context[name] = lay.canvas.getContext("2d");
        this.ContextName = name;
		return this;
	}
    ,beginPath: function( options ){
    	if(options){
	    	if(options['Layer'] || options['Layer']===0)
	    		this.LayerNum = options['Layer'];
	    	if(options['Context'])
	    		this.ContextName = options['Context'];
    	}
		var ctx=this.getContext();
        if(options)
            for(var i in options){
            	if(/border/.test(i)){
                    ctx.strokeStyle = options[i];
                }else if(/background/.test(i)){
                    ctx.fillStyle = options[i];
                }else if(/opacity/.test(i)){
                    ctx.globalAlpha = options[i];
                }
            }
        ctx.beginPath();
        return this;
    }
	,moveTo: function( x, y ){
	    var ctx=this.getContext();
	    ctx.moveTo(x,y);
	    return this;
	}
	,line: function(){ // multi pattern args
        var ctx=this.getContext();
        var args=arguments,x,y;
        if(args.length == 4){
            ctx.moveTo(args[0],args[1]);
            x=args[2],y=args[3];
        }else{
            x=args[0],y=args[1];
        }
        ctx.lineTo(x,y);
        ctx.moveTo(x,y);
        return this;
	}
	,rect: function() {
        var ctx=this.getContext();
        var args=arguments,x1,y1,x2,y2;
        x1=args[0],y1=args[1],x2=args[2],y2=args[3];
        ctx.rect(x1,y1,x2,y2);
        return this;
	}
	,arc: function(){ // multi pattern args?
        var ctx=this.getContext();
        var args=arguments,ox,oy,r,sd,ed,cl;
        ox=args[0],oy=args[1],r=args[2],sd=args[3],ed=args[4],cl=args[5];
        ctx.arc(ox,oy,r,sd,ed,cl);
        return this;
	}
	,bezier: function(){ // multi pattern args
	    var ctx=this.getContext();
        var args=arguments,cp1x,cp1y,cp2x,cp2y,x,y;
        if(args.length == 8){
            ctx.moveTo(args[0],args[1]);
            cp1x=args[2],cp1y=args[3],cp2x=args[4],cp2y=args[5],x=args[6],y=args[7];
        }else{
            cp1x=args[0],cp1y=args[1],cp2x=args[2],cp2y=args[3],x=args[4],y=args[5];
        }
	    ctx.bezierCurveTo(cp1x, cp1y ,cp2x ,cp2y ,x ,y);
	    ctx.moveTo(x,y);
	    return this;
	}
	,clear:function(x1,y1,x2,y2){
        var ctx=this.getContext();
        if(!x1) x1=0;
        if(!y1) y1=0;
        if(!x2) x2=this.$canvas.width();
        if(!y2) y2=this.$canvas.height();
        ctx.clearRect(x1,y1,x2,y2);
        return this;
	}
	,stroke: function(){
        var ctx=this.getContext();
        ctx.stroke();
        return this;
	}
    ,fill: function(){
        var ctx=this.getContext();
        ctx.fill();
        return this;
    }
    ,text: function(t,x,y ){
        var ctx=this.getContext();
        ctx.fillText(t,x,y);
        return this;
    }
    ,save: function(){
        var ctx=this.getContext();
        ctx.save();
        return this;
    }
    ,restore: function(){
        var ctx=this.getContext();
        ctx.restore();
        return this;
    }
};

$.extend($.cj   , extend);
$.extend($.cj.fn, extend);

})(jQuery);

