package com.blog.infrastructure.mq.consumer;

import com.blog.modules.message.model.message.VerificationCodeMessage;
import com.blog.modules.message.service.impl.MessageVerificationServiceImpl;
import com.blog.shared.constant.QueueConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq", matchIfMissing = false)
public class RabbitMqVerificationCodeConsumer {

    private final MessageVerificationServiceImpl messageVerificationService;

    public RabbitMqVerificationCodeConsumer(MessageVerificationServiceImpl messageVerificationService) {
        this.messageVerificationService = messageVerificationService;
    }

    @RabbitListener(queues = QueueConstant.VERIFICATION_CODE_QUEUE)
    public void handleVerificationCode(VerificationCodeMessage message) {
        messageVerificationService.processVerificationMessage(message);
    }
}
