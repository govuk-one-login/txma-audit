package uk.gov.di.txma.audit.pages.KBV;

import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import uk.gov.di.txma.audit.utilities.Driver;

import java.net.MalformedURLException;

public class WhatIsTheTermInMonthsOfYourLoanPage {
    public WhatIsTheTermInMonthsOfYourLoanPage() throws MalformedURLException {
        PageFactory.initElements(Driver.get(), this);
    }

    @FindBy(id = "Q00043-UPTO48MONTHS-label")
    public WebElement UPTO48MONTHS;

    @FindBy(xpath = "//*[@id=\"Q00043-OVER36MONTHSUPTO48MONTHS-label\"]")
    public WebElement OVER36MONTHSUPTO48MONTHS;

    @FindBy(id = "Q00043-NONEOFTHEABOVEDOESNOTAPPLY-label")
    public WebElement NONEOFTHEABOVEDOESNOTAPPLY;

    @FindBy(id = "continue")
    public WebElement Continue;
}