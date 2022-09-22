package uk.gov.di.txma.audit.utilities;

import java.io.FileInputStream;
import java.util.Optional;
import java.util.Properties;


public class ConfigurationReader {

    public static String getBrowser() {
        return Optional.ofNullable(System.getenv("BROWSER")).orElse("chrome-headless");
    }

    public static String getIPVCoreStubUrl() {
        String IPVCoreStubUrl = System.getenv("CFN_IPVCoreStubURL");
        if (IPVCoreStubUrl == null) {
            throw new IllegalArgumentException("Environment variable IPV_CORE_STUB_URL is not set");
        }
        return IPVCoreStubUrl;
    }

}
