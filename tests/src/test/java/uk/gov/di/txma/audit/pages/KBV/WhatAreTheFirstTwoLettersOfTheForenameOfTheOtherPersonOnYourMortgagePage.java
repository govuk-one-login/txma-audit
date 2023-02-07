package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage {
    public WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(xpath = "//label[@id='Q00019-KA-label']")
    public WebElement KA;

    @FindBy(id = "Q00019-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}
