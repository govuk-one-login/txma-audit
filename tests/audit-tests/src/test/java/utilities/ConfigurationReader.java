package utilities;

import java.io.FileInputStream;
import java.util.Optional;
import java.util.Properties;


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
        return Optional.ofNullable(System.getenv("BROWSER")).orElse("chrome-headless");
    }

    public static String getIPVCoreStubUrl() {
        String orchestratorStubUrl = System.getenv("IPV_CORE_STUB_URL");
        if (orchestratorStubUrl == null) {
            throw new IllegalArgumentException("Environment variable IPV_CORE_STUB_URL is not set");
        }
        return orchestratorStubUrl;
    }

    public static String getOrchestratorStubUrl() {
        return "https://staging-di-ipv-orchestrator-stub.london.cloudapps.digital/";
    }

}
