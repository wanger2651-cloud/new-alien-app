import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_pay_agent_relation extends BaseSys {
		user_id: string;
		parent_user_id?: string | null;
		max_share_ratio: number;
		income_amount: number;
}
