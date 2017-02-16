$.fn.make2048 = function(option){
	//扩展jquery
	var defaultOption = {
		animateTime:300,
		width:4,
		height:4,
		style:{
			background_color:"rgb(184,175,158)",
			block_background_color:"rgb(204,192,178)",
			padding:18,
			block_size:100,
			block_style:{
			"font-family":"微软雅黑",
			"font-weight":"bold",
			"text-align":"center"
			}
		},
		
		blocks:[
		{level:0,value:2,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":58}},
		{level:1,value:4,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":58}},
		{level:2,value:8,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":58}},
		{level:3,value:16,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":50}},
		{level:4,value:32,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":50}},
		{level:5,value:64,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":50}},
		{level:6,value:128,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":42}},
		{level:7,value:256,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":42}},
		{level:8,value:512,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":42}},
		{level:9,value:1024,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":34}},
		{level:10,value:2048,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":34}},
		{level:11,value:4096,style:{"background-color":"rgb(238,228,218)","color":"rgb(124,115,106)","font-size":34}}
		
		
			
			
		]
	}

	var state=[];
	option = $.extend({},defaultOption,option);
	console.log("游戏配置:",option);
	//一次只能打开一个游戏
	if(this.length>1) throw "一次只能开始一个错误";
	if(this.length==0) throw "未找到游戏容器";
	
	//创建游戏容器
	var $this = $(this[0]);
	$this.css({
		"background-color":option.style.background_color,
		"border-radius":option.style.padding,
		"position":"relative",
		"-webkit-user-select":"none",
		
	});
	//创建背景上的小方块
	//得到每个块的横纵坐标
	var getPosition = function(x,y){
		return {
	"top":option.style.padding+y*(option.style.block_size+option.style.padding),
	"left":option.style.padding+x*(option.style.block_size+option.style.padding)
	}}
	var buildBackground = function(){
		var backgrounds=[];
		for(var x=0;x<option.width;x++){
			for(var y=0;y<option.height;y++)
			{
				state.push(null);
				var bg_block=$("<div></div>");
				var position=getPosition(x,y);
				bg_block.css({
					"width":option.style.block_size,
					"height":option.style.block_size,
					"background-color":option.style.block_background_color,
					"position":"absolute",
					"top":position.top,
					"left":position.left
				});
					backgrounds.push(bg_block);
			}
		}
		//减少对DOM对象的请求
		$this.append(backgrounds);
		//绝对定位的元素脱离文档流，需要设置父容器的宽高才能把父容器撑开
		$this.width((option.style.padding+option.style.block_size)*option.width+option.style.padding);
		$this.height((option.style.padding+option.style.block_size)*option.height+option.style.padding);
	}
	//创建移动的块
	//得到所有的空块
	var getEmptyBlockIndexs = function(x,y){
		var emptyBlockIndexs = [];
		//用jquery更好兼容，用map,不太好兼容
		//index,object和原生js的前后不一样
		$(state).each(function(i,o){
			if(o == null) emptyBlockIndexs.push(i);
		})
		return emptyBlockIndexs;
	}
	var getCoordinate=function(putIndex){
		return {
			x:putIndex % option.width,
			y:Math.floor(putIndex / option.width)
		}
	}
	var getIndex=function(x,y){
		return x+y*option.width;
	}
	
	var buildBlock = function(level,x,y){
		var emptyBlockIndexs = getEmptyBlockIndexs();
		if(emptyBlockIndexs.length == 0) return false;
		//随机生成空块
		var putIndex;
		if(x!=undefined&&y!=undefined){
			putIndex = getIndex(x,y);
		}
		else{
		putIndex = emptyBlockIndexs[Math.floor(Math.random()*emptyBlockIndexs.length)];
		}//?????
		var block;
		if(level!=undefined){
			block=$.extend({},option.blocks[level]);
		}
		else{
			block=Math.random()>=0.5?option.blocks[0]:option.blocks[1];
		}
		//获得坐标
		var coordinate = getCoordinate(putIndex);

        var position = getPosition(coordinate.x,coordinate.y);
		//加入DOM
		var blockDom=$("<div></div>");
		blockDom.addClass("block_"+coordinate.x+"_"+coordinate.y);
		blockDom.css($.extend(option.style.block_style,{
			"position":"absolute",
			"top":position.top+option.style.block_size/2,
			"left":position.left+option.style.block_size/2,
			"width":0,
			"height":0
		
		},block.style));
		$this.append(blockDom);
		state[putIndex] = block;
		//展现出来
		//尽量不要用常量，用配置变量的方式，方便以后的修改

		blockDom.animate({
			"width":option.style.block_size,
			"height":option.style.block_size,
			"line-height":option.style.block_size+"px",
			"top":position.top,
			"left":position.left
		},option.animateTime,(function(blockDom)
				{
			return function(){
			blockDom.html(block.value);}
			})(blockDom))

		return true;
	}
	var getBlock=function(x,y){
		return state[getIndex(x,y)];
	} 
	var move=function(direction){
		//代码可以进一步简化，把函数给抽取出来
		switch(direction){
		case "up":
			for(var x=0;x<option.width;x++){
				for(var y=1;y<option.height;y++){
					var block=getBlock(x,y);
					if(block==null) continue;
					var target_coordinate = {
					x:x,
					y:y-1
					};
					var target_block=
						getBlock(target_coordinate.x,
						target_coordinate.y);
					var moved=0;
					while(target_coordinate.y>0&&target_block==null){
						target_coordinate.y=target_coordinate.y-1;
						target_block=getBlock(target_coordinate.x,target_coordinate.y);
						//防止死循环
						if(++moved>Math.max(option.width,option.height))break;
						
					}
					var blockDom=$(".block_"+x+"_"+y)
					var position = getPosition(target_coordinate.x,target_coordinate.y);
					//三种情况
					//1.上面有东西，两个块相等
					//2.上面没有块，直接移动过去
					//3.上面有块，块不相等

					if(target_block==null){
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);
						//buildBlock(0);


						}
					else if(target_block.value == block.value){
						var updateBlock = $.extend({},option.blocks[block.level+1]);
						updateBlock.justModified = true;
						state[getIndex(x,y)] = null;
						state[getIndex(target_coordinate.x,target_coordinate.y)] = updateBlock;
						blockDom.animate(
						{
							"top":position.top,
							"left":position.left
						},	
						option.animateTime,(function(blockDom,target_coordinate,updateBlock){
								return function(){
									blockDom.hide();
									var target_blockDom = $(".block_"+target_coordinate.x+"_"+target_coordinate.y);
									target_blockDom.html(updateBlock.value);
									target_blockDom.css(updateBlock.style);
								};
							})(blockDom,target_coordinate,updateBlock));
						//buildBlock(0);


					}
					else{
						target_coordinate.y=target_coordinate.y+1;
						position = getPosition(target_coordinate.x,target_coordinate.y);
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);
						//buildBlock(0);
						
					}
				}
		}
		buildBlock(0);
		break;
		case "down":
			for(var x=option.width-1;x>=0;x--){
				for(var y=option.height-2;y>=0;y--){
					var block=getBlock(x,y);
					if(block==null) continue;
					var target_coordinate = {
					x:x,
					y:y+1
					};
					var target_block=
						getBlock(target_coordinate.x,
						target_coordinate.y);
					var moved=0;
					while(target_coordinate.y<option.height-1&&target_block==null){
						target_coordinate.y=target_coordinate.y+1;
						target_block=getBlock(target_coordinate.x,target_coordinate.y);
						//防止死循环
						if(++moved>Math.max(option.width,option.height))break;
						
					}
					var blockDom=$(".block_"+x+"_"+y)
					var position = getPosition(target_coordinate.x,target_coordinate.y);
					//三种情况
					//1.上面有东西，两个块相等
					//2.上面没有块，直接移动过去
					//3.上面有块，块不相等

					if(target_block==null){
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);


						}
					else if(target_block.value == block.value){
						var updateBlock = $.extend({},option.blocks[block.level+1]);
						updateBlock.justModified = true;
						state[getIndex(x,y)] = null;
						state[getIndex(target_coordinate.x,target_coordinate.y)] = updateBlock;
						blockDom.animate(
						{
							"top":position.top,
							"left":position.left
						},	
						option.animateTime,(function(blockDom,target_coordinate,updateBlock){
								return function(){
									blockDom.hide();
									var target_blockDom = $(".block_"+target_coordinate.x+"_"+target_coordinate.y);
									target_blockDom.html(updateBlock.value);
									target_blockDom.css(updateBlock.style);
								};
							})(blockDom,target_coordinate,updateBlock));



					}
					else{
						target_coordinate.y=target_coordinate.y-1;
						position = getPosition(target_coordinate.x,target_coordinate.y);
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);
						
					}
				}
		}
		buildBlock(0);
		break;
		case "left":
			for(var x=1;x<option.width;x++){
				for(var y=0;y<option.height;y++){
					var block=getBlock(x,y);
					if(block==null) continue;
					var target_coordinate = {
					x:x-1,
					y:y
					};
					var target_block=
						getBlock(target_coordinate.x,
						target_coordinate.y);
					var moved=0;
					while(target_coordinate.x>0&&target_block==null){
						target_coordinate.x=target_coordinate.x-1;
						target_block=getBlock(target_coordinate.x,target_coordinate.y);
						//防止死循环
						if(++moved>Math.max(option.width,option.height))break;
						
					}
					var blockDom=$(".block_"+x+"_"+y)
					var position = getPosition(target_coordinate.x,target_coordinate.y);
					//三种情况
					//1.上面有东西，两个块相等
					//2.上面没有块，直接移动过去
					//3.上面有块，块不相等

					if(target_block==null){
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);


						}
					else if(target_block.value == block.value){
						var updateBlock = $.extend({},option.blocks[block.level+1]);
						updateBlock.justModified = true;
						state[getIndex(x,y)] = null;
						state[getIndex(target_coordinate.x,target_coordinate.y)] = updateBlock;
						blockDom.animate(
						{
							"top":position.top,
							"left":position.left
						},	
						option.animateTime,(function(blockDom,target_coordinate,updateBlock){
								return function(){
									blockDom.hide();
									var target_blockDom = $(".block_"+target_coordinate.x+"_"+target_coordinate.y);
									target_blockDom.html(updateBlock.value);
									target_blockDom.css(updateBlock.style);
								};
							})(blockDom,target_coordinate,updateBlock));



					}
					else{
						target_coordinate.x=target_coordinate.x+1;
						position = getPosition(target_coordinate.x,target_coordinate.y);
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);
						
					}
				}
		}
		buildBlock(0);
		break;
		case "right":
			for(var x=option.width-2;x>=0;x--){
				for(var y=0;y<option.height;y++){
					var block=getBlock(x,y);
					if(block==null) continue;
					var target_coordinate = {
					x:x+1,
					y:y
					};
					var target_block=
						getBlock(target_coordinate.x,
						target_coordinate.y);
					var moved=0;
					while(target_coordinate.x<option.width-1&&target_block==null){
						target_coordinate.x=target_coordinate.x+1;
						target_block=getBlock(target_coordinate.x,target_coordinate.y);
						//防止死循环
						if(++moved>Math.max(option.width,option.height))break;
						
					}
					var blockDom=$(".block_"+x+"_"+y)
					var position = getPosition(target_coordinate.x,target_coordinate.y);
					//三种情况
					//1.上面有东西，两个块相等
					//2.上面没有块，直接移动过去
					//3.上面有块，块不相等

					if(target_block==null){
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);


						}
					else if(target_block.value == block.value){
						var updateBlock = $.extend({},option.blocks[block.level+1]);
						updateBlock.justModified = true;
						state[getIndex(x,y)] = null;
						state[getIndex(target_coordinate.x,target_coordinate.y)] = updateBlock;
						blockDom.animate(
						{
							"top":position.top,
							"left":position.left
						},	
						option.animateTime,(function(blockDom,target_coordinate,updateBlock){
								return function(){
									blockDom.hide();
									var target_blockDom = $(".block_"+target_coordinate.x+"_"+target_coordinate.y);
									target_blockDom.html(updateBlock.value);
									target_blockDom.css(updateBlock.style);
								};
							})(blockDom,target_coordinate,updateBlock));



					}
					else{
						target_coordinate.x=target_coordinate.x-1;
						position = getPosition(target_coordinate.x,target_coordinate.y);
						//当前设为空
						state[getIndex(x,y)]=null;
						//目标设为块
						state[getIndex(target_coordinate.x,target_coordinate.y)]=block;
						//渲染页面
						blockDom.removeClass();
						blockDom.addClass("block_"+target_coordinate.x+"_"+target_coordinate.y);
						blockDom.animate({
							"top":position.top,
							"left":position.left,
							
						},option.animateTime);
						
					}
				}
		}
		buildBlock(0);
		break;
		}}
		
		//键盘通过ascii码控制
		var keyCh = function(evt){
			switch(evt.which){
				case 38:
					move("up");
				break;
				case 40:
					move("down");
				break;
				case 37:
					move("left");
				break;
				case 39:
					move("right");
				break;

			}}
		//鼠标控制
		var mouseStartPoint = null;
		var mouseCh = function(evt){
			if(evt.type=="mousedown"&&mouseStartPoint==null){
				mouseStartPoint = {x:evt.pageX,y:evt.pageY}
			}
			if(evt.type=="mouseup"){
				var xDis=evt.pageX-mouseStartPoint.x;
				var yDis=evt.pageY-mouseStartPoint.y;
				if(Math.abs(xDis)+Math.abs(yDis)>20){
					if(Math.abs(xDis)>=Math.abs(yDis)){
						if(xDis>0){move("right");}
						else{
							move("left");
						}
					
					}else{
						if(yDis>0){move("down");}
						else{move("up");}
					}
				}

			mouseStartPoint = null;

		}
}




		var gameStart=function(){
	buildBackground();
	buildBlock();
	buildBlock();
	$(document).on("keydown",keyCh);
	$(document).on("mousedown",mouseCh);
	$(document).on("mouseup",mouseCh);
}
	/*var gameEnd=function(){
		$(document).off("keydown",keyCh);
		$(document).off("keydown",mouseCh);
		$(document).off("keyup",mouseCh);
		var score = 0;
		for(var i=0;i<state.length;i++){
			if()
		}
	}*/
	gameStart();}
	
	
	