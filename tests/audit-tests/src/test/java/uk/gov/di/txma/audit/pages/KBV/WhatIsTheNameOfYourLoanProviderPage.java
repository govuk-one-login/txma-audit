package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

public class WhatIsTheNameOfYourLoanProviderPage {
    public WhatIsTheNameOfYourLoanProviderPage() {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00033-TSBBANKPLC-label")
    public WebElement TSBBANKPLC;

    @FindBy(id = "Q00033-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}