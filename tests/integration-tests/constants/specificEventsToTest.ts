import { AuditEvent } from '../support/types/auditEvent'
import { getEnv } from '../support/utils/getEnv'
import {
  NestedKeyOf,
  obfuscateSpecifiedProps
} from '../support/utils/obfuscateSpecifiedProps'
import { baseEvent } from './baseEvent'

const hmacKey = getEnv('PERFORMANCE_HMAC_KEY')
const requiredProps = ['user'] as NestedKeyOf<AuditEvent>[]

const obfuscatedProps = obfuscateSpecifiedProps(
  baseEvent,
  requiredProps,
  hmacKey
) as Partial<AuditEvent>

const testUserObject = {
  user_id: obfuscatedProps.user?.user_id,
  govuk_signin_journey_id: baseEvent.user?.govuk_signin_journey_id
}

export const eventsToTest: [string, AuditEvent][] = [
  [
    'IPV_VC_RECEIVED',
    {
      event_name: 'IPV_VC_RECEIVED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        iss: baseEvent.extensions?.iss,
        successful: baseEvent.extensions?.successful,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah',
            type: 'blah',
            checkDetails: {
              biometricVerificationProcessLevel: 'blah',
              checkMethod: 'blah',
              kbvQuality: 'blah',
              kbvResponseMode: 'blah'
            },
            failedCheckDetails: {
              biometricVerificationProcessLevel: 'blah',
              checkMethod: 'blah',
              kbvResponseMode: 'blah'
            }
          }
        ]
      }
    }
  ],
  [
    'IPV_IDENTITY_ISSUED',
    {
      event_name: 'IPV_IDENTITY_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        levelOfConfidence: baseEvent.extensions?.levelOfConfidence,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ],
  [
    'IPV_IDENTITY_ISSUED',
    {
      event_name: 'IPV_IDENTITY_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        levelOfConfidence: baseEvent.extensions?.levelOfConfidence,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ],
  [
    'AUTH_AUTHORISATION_INITIATED',
    {
      event_name: 'AUTH_AUTHORISATION_INITIATED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        'client-name': 'blah',
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ],
  [
    'DCMAW_CRI_VC_ISSUED',
    {
      event_name: 'DCMAW_CRI_VC_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah',
            checkDetails: {
              biometricVerificationProcessLevel: 'blah',
              checkMethod: 'blah'
            },
            failedCheckDetails: {
              biometricVerificationProcessLevel: 'blah',
              checkMethod: 'blah'
            },
            type: 'blah'
          }
        ]
      }
    }
  ],
  [
    'IPV_FRAUD_CRI_VC_ISSUED',
    {
      event_name: 'IPV_FRAUD_CRI_VC_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        iss: baseEvent.extensions?.iss,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah',
            checkDetails: {
              checkMethod: 'blah'
            },
            failedCheckDetails: {
              checkMethod: 'blah'
            },
            type: 'blah'
          }
        ]
      }
    }
  ],
  [
    'IPV_KBV_CRI_VC_ISSUED',
    {
      event_name: 'IPV_KBV_CRI_VC_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        iss: baseEvent.extensions?.iss,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah',
            checkDetails: {
              checkMethod: 'blah',
              kbvQuality: 'blah',
              kbvResponseMode: 'blah'
            },
            failedCheckDetails: {
              checkMethod: 'blah',
              kbvResponseMode: 'blah'
            },
            type: 'blah'
          }
        ]
      }
    }
  ],
  [
    'AUTH_PHONE_CHECK_COMPLETE',
    {
      event_name: 'AUTH_PHONE_CHECK_COMPLETE',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        iss: baseEvent.extensions?.iss,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah',
            type: 'blah'
          }
        ]
      }
    }
  ],
  [
    'IPV_PASSPORT_CRI_VC_ISSUED',
    {
      event_name: 'IPV_PASSPORT_CRI_VC_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        iss: baseEvent.extensions?.iss,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah',
            type: 'blah'
          }
        ]
      }
    }
  ],
  [
    'IPV_GPG45_PROFILE_MATCHED',
    {
      event_name: 'IPV_GPG45_PROFILE_MATCHED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ],
        gpg45Scores: {
          activity: 'blah',
          fraud: 'blah',
          verification: 'blah',
          evidences: {
            strength: 'blah',
            validity: 'blah'
          }
        }
      }
    }
  ],
  [
    'AUTH_CODE_MAX_RETRIES_REACHED',
    {
      event_name: 'AUTH_CODE_MAX_RETRIES_REACHED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        'mfa-type': 'blah',
        'notification-type': 'blah',
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ],
  [
    'AUTH_CODE_VERIFIED',
    {
      event_name: 'AUTH_CODE_VERIFIED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        'mfa-type': 'blah',
        'notification-type': 'blah',
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ],
  [
    'AUTH_INVALID_CODE_SENT',
    {
      event_name: 'AUTH_INVALID_CODE_SENT',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        'mfa-type': 'blah',
        'notification-type': 'blah',
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ],
  [
    'AUTH_AUTH_CODE_ISSUED',
    {
      event_name: 'AUTH_AUTH_CODE_ISSUED',
      component_id: baseEvent.component_id,
      timestamp: baseEvent.timestamp,
      timestamp_formatted: baseEvent.timestamp_formatted,
      event_id: undefined,
      user: testUserObject,
      txma: { obfuscated: true },
      extensions: {
        isNewAccount: baseEvent.extensions?.isNewAccount,
        evidence: [
          {
            activityHistoryScore: 'blah',
            identityFraudScore: 'blah',
            strengthScore: 'blah',
            validityScore: 'blah',
            verificationScore: 'blah'
          }
        ]
      }
    }
  ]
]
