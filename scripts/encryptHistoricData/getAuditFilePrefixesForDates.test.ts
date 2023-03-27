import { getAuditFilePrefixesForDates } from './getAuditFilePrefixesForDates'

describe('getAuditFilePrefixesForDates', () => {
  it.each`
    dateFrom        | dateTo          | prefixes
    ${'2022-03-30'} | ${'2022-03-30'} | ${['2022/03/30']}
    ${'2022-03-30'} | ${'2022-04-02'} | ${['2022/03/30', '2022/03/31', '2022/04/01', '2022/04/02']}
    ${'2022-03-02'} | ${'2022-03-07'} | ${['2022/03/02', '2022/03/03', '2022/03/04', '2022/03/05', '2022/03/06', '2022/03/07']}
  `('should return', ({ dateFrom, dateTo, prefixes }) => {
    expect(getAuditFilePrefixesForDates(dateFrom, dateTo)).toEqual(
      prefixes.map((p: string) => `firehose/${p}`)
    )
  })
})
