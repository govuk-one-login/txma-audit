package pages.KBV;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage {
    public WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//label[@id='Q00019-KA-label']")
    public WebElement KA;

    @FindBy(id = "Q00019-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}