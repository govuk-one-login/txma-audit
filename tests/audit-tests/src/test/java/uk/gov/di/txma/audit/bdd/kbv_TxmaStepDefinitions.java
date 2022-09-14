package uk.gov.di.txma.audit.bdd;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import pages.ExperianUATUserSearchResultsPage;
import pages.HowMuchDoYouHaveLeftToPayOnYourMortgagePage;
import pages.HowMuchIsYourMonthlyMortgagePaymentPage;
import pages.HowMuchOfYourLoanDoYouHaveLeftToPayBackPage;
import pages.HowMuchOfYourLoanDoYouPayBackEveryMonthPage;
import pages.IPVCoreStubPage;
import pages.InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage;
import pages.InWhichYearDidYouMoveToYourCurrentAddressPage;
import pages.UserForKBVCRIStagingPage;
import pages.VerifiableCredentialsPage;
import pages.VisitCredentialIssuersPage;
import pages.WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage;
import pages.WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage;
import pages.WhatIsTheNameOfYourLoanProviderPage;
import pages.WhatIsTheTermInMonthsOfYourLoanPage;
import pages.WhenWasTheOtherPersonOnYourMortgageBornPage;
import pages.WhoHaveYouOpenedACurrentAccountWithPage;
import pages.WhoIsYourCurrentAccountWithPage;
import utilities.BrowserUtils;
import utilities.ConfigurationReader;
import utilities.Driver;

public class kbv_TxmaStepDefinitions {

    String kennethFirstQuestion;
    String kennethSecondQuestion;
    String kennethThirdQuestion;

    @Given("the user is on KBV CRI Staging")
    public void the_user_is_on_KBV_CRI_Staging() throws InterruptedException {
        Driver.get().get(ConfigurationReader.getIPVCoreStubUrl());
        BrowserUtils.waitForPageToLoad(100);
        new IPVCoreStubPage().VisitCredentialIssuers.click();
        BrowserUtils.waitForPageToLoad(100);
        new VisitCredentialIssuersPage().KBVCRIStaging.click();
        BrowserUtils.waitForPageToLoad(100);
    }

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

    @When("the user answers the first question correctly")
    public void the_user_answers_the_first_question_correctly() throws Exception {
        BrowserUtils.waitFor(2);
        kennethFirstQuestion = Driver.get().getTitle();
        kennethFirstQuestion.trim();
        System.out.println("kennethFirstQuestion = " + kennethFirstQuestion);
        switch (kennethFirstQuestion) {
            case "What is the name of your loan provider? – Prove your identity – GOV.UK":
                try {
                    if (new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.isDisplayed()) {
                        new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.click();
                        new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                    }
                }
                break;
            case "Who Have You Opened A Current Account With? – Prove your identity – GOV.UK":
                try {
                    if (new WhoHaveYouOpenedACurrentAccountWithPage().Tsbbankplc.isDisplayed()) {
                        new WhoHaveYouOpenedACurrentAccountWithPage().Tsbbankplc.click();
                        new WhoHaveYouOpenedACurrentAccountWithPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhoHaveYouOpenedACurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhoHaveYouOpenedACurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhoHaveYouOpenedACurrentAccountWithPage().Continue.click();
                    }
                }
                break;
            case "When Was The Other Person On Your Mortgage Born? – Prove your identity – GOV.UK":
                try {
                    if (new WhenWasTheOtherPersonOnYourMortgageBornPage().February1963.isDisplayed()) {
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhenWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                }
                break;
            case "How much is your monthly mortgage payment? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.isDisplayed()) {
                        new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.click();
                        new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.isDisplayed()) {
                        new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.click();
                        new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                    }
                }
                break;
            case "What is the name of the company that provides your mortgage? – Prove your identity – GOV.UK":
                try {
                    if (new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.isDisplayed()) {
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.click();
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                        BrowserUtils.waitForPageToLoad(100);
                    }
                } catch (Exception e) {
                    if (new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                        BrowserUtils.waitForPageToLoad(100);
                    }
                }
                break;
            case "In which year did you move to your current address? – Prove your identity – GOV.UK":
                try {
                    if (new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.isDisplayed()) {
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.click();
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                    }
                }
                break;
            case "What is the term, in months, of your loan? – Prove your identity – GOV.UK":
                BrowserUtils.waitFor(2);
                try {
                    if (new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.isDisplayed()) {
                        new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.click();
                        new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.isDisplayed()) {
                        new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.click();
                        new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                    }
                }
                break;
            case "How much of your loan do you pay back every month? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    }
                } catch (Exception e) {
                    try{
                        if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.isDisplayed()) {
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    }
                } catch (Exception f) {
                        if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    }
                    }

                    }
                    break;
