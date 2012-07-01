/**
* @author: wanghc
* @date  : 2012/4/1
* �Զ����ɲ�ѯ����,�Ҽ��˵�
*tbar: [
			'��ҽ����:',			
			{ paramPosition: 1, xtype:"textfield"}
		]
*��compoent�϶���һ�� paramPosition ����,��Ӧ��̨query�Ĳ���λ��,ʵ���Զ�ƥ��������ѯ
*/
Ext.namespace('dhcc.icare');
/**
* @class dhcc.icare.MixGridPanel
* @extends Ext.grid.GridPanel
*/
dhcc.icare.MixGridPanel = Ext.extend(Ext.grid.GridPanel, {
	/**
	* @cfg {Json} columnModelFieldJson
	*  ��ext.websys.QueryBroker����ReadRSNew�ķ���ֵ
	*  ��
	*  �ֶ�ƴJson
	* ��ʽ��:
	{
		'cms':[{header:'Ҫ��ִ��ʱ��',dataIndex:'TExStDate'}], 
		'fns':[{'name':'TExStDate','type':'string'}],
		'pageSize': 15
	};
	*/
	/**
	* @cfg {String}  listClassName ��̨Query����
	* ��listQueryNameһ������cm��store
	* columnModelFieldJsonΪ�ն���ʱ,ͨ��listClassName��listQueryName����columnModelFieldJson
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
	* @cfg {String} queryBroker
	* ����Query��Ԫ����
	*/
	metaDataBroker: "ext.websys.QueryBroker",
	/**
	* @cfg {String} readMetaData
	* ����Query��Ԫ����
	*/
	readMetaData: "ReadRSNew",
	/**
	* @cfg {String} dsUrl
	* ��ȡstore���ݵĵ�ַ
	*/	
	dataUrl: "ext.websys.querydatatrans.csp",
	/**
	* @cfg {int} pageSize ������
	*һҳ��ʾ����������
	*/	
	/**
	* @cfg {Array} dispalyCM
	* ��ʾ�ļ�����
	* ��: displayCM: [ARCIMDesc,ARCIMCode],
	* ARCIMDesc-->cm��dataIndex
	*/
	/**
	* @cfg {Array} hiddenCM
	* �����ļ���
	* ��: hiddenCM: [ARCIMCode],
	*/
	/**
    * @cfg {String} lookupListComponetId websys.Lookup.List������Ӧ��ID ��:1872
    * ���Զ����в����õ�
    * ����ֵΪwebsys.Lookup.List������Ӧ��ID,��˫����ͷ�������Զ�������
    */
	lookupListComponetId: 1872,
	/**!
	* @cfg {Ext.ext.Menu} rightKeyMenu
	* 	var orderRightMenu = new Ext.menu.Menu({
			items: [{	
				id: 'stopOrderMenuItem',
				iconCls:'iconStop',
				disabledStatu: {Statu_Disable:['D','S']},	//ѡ���е�Statu�ֶ�ֵΪ D��S �ͽ�ֹ��item����
				handler: stopOrderHandler,
				text: 'ͣҽ��'
			},{	
				id: 'addExecOrderMenuItem',	
				disabledStatu: {Statu2_Display:['Prn']},	//ѡ���е�Statu2�ֶ�ֵΪPrn����ʾ��item����
				handler: cancelOrderHandler,
				text: '����ִ��ҽ��'
			}]
		});
	*/
	
	/**!
    * @cfg {Array} displayCM grid��ʾ���������� Ĭ����ͨ����̨query����
    * sample :
    *��̨ query���������ֶ���ֻҪ��ʾ���� displayCM: ['arcim']
	*/
	//private
	conditionCmp: [],
	//private �Ż�grid,�ڲ�ѯʱ���ٽ��ܲ�ѯ����
	loadingflag: false,
    /**
	* ˢ��store
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
	* ������̨���ص�cm
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
				alert("����ȷ����listClassName��listQueryName����");
			}
		}
		if(!this.columnModelFieldJson) {
			alert("������columnModelFieldJson����!");
			return "";
		}
			
		this.pageSize = this.columnModelFieldJson.pageSize || this.pageSize;  	
		if(!this.pageSize){
			alert("pageSize�����Ǳ�����!");
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
	    	//ͨ��displayCM��ʾ��
	    	cmslen = cms.length;
	    	for( i=0 ; i < cmslen ; i++){
		    	if(this.displayCM.indexOf(cms[i].dataIndex)>-1){
			    	cms[i].hidden = false;
			    }else{
				  	cms[i].hidden = true;
				}	
		    }
	    }else if (this.hiddenCM && this.hiddenCM["indexOf"]){
			//ͨ��hiddenCM��ʾ��
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
			myloadM = new Ext.LoadMask(dhcc.icare.lookupconfig.lookupDiv, {msg:"���ڼ�������...",store:this.store});
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
			displayMsg: '{0}-{1},��{2}��'
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
		g.rightKeyMenuHidden = false;
		if(false === g.fireEvent('rightKeyMenuShow',g,rowIndex)){
			g.rightKeyMenuHidden = true;
		}
		if(g.rightKeyMenuHidden) return ;
		g.rightKeyMenu.items.each(function(item){
			var status = item.displayHandler || {};			//2012-04-18 wanghc
			var arr,flag = true;
			if('function' == typeof status){				
				flag = status.call(this);	//this-->item ��ǰ�˵���Ŀ
			}else if('object' == typeof status){
				//{status1_Display:['A','B'],status2_Display:['C','D']}	�����������ҵĹ�ϵ ��������������ʱ��display
				//{HIDDEN2_Disable:['U','E'],HIDDEN5_Display:['Y^Y^Y']}	
				//statu �ĸ�ʽ�� cmitem��_Display��cmitem��_Disable					
				for (statu in status){
					if(status.hasOwnProperty(statu)){
						arr = statu.split("_");							
						flag = flag && (arr[1] == "Display") ;							
						if (status[statu].indexOf(r.data[arr[0]]) == -1) {
							flag = !flag;								
						} 													
					}
					if (!flag){break;}					//����ʾ������
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