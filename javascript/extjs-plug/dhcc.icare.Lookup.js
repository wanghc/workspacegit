/**
*@author: wanghc
*@author: 2011-11-11
*@name: framework/ext.icare.Lookup.js
*@desc �Ŵ󾵸���
*@sample:
var lookup  = new dhcc.icare.Lookup({
	lookupListComponetId: 1872,
	lookupPage: 'dhcdoc.prnordernurse',
	lookupName: 'windTarItemDesc',
	listClassName: 'web.DHCIPBillInsExpItm',
	listQueryName: 'FindTariItem',
	listProperties: [function(){return document.getElementById('windTarItemDesc').value;},""],
});
lookup.doSearch(["aspl",""]);<==>lookup.store.load({params:{P1:"aspl",P2:""}});
* lasterdate: 2012/4/1 ���� displayCM���� 
* 2012/4/18 ����ȷ��λ�õķ���
*/
Ext.namespace('dhcc.icare');
dhcc.icare.lookupconfig = {
	dsurl:"ext.websys.querydatatrans.csp", 	//����json��ҳ��
	queryBroker:"ext.websys.QueryBroker", 	//����cm��store�ĺ�̨������
	readrs:"ReadRSNew",						//����cm��store�ĺ�̨�෽����
	lookupDivId:"bodyLookupComponetId",		//body�ڵ�div��id
	lookupDiv:'',							//ȫ�ֵ�div dom���� idΪdhcc.icare.lookupconfig.lookupDivId
	preLookup:''							//��һ�ε�lookup����
};

