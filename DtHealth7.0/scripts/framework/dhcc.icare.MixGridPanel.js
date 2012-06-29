/**
* @author: wanghc
* @date  : 2012/4/1
* 自动生成查询条件,右键菜单
*tbar: [
			'开医嘱人:',			
			{ paramPosition: 1, xtype:"textfield"}
		]
*在compoent上多加一个 paramPosition 配置,对应后台query的参数位置,实现自动匹配参数查询
*/
Ext.namespace('dhcc.icare');
/**
* @class dhcc.icare.MixGridPanel
* @extends Ext.grid.GridPanel
*/
dhcc.icare.MixGridPanel = Ext.extend(Ext.grid.GridPanel, {
	/**
	* @cfg {Json} columnModelFieldJson
	*  类ext.websys.QueryBroker方法ReadRSNew的返回值
	*  或
	*  手动拼Json
	* 格式如:
	{
		'cms':[{header:'要求执行时间',dataIndex:'TExStDate'}], 
		'fns':[{'name':'TExStDate','type':'string'}],
		'pageSize': 15
	};
	*/
	/**
	* @cfg {String}  listClassName 后台Query类名
	* 与listQueryName一起生成cm与store
	* columnModelFieldJson为空对象时,通过listClassName与listQueryName生成columnModelFieldJson
	*/
    listClassName: '',
    /**
    * @cfg {String} listQueryName 后台Query名字
    * 与listClassName一起生成cm与store
    */
    listQueryName: '',
    
    /**
	* @cfg {Array} listProperties 后台Query的参数
    */
    listProperties: [],
      
   	/**
	* @cfg {String} queryBroker
	* 解析Query的元数据
	*/
	metaDataBroker: "ext.websys.QueryBroker",
	/**
	* @cfg {String} readMetaData
	* 解析Query的元数据
	*/
	readMetaData: "ReadRSNew",
	/**
	* @cfg {String} dsUrl
	* 获取store数据的地址
	*/	
	dataUrl: "ext.websys.querydatatrans.csp",
	/**
	* @cfg {int} pageSize 必须的
	*一页显示多少行数据
	*/	
	/**
	* @cfg {Array} dispalyCM
	* 显示哪几个列
	* 如: displayCM: [ARCIMDesc,ARCIMCode],
	* ARCIMDesc-->cm的dataIndex
	*/
	/**
	* @cfg {Array} hiddenCM
	* 隐藏哪几列
	* 如: hiddenCM: [ARCIMCode],
	*/
	/**
    * @cfg {String} lookupListComponetId websys.Lookup.List组件对应的ID 如:1872
    * 在自定义列布局用到
    * 如果值为websys.Lookup.List组件对应的ID,则双击列头会出现自定义界面
    */
	lookupListComponetId: 1872,
	/**!
	* @cfg {Ext.ext.Menu} rightKeyMenu
	* 	var orderRightMenu = new Ext.menu.Menu({
			items: [{	
				id: 'stopOrderMenuItem',
				iconCls:'iconStop',
				displayHandler: {Statu_Disable:['D','S']},	//选中行的Statu字段值为 D或S 就禁止该item功能
				handler: stopOrderHandler,
				text: '停医嘱'
			},{	
				id: 'addExecOrderMenuItem',	
				displayHandler: {Statu2_Display:['Prn']},	//选中行的Statu2字段值为Prn就显示该item功能
				handler: cancelOrderHandler,
				text: '增加执行医嘱'
			}]
		});
	*/
	
	/**!
    * @cfg {Array} displayCM grid显示的列名集合 默认是通过后台query产生
    * sample :
    *后台 query包含多个字段现只要显示描述 displayCM: ['arcim']
	*/
	//private
	conditionCmp: [],
	//private 优化grid,在查询时不再接受查询命令
	loadingflag: false,
    /**
	* 刷新store
    * @method refreshData
    * @param {Object} paramConfig {P1: value1, P2: value2}
	* @return void
    */
    refreshData: function ( paramConfig ){
		if(paramConfig){			
			Ext.apply(this.store.baseParams, paramConfig);
			this.store.load();
		}					  
	},
	/**
	* 处理后台返回的cm
	* @method cmHandler
	* @param {Object} cm 
	* @return cm
	*/
	cmHandler: function ( cms ){
		return cms;
	},
	headerDblClick: function(){
		if(this.lookupListComponetId != ""){
			websys_lu('../csp/websys.component.customiselayout.csp?ID='+this.lookupListComponetId+'&CONTEXT=K'+this.listClassName+':'+this.listQueryName+"&DHCICARE=1",false);		
		}
	},
	afterRender: function(container){	
		dhcc.icare.MixGridPanel.superclass.afterRender.call(this,container);
		var that = this;
		if( this.getTopToolbar()){
			this.getTopToolbar().items.each(function(item,index){
				if(item.paramPosition){
					that.conditionCmp.push(item);
					that.store.baseParams["P"+(item.paramPosition)] = item.getValue();  
					if(item.xtype == 'combo'){				
						item.on('select', function(cb,r,index){					
							var v =  cb.getValue();
							if(this.store.baseParams["P"+(item.paramPosition)] != v){
								this.store.baseParams["P"+(item.paramPosition)] = v;
								this.store.load();
							}
						}, that);
					}
				}
			});
		}		
	},
	
	initComponent: function(){
		
		if (!this.columnModelFieldJson){
			try{		
				this.columnModelFieldJson =  Ext.decode(tkMakeServerCall(this.metaDataBroker,this.readMetaData, this.listClassName, this.listQueryName ));				
			}catch(e){
				alert("请正确配置listClassName与listQueryName属性");
			}
		}
		if(!this.columnModelFieldJson) {
			alert("请配置columnModelFieldJson属性!");
			return "";
		}
			
		this.pageSize = this.columnModelFieldJson.pageSize || this.pageSize;  	
		if(!this.pageSize){
			alert("pageSize属性是必须的!");
		}
		var ds = new Ext.data.JsonStore ({
			url: this.dataUrl,
			baseParams: { start:0, limit:this.pageSize, pClassName: this.listClassName, pClassQuery: this.listQueryName },
			root: "record", 
			totalProperty: "total",			
			fields: this.columnModelFieldJson.fns
    	});    	  
		var cms = this.columnModelFieldJson.cms;
    	var cmslen = 0;
		var i=0; 		
    	if(this.displayCM && this.displayCM["indexOf"] ){
	    	//通过displayCM显示列
	    	cmslen = cms.length;
	    	for( i=0 ; i < cmslen ; i++){
		    	if(this.displayCM.indexOf(cms[i].dataIndex)>-1){
			    	cms[i].hidden = false;
			    }else{
				  	cms[i].hidden = true;
				}	
		    }
	    }else if (this.hiddenCM && this.hiddenCM["indexOf"]){
			//通过hiddenCM显示列
	    	cmslen = cms.length;
	    	for( i = 0 ; i < cmslen; i++){
		    	if(this.hiddenCM.indexOf(cms[i].dataIndex)>-1){
			    	cms[i].hidden = true;
			    }
				// else{
				// cms[i].hidden = false;
				// }	
		    }
		}		
		cms = this.cmHandler(cms) ;		
		this.colModel = new Ext.grid.ColumnModel({columns:cms,defaults:{sortable:false,menuDisabled:true}});
		delete this.cms;
		this.store = ds;
		this.loadMask = true;
		/*var myloadM;
		if (Ext.isIE){
			myloadM = new Ext.LoadMask(dhcc.icare.lookupconfig.lookupDiv, {msg:"正在加载数据...",store:this.store});
			//this.loadMask = myloadM;
		}else{
			myloadM = true;
		}*/
		this.stripeRows = true;
		this.border = false;
		var that = this;
		this.bbar = new Ext.PagingToolbar({
			listeners: {'afterrender': function(){ that.fireEvent("pagingToolbarRender");} },
			pageSize: that.pageSize, 
			store: that.store, 
			displayInfo: true , 
			displayMsg: '{0}-{1},共{2}条'
		});
		dhcc.icare.MixGridPanel.superclass.initComponent.call(this);		
		this.addEvents('rightKeyMenuShow','pagingToolbarRender');
	},
	initEvents: function(){
		dhcc.icare.MixGridPanel.superclass.initEvents.call(this);
		this.on("rowcontextmenu",this.rowContextMenuHandler);
		this.on("headerdblclick",this.headerDblClick);
		this.store.on('load',function(){
			this.loadingflag = false;
			this.hideRightKeyMenu();			
		},this);
		this.store.on('beforeload',function(){
			if(this.loadingflag){return false;}
			else{this.loadingflag = true;}
		},this);		
	},
	rowContextMenuHandler: function(g,rowIndex,e){
		e.stopEvent();		
		g.getSelectionModel().selectRow(rowIndex);
		var r = g.store.getAt(rowIndex);
		if(!g.rightKeyMenu) return;
		//g.rightKeyMenuHidden = false;
		if(false === g.fireEvent('rightKeyMenuShow',g,rowIndex)){
			g.rightKeyMenuHidden = true;
		}
		if(g.rightKeyMenuHidden) return ;
		g.rightKeyMenu.items.each(function(item){
			var status = item.displayHandler || {};			//2012-04-18 wanghc
			var arr,flag = true;
			if('function' == typeof status){				
				flag = status.call(this);	//this-->item 当前菜单项目
			}else if('object' == typeof status){
				//{status1_Display:['A','B'],status2_Display:['C','D']}	二个条件是且的关系 二个条件都成立时才display
				//{HIDDEN2_Disable:['U','E'],HIDDEN5_Display:['Y^Y^Y']}	
				//statu 的格式是 cmitem名_Display或cmitem名_Disable					
				for (statu in status){
					if(status.hasOwnProperty(statu)){
						arr = statu.split("_");							
						flag = flag && (arr[1] == "Display") ;							
						if (status[statu].indexOf(r.data[arr[0]]) == -1) {
							flag = !flag;								
						} 													
					}
					if (!flag){break;}					//不显示就跳出
				}	
			}			
			item.setDisabled(!flag);				
		});	
		g.rightKeyMenu.showAt(e.getXY());
	},
	hideRightKeyMenu: function(s,rs){
		if(!this.rightKeyMenu) return;
		this.rightKeyMenu.hide();
	}
})