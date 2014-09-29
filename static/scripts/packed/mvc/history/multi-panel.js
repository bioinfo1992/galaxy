define(["mvc/history/history-model","mvc/history/history-panel-edit","mvc/base-mvc","utils/ajax-queue"],function(d,m,A,a){window.HISTORY_MODEL=d;function g(I,F){F=F||{};if(!(Galaxy&&Galaxy.modal)){return I.copy()}var G=I.get("name"),D="Copy of '"+G+"'";function E(K){if(!K){if(!Galaxy.modal.$("#invalid-title").size()){var J=$("<p/>").attr("id","invalid-title").css({color:"red","margin-top":"8px"}).addClass("bg-danger").text(_l("Please enter a valid history title"));Galaxy.modal.$(".modal-body").append(J)}return false}return K}function H(J){var K=$('<p><span class="fa fa-spinner fa-spin"></span> Copying history...</p>').css("margin-top","8px");Galaxy.modal.$(".modal-body").append(K);I.copy(true,J).fail(function(){alert(_l("History could not be copied. Please contact a Galaxy administrator"))}).always(function(){Galaxy.modal.hide()})}Galaxy.modal.show(_.extend({title:_l("Copying history")+' "'+G+'"',body:$(['<label for="copy-modal-title">',_l("Enter a title for the copied history"),":","</label><br />",'<input id="copy-modal-title" class="form-control" style="width: 100%" value="',D,'" />'].join("")),buttons:{Cancel:function(){Galaxy.modal.hide()},Copy:function(){var J=Galaxy.modal.$("#copy-modal-title").val();if(!E(J)){return}H(J)}}},F));$("#copy-modal-title").focus().select()}var C=Backbone.View.extend(A.LoggableMixin).extend({tagName:"div",className:"history-column flex-column flex-row-container",id:function r(){if(!this.model){return""}return"history-column-"+this.model.get("id")},initialize:function c(D){D=D||{};this.panel=D.panel||this.createPanel(D);this.setUpListeners()},createPanel:function v(E){E=_.extend({model:this.model,dragItems:true},E);var D=new m.HistoryPanelEdit(E);D._renderEmptyMessage=this.__patch_renderEmptyMessage;return D},__patch_renderEmptyMessage:function(F){var E=this,G=_.chain(this.model.get("state_ids")).values().flatten().value().length,D=E.$emptyMessage(F);if(!_.isEmpty(E.hdaViews)){D.hide()}else{if(G&&!this.model.contents.length){D.empty().append($('<span class="fa fa-spinner fa-spin"></span> <i>loading datasets...</i>')).show()}else{if(E.searchFor){D.text(E.noneFoundMsg).show()}else{D.text(E.emptyMsg).show()}}}return D},setUpListeners:function f(){var D=this;this.once("rendered",function(){D.trigger("rendered:initial",D)});this.setUpPanelListeners()},setUpPanelListeners:function l(){var D=this;this.listenTo(this.panel,{rendered:function(){D.trigger("rendered",D)}},this)},inView:function(D,E){var G=this.$el.offset().left,F=G+this.$el.width();if(F<D){return false}if(G>E){return false}return true},$panel:function e(){return this.$(".history-panel")},render:function B(E){E=(E!==undefined)?(E):("fast");var D=this.model?this.model.toJSON():{};this.$el.html(this.template(D));this.renderPanel(E);this.setUpBehaviors();return this},setUpBehaviors:function w(){},template:function x(E){E=E||{};var D=['<div class="panel-controls clear flex-row">',this.controlsLeftTemplate(),'<div class="pull-right">','<button class="delete-history btn btn-default">',E.deleted?_l("Undelete"):_l("Delete"),"</button>",'<button class="copy-history btn btn-default">',_l("Copy"),"</button>","</div>","</div>",'<div class="inner flex-row flex-column-container">','<div id="history-',E.id,'" class="history-column history-panel flex-column"></div>',"</div>"].join("");return $(D)},controlsLeftTemplate:function(){return(this.currentHistory)?['<div class="pull-left">','<button class="create-new btn btn-default">',_l("Create new"),"</button> ","</div>"].join(""):['<div class="pull-left">','<button class="switch-to btn btn-default">',_l("Switch to"),"</button>","</div>"].join("")},renderPanel:function i(D){D=(D!==undefined)?(D):("fast");this.panel.setElement(this.$panel()).render(D);return this},events:{"click .switch-to.btn":function(){this.model.setAsCurrent()},"click .delete-history.btn":function(){var D=this,E;if(this.model.get("deleted")){E=this.model.undelete()}else{E=this.model._delete()}E.fail(function(H,F,G){alert(_l("Could not delete the history")+":\n"+G)}).done(function(F){D.render()})},"click .copy-history.btn":"copy"},copy:function t(){g(this.model)},toString:function(){return"HistoryPanelColumn("+(this.panel?this.panel:"")+")"}});var n=Backbone.View.extend(A.LoggableMixin).extend({initialize:function c(D){D=D||{};this.log(this+".init",D);if(!D.currentHistoryId){throw new Error(this+" requires a currentHistoryId in the options")}this.currentHistoryId=D.currentHistoryId;this.options={columnWidth:312,borderWidth:1,columnGap:8,headerHeight:29,footerHeight:0,controlsHeight:20};this.order=D.order||"update";this.hdaQueue=new a.NamedAjaxQueue([],false);this.collection=null;this.setCollection(D.histories||[]);this.columnMap={};this.createColumns(D.columnOptions);this.setUpListeners()},setUpListeners:function f(){},setCollection:function z(E){var D=this;D.stopListening(D.collection);D.collection=E;D.sortCollection(D.order,{silent:true});D.setUpCollectionListeners();D.trigger("new-collection",D);return D},setUpCollectionListeners:function(){var D=this,E=D.collection;D.listenTo(E,{add:D.addAsCurrentColumn,"set-as-current":D.setCurrentHistory,"change:deleted":D.handleDeletedHistory,sort:function(){D.renderColumns(0)},})},setCurrentHistory:function q(E){var D=this.columnMap[this.currentHistoryId];if(D){D.currentHistory=false;D.$el.height("")}this.currentHistoryId=E.id;var F=this.columnMap[this.currentHistoryId];F.currentHistory=true;this.sortCollection();multipanel._recalcFirstColumnHeight();return F},handleDeletedHistory:function b(E){if(E.get("deleted")){this.log("handleDeletedHistory",this.collection.includeDeleted,E);var D=this;column=D.columnMap[E.id];if(!column){return}if(column.model.id===this.currentHistoryId){}else{if(!D.collection.includeDeleted){D.removeColumn(column)}}}},sortCollection:function(D,E){D=D||this.order;var F=this.currentHistoryId;switch(D){case"name":this.collection.comparator=function(G){return[G.id!==F,G.get("name").toLowerCase()]};break;case"size":this.collection.comparator=function(G){return[G.id!==F,G.get("size")]};break;default:this.collection.comparator=function(G){return[G.id!==F,Date(G.get("update_time"))]}}this.collection.sort(E);return this.collection},setOrder:function(D){if(["update","name","size"].indexOf(D)===-1){D="update"}this.order=D;this.sortCollection();return this},create:function(D){return this.collection.create({current:true})},createColumns:function s(E){E=E||{};var D=this;this.columnMap={};D.collection.each(function(F,G){var H=D.createColumn(F,E);D.columnMap[F.id]=H})},createColumn:function u(F,D){D=_.extend({},D,{model:F});var E=new C(D);if(F.id===this.currentHistoryId){E.currentHistory=true}this.setUpColumnListeners(E);return E},columnMapLength:function(){return Object.keys(this.columnMap).length},sortedFilteredColumns:function(D){D=D||this.filters;if(!D||!D.length){return this.sortedColumns()}var E=this;return E.sortedColumns().filter(function(H,G){var F=H.currentHistory||_.every(D.map(function(I){return I.call(H)}));return F})},sortedColumns:function(){var E=this;var D=this.collection.map(function(G,F){return E.columnMap[G.id]});return D},addColumn:function p(F,D){D=D!==undefined?D:true;var E=this.createColumn(F);this.columnMap[F.id]=E;if(D){this.renderColumns()}return E},addAsCurrentColumn:function p(F){var E=this,D=this.addColumn(F,false);this.setCurrentHistory(F);D.once("rendered",function(){E.queueHdaFetch(D)});return D},removeColumn:function y(F,E){E=E!==undefined?E:true;this.log("removeColumn",F);if(!F){return}var G=this,D=this.options.columnWidth+this.options.columnGap;F.$el.fadeOut("fast",function(){if(E){$(this).remove();G.$(".middle").width(G.$(".middle").width()-D);G.checkColumnsInView();G._recalcFirstColumnHeight()}G.stopListening(F.panel);G.stopListening(F);delete G.columnMap[F.model.id];F.remove()})},setUpColumnListeners:function o(D){var E=this;E.listenTo(D,{"in-view":E.queueHdaFetch});E.listenTo(D.panel,{"view:draggable:dragstart":function(I,G,F,H){E._dropData=JSON.parse(I.dataTransfer.getData("text"));E.currentColumnDropTargetOn()},"view:draggable:dragend":function(I,G,F,H){E._dropData=null;E.currentColumnDropTargetOff()},"droptarget:drop":function(H,I,G){var J=E._dropData.filter(function(K){return(_.isObject(K)&&K.id&&K.model_class==="HistoryDatasetAssociation")});E._dropData=null;var F=new a.NamedAjaxQueue();J.forEach(function(K){F.add({name:"copy-"+K.id,fn:function(){return G.model.contents.copy(K.id)}})});F.start();F.done(function(K){G.model.fetch()})}})},render:function B(E){E=E!==undefined?E:this.fxSpeed;var D=this;D.log(D+".render");D.$el.html(D.template(D.options));D.renderColumns(E);D.setUpBehaviors();D.trigger("rendered",D);return D},template:function x(D){D=D||{};var E=[];if(this.options.headerHeight){E=E.concat(['<div class="loading-overlay flex-row"><div class="loading-overlay-message">loading...</div></div>','<div class="header flex-column-container">','<div class="header-control header-control-left flex-column">','<button class="done btn btn-default">',_l("Done"),"</button>",'<button class="include-deleted btn btn-default"></button>','<div class="order btn-group">','<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">',_l("Order histories by")+'... <span class="caret"></span>',"</button>",'<ul class="dropdown-menu" role="menu">','<li><a href="javascript:void(0);" class="order-update">',_l("Time of last update"),"</a></li>",'<li><a href="javascript:void(0);" class="order-name">',_l("Name"),"</a></li>",'<li><a href="javascript:void(0);" class="order-size">',_l("Size"),"</a></li>","</ul>","</div>",'<div id="search-histories" class="header-search"></div>',"</div>",'<div class="header-control header-control-center flex-column">','<div class="header-info">',"</div>","</div>",'<div class="header-control header-control-right flex-column">','<div id="search-datasets" class="header-search"></div>','<button id="toggle-deleted" class="btn btn-default">',_l("Include deleted datasets"),"</button>",'<button id="toggle-hidden" class="btn btn-default">',_l("Include hidden datasets"),"</button>","</div>","</div>"])}E=E.concat(['<div class="outer-middle flex-row flex-row-container">','<div class="middle flex-column-container flex-row"></div>',"</div>",'<div class="footer flex-column-container">',"</div>"]);return $(E.join(""))},renderColumns:function k(G){G=G!==undefined?G:this.fxSpeed;var F=this,D=F.sortedFilteredColumns();F.$(".middle").width(D.length*(this.options.columnWidth+this.options.columnGap)+this.options.columnGap+16);var E=F.$(".middle");E.empty();D.forEach(function(I,H){I.$el.appendTo(E);I.delegateEvents();F.renderColumn(I,G)});if(this.searchFor&&D.length<=1){}else{F.checkColumnsInView();this._recalcFirstColumnHeight()}return D},renderColumn:function(D,E){E=E!==undefined?E:this.fxSpeed;return _.delay(function(){return D.render(E)},0)},queueHdaFetch:function j(F){if(F.model.contents.length===0&&!F.model.get("empty")){var D={},E=_.values(F.panel.storage.get("expandedIds")).join();if(E){D.dataset_details=E}this.hdaQueue.add({name:F.model.id,fn:function(){var G=F.model.contents.fetch({data:D,silent:true});return G.done(function(H){F.panel.renderItems()})}});if(!this.hdaQueue.running){this.hdaQueue.start()}}},queueHdaFetchDetails:function(D){if((D.model.contents.length===0&&!D.model.get("empty"))||(!D.model.contents.haveDetails())){this.hdaQueue.add({name:D.model.id,fn:function(){var E=D.model.contents.fetch({data:{details:"all"},silent:true});return E.done(function(F){D.panel.renderItems()})}});if(!this.hdaQueue.running){this.hdaQueue.start()}}},allColumns:function h(){return[this.currentColumn].concat(this.columns)},renderInfo:function(D){this.$(".header .header-info").text(D)},events:{"click .done.btn":function(){window.location="/"},"click .create-new.btn":"create","click .order .order-update":function(D){this.setOrder("update")},"click .order .order-name":function(D){this.setOrder("name")},"click .order .order-size":function(D){this.setOrder("size")}},includeDeletedHistories:function(){window.location+=(/\?/.test(window.location.toString()))?("&"):("?")+"include_deleted_histories=True"},excludeDeletedHistories:function(){window.location=window.location.toString().replace(/[&\?]include_deleted_histories=True/g,"")},setUpBehaviors:function(){var E=this;E.$(".include-deleted").modeButton({initialMode:this.collection.includeDeleted?"exclude":"include",switchModesOnClick:false,modes:[{mode:"include",html:_l("Include deleted histories"),onclick:_.bind(E.includeDeletedHistories,E)},{mode:"exclude",html:_l("Exclude deleted histories"),onclick:_.bind(E.excludeDeletedHistories,E)}]});E.$("#search-histories").searchInput({name:"search-histories",placeholder:_l("search histories"),onsearch:function(F){E.searchFor=F;E.filters=[function(){return this.model.get("name").indexOf(E.searchFor)!==-1}];E.renderColumns(0)},onclear:function(F){E.searchFor=null;E.filters=[];E.renderColumns(0)}});E.$("#search-datasets").searchInput({name:"search-datasets",placeholder:_l("search all datasets"),onfirstsearch:function(F){E.hdaQueue.clear();E.$("#search-datasets").searchInput("toggle-loading");E.searchFor=F;E.sortedFilteredColumns().forEach(function(G){G.panel.searchItems(F);E.queueHdaFetchDetails(G)});E.hdaQueue.progress(function(G){E.renderInfo([_l("loading"),(G.curr+1),_l("of"),G.total].join(" "))});E.hdaQueue.deferred.done(function(){E.renderInfo("");E.$("#search-datasets").searchInput("toggle-loading")})},onsearch:function(F){E.searchFor=F;E.sortedFilteredColumns().forEach(function(G){G.panel.searchItems(F)})},onclear:function(F){E.searchFor=null;E.sortedFilteredColumns().forEach(function(G){G.panel.clearSearch()})}});E.$("#toggle-deleted").modeButton({initialMode:"include",modes:[{mode:"exclude",html:_l("Exclude deleted datasets")},{mode:"include",html:_l("Include deleted datasets")}]}).click(function(){var F=$(this).modeButton("getMode").mode==="exclude";E.sortedFilteredColumns().forEach(function(H,G){_.delay(function(){H.panel.toggleShowDeleted(F,false)},G*200)})});E.$("#toggle-hidden").modeButton({initialMode:"include",modes:[{mode:"exclude",html:_l("Exclude hidden datasets")},{mode:"include",html:_l("Include hidden datasets")}]}).click(function(){var F=$(this).modeButton("getMode").mode==="exclude";E.sortedFilteredColumns().forEach(function(H,G){_.delay(function(){H.panel.toggleShowHidden(F,false)},G*200)})});$(window).resize(function(){E._recalcFirstColumnHeight()});var D=_.debounce(_.bind(this.checkColumnsInView,this),100);this.$(".middle").parent().scroll(D)},_recalcFirstColumnHeight:function(){var D=this.$(".history-column").first(),F=this.$(".middle").height(),E=D.find(".panel-controls").height();D.height(F).find(".inner").height(F-E)},_viewport:function(){var D=this.$(".middle").parent().offset().left;return{left:D,right:D+this.$(".middle").parent().width()}},columnsInView:function(){var D=this._viewport();return this.sortedFilteredColumns().filter(function(E){return E.currentHistory||E.inView(D.left,D.right)})},checkColumnsInView:function(){this.columnsInView().forEach(function(D){D.trigger("in-view",D)})},currentColumnDropTargetOn:function(){var D=this.columnMap[this.currentHistoryId];if(!D){return}D.panel.dataDropped=function(E){};D.panel.dropTargetOn()},currentColumnDropTargetOff:function(){var D=this.columnMap[this.currentHistoryId];if(!D){return}D.panel.dataDropped=m.HistoryPanelEdit.prototype.dataDrop;D.panel.dropTargetOff()},toString:function(){return"MultiPanelColumns("+(this.columns?this.columns.length:0)+")"}});return{MultiPanelColumns:n}});