function prop(n){return n&&n.constructor==Number?n+'px':n;}
function createLookupBodyDiv(){
	var s ,html;
	dhcc.icare.lookupconfig.lookupDiv = document.createElement("div");
	dhcc.icare.lookupconfig.lookupDiv.id = dhcc.icare.lookupconfig.lookupDivId ;
	dhcc.icare.lookupconfig.lookupDiv.style.display = "none";
	dhcc.icare.lookupconfig.lookupDiv.style.zIndex = 12000;	
	dhcc.icare.lookupconfig.lookupDiv.style.position = "absolute";
	dhcc.icare.lookupconfig.lookupDiv.style.borderStyle = 'outset';
	dhcc.icare.lookupconfig.lookupDiv.style.borderWidth = '2px';
	dhcc.icare.lookupconfig.lookupDiv.style.borderColor = '#a3bae9';

	document.body.appendChild(dhcc.icare.lookupconfig.lookupDiv);
	if(Ext.isIE6){
		s = {top:'auto',left:'auto',width:'auto',height:'auto',opacity:true,src:'javascript:false;'};
		html= '<iframe class="bgiframe"frameborder="0"tabindex="-1"src="'+s.src+'"'+
	                   'style="display:block;position:absolute;z-index:-1;'+
	                       (s.opacity !== false?'filter:Alpha(Opacity=\'0\');':'')+
	                       'top:'+(s.top=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderTopWidth)||0)*-1)+\'px\')':prop(s.top))+';'+
	                       'left:'+(s.left=='auto'?'expression(((parseInt(this.parentNode.currentStyle.borderLeftWidth)||0)*-1)+\'px\')':prop(s.left))+';'+
	                       'width:'+(s.width=='auto'?'expression(this.parentNode.offsetWidth+\'px\')':prop(s.width))+';'+
	                       'height:'+(s.height=='auto'?'expression(this.parentNode.offsetHeight+\'px\')':prop(s.height))+';'+
	                '"/>';
		dhcc.icare.lookupconfig.lookupDiv.insertBefore(document.createElement(html));
	}
}
Ext.onReady(createLookupBodyDiv);
//lookup id = this.lookupName+"zlookup"
dhcc.icare.Lookup = Ext.extend(Ext.grid.GridPanel, {  
    /**
    * @cfg {String} lookupListComponetId websys.Lookup.List�����Ӧ��ID ��:1872
    * ���Զ����в����õ�
    * ���ֵΪwebsys.Lookup.List�����Ӧ��ID,��˫����ͷ������Զ������
    */
    /**
    * @cfg {String} lookup PageName Or componentName
    * �ڲ�ѯʱ��Ϊrequest������̨
    */
    lookupPage: '',
    /**
    * @cfg {String} Lookup name
    *������������������  
    */
    lookupName: '',
    /**
	* @cfg {String}  listClassName ��̨Query����
	* ��listQueryNameһ������cm��store
	*/
    listClassName: '',
    /**
    * @cfg {String} listQueryName ��̨Query����
    * ��listClassNameһ������cm��store
    */
    listQueryName: '',
    /**
	* @cfg {Array} listProperties ��̨Query�Ĳ���
    */
    listProperties: [],
    /**
    * @cfg {Boolean} resizeColumn �Ƿ������Store�����¼����п�. default false.
    * ������Ի�ǿ�����������lookup
    */
    resizeColumn : false ,
    /**
    * @cfg {String} displayField ��ʾ�������ı����е��ֶ��� Ĭ��ΪQuery��һ����,��ʾstore����
    */
    /**
    * @cfg {Array} displayCM grid��ʾ���������� Ĭ����ͨ����̨query����
    * sample :
    *��̨ query��������ֶ���ֻҪ��ʾ���� displayCM: ['arcim']
    */
    viewConfig:{forceFit:true},
    defaultHeight: 320,
    initComponent: function() {
	    //if(window.console) console.log("initComponent start" + new Date());	    
    	if(dhcc.icare.lookupconfig.preLookup) dhcc.icare.lookupconfig.preLookup.hide();
        this.initGridPanel();
        dhcc.icare.Lookup.superclass.initComponent.call(this);
        this.addEvents('selectRow');
        //if(window.console) console.log("initComponent   end" + new Date());	    
    },   
	initGridPanel: function (){
		if(!this.lookupName) return;
		var myclassname = this.listClassName;
		var myqueryname = this.listQueryName;
		if ( myclassname == '' || myqueryname == '')  return ;
		//if(window.console) console.log("initGridPanel start" + new Date());
		var myCmAndFields = tkMakeServerCall ( dhcc.icare.lookupconfig.queryBroker, dhcc.icare.lookupconfig.readrs, myclassname, myqueryname );				
		//if(window.console) console.log("initGridPanel   end" + new Date());
		var json = Ext.decode( myCmAndFields );
		var ds = new Ext.data.JsonStore ({
			url: dhcc.icare.lookupconfig.dsurl, root: "record", totalProperty: "total", fields: json.fns, listeners:{scope: this,load: this.storeLoaded}
    	});
    	this.pageSize = json.pageSize || this.pageSize || 15;
		var pagingBar = new Ext.PagingToolbar({
			pageSize: this.pageSize, store: ds, displayInfo: true , displayMsg: '{0}-{1},��{2}��',
			items: ['-',new Ext.Toolbar.Button({handler: this.hide,text:'�ر�',scope:this})]
    	});
    	var cms = json.cms;
    	var cmslen = 0; 
    	if(this.displayCM && this.displayCM["indexOf"] ){
	    	cmslen = cms.length;
	    	for(var i=0;i< cmslen; i++){
		    	if(this.displayCM.indexOf(cms[i].dataIndex)>-1){
			    	cms[i].hidden = false;
			    }else{
				  	cms[i].hidden = true;
				 }	
		    }
	    }
    	   	
    	var cmslen = cms.length;
    	var displayFieldCmCount = 0;
    	for(var i = 0 ; i < cmslen ; i++){
	    	if(!cms[i].hidden){
		    	if (!this.displayField) this.displayField = json.fns[i].name;		    			   
				displayFieldCmCount++;
			}
	    }
		this.id = this.lookupName+"zlookup";
		this.title = "";				
		this.width= this.width || (((displayFieldCmCount*140) > document.body.clientWidth) ? document.body.clientWidth : displayFieldCmCount*140);
		if(this.width<420) this.width=420;		
		this.height = this.defaultHeight;
		this.colModel = new Ext.grid.ColumnModel({columns:cms,defaults:{sortable:false,menuDisabled:true}});
		this.store = ds;
		var myloadM;
		if (Ext.isIE){
			myloadM = new Ext.LoadMask(dhcc.icare.lookupconfig.lookupDiv, {msg:"���ڼ�������...",store:this.store});//this.loadMask = myloadM;
		}else{
			myloadM = true;
		}
		this.stripeRows=true;
		this.border=false;
		this.bbar = pagingBar;
		this.pagingBar = pagingBar;
		this.listeners = {
			afterrender: this.searchAndShow,
			headerdblclick: this.headerDblClick, 
			rowclick: this.rowClick,
			keydown: this.gridPanelKeydown,
			scope: this
		};
		//Ext.EventManager.addListener(window,"resize", function(){});
		this.renderTo = dhcc.icare.lookupconfig.lookupDivId;
	},
	/* 	getOffset : function(o){
		var ntLeft = o.offsetLeft ;
		var ntTop = o.offsetTop + o.offsetHeight ;
		var width = o.offsetWidth;
		var height = o.offsetHeight		
		while(o = o.offsetParent){
			ntLeft += o.offsetLeft;
			ntTop += o.offsetTop;
		}		
		return [ntLeft,ntTop,width,height];		
	}, */
	getOffset : function(){
		var el = Ext.get(this.lookupName);
		var extxy = el.getAnchorXY();
		var width = el.dom.offsetWidth;
		var height = el.dom.offsetHeight		
		return [extxy[0],extxy[1]+height,width,height];		
	},
	searchAndShow: function(param){
		dhcc.icare.lookupconfig.preLookup = this;
		this.posiAndSizeResize();	
		this.show();
		this.doSearch(param);
		if(Ext.isIE) setTimeout(function(){CollectGarbage()},10); 
	},
	posiAndSizeResize: function(){		
		var xy = this.getOffset(); //[left, top, width, height]
		var bodyHeight = document.body.clientHeight; // window.screen.height ;
		var bodyWidth = document.body.clientWidth; // window.screen.width ;
		//var topBlank = xy[1] - xy[3];
		//var bottomBlank = bodyHeight - xy[1];
		var height = this.defaultHeight;
		var width = this.width;
		//����top
		/* if((bodyHeight-height-xy[1]<0)){	//���治����ʾ
			if (xy[1]-xy[3]>height){		//��������ʾ
				dhcc.icare.lookupconfig.lookupDiv.style.pixelBottom = bottomBlank + xy[3];		
			}else {
				if(topBlank>bottomBlank){
					height = topBlank;
					dhcc.icare.lookupconfig.lookupDiv.style.pixelBottom = bottomBlank + xy[3];		
				}else{
					height = bottomBlank;
					dhcc.icare.lookupconfig.lookupDiv.style.pixelTop = xy[1];
				}
			}
		}else{			
			dhcc.icare.lookupconfig.lookupDiv.style.pixelTop = xy[1];
		}		 */
		var tmpLeft = xy[0];
		var tmpTop = xy[1];
		if (((bodyHeight-tmpTop) < height) && ( (xy[1]-xy[3]) > height )){					//���治����ʾ,����������ʾ
			tmpTop = xy[1]  - xy[3] - height - 3;
		}
		if ( ((bodyWidth-tmpLeft)<width) && ((xy[0]+xy[2])>width) ){	//�ұ߲�����ʾ,���������ʾ			
			tmpLeft = bodyWidth - width - (bodyWidth-xy[0]-xy[2]);		//���Ŵ󾵵Ŀ��,�ټ��ı����ұ߿հ׿��
		}
		dhcc.icare.lookupconfig.lookupDiv.style.pixelTop = tmpTop ; 
		dhcc.icare.lookupconfig.lookupDiv.style.pixelLeft = tmpLeft ; 
		dhcc.icare.lookupconfig.lookupDiv.style.display = "";
		//this.setHeight(height);
	},
	headerDblClick: function(){
		if(this.lookupListComponetId != ""){
			websys_lu('../csp/websys.component.customiselayout.csp?ID='+this.lookupListComponetId+'&CONTEXT=K'+this.listClassName+':'+this.listQueryName+"&DHCICARE=1",false);		
		}
	},
    rowClick: function(gridPanel, rowIndex, e) {
        var r = this.store.getAt(rowIndex);      
        this.value = r.data[this.displayField];
        $(this.lookupName).value = this.value;
        var arr = this.store.fields.keys;
        var len = arr.length;
        var str = "";
        for(var i = 0 ; i < len ; i++){
	    	   if(str=="")str = r.data[arr[i]];
	    	   else{str += "^"+r.data[arr[i]];}
	    }
	    //websys_nextfocusElement($(this.lookupName));	    
	    //websys_setfocus(this.lookupName);
        this.fireEvent('selectRow',str);              
        this.hide();
    },
    hide:function(){
	    dhcc.icare.lookupconfig.preLookup = '';
		this.destroy();
	},
    getValue: function() {
	    this.value;       
    },
    doSearch: function(param) {
	    var arr = this.listProperties ;
	    if(arguments.length>0 && param instanceof Array) arr = param;
	    var len = arr.length;
	    var obj={};
	    obj.lookupName = this.lookupName;
	    obj.lookupPage = this.lookupPage;
	    obj.pClassName = this.listClassName;
	    obj.pClassQuery = this.listQueryName;
	    obj.start = 0;
	    obj.limit = this.pageSize;
	    if(len>0){
	    	for(var i = 0 ; i< len ; i++){
	    		if(Ext.isFunction(arr[i])){
	    			obj["P"+(i+1)]=arr[i]();
	    		}else{
		    		obj["P"+(i+1)]=arr[i];
		    	}
	    	}	    	
	    }
	    this.store.baseParams = obj;
        this.store.load();
    }, 
    resizeColumnFun : function(s,rs,obj){
		var pagesize,cm,objWidth = {};
		if(this.resizeColumn){
			pagesize = 0;
			cm = this.colModel ;
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
				pagesize += objWidth.val;
		  	}
		  	this.setWidth(pagesize);
		  	this.reconfigure(this.store, cm);		  	
		}
	},      
    storeLoaded: function(obj,records,options){
	    this.resizeColumnFun(obj,records,options);
    	this.getSelectionModel().selectFirstRow();
		this.getView().focusRow(0);
	},	
    /**
     * ����GridPanel��keydown�¼�������ENTER����ѡ���У�����ESC������GridPanel��
     */
    gridPanelKeydown: function(e) {
    	e.stopEvent();
    	var obj = document.getElementById(this.lookupName);
    	if(e.getKey() == e.ENTER) {
    		var record = this.getSelectionModel().getSelected();
    		this.rowClick(this, this.store.indexOf(record));
    	}else if(e.getKey() == e.ESC) {
        	this.hide();        	
        	if(obj && !obj.disabled && !obj.readOnly) {	        	
	        	websys_setfocus(this.lookupName);
        	}
        }else if (e.getKey() == Ext.EventObject.PAGE_DOWN){			
			if (this.pagingBar.getPageData().activePage< this.pagingBar.getPageData().pages){
				this.pagingBar.moveNext();
			}
		}else if (e.getKey() == Ext.EventObject.PAGE_UP){
			if (this.pagingBar.getPageData().activePage>1){
				this.pagingBar.movePrevious();
			}
		}else if(e.getKey() == Ext.EventObject.BACKSPACE){
			if(obj && !obj.disabled && !obj.readOnly) {
				this.getSelectionModel().clearSelections();
				websys_setfocus(this.lookupName);			
			}
		}else if(e.getKey() == Ext.EventObject.UP){
			/*if(this.getSelectionModel().isSelected(0)){
				websys_setfocus(this.lookupName);
			}*/
		}
        //e.preventDefault() : 
        //e.stopPropagation(); // ȡ���¼�ð�ݣ��������Ӱ�����������keyDown�¼�������Button�����˿�ݼ�Enter
        
    }
	
});