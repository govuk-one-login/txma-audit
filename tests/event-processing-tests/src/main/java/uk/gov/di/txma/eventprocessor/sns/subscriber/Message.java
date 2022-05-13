package uk.gov.di.txma.eventprocessor.sns.subscriber;

import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

@JsonNaming(PropertyNamingStrategies.UpperCamelCaseStrategy.class)
public class Message {

    private final String type;
    private final String messageId;
    private final String token;
    private final String topicArn;
    private final String message;
    private final String subscribeURL;
    private final String timestamp;

    public Message(String type, String messageId, String token, String topicArn, String message, String subscribeURL, String timestamp) {
        this.type = type;
        this.messageId = messageId;
        this.token = token;
        this.topicArn = topicArn;
        this.message = message;
        this.subscribeURL = subscribeURL;
        this.timestamp = timestamp;
    }

    public String getType() {
        return type;
    }

    public String getMessageId() {
        return messageId;
    }

    public String getToken() {
        return token;
    }

    public String getTopicArn() {
        return topicArn;
    }

    public String getMessage() {
        return message;
    }

    public String getSubscribeURL() {
        return subscribeURL;
    }

    public String getTimestamp() {
        return timestamp;
    }
}
