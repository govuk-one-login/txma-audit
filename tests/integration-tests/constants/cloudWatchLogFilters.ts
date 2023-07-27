export const cloudwatchLogFilters: CloudwatchLogFiltersConstants = {
  eventPublished: 'Successfully processed',
  firehouseSuccess: 'Successfully processed'
}

type CloudwatchLogFiltersConstants = {
  readonly eventPublished: string
  readonly firehouseSuccess: string
}
