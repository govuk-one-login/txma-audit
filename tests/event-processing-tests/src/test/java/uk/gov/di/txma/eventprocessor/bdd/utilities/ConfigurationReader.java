package uk.gov.di.txma.eventprocessor.bdd.utilities;

public class ConfigurationReader {


    public static String getSqsUrl() {
        String SqsUrl = System.getenv("CFN_SqsURL");
        if (SqsUrl == null) {
            throw new IllegalArgumentException("Environment variable CFN_SqsURL is not set");
        }
        return SqsUrl;
    }
}
