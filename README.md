## selectGroup
select下拉框级联组件

###用法：
- select结构要求 `<select name="" role="select-group" group-index="i" final>`
- role="select-group" 固定标识, 值可自定义
- group-index="i"	级别标记, 按级联顺序依次标记1,2,3,4...
- final	最后一个及最底部的级联选框添加此标识(group-index值最大)
- use-api  可选属性参数，指定独立的接口url

###配置说明：cfg

- group   级联唯一分组名，默认select-group
- node	所有级联框的一个父层节点
- isUseName  是否取用控件name属性存储值
- isNeedParents 是否需要提取携带所有父级级联控件的值
- api		获取级联数据的接口地址,当在控件属性上设置了use-api值时，可不指定，因为优先使用use-api指定的接口地址
- defaultOption	默认选项(默认：请选择),可选
- postData	需要提交的固定参数,可选
- keyName		需要提交给后端接口的级联唯一值对应字段名,isUseName为true时，可不指定

###example:

```
	// 一个指定接口，固定参数
	var selectGroup = $selectGroup({
		group: 'select-group',
		node: '#demo',
		api: 'getOptions.json?t=1',
		postData: {
			type: 'demo'
		},
		keyName: 'cate_id'
	});
	// 针对需要多个不同接口，不同参数
	var selectGroup_test = $selectGroup({
		group: 'test-selgroup',
		node: $('#demo2'),
		isUseName: 1,
		isNeedParents: 1,
		postData: {
			type: 'demo2'
		}
	});
```
