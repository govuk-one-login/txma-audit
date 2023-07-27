import { cloudWatchLogsClient } from './cloudWatchLogsClient'
import {
  DescribeLogStreamsCommand,
  FilterLogEventsCommand,
  FilteredLogEvent,
  FilterLogEventsCommandInput
} from '@aws-sdk/client-cloudwatch-logs'
import { exponentialBackoff, pause } from '../../helpers'

export const filterCloudWatchLogs = async (
  logGroupName: string,
  filters: string[],
  maxRetries = 20,
  retryCount = 0
): Promise<FilteredLogEvent[]> => {
  try {
    const filterPattern = filters.map((pattern) => `"${pattern}"`).join(' ')

    const logStreamNames = await getLogStreams(logGroupName)
    if (logStreamNames === undefined || logStreamNames.length === 0) {
      throw new Error(`No log streams found for log group ${logGroupName}`)
    }

    const filterResponse = await filterLogEvents({
      logGroupName,
      logStreamNames,
      filterPattern
    })
    if (filterResponse === undefined || filterResponse.length === 0) {
      throw new Error(
        `No log events found for log group ${logGroupName} matching filter pattern ${filterPattern}`
      )
    }

    return filterResponse
  } catch (error) {
    retryCount++
    if (retryCount > maxRetries) {
      return []
    } else {
      await pause(exponentialBackoff(retryCount, 2))
      return await filterCloudWatchLogs(
        logGroupName,
        filters,
        maxRetries,
        retryCount
      )
    }
  }
}

const getLogStreams = async (logGroupName: string) => {
  const input = {
    logGroupName: logGroupName,
    orderBy: 'LastEventTime',
    descending: true,
    limit: 15
  }
  const command = new DescribeLogStreamsCommand(input)
  const response = await cloudWatchLogsClient.send(command)
  const logStreams = response?.logStreams ?? []

  return logStreams.map((logStream) => logStream.logStreamName as string)
}

const filterLogEvents = async (
  input: FilterLogEventsCommandInput,
  events: FilteredLogEvent[] = []
) => {
  const command = new FilterLogEventsCommand(input)
  const response = await cloudWatchLogsClient.send(command)

  if (!response.events) return []

  response.events.forEach((event) => events.push(event))

  if (response.nextToken) {
    input.nextToken = response.nextToken
    await filterLogEvents(input, events)
  }

  return events
}