//                try {
//                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                    else if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//
//                } catch (Exception f) {
//                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                }
//                break;
            case "How much do you have left to pay on your mortgage? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.isDisplayed()) {
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.click();
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.isDisplayed()) {
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                }
                break;
            case "How much of your loan do you have left to pay back? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                }
                break;
            case "What are the first two letters of the forename of the other person on your mortgage? – Prove your identity – GOV.UK":
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().KA.click();
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().Continue.click();
                break;
            case "Who is your current account with? – Prove your identity – GOV.UK":
                try {
                    if (new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.isDisplayed()) {
                        new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.click();
                        new WhoIsYourCurrentAccountWithPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhoIsYourCurrentAccountWithPage().Continue.click();
                    }
                }
                break;
            case "In what month and year was the other person on your mortgage born? – Prove your identity – GOV.UK":
                try {
                    if (new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.isDisplayed()) {
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                }
                break;
            default:
                System.out.println("First question not answered");
        }
    }

    @When("the user answers the second KBV question correctly")
    public void the_user_answers_the_second_KBV_question_correctly() throws Exception {
        kennethSecondQuestion = Driver.get().getTitle();
        kennethSecondQuestion.trim();
        System.out.println("kennethSecondQuestion = " + kennethSecondQuestion);
        switch (kennethSecondQuestion) {
            case "What is the name of your loan provider? – Prove your identity – GOV.UK":
                try {
                    if (new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.isDisplayed()) {
                        new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.click();
                        new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                    }
                }
                break;
            case "Who Have You Opened A Current Account With? – Prove your identity – GOV.UK":
                try {
                    if (new WhoHaveYouOpenedACurrentAccountWithPage().Tsbbankplc.isDisplayed()) {
                        new WhoHaveYouOpenedACurrentAccountWithPage().Tsbbankplc.click();
                        new WhoHaveYouOpenedACurrentAccountWithPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhoHaveYouOpenedACurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhoHaveYouOpenedACurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhoHaveYouOpenedACurrentAccountWithPage().Continue.click();
                    }
                }
                break;
            case "When Was The Other Person On Your Mortgage Born? – Prove your identity – GOV.UK":
                try {
                    if (new WhenWasTheOtherPersonOnYourMortgageBornPage().February1963.isDisplayed()) {
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhenWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                }
                break;
            case "How much is your monthly mortgage payment? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.isDisplayed()) {
                        new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.click();
                        new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.isDisplayed()) {
                        new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.click();
                        new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                    }
                }
                break;
            case "What is the name of the company that provides your mortgage? – Prove your identity – GOV.UK":
                try {
                    if (new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.isDisplayed()) {
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.click();
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                        BrowserUtils.waitForPageToLoad(100);
                    }
                } catch (Exception e) {
                    if (new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                        BrowserUtils.waitForPageToLoad(100);
                    }
                }
                break;
            case "In which year did you move to your current address? – Prove your identity – GOV.UK":
                try {
                    if (new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.isDisplayed()) {
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.click();
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                    }
                }
                break;
            case "What is the term, in months, of your loan? – Prove your identity – GOV.UK":
                BrowserUtils.waitFor(2);
                try {
                    if (new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.isDisplayed()) {
                        new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.click();
                        new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.isDisplayed()) {
                        new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.click();
                        new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                    }
                }
                break;
            case "How much do you have left to pay on your mortgage? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.isDisplayed()) {
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.click();
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.isDisplayed()) {
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                }
                break;
            case "How much of your loan do you have left to pay back? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                }
                break;
            case "How much of your loan do you pay back every month? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    }
                } catch (Exception e) {
                    try{
                        if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.isDisplayed()) {
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                        }
                    } catch (Exception f) {
                        if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                        }
                    }

                }
                break;
