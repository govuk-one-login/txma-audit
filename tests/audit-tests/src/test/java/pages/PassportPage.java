package pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class PassportPage {

    public PassportPage(){
        PageFactory.initElements(Driver.get(),this);
    }

    @FindBy(xpath = "//*[@class='govuk-error-summary error-summary']//*[@class='govuk-error-summary__body']//*[@class='govuk-list govuk-error-summary__list']//*[contains(@href,'#passportNumber')]")
    public WebElement InvalidPassportNumberError;

    @FindBy(id = "passportNumber")
    public WebElement PassportNumber;
//    WebElement PassportNumber = Driver.get().findElement(By.id("passportNumber"));

    @FindBy (id = "surname")
    public WebElement Surname;

//    WebElement FirstName = Driver.get().findElement(By.id("firstName"));
    @FindBy (id = "firstName")
    public WebElement FirstName;

//    WebElement birthDay = Driver.get().findElement(By.id("dateOfBirth-day"));
    @FindBy (id = "dateOfBirth-day")
    public WebElement birthDay;

//    WebElement birthMonth = Driver.get().findElement(By.id("dateOfBirth-month"));
    @FindBy (id = "dateOfBirth-month")
    public WebElement birthMonth;

//    WebElement birthYear = Driver.get().findElement(By.id("dateOfBirth-year"));
    @FindBy (id = "dateOfBirth-year")
    public WebElement birthYear;

//    WebElement PassportExpiryDay = Driver.get().findElement(By.id("expiryDate-day"));
    @FindBy (id = "expiryDate-day")
    public WebElement PassportExpiryDay;

//    WebElement PassportExpiryMonth = Driver.get().findElement(By.id("expiryDate-month"));
    @FindBy (id = "expiryDate-month")
    public WebElement PassportExpiryMonth;

//    WebElement PassportExpiryYear = Driver.get().findElement(By.id("expiryDate-year"));
    @FindBy (id = "expiryDate-year")
    public WebElement PassportExpiryYear;

//    WebElement PassportContinueButton = Driver.get().findElement(By.xpath("//button[@class='govuk-button button']"));
    @FindBy (xpath = "//button[@class='govuk-button button']")
    public WebElement PassportContinueButton;

}