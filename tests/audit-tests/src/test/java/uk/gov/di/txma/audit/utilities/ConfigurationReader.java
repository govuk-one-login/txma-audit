package uk.gov.di.txma.audit.utilities;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.ssm.SsmClient;
import software.amazon.awssdk.services.ssm.model.DescribeParametersRequest;
import software.amazon.awssdk.services.ssm.model.DescribeParametersResponse;
import software.amazon.awssdk.services.ssm.model.GetParameterRequest;
import software.amazon.awssdk.services.ssm.model.GetParameterResponse;
import software.amazon.awssdk.services.ssm.model.ParameterMetadata;
import software.amazon.awssdk.services.ssm.model.SsmException;

import java.util.Optional;


public class ConfigurationReader {

    public static String getBrowser() {
        return Optional.ofNullable(System.getenv("BROWSER")).orElse("chrome-headless");
    }

    public static String getUrl(String URLName){
        try (SsmClient ssmClient = SsmClient.builder()
                .region(Region.EU_WEST_2)
                .build()){

            GetParameterRequest parameterRequest = GetParameterRequest.builder()
                    .name(URLName)
                    .build();


            GetParameterResponse parameterResponse = ssmClient.getParameter(parameterRequest);
            return(parameterResponse.parameter().value());

        } catch (SsmException e) {
            System.out.println("message" + e.getMessage());
            System.exit(1);
        }

        return null;
    }

}
