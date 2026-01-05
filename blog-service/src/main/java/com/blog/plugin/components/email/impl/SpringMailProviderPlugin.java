package com.blog.plugin.components.email.impl;



import com.blog.plugin.core.Plugin;
import com.blog.plugin.components.email.EmailProviderPlugin;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import jakarta.mail.internet.MimeMessage;
import java.util.Map;
@Component
@ConditionalOnProperty(name = "email.provider.type", havingValue = "spring-mail", matchIfMissing = true)
public class SpringMailProviderPlugin implements EmailProviderPlugin, Plugin {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Autowired(required = false)
    private TemplateEngine templateEngine;
    
    @Value("${email.from:}")
    private String from;
    
    @Value("${email.from-name:Swater Blog}")
    private String fromName;
    
    @Value("${email.template.path:classpath:templates/email/}")
    private String templatePath;
    
    @Override
    public String getName() {
        return "spring-mail";
    }
    
    @Override
    public boolean isEnabled() {
        return mailSender != null;
    }
    
    @Override
    public void sendEmail(String to, String subject, String content) throws Exception {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender未配置");
        }
        
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(from, fromName);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(content, true);
        
        mailSender.send(message);
    }
    
    @Override
    public void sendEmailWithTemplate(String to, String subject, String templateName, Map<String, Object> variables) throws Exception {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender未配置");
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
}
