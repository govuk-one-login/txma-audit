import { AuditEvent } from '../support/types/auditEvent'

export const baseEvent: AuditEvent = {
  event_name: 'AUTH_IPV_CAPACITY_REQUESTED',
  component_id: 'AuthAccountMgmt',
  timestamp: 1675073725,
  timestamp_formatted: '2023-01-30T10:15:25.000Z',
  user: {
    user_id: 'db8585f96ecafb3e7f42e71a7098386b0c3cf1e3d1bb8aa4edc5f127d2bb510b',
    govuk_signin_journey_id: 'Iwc0V7rjWLKpsMXXsDqJEm2fZvY',
    ip_address: '3.8.95.217',
    session_id: 'an4O5JafsHBvtbKCu2vDrMGZx6djfN0lkCxZvgjfrko',
    email: 'test@example.com',
    phone: '01234567890',
    transaction_id: 'blah',
    persistent_session_id: 'sakhsihqiuhiwg182hgso',
    device_id: 'ushig71wgbsjs'
  },
  restricted: {
    passport: {
      documentNumber: '9389372',
      expiryDate: '03/09/2040'
    }
  },
  platform: [
    {
      deviceInfo: {
        OSVersion: '12',
        brand: 'samsung',
        manufacturer: 'samsung',
        model: 'SM-G975F',
        platform: 'android'
      }
    }
  ],
  extensions: {
    iss: 'blah',
    successful: 'blah',
    levelOfConfidence: 'blah',
    'mfa-type': 'blah',
    'notification-type': 'blah',
    'client-name': 'blah',
    isNewAccount: 'blah',
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
