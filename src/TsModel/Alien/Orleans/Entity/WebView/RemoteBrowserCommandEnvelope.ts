export interface RemoteBrowserCommandEnvelope {
		CommandType: string;
		CorrelationId: any;
		PageKey?: string | null;
		PayloadJson?: string | null;
}
