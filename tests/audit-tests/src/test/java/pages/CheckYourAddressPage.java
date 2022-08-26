package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class CheckYourAddressPage {

    public CheckYourAddressPage(){
        PageFactory.initElements(Driver.get(),this);
    }

    @FindBy(id = "addressYearFrom")
    public WebElement EnterTheYearYouStartedLivingAtThisAddress;

    @FindBy (id = "continue")
    public WebElement Continue;
}
