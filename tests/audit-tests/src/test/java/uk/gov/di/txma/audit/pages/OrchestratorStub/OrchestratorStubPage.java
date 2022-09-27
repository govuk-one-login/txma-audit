package uk.gov.di.txma.audit.pages.OrchestratorStub;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class OrchestratorStubPage {

    public OrchestratorStubPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//*[@id='main-content']/form[2]/input[2]")
    public WebElement DebugRoute;

    @FindBy(xpath = "//input[@value='Full journey route']")
    public WebElement FullJourneyRoute;

}