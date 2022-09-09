package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class FindYourAddressPage {
    public FindYourAddressPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "addressSearch")
    public WebElement EnterYourPostcode;

    @FindBy (id = "continue")
    public WebElement FindAddress;
}