//                try {
//                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                    else if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                } catch (Exception f) {
//                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                }
//                break;
            case "What are the first two letters of the forename of the other person on your mortgage? – Prove your identity – GOV.UK":
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().KA.click();
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().Continue.click();
                break;
            case "Who is your current account with? – Prove your identity – GOV.UK":
                try {
                    if (new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.isDisplayed()) {
                        new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.click();
                        new WhoIsYourCurrentAccountWithPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhoIsYourCurrentAccountWithPage().Continue.click();
                    }
                }
                break;
            case "In what month and year was the other person on your mortgage born? – Prove your identity – GOV.UK":
                try {
                    if (new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.isDisplayed()) {
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                }
                break;
            default:
                System.out.println("Second question not answered");

        }
    }

    @When("the user answers the third KBV question correctly")
    public void the_user_answers_the_third_KBV_question_correctly() throws Exception {
        kennethThirdQuestion = Driver.get().getTitle();
        kennethThirdQuestion.trim();
        System.out.println("kennethThirdQuestion = " + kennethThirdQuestion);
        switch (kennethThirdQuestion) {
            case "What is the name of your loan provider? – Prove your identity – GOV.UK":
                try {
                    if (new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.isDisplayed()) {
                        new WhatIsTheNameOfYourLoanProviderPage().TSBBANKPLC.click();
                        new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhatIsTheNameOfYourLoanProviderPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhatIsTheNameOfYourLoanProviderPage().Continue.click();
                    }
                }
                break;
            case "How much is your monthly mortgage payment? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.isDisplayed()) {
                        new HowMuchIsYourMonthlyMortgagePaymentPage().OVER500UPTO600.click();
                        new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.isDisplayed()) {
                        new HowMuchIsYourMonthlyMortgagePaymentPage().UPTO600.click();
                        new HowMuchIsYourMonthlyMortgagePaymentPage().Continue.click();
                    }
                }
                break;
            case "What is the name of the company that provides your mortgage? – Prove your identity – GOV.UK":
                try {
                    if (new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.isDisplayed()) {
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().SANTANDERANMFMORTGAGE.click();
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                        BrowserUtils.waitForPageToLoad(100);
                    }
                } catch (Exception e) {
                    if (new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhatIsTheNameOfTheCompanyThatProvidesYourMortgagePage().Continue.click();
                        BrowserUtils.waitForPageToLoad(100);
                    }
                }
                break;
            case "In which year did you move to your current address? – Prove your identity – GOV.UK":
                try {
                    if (new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.isDisplayed()) {
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Year2002.click();
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new InWhichYearDidYouMoveToYourCurrentAddressPage().Continue.click();
                    }
                }
                break;
            case "What is the term, in months, of your loan? – Prove your identity – GOV.UK":
                BrowserUtils.waitFor(2);
                try {
                    if (new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.isDisplayed()) {
                        new WhatIsTheTermInMonthsOfYourLoanPage().OVER36MONTHSUPTO48MONTHS.click();
                        new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.isDisplayed()) {
                        new WhatIsTheTermInMonthsOfYourLoanPage().UPTO48MONTHS.click();
                        new WhatIsTheTermInMonthsOfYourLoanPage().Continue.click();
                    }
                }
                break;

            case "How much do you have left to pay on your mortgage? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.isDisplayed()) {
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().OVER35000UPTO60000.click();
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.isDisplayed()) {
                        new HowMuchDoYouHaveLeftToPayOnYourMortgagePage().UPTO60000.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                }
                break;
            case "How much of your loan do you have left to pay back? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().UPTO6750.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().OVER6500UPTO6750.click();
                        new HowMuchOfYourLoanDoYouHaveLeftToPayBackPage().Continue.click();
                    }
                }
                break;
            case "How much of your loan do you pay back every month? – Prove your identity – GOV.UK":
                try {
                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.isDisplayed()) {
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                    }
                } catch (Exception e) {
                    try{
                        if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.isDisplayed()) {
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                        }
                    } catch (Exception f) {
                        if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                            new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
                        }
                    }

                }
                break;
