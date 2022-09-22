package uk.gov.di.txma.audit.pages.KBV;

//import gov.di_ipv_kbv.uk.gov.di.txma.audit.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class UserForKBVCRIStagingPage {
    public UserForKBVCRIStagingPage (){
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy (id = "name")
    public WebElement SearchForUserInExperian;

    @FindBy (xpath = "//button[normalize-space()='Search']")
    public WebElement Search;


}