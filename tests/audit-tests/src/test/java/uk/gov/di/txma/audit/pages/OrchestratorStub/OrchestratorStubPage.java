package uk.gov.di.txma.audit.pages.OrchestratorStub;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class OrchestratorStubPage {

    public OrchestratorStubPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//*[@id='main-content']/form[2]/input[2]")
    public WebElement DebugRoute;
}