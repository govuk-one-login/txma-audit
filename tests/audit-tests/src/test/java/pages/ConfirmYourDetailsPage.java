package pages;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class ConfirmYourDetailsPage {
    public ConfirmYourDetailsPage(){
        PageFactory.initElements(Driver.get(), this);
    }
    @FindBy(xpath = "//button[@class='govuk-button button']")
    public WebElement IConfirmMyDetailsAreCorrect;
}
