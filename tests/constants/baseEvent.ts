import { AuditEvent } from '../support/types/auditEvent'

export const baseEvent: AuditEvent = {
  event_name: 'AUTH_IPV_CAPACITY_REQUESTED',
  component_id: 'AuthAccountMgmt',
  timestamp: 1675073725,
  timestamp_formatted: '2023-01-30T10:15:25.000Z',
  user: {
    user_id: '2Io50iukFV344Ig6g4kMOAG0F',
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
    },
    device_information: {
      accepted_language: 'en-GB,en-US;q=0.9,en;q=0.8',
      audit_header_version: 'FlrDngpqN7sLqB7SxraNWPQVt',
      connection_port: 53232,
      country_code: 'GB',
      device_id: '2XXQBJtWdKX23yT3OuMe3T7B3',
      ip_address: '1.2.3.4',
      ja3_fingerprint: 'VwxGmcGMAGOpGmopnr0A82XHe',
      request_timestamp_ms: 1746710076288,
      user_agent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
      thumbmarkjs_fingerprint: {
        fonts: {
          fontHash: 'abo9ClMIS0G9SuBwNGE7oOtNR'
        },
        hardware: {
          architecture: 'ko7oSE93Yx30PMdnXW9TKd1bI',
          deviceMemory: 'e2VkQvtVGj7Esf3YJ6BBdkEUk',
          jsHeapSizeLimit: 'eDh3HChjqRu332LaWv3nWIrW2',
          videocard: {
            renderer: 'AdYySJJjqqPyCo5QPRX0yVaFv',
            shadingLanguageVersion: 'adxGeCDoGS6FLSJpQCMVr4Ziu',
            vendor: 'e8hlY382IbtCdABmZOYhD6MhF',
            version: '2mzSIWJ6hOrtFniYtInj3IFiI'
          }
        },
        locales: {
          languages: 'Q8OmCmaaPo9t0FheeTw1cIJ9o',
          timezone: 'yWtWuvq07PM1Vf1LoQcCEd839'
        },
        permissions: {
          accelerometer: 'rFGOFZPIMf7exwJEjy9UghP1y',
          'background-fetch': 'UPGQ8OV7SXN9GUDE2JnCRv386',
          'background-sync': 'FusmRQDGuCYpnXClSRn9B74CI',
          camera: 'fpul9W7rLU25jg4fmHKfzKFNj',
          'clipboard-read': 'gdDOnPyV5X8BIGmrH0WI64Xu8',
          'clipboard-write': 'NYfahY4EzwQHo76A5xjiPbu5I',
          'display-capture': 'bcnXalk87uIKN2wYcdFbwPrPH',
          geolocation: 'x1aHQUxiaENnpx0DEve9jlpQP',
          gyroscope: 'T5PPYwBnVeYvEJbiyCmcxTWTt',
          'local-fonts': 'lfvV843C707r1wtqWsxuUHvxK',
          magnetometer: 'gxMj15Y0UfMSMCqUkCTzcXyP1',
          microphone: 'eu43BlBA7nMXHM3q3bangUUEP',
          midi: 'hTdPdO9UxTTjXurbr7NLJ7HPR',
          notifications: 'c8ACunImDup6XU4KwbhAvRePQ',
          'payment-handler': 'XKMwjGwpkbkhGQf9qCiueYAKG',
          'persistent-storage': 'ixQ41MAI8GpucVJifllFiF71Z',
          'storage-access': 'qY1ue6mUoMzCvqDhdcAkFLrN8',
          'window-management': 'JnPthscRAUuFmKmV0kp9f2gFX'
        },
        plugins: {
          plugins: [
            'YFZwnTYlYSQTdcxVweLTC8MsS',
            'ImYj4aJB35iSWAvIV2vPbSAuy',
            'RbAZTMp8w0guRuB9mYCtVCCuz',
            'Co1FjPWO1OY81HBJZuax2OyjB',
            'Fa6Jpo2g8xnm5kpgN5oyfCzTS'
          ]
        },
        screen: {
          colorDepth: 'bBnYHZ3AZQY8T9LkKmSjvrmdk',
          is_touchscreen: 'EvCt2eSphKdPTZoBfpaN6bTef',
          maxTouchPoints: 'uzAJDnfhrEYVrOorLA4u0GQTm',
          mediaMatches: [
            'N7wKHBeJ76d2FOXffGPKzIi1Y',
            '1cf1KWaL2u9Bj88uxezriOTEb',
            '0xyHgiZuoaNmkPgYc9xf29b2d',
            'IciPl5jVONJeGGjchurWWsydW',
            '8DjpHJkn9wChD3WxZXrXAlexh',
            'zhKBfrAVwKdkNg2QvwqqAEEla',
            '7pTmbxqcDovU2oDmvQNrg5JXY',
            'LHkhcJEn5dUZwyrVF91Y9G5Vz',
            'jCumpiSU9Ho8kycjswi1EJf1d',
            'l4vl02jD1sXvGJoPYBpcZic9b'
          ]
        },
        system: {
          applePayVersion: 'WumQAtp0E3KKKjRGwBw2ofudr',
          browser: {
            name: 'k5sqVNatFFpl0rSqTgKwPkUlc',
            version: 'Lqx8qL4fPWIcccgJscjhvU9Ia'
          },
          cookieEnabled: '6LYlGLDFaqhu035QgZ7kBWL4S',
          hardwareConcurrency: '7AzLQp8S8uKFJ8OaukngUOXHd',
          platform: 'Ij6QmlXB2dVMUqgvVbQNhOj1j',
          product: 'cb8Obowg5A3BbwsZrE9qqjAFJ',
          productSub: 'm5glDAtcalah7VIOKTr6aBn6e',
          useragent: 'OpRYjgfRZLorkLpHLakUgX05Q'
        },
        thumbmark: {
          deviceHash: 'coaIAbIjEIE7ICAVf3P0ZPtSU'
        }
      }
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
