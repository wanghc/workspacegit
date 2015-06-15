/**
* @author: wanghc
* @date:   2014-06-04
* @desc: 通过重写websys_ul方法, 实现放大镜与日期在当前界面显示.
* 往界面中写入id为dhcpopup的层, 存放放大镜与日期, Esc键隐藏层
**/
if ("undefined" !== typeof Ext){
	Ext.onReady(function(){
		var s ,html;
		var lookupDiv = document.createElement("div");
		lookupDiv.id = dhcc.icare.lu.popupDiv ;
		lookupDiv.style.display = "none";
		lookupDiv.style.zIndex = 12000;	
		lookupDiv.style.position = "absolute";
		lookupDiv.style.borderStyle = 'outset';
		//lookupDiv.style.borderWidth = '1px';
		lookupDiv.style.borderColor = '#a3bae9';
		lookupDiv.style.backgroundColor ='#ffffff';
		document.body.appendChild(lookupDiv);
		if(Ext.isIE6){
			var prop = function (n){return n&&n.constructor==Number?n+'px':n;}
			s = {top:'auto',left:'auto',width:'auto',height:'auto',opacity:true,src:'javascript:false;'};
			html= '<iframe class="bgiframe" frameborder="0" tabindex="-1" src="'+s.src+'"'+
						   ' style="display:block;position:absolute;z-index:-1;'+
							   (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
							   'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
							   'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
							   'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
							   'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
						'"/>';
			lookupDiv.insertBefore(document.createElement(html));
		}
		
		var extStyle = document.createElement("style");
		extStyle.id = dhcc.icare.lu.popupDiv+"extStyle";
		//extStyle.innerHTML = "";
		document.body.appendChild(extStyle);
		extStyle="";
		Ext.EventManager.on(document.body,"keydown",function(e){
			var keycode = e.getKey();
			if (keycode==Ext.EventObject.ESC){ //esc 27
				clearlu();			
			}		
			if (dhcc.icare.lu.component && dhcc.icare.lu.component.bbar){			
				//grid
				var t = dhcc.icare.lu.component;
				if (keycode == Ext.EventObject.PAGE_DOWN){			
					if (t.getBottomToolbar().getPageData().activePage< t.getBottomToolbar().getPageData().pages){
						t.getBottomToolbar().moveNext();
					}
				}
				if (keycode == Ext.EventObject.PAGE_UP){
					if (t.getBottomToolbar().getPageData().activePage>1){
						t.getBottomToolbar().movePrevious();
					}
				}			
			}
		})
		Ext.EventManager.on(document.body,"mousedown",function(e){
			var height = Ext.getBody().getHeight() - 30;
			var width = Ext.getBody().getWidth() - 30;
			if (e.xy[1]>height)return ; //ie8下点滚动条
			if (e.xy[0]>width)return;
			if (e.target){
				if(e.target.id.indexOf(dhcc.icare.lu.preSrcElementId)>-1){
					return false;
				}
				var tmp = e.target;
				var maxTimes=20;	
				while(tmp){
					if(tmp.id && tmp.id==dhcc.icare.lu.popupDiv){return false;}
					if(tmp.tagName=="BODY"){
						clearlu();
						return false;
					}	
					tmp = tmp.parentElement;
					maxTimes--;
					if(maxTimes==1) return ;
				}
			}
		})
	});		
	Ext.namespace('dhcc.icare');
	dhcc.icare.lu = {
		preSrcElementId:"",		//放大镜关联的input的id
		popupDiv : "zdhcpopup",
		lookUp: "websys.lookup.csp",
		lookUpDate: "websys.lookupdate.csp",
		defaultHeight: 180,		
		defaultWidth: 300,
		maxHeight: 380,	//一页显示15行,是高度最高时		
		pageSize: 15,
		fontSize: 13
	};	
	/**
	*@param: {Dom} container
	*@param: {Dom} srcElement 放大镜输入框
	*@desc: 把容器移动到输入框下面或上面  	
	*/
	setPosition = function(container, srcElement){
		var bodyHeight = document.body.clientHeight;
		var bodyWidth = document.body.clientWidth;
		var height = dhcc.icare.lu.defaultHeight;
		var width = dhcc.icare.lu.defaultWidth;
		var tmpWidth = srcElement.offsetWidth; 
		var tmpHeight = srcElement.offsetHeight;
		var el = Ext.get(srcElement.id)
		var extxy = el.getAnchorXY();
		var tmpLeft = extxy[0] ;
		var tmpTop = extxy[1]+tmpHeight;
		if (((bodyHeight-tmpTop) < height) && ( (tmpTop-tmpHeight) > height )){					//下面不能显示,但上面能显示
			tmpTop = tmpTop  - tmpHeight - height - 3;
		}
		if ( ((bodyWidth-tmpLeft)<width) && ((tmpLeft+tmpWidth)>width) ){	//右边不能显示,但左边能显示			
			tmpLeft = bodyWidth - width - (bodyWidth-tmpLeft-tmpWidth);		//减放大镜的宽度,再减文本框右边空白宽度
		}
		//container.style.pixelTop = tmpTop ; 
		//container.style.pixelLeft = tmpLeft ;
		container.style.top = tmpTop + "px";
		container.style.left = tmpLeft + "px";		
		container.style.borderWidth = '1px';
		container.style.display = "";
	};
	clearlu = function(){
		var container = document.getElementById(dhcc.icare.lu.popupDiv);
		container.style.borderWidth = '0px';
		container.style.display = "none";
		container.innerHTML = "";
		if (dhcc.icare.lu.component) {
			dhcc.icare.lu.component.destroy();
			delete dhcc.icare.lu.component;
		}
		if(Ext.isIE) CollectGarbage();
	};
	dhcc.icare.lu.createLookup = function(url,srcElement){
		Ext.QuickTips.init();
		var cspNameLen = url.indexOf(dhcc.icare.lu.lookUp) + dhcc.icare.lu.lookUp.length;
		if (cspNameLen>-1){url = url.slice(cspNameLen+1);}
		var p = Ext.urlDecode(url);
		var myCONTEXT = p["CONTEXT"];
		if (('undefined' == typeof myCONTEXT) && (myCONTEXT=="")) return false;
		var mycontextary = myCONTEXT.split(":");
		if (mycontextary.length !=2 ) return false;
		p.rnd = Math.random();
		p.pClassName = mycontextary[0].substring(1);
		p.pClassQuery = mycontextary[1];
		p.resizeColumn = 1;
		delete p.CONTEXT;		
		var mymodalstr = tkMakeServerCall("ext.websys.QueryBroker", "ReadRSNew", p.pClassName, p.pClassQuery);		
		var json = Ext.decode(mymodalstr);		
		var cm = new Ext.grid.ColumnModel({columns : json.cms, defaults:{ sortable: false, menuDisabled: true }});
		dhcc.icare.lu.pageSize = json.pageSize || dhcc.icare.lu.pageSize;
		var styleObj = document.getElementById(dhcc.icare.lu.popupDiv+"extStyle");
		if(json.fontSize){
			styleObj.innerHTML = ".x-grid3-row td, .x-grid3-summary-row td {font: normal "+json.fontSize+"px arial, tahoma, helvetica, sans-serif;} .x-grid3-hd-row td {font: normal "+json.fontSize+"px arial, tahoma, helvetica, sans-serif;}"
		}
		var mycmurl = "ext.websys.querydatatrans.csp";
		var resizeColumnFun = function(s,rs,obj){
			if (obj.params["resizeColumn"] != 1) return false;
			var gridWidth,gridHeight,cm,objWidth = {};			
			gridWidth = 0;
			cm = grid.colModel ;
			for(var cm_i=0; cm_i<cm.config.length; cm_i++){
				if (cm.config[cm_i].hidden) continue;
				objWidth.key = cm.config[cm_i].dataIndex;				
				objWidth.val = cm.config[cm_i].width;				
				//objWidth.val = 60 ;
				for(var rs_i=0;rs_i<rs.length;rs_i++){
					var len = rs[rs_i].get(objWidth.key).trim().replace(/[^\x00-\xff]/g,"**").length * 7;
					if (len > objWidth.val){
						objWidth.val = len ;
					}
				}				
				cm.config[cm_i].width = objWidth.val;
				gridWidth += objWidth.val;
			}
			if (gridWidth < dhcc.icare.lu.defaultWidth) gridWidth = dhcc.icare.lu.defaultWidth;
			if(gridWidth!=dhcc.icare.lu.defaultWidth) grid.setWidth(gridWidth+40);	
			gridHeight = rs.length*25 + 40;			
			if (gridHeight < dhcc.icare.lu.defaultHeight) gridHeight =  dhcc.icare.lu.defaultHeight;
			if (gridHeight > dhcc.icare.lu.maxHeight) gridHeight =   dhcc.icare.lu.maxHeight;			
			if (gridHeight != dhcc.icare.lu.defaultHeight) grid.setHeight(gridHeight);
			grid.reconfigure(grid.store, cm);
			//alert(gridWidth);
			grid.store.baseParams.resizeColumn = 0;				
		};    
		var storeLoaded = function(obj,records,options){
			// ds.onload  加载数据后触发事件，重新计算列宽
			resizeColumnFun(obj,records,options);
			grid.getSelectionModel().selectFirstRow();
			grid.getView().focusRow(0);
		};
		var ds = new Ext.data.JsonStore({
			url: mycmurl,
			baseParams: p,
			root: "record",
			totalProperty: "total",
			fields: json.fns ,
			listeners:{'load': storeLoaded}
		});
		var pagingBar = new Ext.PagingToolbar({
			pageSize: dhcc.icare.lu.pageSize,
			store: ds,
			items:['-',{text:'关闭',handler:clearlu}],
			displayInfo: true,
			displayMsg: '{0}-{1},共{2}条'
		});
		var myloadM;
		if (Ext.isIE){
			myloadM = new Ext.LoadMask(document.getElementById(dhcc.icare.lu.popupDiv), {msg: "正在加载数据...",store:ds});
		} else {
			myloadM = true;
		}		
		var isSelected = 0;
		var myjsf = p["TLUJSF"];
		var GridRowSelect = function(firstCol, allCol) {
			try {
				eval(srcElement.id + "_lookupsel(unescape('" + firstCol + "'))");
			} catch (err) {}
			if (myjsf != "") {
				try {
					eval(myjsf + "(unescape('" + allCol + "'))");
				} catch (err) {}
			}
			isSelected = 1;
			grid.destroy();			
			clearlu();
			RegainFocus();
		};
		var RegainFocus = function() {
			if (!isSelected) {
				try {
					var obj = document.getElementById(dhcc.icare.lu.preSrcElementId);
					websys_setfocus(obj);
				} catch (e) {};
			}
		};
		var selectRow = function(grid,rowIndex,e) {
			var tmpRecord = grid.getSelectionModel().getSelected();
			var myColAry = "";
			for (var myIdx = 0; myIdx < json.fns.length; myIdx++) {
				if (myIdx==0){
					myColAry = tmpRecord.get(json.fns[myIdx].name);
				}else{
					myColAry = myColAry+"^"+ tmpRecord.get(json.fns[myIdx].name)
				}					
			}
			GridRowSelect(tmpRecord.get(json.fns[0].name), myColAry);
		}
		var cmslen = json.cms.length;
		var displayFieldCmCount = 0;
		for(var i = 0 ; i < cmslen ; i++){
			if(!json.cms[i].hidden){		    	   			   
				displayFieldCmCount++;
			}
		}
		var tmpWidth = (((displayFieldCmCount*140) > document.body.clientWidth) ? document.body.clientWidth : displayFieldCmCount*140);
		if(tmpWidth < dhcc.icare.lu.defaultWidth) tmpWidth=dhcc.icare.lu.defaultWidth;	
		var grid = new Ext.grid.GridPanel({			
			title: "", split: true, border: false,width: tmpWidth, height: dhcc.icare.lu.defaultHeight,cm: cm, ds: ds,
			loadMask: myloadM, stripeRows: true,bbar: pagingBar,
			listeners:{
				'headerdblclick':function(){
						var flag = tkMakeServerCall("web.SSGroup","GetAllowWebColumnManager",session['LOGON.GROUPID']);
						if(flag==1) websys_lu('../csp/websys.component.customiselayout.csp?ID=1872&CONTEXT=K'+p.pClassName+':'+p.pClassQuery+"&DHCICARE=1",false);		
					},
				'rowclick': selectRow,
				'keydown': function(e) {
					if (e.keyCode == Ext.EventObject.ENTER) {						
						var record = this.getSelectionModel().getSelected();
						selectRow(this, this.store.indexOf(record),e);
					}
				},
				'afterrender': function(t){
					t.store.load({params: {start: 0, limit: dhcc.icare.lu.pageSize}});
				}
			}
		});	
		//clearlu();
		grid.render(dhcc.icare.lu.popupDiv);
		return grid;
	};
	dhcc.icare.lu.createLookupDate = function(url,srcElement){		
		return new Ext.DatePicker({
			dateSrcElementId:srcElement.id,				
			value: Date.parseDate(srcElement.value,"d/m/Y"),
			renderTo:dhcc.icare.lu.popupDiv,					
			listeners:{
				'select':function(t,date){
					document.getElementById(this.dateSrcElementId).value = date.format('d/m/Y');
					t.hide(); t.destroy();
					clearlu();
				}
			}
		});
	};
	websys_lubak = websys_lu;
	///http://127.0.0.1/dthealth/web/csp/websys.lookup.csp?ID=d1434iSSGRPDesc&CONTEXT=Kweb.SSGroup:LookUpPartial&TLUDESC=%E5%AE%89%E5%85%A8%E7%BB%84&TLUJSF=GroupHanlder&P1=&P2=
	///http://127.0.0.1/dthealth/web/csp/websys.lookupdate.csp?ID=DateOfBirth&TLUDESC=%B3%F6%C9%FA%C8%D5%C6%DA&STARTVAL=&DATEVAL=
	/*
	{
		"LookupID":"SSGRPDesc",
		"CONTEXT":"Kweb.SSGroup:LookUpPartial",
		"TLUDESC":"%E5%AE%89%E5%85%A8%E7%BB%84",
		"TLUJSF":"GroupHanlder",
		"P1":"",
		"P2":""
	}
	*/
	websys_lu = function(url,islookup,posn){
		var container = document.getElementById(dhcc.icare.lu.popupDiv);			
		var ludFlagIndex = url.indexOf(dhcc.icare.lu.lookUpDate);
		var luFlagIndex = url.indexOf(dhcc.icare.lu.lookUp);
		var srcElement = null,srcElementId = "";		
		if (islookup==1){
			if (url.indexOf("?ID=") == -1) return false;
			srcElementId = url.slice(url.indexOf("?ID=")+4).split('&')[0];
			//console.log(srcElementId);
			srcElement =  document.getElementById(srcElementId);
			if (ludFlagIndex > -1) {				
				if ((dhcc.icare.lu.preSrcElementId==srcElementId)&&(container.style.display != "none")) return false;
				if (srcElement) { 
					clearlu();
					setPosition(container,srcElement); 					
					dhcc.icare.lu.component = dhcc.icare.lu.createLookupDate(url,srcElement); 
					//container.style.width = 183;
				}
			}else if (luFlagIndex > -1){
				if(!srcElement){ //放大镜ID入参有时为d22222iLookup					
					srcElementId = srcElementId.slice(srcElementId.indexOf('i')+1);			
					srcElement = document.getElementById(srcElementId);
				}
				if(!srcElement){ //自己找源事件框
					srcElement = websys_getSrcElement();
					srcElementId = srcElement.id;
				}
				if ((dhcc.icare.lu.preSrcElementId==srcElementId)&&(container.style.display != "none")) return false;
				if (srcElement) {
					clearlu(); 
					setPosition(container,srcElement); 
					try{
						dhcc.icare.lu.component = dhcc.icare.lu.createLookup(url,srcElement); 
					}catch(e){
						alert("生成放大镜失败! \n" + e);
						return false;
					}
					//container.style.width = dhcc.icare.lu.component.getWidth();
					//alert(" wanghc "+dhcc.icare.lu.component.getWidth());
				}
			}							
			if (srcElement) dhcc.icare.lu.preSrcElementId = srcElement.id;
			return false;	
		}	
		websys_lubak(url, islookup, posn);	
	};
}