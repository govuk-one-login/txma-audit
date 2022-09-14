package pages;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class WhenWasTheOtherPersonOnYourMortgageBornPage {
    public WhenWasTheOtherPersonOnYourMortgageBornPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00020-021963-label")
    public WebElement February1963;

    @FindBy(id = "Q00020-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(xpath = "//button[@id='continue']")
    public WebElement Continue;
}