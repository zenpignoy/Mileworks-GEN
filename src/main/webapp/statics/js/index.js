//创建一个组件构造器
var menuItem = Vue.extend({
	name: 'menu-item',
	props:{item:{}},
	template:[
		'<li>',
		'	<a v-if="item.type === 0" href="#" class="accordion-toggle menu-open">',
		'		<span class="glyphicon glyphicon-equalizer"></span>',
		'		<span class="sidebar-title">{{item.name}}</span>',
		'		<span class="caret"></span>',
		'	</a>',
		'	<ul v-if="item.type === 0" class="nav sub-nav">',
		'		<menu-item :item="item" v-for="item in item.list"></menu-item>',
		'	</ul>',
		'	<a v-if="item.type === 1" :href="\'#\'+item.url">',
		'		<span v-if="item.icon != null" :class="item.icon"></span>{{item.name}}',
		'   </a>',
		'</li>'
	].join('')
});


//注册菜单组件
Vue.component('menuItem',menuItem);

var vm = new Vue({
	el:'#rrapp',
	data:{
		user:{},
		menuList:{},
		main:"main.html",
		password:'',
		newPassword:'',
        navTitle:"控制台"
	},
	methods: {
		getMenuList: function (event) {
			$.getJSON("sys/menu/nav?_"+$.now(), function(r){
				vm.menuList = r.menuList;
			});
		},
		getUser: function(){
			$.getJSON("sys/user/info?_"+$.now(), function(r){
				vm.user = r.user;
			});
		},
		updatePassword: function(){
			layer.open({
				type: 1,
				skin: 'layer-ext-moon',
				title: "修改密码",
				area: ['550px', '270px'],
				shadeClose: false,
				content: jQuery("#passwordLayer"),
				btn: ['修改','取消'],
				btn1: function (index) {
					var data = "password="+vm.password+"&newPassword="+vm.newPassword;
					$.ajax({
						type: "POST",
					    url: "sys/user/password",
					    data: data,
					    dataType: "json",
					    success: function(result){
							if(result.code == 0){
								layer.close(index);
								layer.alert('修改成功', function(index){
									location.reload();
								});
							}else{
								layer.alert(result.msg);
							}
						}
					});
	            }
			});
			
		}
	},
	created: function(){
		this.getMenuList();
		this.getUser();
	},
	updated: function(){
		//路由
		var router = new Router();
		routerList(router, vm.menuList);
		router.start();
	}
});



function routerList(router, menuList){
	for(var key in menuList){
		var menu = menuList[key];
		if(menu.type == 0){
			routerList(router, menu.list);
		}else if(menu.type == 1){
			router.add('#'+menu.url, function() {
				var url = window.location.hash;
				
				//替换iframe的url
			    vm.main = url.replace('#', '');
			    
			    //导航菜单展开
			    $(".treeview-menu li").removeClass("active");
			    $("a[href='"+url+"']").parents("li").addClass("menu-open");
			    
			    vm.navTitle = $("a[href='"+url+"']").text();
			});
		}
	}
}
