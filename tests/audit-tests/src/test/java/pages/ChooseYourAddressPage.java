package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class ChooseYourAddressPage {
    public ChooseYourAddressPage(){
        PageFactory.initElements(Driver.get(),this);
    }
    @FindBy(id = "addressResults")
    public WebElement ChooseYourAddressFromTheList;

    @FindBy (id = "continue")
    public WebElement ChooseAddress;
}
