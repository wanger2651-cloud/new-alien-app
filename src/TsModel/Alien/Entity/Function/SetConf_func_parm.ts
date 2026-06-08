export interface SetConf_func_parm {
		shop: string;
		/** 功能编码*/
		code: string;
		/** 配置*/
		ConfObj: any;
		/** 批量更新时保留 CHATPUSH 的 PushGroupOffIds、PushFriendOffids（各店铺推送目标不同，不覆盖）*/
		PreserveChatPushTargets: boolean;
}