//                try {
//                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().OVER550UPTO600.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                    else if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().UPTO600.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//
//                } catch (Exception f) {
//                    if (new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
//                        new HowMuchOfYourLoanDoYouPayBackEveryMonthPage().Continue.click();
//                    }
//                }
//                break;
            case "What are the first two letters of the forename of the other person on your mortgage? – Prove your identity – GOV.UK":
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().KA.click();
                new WhatAreTheFirstTwoLettersOfTheForenameOfTheOtherPersonOnYourMortgagePage().Continue.click();
                break;
            case "Who is your current account with? – Prove your identity – GOV.UK":
                try {
                    if (new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.isDisplayed()) {
                        new WhoIsYourCurrentAccountWithPage().TSBBANKPLC.click();
                        new WhoIsYourCurrentAccountWithPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhoIsYourCurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhoIsYourCurrentAccountWithPage().Continue.click();
                    }
                }
                break;
            case "Who Have You Opened A Current Account With? – Prove your identity – GOV.UK":
                try {
                    if (new WhoHaveYouOpenedACurrentAccountWithPage().Tsbbankplc.isDisplayed()) {
                        new WhoHaveYouOpenedACurrentAccountWithPage().Tsbbankplc.click();
                        new WhoHaveYouOpenedACurrentAccountWithPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhoHaveYouOpenedACurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhoHaveYouOpenedACurrentAccountWithPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhoHaveYouOpenedACurrentAccountWithPage().Continue.click();
                    }
                }
                break;
            case "When Was The Other Person On Your Mortgage Born? – Prove your identity – GOV.UK":
                try {
                    if (new WhenWasTheOtherPersonOnYourMortgageBornPage().February1963.isDisplayed()) {
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new WhenWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new WhenWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                }
                break;
            case "In what month and year was the other person on your mortgage born? – Prove your identity – GOV.UK":
                try {
                    if (new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.isDisplayed()) {
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().February1963.click();
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                } catch (Exception e) {
                    if (new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.isDisplayed()) {
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().NONEOFTHEABOVEDOESNOTAPPLY.click();
                        new InWhatMonthAndYearWasTheOtherPersonOnYourMortgageBornPage().Continue.click();
                    }
                }
                break;
            default:
                System.out.println("Third question not answered");

        }
    }

    @Then("the verifiable credential page should be displayed")
    public void the_verifiable_credential_page_should_be_displayed() throws JsonProcessingException {
        BrowserUtils.waitForPageToLoad(100);
        new VerifiableCredentialsPage().ResponseFromKBVCRIStaging.click();
        String ResponseJSON = new VerifiableCredentialsPage().Data.getText();
        ObjectMapper objectMapper = new ObjectMapper();
    }


    @Then("the user should get verificationCode of {int}")
    public void the_user_should_get_verificationCode_of(Integer int1) throws JsonProcessingException {
        BrowserUtils.waitForPageToLoad(100);
        new VerifiableCredentialsPage().ResponseFromKBVCRIStaging.click();
        String ResponseJSON = new VerifiableCredentialsPage().Data.getText();
        ObjectMapper objectMapper = new ObjectMapper();
        JsonNode jsonNode = objectMapper.readTree(ResponseJSON);
        JsonNode vcNode = jsonNode.get("vc");
        JsonNode evidenceNode = vcNode.get("evidence");
        JsonNode insideEvidence = evidenceNode.get(0);
        String verificationScore = insideEvidence.get("verificationScore").asText();
        System.out.println("verificationScore = " + verificationScore);
    }
}
