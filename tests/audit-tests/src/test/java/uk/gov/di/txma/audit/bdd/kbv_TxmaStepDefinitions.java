package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.When;
import uk.gov.di.txma.audit.pages.KBV.ExperianUATUserSearchResultsPage;
import uk.gov.di.txma.audit.pages.KBV.HowMuchDoYouHaveLeftToPayOnYourMortgagePage;
import uk.gov.di.txma.audit.pages.KBV.HowMuchIsYourMonthlyMortgagePaymentPage;
import uk.gov.di.txma.audit.pages.KBV.HowMuchOfYourLoanDoYouHaveLeftToPayBackPage;
import uk.gov.di.txma.audit.pages.KBV.HowMuchOfYourLoanDoYouPayBackEveryMonthPage;
import uk.gov.di.txma.audit.pages.KBV.InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage;
import uk.gov.di.txma.audit.pages.KBV.InWhichYearDidYouMoveToYourCurrentAddressPage;
import uk.gov.di.txma.audit.pages.KBV.UserForKBVCRIStagingPage;
import uk.gov.di.txma.audit.pages.KBV.WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage;
import uk.gov.di.txma.audit.pages.KBV.WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage;
import uk.gov.di.txma.audit.pages.KBV.WhatIsTheNameOfYourLoanProviderPage;
import uk.gov.di.txma.audit.pages.KBV.WhatIsTheTermInMonthsOfYourLoanPage;
import uk.gov.di.txma.audit.pages.KBV.WhoIsYourCurrentAccountWithPage;
import uk.gov.di.txma.audit.utilities.BrowserUtils;
import uk.gov.di.txma.audit.utilities.Driver;

public class kbv_TxmaStepDefinitions {

    @When("the user searches Kenneth Decerqueira and click `Search`")
    public void the_user_searches_Kenneth_Decerqueira_and_click_Search() {
        new UserForKBVCRIStagingPage().SearchForUserInExperian.sendKeys("KENNETH DECERQUEIRA");
        new UserForKBVCRIStagingPage().Search.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("the user clicks on `Go to KBV CRI Staging`")
    public void the_user_clicks_on_Go_to_KBV_CRI_Staging() {
        new ExperianUATUserSearchResultsPage().GoToKBVCRIStaging.click();
        BrowserUtils.waitForPageToLoad(100);
    }

    @When("the user answers the {string} question correctly")
    public void KennethAnswersQuestion(String questionNumber) {
        String kennethQuestion = Driver.get().getTitle();
        System.out.println("kenneth " + questionNumber + " Question = " + kennethQuestion);
        switch (kennethQuestion) {
            case "What is the name of your loan provider? – Prove your identity – GOV.UK":
                try {
                    new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.click();
                    new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                } catch (Exception e) {
                    new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                    new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                }
                break;
            case "How much is your monthly mortgage payment? – Prove your identity – GOV.UK":
                try {
                    new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.click();
                    new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                } catch (Exception e) {
                    new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.click();
                    new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                }
                break;
            case "What is the name of the company that provides your mortgage? – Prove your identity – GOV.UK":
                try {
                    new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.click();
                    new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                } catch (Exception e) {
                    new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                    new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                }
                break;
            case "In which year did you move to your current address? – Prove your identity – GOV.UK":
                try {
                    new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.click();
                    new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                } catch (Exception e) {
                    new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                    new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                }
                break;
            case "What is the term, in months, of your loan? – Prove your identity – GOV.UK":
                try {
                    new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.click();
                    new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                } catch (Exception e) {
                    new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.click();
                    new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                }
                break;
            case "How much of your loan do you pay back every month? – Prove your identity – GOV.UK":
                try {
                    new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
                    new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                } catch (Exception e) {
                    try{
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    } catch (Exception f) {
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    }

                }
                break;
            case "How much do you have left to pay on your mortgage? – Prove your identity – GOV.UK":
                try {
                    new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.click();
                    new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().Continue.click();
                } catch (Exception e) {
                    new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.click();
                    new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                }
                break;
            case "How much of your loan do you have left to pay back? – Prove your identity – GOV.UK":
                try {
                    new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.click();
                    new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                } catch (Exception e) {
                    new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.click();
                    new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                }
                break;
            case "What are the first two letters of the forename of the other person on your mortgage? – Prove your identity – GOV.UK":
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().KA.click();
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().Continue.click();
                break;
            case "Who is your current account with? – Prove your identity – GOV.UK":
                try {
                    new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.click();
                    new WhoIsYourCurrentAccountWithPage().Continue.click();
                } catch (Exception e) {
                    new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                    new WhoIsYourCurrentAccountWithPage().Continue.click();
                }
                break;
            case "In what month and year was the other person on your mortgage born? – Prove your identity – GOV.UK":
                try {
                    new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                    new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                } catch (Exception e) {
                    new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                    new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                }
                break;
            default:
                System.out.println(questionNumber + " question not answered");
        }
    }
}
