package uk.gov.di.txma.eventprocessor.bdd;

import com.google.common.collect.ImmutableMap;
import io.cucumber.java.Before;

import static com.github.automatedowl.tools.AllureEnvironmentWriter.allureEnvironmentWriter;

public class Hooks {
    @Before
    public void setUp() {
        allureEnvironmentWriter(
                ImmutableMap.<String, String>builder()
                        .put("TEST_ENVIRONMENT", System.getenv("TEST_ENVIRONMENT"))
                        .build());
    }
}