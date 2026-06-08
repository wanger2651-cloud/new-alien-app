export interface RemoteBrowserNotificationDto {
		Message: string;
		Severity?: string | null;
		PlaySound: boolean;
		SoundId?: string | null;
		PageKey?: string | null;
}
