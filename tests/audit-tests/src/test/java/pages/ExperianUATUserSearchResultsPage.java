package gov.di_ipv_kbv.pages;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class ExperianUATUserSearchResultsPage {
    public ExperianUATUserSearchResultsPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//a[normalize-space()='Go to KBV CRI Build']")
    public WebElement GoToKBVCRIBuild;

    @FindBy(xpath = "//a[normalize-space()='Go to KBV CRI Staging']")
    public WebElement GoToKBVCRIStaging;

    @FindBy(xpath = "//a[normalize-space()='View KBV Answers']")
    public WebElement ViewKBVAnswers;

}