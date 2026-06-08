import * as Comm from '@/TsModel/Comm/Comm';

export interface HttpRequestItem {
		URL: string;
		Method: string;
		Timeout: number;
		Accept: string;
		ContentType: string;
		Postdata?: string | null;
		PostDataType: number;
		Form_Data?: Comm.Dictionary<string, string> | null;
		Cookie?: string | null;
		Headers?: Comm.Dictionary<string, string> | null;
		UseInterceptor: boolean;
		PageKey?: string | null;
}
