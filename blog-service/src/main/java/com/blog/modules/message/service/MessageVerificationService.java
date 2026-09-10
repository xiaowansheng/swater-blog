package com.blog.modules.message.service;

public interface MessageVerificationService {
    void sendEmailCode(String email);

    void validateEmailCode(String email, String code);

    /**
     * 消费验证码消息并发送邮件。异常向外抛出以触发 MQ 重试/死信。
     */
    void processVerificationMessage(com.blog.modules.message.model.message.VerificationCodeMessage message) throws Exception;
}
