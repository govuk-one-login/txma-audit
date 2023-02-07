package uk.gov.di.txma.audit.pages.Passport;

 import org.openqa.selenium.WebElement;
 import org.openqa.selenium.support.FindBy;
 import org.openqa.selenium.support.PageFactory;
 import uk.gov.di.txma.audit.utilities.Driver;

 import java.net.MalformedURLException;

public class PassportPage {

    public PassportPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(),this);
    }
    @FindBy(id = "passportNumber")
    public WebElement PassportNumber;
    @FindBy (id = "surname")
    public WebElement Surname;
    @FindBy (id = "firstName")
    public WebElement FirstName;
    @FindBy (id = "dateOfBirth-day")
    public WebElement birthDay;
    @FindBy (id = "dateOfBirth-month")
    public WebElement birthMonth;
    @FindBy (id = "dateOfBirth-year")
    public WebElement birthYear;
    @FindBy (id = "expiryDate-day")
    public WebElement PassportExpiryDay;
    @FindBy (id = "expiryDate-month")
    public WebElement PassportExpiryMonth;
    @FindBy (id = "expiryDate-year")
    public WebElement PassportExpiryYear;
    @FindBy (xpath = "//button[@class='govuk-button button']")
    public WebElement PassportContinueButton;

}
