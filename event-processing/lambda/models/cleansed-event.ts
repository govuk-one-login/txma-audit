const fraudKeys = ['activityHistoryScore', 'identityFraudScore', 'strengthScore', 'validityScore', 'verificationScore'];

export interface ICleansedEvidenceEvent {
    activityHistoryScore?: number;
    identityFraudScore?: number;
    strengthScore?: number;
    validityScore?: number;
    verificationScore?: number;
}

export interface ICleansedExtensionsEvent {
    evidence?: ICleansedEvidenceEvent | undefined;
}

export interface ICleansedUserEvent {
    govuk_signin_journey_id?: string;
}

export interface ICleansedEvent {
    event_id: string;
    event_name: string;
    component_id: string;
    timestamp: number;
    timestamp_formatted: string;
    client_id?: string;
    user?: unknown | undefined;
    extensions?: unknown | undefined;
    reIngestCount?: number;
}

export class CleansedEvent implements ICleansedEvent {
    readonly event_id: string;
    readonly event_name: string;
    readonly component_id: string;
    readonly timestamp: number;
    readonly timestamp_formatted: string;
    readonly client_id?: string;
    readonly user?: unknown | undefined;
    readonly extensions?: unknown | undefined;
    readonly reIngestCount?: number;

    constructor(
        event_id: string,
        event_name: string,
        component_id: string,
        timestamp: number,
        timestamp_formatted: string,
        client_id?: string,
        user?: unknown | undefined,
        extensions?: unknown | undefined,
        reIngestCount?: number,
    ) {
        this.event_id = event_id;
        this.event_name = event_name;
        this.component_id = component_id;
        this.timestamp = timestamp;
        this.timestamp_formatted = timestamp_formatted;
        this.client_id = client_id;
        this.reIngestCount = reIngestCount;

        if (user != undefined && (user as ICleansedUserEvent).govuk_signin_journey_id) {
            this.user = {
                govuk_signin_journey_id: (user as ICleansedUserEvent).govuk_signin_journey_id,
            } as ICleansedUserEvent;
        }

        if (extensions != undefined && (extensions as ICleansedExtensionsEvent).evidence != undefined) {
            const evidence = CleansedEvent.CleanseEvidenceArrayEvent(
                (extensions as ICleansedExtensionsEvent).evidence as Array<ICleansedEvidenceEvent>,
            );
            if (Object.keys(evidence).length) {
                this.extensions = { evidence: evidence };
            }
        }
    }

    private static CleanseEvidenceArrayEvent(evidenceArray: Array<ICleansedEvidenceEvent>) {
        const cleansedEvidence: Array<ICleansedEvidenceEvent> = [];
        for (let evidence of evidenceArray) {
            evidence = CleansedEvent.CleanseEvidenceEvent(evidence as ICleansedEvidenceEvent);
            if (Object.keys(evidence).length) {
                cleansedEvidence.push(evidence);
            }
        }

        return cleansedEvidence;
    }

    private static CleanseEvidenceEvent(evidence: ICleansedEvidenceEvent) {
        for (const key in evidence) {
            const k = key as keyof ICleansedEvidenceEvent;

            if (!fraudKeys.includes(k)) {
                delete evidence[k];
            }
        }

        return evidence;
    }
}
