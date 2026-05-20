package com.blog.bootstrap.config;

import com.blog.modules.notification.model.message.NotificationMessage;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class RabbitMQAutoConfigurationTest {

    @Test
    void rabbitTemplateAllowsProjectMessagesToRoundTrip() {
        RabbitMQAutoConfiguration configuration = new RabbitMQAutoConfiguration();
        RabbitTemplate rabbitTemplate = configuration.rabbitTemplate(mock(ConnectionFactory.class));

        NotificationMessage payload = new NotificationMessage();
        payload.setNotificationId(1L);
        payload.setType("SYSTEM");
        payload.setUserId(2L);
        payload.setTitle("title");
        payload.setContent("content");
        payload.setTimestamp(LocalDateTime.of(2026, 1, 2, 3, 4, 5));
        payload.setData(Map.of("source", "test"));

        Message message = rabbitTemplate.getMessageConverter()
                .toMessage(payload, new MessageProperties());
        Object decoded = rabbitTemplate.getMessageConverter().fromMessage(message);

        assertThat(decoded).isInstanceOf(NotificationMessage.class);
        NotificationMessage decodedMessage = (NotificationMessage) decoded;
        assertThat(decodedMessage.getNotificationId()).isEqualTo(1L);
        assertThat(decodedMessage.getTimestamp()).isEqualTo(payload.getTimestamp());
        assertThat(decodedMessage.getData()).containsEntry("source", "test");
    }
}
