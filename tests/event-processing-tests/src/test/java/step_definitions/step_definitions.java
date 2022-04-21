package step_definitions;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

public class step_definitions {
        @Given("^I am on database$")
                public void i_m_on_database(){
            System.out.println("This is given");
        };
    @When("I read data")
    public void i_read_data() {
        System.out.println("I read data now");

    }
    @Then("data is correct")
    public void data_is_correct() {
        System.out.println("data is correct");

    }
    }

