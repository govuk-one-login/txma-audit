package gov.di_ipv_core.utilities;

import java.io.FileInputStream;
import java.util.Properties;

/**
 * reads the properties file configuration.properties
 */
public class ConfigurationReader {

    private static Properties properties;

    static {

        try {
            String path = "configuration.properties";
            FileInputStream input = new FileInputStream(path);
            properties = new Properties();
            properties.load(input);

            input.close();
        } catch (Exception e) {
            e.printStackTrace();

        }
    }

    public static String get(String keyName) {
        return properties.getProperty(keyName);
    }

    public static String getBrowser() {
        return System.getenv("BROWSER") != null ? System.getenv("BROWSER") : "chrome";
    }

    public static String getOrchestratorUrl() {
        return getEnvironmentVariableOrError("ORCHESTRATOR_STUB_URL");
    }

    public static String getCoreStubUrl() {
        return getEnvironmentVariableOrError("CORE_STUB_URL");
    }

    public static String getSampleServiceStagingUrl() {
        return getEnvironmentVariableOrError("SAMPLE_SERVICE_STAGING_URL");
    }

    public static String getAuthCodeBucketName() {
        return getEnvironmentVariableOrError("AUTH_CODE_BUCKET_NAME");
    }

    public static String getAuthCodeKeyName() {
        return getEnvironmentVariableOrError("AUTH_CODE_KEY_NAME");
    }

    private static String getEnvironmentVariableOrError(String variable) {
        String value = System.getenv(variable);
        if (value == null) {
            throw new IllegalArgumentException(String.format("Environment variable %s is not set", variable));
        }
        return value;
    }

    public static String getSampleServiceIntegrationUrl() {
        String sampleServiceIntegrationUrl = System.getenv("SAMPLE_SERVICE_INTEGRATION_URL");
        if (sampleServiceIntegrationUrl == null) {
            throw new IllegalArgumentException("Environment variable SAMPLE_SERVICE_STAGING_URL is not set ");
        }
        return sampleServiceIntegrationUrl;
    }



    public static boolean noChromeSandbox() {
        return "true".equalsIgnoreCase(System.getenv("NO_CHROME_SANDBOX"));
    }
}
