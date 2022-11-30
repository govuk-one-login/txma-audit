package uk.gov.di.txma.audit.utilities;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.ie.InternetExplorerDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.safari.SafariDriver;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.logging.Logger;

public class Driver {

    private static final String SELENIUM_HUB_URL = "http://selenium-hub:4444/wd/hub";
    private static final String REMOTE_DRIVER_EMV_VAR = System.getenv("DRIVER");
    private static final Logger LOGGER = Logger.getLogger(Driver.class.getName());

    private Driver() {

    }

    // InheritableThreadLocal --> this is like a container, bag, pool.
    // in this pool we can have separate objects for each thread
    // for each thread, in InheritableThreadLocal we can have separate object for
    // that thread

    // driver class will provide separate webdriver object per thread
    private static final InheritableThreadLocal<WebDriver> driverPool = new InheritableThreadLocal<>();

    public static WebDriver get() throws MalformedURLException {
        // if this thread doesn't have driver - create it and add to pool
        if (driverPool.get() == null) {

            // if we pass the driver from terminal then use that one
            // if we do not pass the driver from terminal then use the one properties file
            String browser = ConfigurationReader.getBrowser();
            LOGGER.info("ℹ️ browser is " + browser);
            switch (browser) {
                case "chrome":
                    WebDriverManager.chromedriver().setup();
                    driverPool.set(new ChromeDriver());
                    break;
                case "chrome-headless":
                    WebDriverManager.chromedriver().setup();
                    ChromeOptions chromeOptions = new ChromeOptions();
                    chromeOptions.addArguments("--no-sandbox"); // Bypass OS security model, MUST BE FIRST OPTION
                    chromeOptions.addArguments("--disable-setuid-sandbox");
                    chromeOptions.addArguments("start-maximized"); // open Browser in maximized mode
                    chromeOptions.addArguments("disable-infobars"); // disabling infobars
                    chromeOptions.addArguments("--disable-extensions"); // disabling extensions
                    chromeOptions.addArguments("--disable-gpu"); // applicable to windows os only
                    chromeOptions.addArguments("--disable-dev-shm-usage"); // overcome limited resource problems
                    chromeOptions.addArguments("--headless");
                    chromeOptions.addArguments("--whitelisted-ips=");

                    System.out.println("The value of environment variable DRIVER: " + REMOTE_DRIVER_EMV_VAR);
                    if (REMOTE_DRIVER_EMV_VAR.equals(SELENIUM_HUB_URL)) {
                        System.out.println("[INFO]: using selenium grid remotedriver to run the tests");
                        driverPool.set(new RemoteWebDriver(new URL(REMOTE_DRIVER_EMV_VAR), chromeOptions));
                    } else {
                        System.out.println("[INFO]: using selenium chromedriver to run the tests");
                        driverPool.set(new ChromeDriver(chromeOptions));
                    }

                    break;
                case "firefox":
                    WebDriverManager.firefoxdriver().setup();
                    driverPool.set(new FirefoxDriver());
                    break;
                case "firefox-headless":
                    WebDriverManager.firefoxdriver().setup();
                    driverPool.set(new FirefoxDriver(new FirefoxOptions().setHeadless(true)));
                    break;
                case "ie":
                    if (!System.getProperty("os.name").toLowerCase().contains("windows"))
                        throw new WebDriverException("Your OS doesn't support Internet Explorer");
                    WebDriverManager.iedriver().setup();
                    driverPool.set(new InternetExplorerDriver());
                    break;

                case "edge":
                    if (!System.getProperty("os.name").toLowerCase().contains("windows"))
                        throw new WebDriverException("Your OS doesn't support Edge");
                    WebDriverManager.edgedriver().setup();
                    driverPool.set(new EdgeDriver());
                    break;

                case "safari":
                    if (!System.getProperty("os.name").toLowerCase().contains("mac"))
                        throw new WebDriverException("Your OS doesn't support Safari");
                    WebDriverManager.getInstance(SafariDriver.class).setup();
                    driverPool.set(new SafariDriver());
                    break;
            }
        }
        return driverPool.get();
    }

}
