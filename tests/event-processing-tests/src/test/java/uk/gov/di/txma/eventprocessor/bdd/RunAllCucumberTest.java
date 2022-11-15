package uk.gov.di.txma.eventprocessor.bdd;

import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

@Suite
@SelectClasspathResource("features")
public class RunAllCucumberTest {
}
