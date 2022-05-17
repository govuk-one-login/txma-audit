package uk.gov.di.txma.eventprocessor.sns.subscriber;

import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@RestController
public class MessageController {

    private static final String template = "Hello, %s!";

    private static final List<Message> messageRepository = new ArrayList<>();


    @GetMapping("/")
    public String index() {
        return "Greetings from Spring Boot!";
    }

    @GetMapping("/messages")
    public List<Message> getAll() {
        return messageRepository;
    }

    @GetMapping("/message/{messageId}")
    public Message getMessage(@PathVariable String messageId) {
        System.out.println(String.format("Looking for message with MessageId: %s", messageId));
        return messageRepository.stream().filter(m->m.getMessageId().equals(messageId)).findFirst().get();
    }

    /**
     *
     * @return the most recent message posted to this endpoint
     */
    @GetMapping("/message/latest")
    public Message getLatestMessage() {
        return messageRepository.get(messageRepository.size() -1);
    }

    @PostMapping("/messages")
    public void newMessage(@RequestBody Message newMessage) {
        System.out.println(String.format("Adding message %s", newMessage));
        messageRepository.add(newMessage);
    }

}
