package com.blog.infrastructure.mq.consumer;

import com.blog.modules.message.model.message.VerificationCodeMessage;
import com.blog.modules.message.service.MessageVerificationService;
import com.blog.shared.constant.QueueConstant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "plugin.mq.active", havingValue = "rabbitmq", matchIfMissing = false)
public class RabbitMqVerificationCodeConsumer {

    private final MessageVerificationService messageVerificationService;

    public RabbitMqVerificationCodeConsumer(MessageVerificationService messageVerificationService) {
        this.messageVerificationService = messageVerificationService;
    }

    /**
     * 异常向外抛给监听容器：触发 yml 配置的 3 次重试，耗尽后消息进入死信队列。
     */
    @RabbitListener(queues = QueueConstant.VERIFICATION_CODE_QUEUE)
    public void handleVerificationCode(VerificationCodeMessage message) throws Exception {
        messageVerificationService.processVerificationMessage(message);
    }
}
