package pages.KBV;

//import gov.di_ipv_kbv.utilities.Driver;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import utilities.Driver;

public class WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage {
    public WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00009-SANTANDERANMFMORTGAGE-label")
    public WebElement SANTANDERANMFMORTGAGE;

    @FindBy(id = "Q00009-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}