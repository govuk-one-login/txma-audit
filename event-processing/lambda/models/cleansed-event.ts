export interface ICleansedExtensionsEvent {
    evidence?: unknown | undefined;
}

export interface ICleansedEvent {
    event_id: string;
    event_name: string;
    component_id: string;
    timestamp: number;
    timestamp_formatted: string;
    extensions?: unknown | undefined;
}

function CleanseEvidenceEvent(evidence: any) {

    let cleansedEvidence = {} as any;
    let fraudKeys = ['validityScore']

    for (const key of fraudKeys){
      if (evidence[key]){
          cleansedEvidence[key] = evidence[key];
      }
    }

    return cleansedEvidence
}

export class CleansedEvent implements ICleansedEvent {
    readonly event_id: string;
    readonly event_name: string;
    readonly component_id: string;
    readonly timestamp: number;
    readonly timestamp_formatted: string;
    readonly extensions?: unknown | undefined;

    constructor(
        event_id: string,
        event_name: string,
        component_id: string,
        timestamp: number,
        timestamp_formatted: string,
        extensions?: unknown | undefined,
    ) {
        this.event_id = event_id;
        this.event_name = event_name;
        this.component_id = component_id;
        this.timestamp = timestamp;
        this.timestamp_formatted = timestamp_formatted;

        if (extensions != undefined && Object.keys((extensions as ICleansedExtensionsEvent).evidence as any).length > 0) {
            let evidence = CleanseEvidenceEvent((extensions as ICleansedExtensionsEvent).evidence as any)
            if (Object.keys(evidence).length){
              this.extensions = { evidence: evidence };
            }
        }
    }
}
