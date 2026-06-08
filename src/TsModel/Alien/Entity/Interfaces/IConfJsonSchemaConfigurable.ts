	/** 可配置 JSON 的实现类统一契约：业务方仅需声明配置 POCO 类型与业务校验逻辑；
JSON Schema 的生成由平台统一工具（{Alien.Common.Helpers.ConfJsonSchemaBuilder}）按 M:Alien.Entity.Interfaces.IConfJsonSchemaConfigurable.GetConfigType 产出，
业务侧禁止再各自手写或重复实现 Schema 生成代码，避免字段命名/枚举/默认值等口径漂移。*/
	export interface IConfJsonSchemaConfigurable {
		// 接口成员由实现类定义
	}
