package uk.gov.di.txma.audit.pages.IPVCoreStub;

import uk.gov.di.txma.audit.utilities.Driver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class IPVCoreStubFrontPage {

    @FindBy(xpath = "//*[@id=\"main-content\"]/div[1]/h1")
    public WebElement Addresssstub;

    @FindBy(id = "test_data")
    public WebElement SelectaddCRIData;

    @FindBy(xpath = "//*[@id=\"main-content\"]/div[1]/h1")
    public WebElement FraudStub;

    @FindBy(id = "test_data")
    public WebElement SelectfraudCRIData;

    @FindBy(xpath = "//*[@name=\"identityFraudScore\"]")
    public WebElement fraudscore;

    @FindBy(xpath = "//*[@id='header']")
    public WebElement KbvStubheader;

    @FindBy(id = "test_data")
    public WebElement SelectkbvCRIData;

    @FindBy(xpath = "//*[@name=\"verificationScore\"]")
    public WebElement kbvscore;

    @FindBy(xpath = "//*[@id='header']")
    public WebElement journeycomplete;

    public IPVCoreStubFrontPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//h1")
    public WebElement h1;

    @FindBy(xpath = "//a[normalize-space()='KBV (Stub)']")
    public WebElement KbvStub;

    //@FindBy(xpath = "//a[normalize-space()='ukPassport']")
    @FindBy(xpath = "//*[@id='cri-link-ukPassport']")
    public WebElement UkPassport;

    @FindBy(xpath = "//span[@class='govuk-details__summary-text']")
    public WebElement CredentialAttributes;

    @FindBy(xpath = "//input[@value='Authorize and Return']")
    public WebElement AuthorizeAndReturn;

    @FindBy(xpath = "/html/body/div/main/div/div/dl[3]/div/dd/pre")
    public WebElement GPG45Score;

    @FindBy(xpath = "//*[@id='header']")
    public WebElement Kbvheader;

}
