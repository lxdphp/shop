>**[Shotgun API 说明文档](#jump_8)**

官方API文档地址： https://developer.shotgridsoftware.com/rest-api/?shell#search-all-records

基本用法，获取实体数据可用 Search all records 或者 Read all records

现在以外包排期接口为例，说明如何用NodeJs，来请求数据

## 1 获取access_token
    
- 请求地址： /api/v1/auth/access_token
- 请求方式:  post
- 请求参数： 自己的shotgun账号密码

示例代码

```javajavascript
async getAxcessToken() {
		const { ctx } = this;

    const redis_key = 'schedule:shotgun_user_token';
    const res = await ctx.service.redis.get(redis_key);
    
    let token = '';
    if(res) {
      token = res;
    } else {
      const data = {
        grant_type: 'password',
        username: 'lingxiao',
        password: 'ling0310?!',
      }
      const url = `${this.config.shotgunHost}/api/v1/auth/access_token`;
  
      try {
        const res = await ctx.curl(url, {
          dataType: 'json',
          data,
          method: 'POST',
        });
        await ctx.service.redis.set(redis_key, res.data.access_token, 40);
        token = res.data.access_token
      } catch (error) {
        console.log('service shotgun getAxcessToken error: ', error);
      
      }
    }
    return token;		
	}
```

## 2 获取排期计划数据

- 请求地址： /api/v1/entity/Task/_search ，因为数据源是shotgun的镜头任务，所以实体这边用 Task 
- 请求方式:  post
- 请求参数： 根据业务来选择参数

### 2.1 如何写请求参数

示例：
  需求： 通过环节筛选数据
  我们首先需要shotgun是怎么通过环节筛选数据的，打开shotgun的任务页面，打开F12, 在filter中筛选镜头，这时查看
  https://shotgun.morevfx.com/page/save_user_temporary_settings 这个接口的请求参数，其中可以看到
  {
    "logical_operator": "or",
    "conditions": [
      {
        "path": "step",
        "relation": "is",
        "values": [
          {
            "type": "Step",
            "id": 10,
            "name": "Model",
            "valid": "valid",
            "show_entity_type": true
          }
        ]
      }
    ]
  }
  我们这边可以用下面的方式来请求参数
  
  "filters": {
    "logical_operator": "and",
    "conditions": [
      [
        "step.Step.code",
        "is",
        "Model"
      ]`
    ]
  }

  这种是hash的方式书写的参数

  这里的header要采用 'Content-Type': 'application/vnd+shotgun.api3_hash+json',



### 2.2 如何获取shotgun字段

示例：
  需求： 列表展示镜头
  我们首先需要shotgun是怎么展示镜头数据的，打开shotgun的任务页面，打开F12, 在fields中勾选镜头，这时查看
  https://shotgun.morevfx.com/page/save_user_temporary_settings 这个接口的请求参数，其中可以看到

  "columns": [
      "entity.Asset.image",
      "entity.Shot.tags",
      "entity.Shot.sg_episodes",
      "entity",
      "entity.Asset.description",
      "step",
      "content",
      "sg_description",
      "sg_status_list",
      "sg_task_progress",
      "task_assignees",
      "start_date",
      "sg_schedule_last_dailies_date",
      "due_date",
      "duration",
      "sg_plan_day",
      "time_logs_sum",
      "sg_hero_shot",
      "sg_follow_shots",
      "tags",
      "entity.Shot.id",
      "entity.Shot.code",
      "entity.Asset.code",
      "sg_timelog_description",
      "entity.Shot.sg_category.CustomEntity26.code",
      "entity.Asset.sg_category.CustomEntity26.code",
      "entity.Shot.sg_shared_date"
    ]

    "entity.Shot.code" 这个值就是镜头名称字段