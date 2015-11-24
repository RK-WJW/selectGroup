define(['jquery'], function ($){
	/* 级联下拉列表组件, 依赖jQ
	 * author：rkcoder (javawjw@163.com)
	 * date: 2015-11-10
	 * 用法：
	 * 	select结构要求 <select name="" role="select-group" group-index="i" final>
	 *		role="select-group" 固定标识, 值可自定义
	 *		group-index="i"	级别标记, 按级联顺序依次标记1,2,3,4...
	 *		final	最后一个及最底部的级联选框添加此标识(group-index值最大)
	 *		use-api  可选属性参数，指定独立的接口url
	 *  配置说明：cfg
	 *      group   级联唯一分组名，默认select-group
	 *		node	所有级联框的一个父层节点
	 *		isUseName  是否取用控件name属性存储值
	 *		isNeedParents 是否需要提取携带所有父级级联控件的值
	 *		api		获取级联数据的接口地址,当在控件属性上设置了use-api值时，可不指定，因为优先使用use-api指定的接口地址
	 *		defaultOption	默认选项(默认：请选择),可选
	 *		postData	需要提交的固定参数,可选
	 *		keyName		需要提交给后端接口的级联唯一值对应字段名,isUseName为true时，可不指定
	 *	example:
	 *		var selGroup = selectGroup({
	 *			node: $('[role="select-group-wrap"]'),
	 *			isUseName: 0,
	 * 			isNeedParents: 0,
	 *			api: 'http://..',
	 *			postData: {type: 1},
	 *			keyName: 'category_id'
	 *	 	});
	 */
	var cache = {};
	function SelectGroup(cfg){
		var defaultCfg = {
			group: 'select-group',
			isUseName: 0,
			isNeedParents: 0,
			node: null,
			api: '',
			defaultOption: '<option value="">请选择</option>',
			postData: {},
			keyName: ''
		};
		this.cfg = $.extend(true, defaultCfg, cfg);
		this.initialize(this.cfg);
	}

	SelectGroup.prototype = {
		constructor: SelectGroup,
		initialize: function (cfg){
			var that = this;

			that.root = $(cfg.node);
			that.postData = cfg.postData;
			that.groups = that.root.find('[role="'+ cfg.group +'"]');
			that.setEvent();
		},
		setEvent: function (){
			var that = this;
			that.root.on('change', '[role="'+ that.cfg.group +'"]:not([final])', function (ev){
				var tar = $(this);
				var val = tar.val();
				var index = tar.attr('group-index')/1;
				var useApi = tar.attr('use-api') || that.cfg.api;
				var cacheKey = that.cfg.group + '-' + index + '-' + val;
				if(val === ''){
					that.clearSelect(index);
					return;
				}
				// 清理后级未确定的select选项
				that.clearSelect(index + 1);
				// 是否存在缓存，存在直接提取缓存渲染并返回
				if(cache[cacheKey]){
					that.render(cache[cacheKey]);
					return;
				}
				// 设置需要提交的数据
				that.setPostData(tar);
				// 请求获取选项数据
				that.getSelGroupOpts({url: useApi, data: that.postData}, function (options){
					// 加工后端传回的数据
					options = that.processData(options);
					// 记录缓存
					cache[cacheKey] = options;
					// 渲染
					that.render(index + 1, options);
				});
			});
		},
		// 设置需要提交的数据
		setPostData: function (tar){
			var that = this;
			var name = tar.attr('name');
			var val = tar.val();
			var index = tar.attr('group-index')/1;
			data = that.postData;
			// 设置配置的固定参数keyName
			if(that.cfg.keyName){
				data[that.cfg.keyName] = val;
			}
			// 是否使用控件name属性存储当前value
			if(that.cfg.isUseName){
				data[name] = val;
			}
			// 是否提取并携带所有父级级联控件值，这里提取的值目前均依控件name属性存储对应值
			if(that.cfg.isNeedParents){
				that.groups.each(function (i){
					var idx = $(this).attr('group-index')/1;
					var nam = $(this).attr('name');
					var vau = $(this).val();
					if(idx < index){
						data[nam] = vau;
					}
				});
			}
		},
		// 请求后端接口获取选项数据
		getSelGroupOpts: function (conf, cb){
			if(conf && conf.url && conf.data){
				$.ajax({
					type: conf.type || 'get',
					url: conf.url,
					data: conf.data,
					dataType: 'json',
					success: function(ret) {
						var options = {};
						ret = ret || {};
						if(ret.status === 10000){
							options = ret;//that.processData(ret);
						}else{
							options.error = re.msg || '接口异常';
						}
						cb(options);
					},
					error: function() {
						cb({error: '请求异常'});
					}
				});
			}else{
				cb({error: '缺少重要参数'});
			}
		},
		// 数据加工处理，可以重写覆盖此方法，将数据加工成符合标准的结构
		/*
			{
				//select 选择option数据列表
				list: [
					{
						value: 'value',
						text: 'text'
					},
					...
				]
			}
		*/
		processData: function (data){
			data = data || {};
			if(!data.error){
				data = {
					list: data.data || []
				};
			}
			return data;
		},
		// 清除指定级别之后的控件选项
		clearSelect: function (index){
			var that = this;
			that.groups.filter(function (i){
				return $(this).attr('group-index')/1 > index;
			}).html(that.cfg.defaultOption);
		},
		// 选择指定控件
		render: function (index, options){
			var that = this;
			var htmlStr = that.cfg.defaultOption;
			if(!options.error){
				for(var i = 0; i < options.list.length; i++){
					var item = options.list[i];
					htmlStr += '<option value="'+ item.value +'">'+ item.text +'</option>';
				}
				that.root.find('[role="'+ that.cfg.group +'"][group-index="'+ index +'"]').html(htmlStr);
			}else{
				that.onError(options);
			}
		},
		onError: function (options){
			throw options.error;
		}
	};

	return function (cfg){
		return new SelectGroup(cfg);
	}
});