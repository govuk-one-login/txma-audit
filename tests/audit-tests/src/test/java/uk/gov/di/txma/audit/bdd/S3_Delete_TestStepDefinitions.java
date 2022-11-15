package uk.gov.di.txma.audit.bdd;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Response;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;

import java.util.List;

import static org.hamcrest.core.IsNot.not;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;
import static org.junit.Assert.fail;

public class S3_Delete_TestStepDefinitions {
    String key;
    String awserror;

    @Given("there is an object in S3 bucket")
    public void there_is_an_object_in_S3_bucket() {
        try (S3Client s3 = S3Client.builder()
                .region(Region.EU_WEST_2)
                .build()) {
            String bucketName = "audit-" + System.getenv("TEST_ENVIRONMENT") + "-message-batch";

            // Lists first object
            ListObjectsV2Request listObjects = ListObjectsV2Request
                    .builder()
                    .bucket(bucketName)
                    .maxKeys(1)
                    .build();
            ListObjectsV2Response res = s3.listObjectsV2(listObjects);
            List<S3Object> objects = res.contents();


            assertThat("No objects found", res.keyCount(), not(0));

            // Stores the most recent two keys
            key=objects.get(0).key();

        } catch (S3Exception e) {
            System.err.println(e.awsErrorDetails().errorMessage());
            System.exit(1);
        }
    }

    @When("the user tries to delete the first object")
    public void theUserTriesToDeleteTheFirstObject() {
        try (S3Client s3 = S3Client.builder()
                .region(Region.EU_WEST_2)
                .build()) {
            String bucketName = "audit-" + System.getenv("TEST_ENVIRONMENT") + "-message-batch";

            // Lists first object
            DeleteObjectRequest deleteObjects = DeleteObjectRequest
                    .builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3.deleteObject(deleteObjects);
            fail("Object was deleted");
        } catch (S3Exception e) {
            awserror=e.awsErrorDetails().errorMessage();
        }
    }

    @Then("the user should not be allowed to do so")
    public void theUserShouldNotBeAllowedToDoSo() {
        assertEquals("aws S3 failure with error message "+awserror,"Access Denied",awserror);
    }
}
