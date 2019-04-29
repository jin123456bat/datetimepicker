jQuery.fn.extend({
	datetimepicker:function(args){
		args = args || {};
		//时间选择模式  默认为日期时间  还有date 或者 time
		var global_select = args.select||'datetime';
		
		var global_min_date = args.min_date || '';
		var global_max_date = args.max_date || '';
		if(args.with_second == undefined || args.with_second)
		{
			var global_with_second = true;
		}
		else 
		{
			var global_with_second = false;
		}
		
		var global_event_blur = args.blur;
		
		var selector = $(this).attr('autocomplete','off');
		
		if(args == 'destroy')
		{
			selector.next().remove();
			selector.removeAttr('_date_time_picker');
			return false;
		}
		
		
		var outline = $('<div></div>').css({
			display:'inline',
			position:'relative',
		});
		outline.insertAfter(selector);
		outline.append(selector);
		
		
		$(document).on('click',function(e){
			$(this).find('[_date_time_picker=true]').removeAttr('_date_time_picker').next().remove();
			if(typeof global_event_blur == 'function')
			{
				global_event_blur();
			}
		});
		
		selector.on('focus',function(e){
			//被禁用的输入框不弹出
			if($(this).prop('disabled')==true)
			{
				return false;
			}
			//假如弹出框已经出来了就不执行下面的代码
			if($(this).attr('_date_time_picker') == 'true')
			{
				return false;
			}
			//弹出框弹出标记
			$(this).attr('_date_time_picker','true');
			//时间模式
			var mode = 'day';
			
			
			var week_table = [
				'日',
				'一',
				'二',
				'三',
				'四',
				'五',
				'六',
			];
			
			var month_table = [
				'一','二','三','四','五','六','七','八','九','十','十一','十二'
			];
			
			var date = new Date();
			
			var current_year = date.getFullYear();
			var current_month = date.getMonth();
			var current_day = date.getDate();
			var current_hour = date.getHours();
			var current_minute = date.getMinutes();
			var current_second = date.getSeconds();
			
			//弹出框偏移位置
			var top = 3;
			var left = 1;
			
			var old_val = $.trim(selector.val());
			if(old_val.length!=0)
			{
				old_val_array = old_val.split('-');
				if(old_val_array.length==3)
				{
					current_year = parseInt(old_val_array[0]);
					current_month = parseInt(old_val_array[1])-1;
					current_day = parseInt(old_val_array[2]);
				}
			}
			
			var container = $('<div class="datetimepicker-container"></div>');
			container.insertAfter(selector).css({
				top:(selector.outerHeight())+'px',
				left:left+'px'
			});
			
			var header_container = $('<div class="datetimepicker-header"><div class="prev datetimepicker-item1"><</div><div class="title datetimepicker-item5">'+current_year+'年'+(current_month+1)+'月</div><div class="next datetimepicker-item1">></div></div>').appendTo(container);
			
			var mode_day = $('<div class="mode_container mode_day"></div>').appendTo(container);
			var mode_month = $('<div class="mode_container mode_month"></div>').appendTo(container);
			var mode_year = $('<div class="mode_container mode_year"></div>').appendTo(container);
			var mode_time = $('<div class="mode_container mode_time display-none"></div>').appendTo(container);
			
			var week_container = $('<div class="datetimepicker-week"></div>').appendTo(mode_day);
			var day_container = $('<div class="datetimepicker-day"></div>').appendTo(mode_day);
			var month_container = $('<div class="datetimepicker-month"></div>').appendTo(mode_month);
			var year_container = $('<div class="datetimepicker-year"></div>').appendTo(mode_year);
			var time_container = $('<div class="datetimepicker-time"></div>').appendTo(mode_time);
			
			
			var hour_select = $('<div class="datetimepicker-select hour-select"></div>').appendTo(time_container);
			var minutes_select = $('<div class="datetimepicker-select minutes-select"></div>').appendTo(time_container);
			
			if(global_with_second)
			{
				var second_select = $('<div class="datetimepicker-select second-select"></div>').appendTo(time_container);
			}
			
			//添加小时数据
			for(var i=0;i<24;i++)
			{
				var item = $('<div class="time-item hour">'+lpad(i,2)+'</div>').on('click',function(e){
					$(this).siblings().removeClass('active');
					$(this).addClass('active');
					current_hour = parseInt($(this).text());
					setSelectorVal();
					e.stopPropagation();
				});
				if(i==current_hour)
				{
					item.addClass('active');
				}
				item.appendTo(hour_select);
			}
			
			//添加分数据
			for(var i=0;i<60;i++)
			{
				var item = $('<div class="time-item minute">'+lpad(i,2)+'</div>').on('click',function(e){
					$(this).siblings().removeClass('active');
					$(this).addClass('active');
					current_minute = parseInt($(this).text());
					setSelectorVal();
					e.stopPropagation();
				});
				if(i==current_minute)
				{
					item.addClass('active');
				}
				item.appendTo(minutes_select);
			}
			
			//添加秒数据
			if(global_with_second)
			{
				for(var i=0;i<60;i++)
				{
					var item = $('<div class="time-item second">'+lpad(i,2)+'</div>').on('click',function(e){
						$(this).siblings().removeClass('active');
						$(this).addClass('active');
						current_second = parseInt($(this).text());
						setSelectorVal();
						e.stopPropagation();
					});
					if(i==current_second)
					{
						item.addClass('active');
					}
					item.appendTo(second_select);
				}
			}
			
			header_container.find('.prev').on('click',function(e){
				if(mode == 'day')
				{
					current_month -= 1;
					if(current_month<0)
					{
						current_year-=1;
						current_month = 11;
					}
					drawDay(current_year,current_month,current_day);
				}
				else if(mode == 'year')
				{
					if(current_year-12>=1970)
					{
						drawYear(current_year-12);
						var start_year = 1970+parseInt((current_year - 1970)/12)*12;
						var end_year = 1970+(1+parseInt((current_year - 1970)/12))*12;
						header_container.find('.title').html(start_year+'~'+end_year);
					}
				}
				e.stopPropagation();
			});
			
			header_container.find('.title').on('click',function(e){
				if(global_select=='time')
				{
					return false;
				}
				if(mode == 'day')
				{
					mode = 'month';
					header_container.find('.title').html(current_year+'年');
					mode_day.addClass('display-none');
					mode_month.removeClass('display-none');
					drawMonth(current_year,current_month);
				}
				else if(mode == 'month')
				{
					mode = 'year';
					var start_year = 1970+parseInt((current_year - 1970)/12)*12;
					var end_year = 1970+(1+parseInt((current_year - 1970)/12))*12;
					header_container.find('.title').html(start_year+'~'+end_year);
					mode_day.addClass('display-none');
					mode_month.addClass('display-none');
					mode_year.removeClass('display-none');
				}
				else if(mode == 'time')
				{
					mode = 'day';
					mode_day.removeClass('display-none');
					mode_time.addClass('display-none');
					header_container.find('.title').html(current_year+'年'+(current_month+1)+'月');
				}
				e.stopPropagation();
			});
			header_container.find('.next').on('click',function(e){
				if(mode == 'day')
				{
					current_month += 1;
					if(current_month>11)
					{
						current_year+=1;
						current_month = 0;
					}
					drawDay(current_year,current_month,current_day);
				}
				else if(mode == 'year')
				{
					drawYear(current_year+12);
					var start_year = 1970+parseInt((current_year - 1970)/12)*12;
					var end_year = 1970+(1+parseInt((current_year - 1970)/12))*12;
					header_container.find('.title').html(start_year+'~'+end_year);
				}
				
				e.stopPropagation();
			});
			
			for(var i=0;i<week_table.length;i++)
			{
				var week_btn = $('<div class="datetimepicker-item1 week_btn">'+week_table[i]+'</div>');
				week_btn.appendTo(week_container);
			}
			
			var setSelectorVal = function(){
				if(global_select=='date')
				{
					val = current_year+'-'+lpad(current_month+1,2)+'-'+lpad(current_day,2);
				}
				else if(global_select=='time')
				{
					val = lpad(current_hour,2)+':'+lpad(current_minute,2)+(global_with_second?(':'+lpad(current_second,2)):'');
				}
				else if(global_select == 'datetime')
				{
					val = current_year+'-'+lpad(current_month+1,2)+'-'+lpad(current_day,2)+' '+lpad(current_hour,2)+':'+lpad(current_minute,2)+(global_with_second?(':'+lpad(current_second,2)):'');
				}
				selector.val(val).trigger('change');
				
				if(global_select == 'time')
				{
					header_container.find('.title').html(lpad(current_hour,2)+':'+lpad(current_minute,2)+(global_with_second?(':'+lpad(current_second,2)):''));
				}
			};
			
			var drawYear = function(year){
				year_container.empty();
				var start_year = 1970+parseInt((year - 1970)/12)*12;
				var end_year = 1970+(1+parseInt((year - 1970)/12))*12;
				for(var i=start_year;i<end_year;i++)
				{
					var item = $('<div class="datetimepicker-item3">'+i+'</div>');
					if(i==current_year)
					{
						item.addClass('active');
					}
					item.on('click',function(e){
						$(this).siblings().removeClass('active');
						$(this).addClass('active');
						current_year = parseInt($(this).text());
						mode_month.removeClass('display-none');
						mode_year.addClass('display-none');
						mode = 'month';
						header_container.find('.title').html(current_year+'年');
						setSelectorVal();
						e.stopPropagation();
					});
					year_container.append(item);
				}
				current_year = year;
			};
			
			var drawMonth = function(year,month){
				month_container.empty();
				for(var i=0;i<month_table.length;i++)
				{
					var item = $('<div class="datetimepicker-item3" data-month="'+i+'">'+month_table[i]+'</div>');
					if(i==month)
					{
						item.addClass('active');
					}
					item.on('click',function(e){
						mode = 'day';
						current_month = parseInt($(this).data('month'));
						$(this).siblings().removeClass('active');
						$(this).addClass('active');
						header_container.find('.title').html(current_year+'年'+(current_month+1)+'月');
						drawDay(current_year,current_month,current_day);
						setSelectorVal();
						e.stopPropagation();
					});
					item.appendTo(month_container);
				}
			}
			
			
			
			/**
			 * 比较2个日期的大小
			 * 格式必须为YYYY-m-d
			 */
			var date_compare = function(start_date,end_date){
				var today = new Date();
				today_year = date.getFullYear();
				today_month = date.getMonth();
				today_day = date.getDate();
			
				end_date = end_date || (today_year+'-'+(today_month+1)+'-'+today_day);
				
				start_date_array = start_date.split('-');
				end_date_array = end_date.split('-');
				//比较年份
				if(parseInt(start_date_array[0]) < parseInt(end_date_array[0]))
				{
					return -1;
				}
				else if(parseInt(start_date_array[0]) > parseInt(end_date_array[0]))
				{
					return 1;
				}
				else
				{
					//比较月
					if(parseInt(start_date_array[1]) < parseInt(end_date_array[1]))
					{
						return -1;
					}
					else if(parseInt(start_date_array[1]) > parseInt(end_date_array[1]))
					{
						return 1;
					}
					else
					{
						//比较天
						if(parseInt(start_date_array[2]) < parseInt(end_date_array[2]))
						{
							return -1;
						}
						else if(parseInt(start_date_array[2]) > parseInt(end_date_array[2]))
						{
							return 1;
						}
						else
						{
							return 0;
						}
					}
				}
				
				return 0;
			}
			
			var drawDay = function(year,month,day){
				mode_day.removeClass('display-none');
				mode_month.addClass('display-none');
				mode_year.addClass('display-none');
				day_container.empty();
				var d = new Date(year,month,1);
				d_week = d.getDay();
				
				header_container.find('.title').html(current_year+'年'+(current_month+1)+'月');

				var insert_num = 0;
				//插入1号之前的日期
				for(var i=1;i<=d_week;i++)
				{
					var a = new Date(year,month,1);
					var s = new Date(a - i*24*3600*1000);
					var item = $('<div class="datetimepicker-item1 outday">'+s.getDate()+'</div>');
					item.on('click',function(e){
						current_month -= 1;
						if(current_month<0)
						{
							current_year-=1;
							current_month = 11;
						}
						current_day = parseInt($(this).text());
						drawDay(current_year,current_month,current_day);
						e.stopPropagation();
					});
					day_container.prepend(item);
					insert_num++;
				}
				//插入这个月的数据
				
				//先获取这个月有几天
				var a = new Date(year,month+1,1);
				var s = new Date(a-24*3600*1000);
				var last_day = s.getDate();
				
				//添加这个月的数据
				for(var i=1;i<=last_day;i++)
				{
					var item = $('<div class="datetimepicker-item1">'+i+'</div>');
					
					current_date = current_year+'-'+(current_month+1)+'-'+i;
					if(global_min_date.length>0 && date_compare(current_date,global_min_date) != 1)
					{
						item.css({
							color:'#999999',
						    cursor: 'default',
						});
						item.on('click',function(e){
							e.stopPropagation();
						});
					}
					else if(global_max_date.length>0 && date_compare(current_date,global_max_date) == 1)
					{
						item.css({
							color:'#999999',
						    cursor: 'default',
						});
						item.on('click',function(e){
							e.stopPropagation();
						});
					}
					else
					{
						item.on('click',function(e){
							$(this).siblings().removeClass('active');
							$(this).addClass('active');
							current_day = parseInt($(this).text());
							
							
							if(global_select == 'date')
							{
								//关闭整个选择框
								container.remove();
								selector.removeAttr('_date_time_picker');
							}
							else if(global_select == 'datetime')
							{
								//进入time模式
								mode = 'time';
								mode_day.addClass('display-none');
								mode_time.removeClass('display-none');
								header_container.find('.title').html(current_year+'年'+(current_month+1)+'月'+current_day+'日');
							}
							
							setSelectorVal();
							e.stopPropagation();
						});
						if(i == day)
						{
							item.addClass('active');
						}
					}
					
					day_container.append(item);
					insert_num++;
				}
				
				//添加下个月的数据
				for(var i=insert_num;i<42;i++)
				{
					var a = new Date(year,month+1,1);
					
					var s = new Date(a.valueOf() + (i-insert_num)*24*3600*1000);
					var item = $('<div class="datetimepicker-item1 outday">'+s.getDate()+'</div>');
					item.on('click',function(e){
						current_month += 1;
						if(current_month>11)
						{
							current_year+=1;
							current_month = 0;
						}
						current_day = parseInt($(this).text());
						drawDay(current_year,current_month,current_day);
						e.stopPropagation();
					});
					day_container.append(item);
				}
			};
			
			
			drawYear(current_year);
			//自适应js
			var item_width3 = mode_year.find('.datetimepicker-item3').width();
			mode_year.css({
				lineHeight: item_width3+'px',
			}).find('.datetimepicker-item3').height(item_width3+'px');
			
			
			drawMonth(current_year,current_month);
			//自适应js
			var item_width3 = $('.datetimepicker-item3').width();
			mode_month.find('.datetimepicker-item3').height(item_width3+'px');
			mode_month.css({
				lineHeight: item_width3+'px',
			});
			
			drawDay(current_year,current_month,current_day);
			//自适应js
			var item_width = mode_day.find('.datetimepicker-item1').width();
			mode_day.find('.datetimepicker-item1').height(item_width+'px');
			container.css({
				lineHeight: item_width+'px',
			});
			
			if(global_select=='time')
			{
				mode_day.addClass('display-none');
				mode_time.removeClass('display-none');
				mode = 'time';
				
				header_container.find('.prev').addClass('display-none');
				header_container.find('.next').addClass('display-none');
				header_container.find('.title')
				.removeClass('datetimepicker-item5')
				.addClass('datetimepicker-item7')
				.html(lpad(current_hour,2)+':'+lpad(current_minute,2)+(global_with_second?(':'+lpad(current_second,2)):''));
			}
		});
		selector.on('click',function(e){
			e.stopPropagation();
		});
	}
});