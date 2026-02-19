import { describe, it, expect, beforeEach, vi } from 'vitest'
import { firehosePutRecordBatch } from '../../../common/sharedServices/firehose/firehosePutRecordBatch'
import { logger } from '../../../common/sharedServices/logger'
import { auditEventsToFirehoseRecords } from '../../../common/utils/helpers/firehose/auditEventsToFirehoseRecords'
import {
  baseFirehoseResponse,
  baseProcessingResults,
  mockFireHoseRecords
} from '../../../common/utils/tests/test-helpers/redriveSnsDlqTestHelper'
import * as parseFirehoseResponse from './parseFirehoseResponse'
import { FirehoseProcessingResult, writeToFirehose } from './writeToFirehose'

vi.mock(
  '../../../common/sharedServices/firehose/firehosePutRecordBatch',
  () => ({
    firehosePutRecordBatch: vi.fn()
  })
)

vi.mock(
  '../../../common/utils/helpers/firehose/auditEventsToFirehoseRecords.ts',
  () => ({
    auditEventsToFirehoseRecords: vi.fn()
  })
)

describe('test writeToFirehose() function', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(logger, 'warn')
    vi.spyOn(logger, 'info')
    vi.spyOn(logger, 'error')
    vi.spyOn(parseFirehoseResponse, 'parseFirehoseResponse')
  })

  it('calls firehosePutRecordBatch() function.', async () => {
    const mockDeliveryStreamName = 'mockDeliveryStreamName'
    ;(auditEventsToFirehoseRecords as any).mockReturnValue(mockFireHoseRecords)
    ;(firehosePutRecordBatch as any).mockResolvedValue(baseFirehoseResponse)

    await writeToFirehose(baseProcessingResults)
    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFireHoseRecords
    )
    expect(parseFirehoseResponse.parseFirehoseResponse).toHaveBeenCalledWith(
      baseFirehoseResponse,
      baseProcessingResults
    )
  })

  it('calls firehosePutRecordBatch() function. An error is raised', async () => {
    const mockDeliveryStreamName = 'mockDeliveryStreamName'
    const error = new Error('mockError')

    ;(auditEventsToFirehoseRecords as any).mockReturnValue(mockFireHoseRecords)
    ;(firehosePutRecordBatch as any).mockRejectedValue(error)

    const result = await writeToFirehose(baseProcessingResults)
    const expectedResult: FirehoseProcessingResult = {
      successfullProcessingResults: [],
      failedProcessingResults: baseProcessingResults
    }

    expect(firehosePutRecordBatch).toHaveBeenCalledWith(
      mockDeliveryStreamName,
      mockFireHoseRecords
    )
    expect(result).toStrictEqual(expectedResult)
    expect(logger.error).toHaveBeenCalledWith(
      'failed to publish to firehose',
      error
    )
  })
})
