import { startEncryptBatchJob } from './startEncryptBatchJob'
import { startRestoreBatchJob } from './startRestoreBatchJob'
import { listFilesToEncrypt } from './listFilesToEncrypt'
import { program } from 'commander'

export const startEncryption = async (parameters: {
  dateFrom: string
  dateTo: string
  testMode: boolean
}) => {
  console.log('Checking data for historic decrypt', {
    dateFrom: parameters.dateFrom,
    dateTo: parameters.dateTo
  })
  const listFilesResults = await listFilesToEncrypt(parameters)
  console.log(
    `${listFilesResults.standardFiles.length} standard files and ${listFilesResults.glacierFiles.length} glacier files found`
  )
  if (parameters.testMode) {
    console.log('Not starting batch jobs because this was a test mode run')
  } else {
    console.log('Starting batch jobs')
    await startRestoreBatchJob(listFilesResults.glacierFiles)
    await startEncryptBatchJob(listFilesResults.standardFiles)
  }
}

program
  .option('--startDate <startDate>', 'Start date')
  .option('--endDate <endDate>', 'End date')
  .option('--startNow')

program.parse(process.argv)

const options = program.opts()
if (options.startDate === undefined) {
  console.log('no startDate')
} else if (options.endDate === undefined) {
  console.log('no endDate')
} else {
  startEncryption({
    dateFrom: options.startDate,
    dateTo: options.endDate,
    testMode: !options.startNow
  }).then(() => console.log('Completed'))
}
