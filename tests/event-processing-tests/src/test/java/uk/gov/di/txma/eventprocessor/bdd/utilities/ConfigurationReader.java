package uk.gov.di.txma.eventprocessor.bdd.utilities;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.GetParameterRequest;
import software.amazon.awssdk.services.ssm.model.GetParameterResponse;
import software.amazon.awssdk.services.ssm.model.SsmException;

public class ConfigurationReader {


    public static String getSqsUrl() {
        Region region = Region.EU_WEST_2;
        SsmClient ssmClient = SsmClient.builder()
                .region(region)
                .build();
        String sqsUrl = new String();

        try {
            GetParameterRequest parameterRequest = GetParameterRequest.builder()
                    .name("TxMAAccountsQueueArn")
                    .build();

            GetParameterResponse parameterResponse = ssmClient.getParameter(parameterRequest);
            System.out.println("paramenter requested" +parameterResponse.parameter().value());
            String[] arnArray = parameterResponse.parameter().value().split(":");
            String accountId = arnArray[4];
            String queueName = arnArray[5];
            String queueRegion = arnArray[3];
            sqsUrl = "https://sqs." + queueRegion + ".amazonaws.com" + '/' +accountId + '/' +queueName;

        } catch (SsmException e) {
            System.err.println(e.getMessage());
            System.exit(1);
        }
        return sqsUrl;
    }
}
