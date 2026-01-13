package com.blog.infrastructure.mail;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;

@Slf4j
@Service
@ConditionalOnProperty(name = "spring.mail.host")
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired(required = false)
    private TemplateEngine templateEngine;

    @Getter
    @Value("${spring.mail.username:}")
    private String from;

    @Getter
    @Value("${spring.mail.from-name:Swater Blog}")
    private String fromName;

    public void sendEmail(String to, String subject, String content) throws Exception {
        if (mailSender == null) {
            throw new IllegalStateException("邮件服务未配置");
        }
        if (from == null || from.isEmpty()) {
            throw new IllegalStateException("邮件发件人地址未配置 (spring.mail.username)");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(from, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);

        mailSender.send(message);
        log.info("邮件发送成功: to={}, subject={}", to, subject);
    }

    public void sendEmailWithTemplate(String to, String subject, String templateName, Map<String, Object> variables) throws Exception {
        if (mailSender == null) {
            throw new IllegalStateException("邮件服务未配置");
        }

        String content;
        if (templateEngine != null && variables != null) {
            Context context = new Context();
            context.setVariables(variables);
            content = templateEngine.process(templateName, context);
        } else {
            throw new IllegalStateException("模板引擎未配置或变量为空");
        }

        sendEmail(to, subject, content);
    }

    public boolean isConfigured() {
        return mailSender != null && from != null && !from.isEmpty();
    }
}
