package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class OrchestratorStubPage {

    public OrchestratorStubPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//input[@value='Debug route']")
    public static WebElement DebugRoute;

    @FindBy(xpath = "//input[@value='Full journey route']")
    public WebElement FullJourneyRoute;

}
