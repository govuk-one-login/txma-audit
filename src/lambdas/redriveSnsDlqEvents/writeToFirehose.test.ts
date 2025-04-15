import { when } from 'jest-when'
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

jest.mock(
  '../../../common/sharedServices/firehose/firehosePutRecordBatch',
  () => ({
    firehosePutRecordBatch: jest.fn()
  })
)

jest.mock(
  '../../../common/utils/helpers/firehose/auditEventsToFirehoseRecords.ts',
  () => ({
    auditEventsToFirehoseRecords: jest.fn()
  })
)

describe('test writeToFirehose() function', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.spyOn(logger, 'warn')
    jest.spyOn(logger, 'info')
    jest.spyOn(logger, 'error')
    jest.spyOn(parseFirehoseResponse, 'parseFirehoseResponse')
  })

  it('calls firehosePutRecordBatch() function.', async () => {
    const mockDeliveryStreamName = 'mockDeliveryStreamName'
    when(auditEventsToFirehoseRecords).mockReturnValue(mockFireHoseRecords)
    when(firehosePutRecordBatch).mockResolvedValue(baseFirehoseResponse)

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

    when(auditEventsToFirehoseRecords).mockReturnValue(mockFireHoseRecords)
    when(firehosePutRecordBatch).mockRejectedValue(error)

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
