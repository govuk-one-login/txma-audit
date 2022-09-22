const fraudKeys = ['validityScore'];

export interface ICleansedEvidenceEvent {
    validityScore?: number;
}

export interface ICleansedExtensionsEvent {
    evidence?: ICleansedEvidenceEvent | undefined;
}

export interface ICleansedEvent {
    event_id: string;
    event_name: string;
    component_id: string;
    timestamp: number;
    timestamp_formatted: string;
    extensions?: unknown | undefined;
    reIngestCount?: number;
    govuk_signin_client_id?: string;
}

export class CleansedEvent implements ICleansedEvent {
    readonly event_id: string;
    readonly event_name: string;
    readonly component_id: string;
    readonly timestamp: number;
    readonly timestamp_formatted: string;
    readonly extensions?: unknown | undefined;
    readonly reIngestCount?: number;
    readonly govuk_signin_client_id?: string;

    constructor(
        event_id: string,
        event_name: string,
        component_id: string,
        timestamp: number,
        timestamp_formatted: string,
        extensions?: unknown | undefined,
        reIngestCount?: number,
        govuk_signin_client_id?: string,
    ) {
        this.event_id = event_id;
        this.event_name = event_name;
        this.component_id = component_id;
        this.timestamp = timestamp;
        this.timestamp_formatted = timestamp_formatted;
        this.reIngestCount = reIngestCount;
        this.govuk_signin_client_id = govuk_signin_client_id;

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
