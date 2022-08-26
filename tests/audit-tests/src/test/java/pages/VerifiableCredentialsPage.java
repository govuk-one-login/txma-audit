package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class VerifiableCredentialsPage {
    public VerifiableCredentialsPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//*[@id=\"main-content\"]/div/details/summary/span")
    public WebElement ResponseFromAddressCRIDev;

    @FindBy(xpath = "//*[@id=\"main-content\"]/div/details/div/pre")
    public WebElement JSONPayload;

    @FindBy(xpath = "//span[@class='govuk-details__summary-text']")
    public WebElement ResponseFromKBVCRIIntegration;

    @FindBy(xpath = "//div[@class='govuk-details__text']//pre")
    public WebElement IntegrationJSONPayload;

    @FindBy (xpath = "//*[@id=\"main-content\"]/div/details/summary/span")
    public WebElement ResponseFromKBVCRIStaging;

    @FindBy (id = "data")
    public WebElement Data;

    @FindBy (xpath = "//span[@class='govuk-details__summary-text']")
    public WebElement ResponseFromAddressCRIIntegration;

    @FindBy (xpath = "//div[@class='govuk-details__text']//pre")
    public WebElement AddressCRIJSONResponse;

}
