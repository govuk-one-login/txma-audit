package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class VisitCredentialIssuersPage {
    public VisitCredentialIssuersPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//input[@value='Address CRI Dev']")
    public WebElement AddressCRIDev;

    @FindBy(xpath = "//input[@value='Address CRI Integration']")
    public WebElement AddressCRIIntegration;

    @FindBy(xpath = "//input[@value='Address CRI Build']")
    public WebElement AddressCRIBuild;

    @FindBy(xpath = "//input[@value='KBV CRI Build']")
    public WebElement KBVCRIBuild;

    @FindBy(xpath = "//*[@id=\"main-content\"]/p[5]/a/input")
    public WebElement KBVCRIStaging;

    @FindBy(xpath = "//input[@value='Address CRI Staging']")
    public WebElement AddressCRIStaging;

}
