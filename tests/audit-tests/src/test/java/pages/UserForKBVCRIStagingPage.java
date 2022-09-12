package gov.di_ipv_kbv.pages;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class UserForKBVCRIStagingPage {
    public UserForKBVCRIStagingPage (){
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy (id = "name")
    public WebElement SearchForUserInExperian;

    @FindBy (xpath = "//button[normalize-space()='Search']")
    public WebElement Search;


}