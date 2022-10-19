package uk.gov.di.txma.audit.utilities;

import java.util.Optional;

public class ConfigurationReader {

    public static String getBrowser() {
        return Optional.ofNullable(System.getenv("BROWSER")).orElse("chrome-headless");
    }

    public static String getIPVCoreStubUrl() {
        String IPVCoreStubUrl = System.getenv("CFN_IPVCoreStubURL");
        if (IPVCoreStubUrl == null) {
            throw new IllegalArgumentException("Environment variable CFN_IPVCoreStubURL is not set");
        }
        return IPVCoreStubUrl;
    }
    public static String getOrchestratorStubUrl() {
        String orchestratorStubUrl = System.getenv("CFN_OrchestrationStubURL");
        if (orchestratorStubUrl == null) {
            throw new IllegalArgumentException("Environment variable CFN_OrchestrationStubURL is not set");
        }
        return orchestratorStubUrl;
    }

    public static String getAppURL() {
        String AppURL = System.getenv("CFN_AppURL");
        if (AppURL == null) {
            throw new IllegalArgumentException("Environment variable CFN_AppURL is not set");
        }
        return AppURL;
    }
}