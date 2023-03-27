export const getAuditFilePrefixesForDates = (
  dateFrom: string,
  dateTo: string
): string[] => {
  return generateTimeRange(getEpochDate(dateFrom), getEpochDate(dateTo)).map(
    (date) =>
      `firehose/${date.getFullYear()}/${padDateComponentToTwoDigits(
        date.getMonth() + 1
      )}/${padDateComponentToTwoDigits(date.getDate())}`
  )
}

const padDateComponentToTwoDigits = (dateComponent: number) =>
  dateComponent.toString().padStart(2, '0')

const generateTimeRange = (epochStartDate: number, epochEndDate: number) => {
  const currentDate = new Date(epochStartDate)

  // Set end to be the last hour in the last day
  const lastHour = new Date(epochEndDate)

  const timeRange: Date[] = []

  while (currentDate <= new Date(lastHour)) {
    timeRange.push(new Date(currentDate))
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  return timeRange
}

const getEpochDate = (dateString: string): number => {
  const dateParts = dateString.split('-')

  const epochDate = Date.UTC(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2])
  )

  if (isNaN(epochDate))
    throw Error(`String '${dateString}' is not a valid date`)

  return epochDate
}
